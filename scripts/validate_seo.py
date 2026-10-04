"""Validate canonical targets, sitemap and static discovery without network calls."""
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, urlparse

SITE = 'https://openhmi.network'
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.canonical = []
        self.robots = []
        self.links = []
        self.schemas = []
        self.refresh = False
        self.feed(source)
        for match in re.finditer(r'<script\b[^>]*type=[\"\x27]application/ld\+json[\"\x27][^>]*>(.*?)</script>', source, re.I|re.S):
            self.schemas.append(json.loads(match.group(1)))
    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical.append(a.get('href'))
        if tag == 'meta' and a.get('name','').lower() == 'robots':
            self.robots.append(a.get('content',''))
        if tag == 'meta' and a.get('http-equiv','').lower() == 'refresh':
            self.refresh = True
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])

def local_path(url):
    path = urlparse(url).path.lstrip('/')
    return path+'index.html' if not path or path.endswith('/') else path

def validate(files, repository_tree=None):
    errors, warnings, pages = [], [], {}
    known = {p for p in files} | {x['path'] for x in (repository_tree or []) if x['type']=='blob'}
    for p,s in files.items():
        if p.endswith('.html'):
            try:
                pages[p] = Page(s)
            except (ValueError, TypeError) as e:
                errors.append(p+': invalid JSON-LD: '+str(e))
    edges = {p:set() for p in pages}
    for p, page in pages.items():
        if len(page.canonical) != 1:
            errors.append(p+': expected one canonical')
            continue
        canonical = page.canonical[0]
        if not canonical.startswith(SITE+'/') or urlparse(canonical).query or urlparse(canonical).fragment:
            errors.append(p+': invalid canonical '+canonical)
        target = local_path(canonical)
        if target not in pages:
            errors.append(p+': missing canonical target '+target)
        elif pages[target].canonical != [canonical]:
            errors.append(p+': canonical chain through '+target)
        elif target != p and (any('noindex' in r for r in pages[target].robots) or pages[target].refresh):
            errors.append(p+': canonical target is noindex or redirect '+target)
        for href in page.links:
            resolved = urljoin(SITE+'/'+p, href)
            if urlparse(resolved).netloc != 'openhmi.network':
                continue
            dest = local_path(resolved)
            if dest not in known:
                errors.append(p+': missing internal link '+href)
            if dest in pages:
                edges[p].add(dest)
            if urlparse(resolved).path.endswith('/index.html'):
                errors.append(p+': internal link uses index.html alias '+href)
    try:
        sm = ET.fromstring(files['sitemap.xml'])
        urls = [loc.text for loc in sm.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    except (ET.ParseError, KeyError) as e:
        errors.append('Invalid sitemap: '+str(e))
        urls = []
    if len(urls) != len(set(urls)):
        errors.append('Duplicate sitemap URLs')
    for url in urls:
        p = local_path(url)
        if p not in pages:
            errors.append('Sitemap page missing: '+str(url))
        elif pages[p].canonical != [url] or pages[p].refresh or any('noindex' in r for r in pages[p].robots):
            errors.append('Sitemap URL is noncanonical, redirect or noindex: '+url)
    for p,page in pages.items():
        if not page.canonical:
            continue
        if local_path(page.canonical[0]) == p and not page.refresh and not any('noindex' in r for r in page.robots):
            if page.canonical[0] not in urls:
                errors.append('Self-canonical indexable page omitted from sitemap: '+p)
    depths = {'index.html':0}
    queue = deque(['index.html'])
    while queue:
        p = queue.popleft()
        for dest in edges.get(p,[]):
            if dest not in depths:
                depths[dest] = depths[p]+1
                queue.append(dest)
    for url in urls:
        p = local_path(url)
        if p not in depths:
            errors.append('No static path from homepage: '+p)
    for p,page in pages.items():
        if not page.robots:
            warnings.append(p+': no explicit robots tag (default index/follow)')
        for graph in page.schemas:
            nodes = graph.get('@graph', [graph])
            for node in nodes:
                if node.get('@type') == 'VideoObject' and re.fullmatch(r'\d{4}-\d{2}-\d{2}', node.get('uploadDate','')):
                    warnings.append(p+': verify real uploadDate and timezone before adding a timestamp')
    return {'html_pages':len(pages), 'sitemap_urls':len(urls), 'errors':sorted(set(errors)), 'warnings':sorted(set(warnings)), 'discovery_depth':dict(sorted(depths.items()))}

def main():
    root = Path(__file__).resolve().parents[1]
    files = {p.relative_to(root).as_posix():p.read_text(encoding='utf-8') for p in root.rglob('*.html') if '.git' not in p.parts}
    files['sitemap.xml'] = (root/'sitemap.xml').read_text(encoding='utf-8')
    tree = [{'path':p.relative_to(root).as_posix(), 'type':'blob'} for p in root.rglob('*') if p.is_file() and '.git' not in p.parts]
    result = validate(files, tree)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    raise SystemExit(bool(result['errors']))

if __name__ == '__main__':
    main()
