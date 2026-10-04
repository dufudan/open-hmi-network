"""Render initial discovery cards; browser scripts retain filtering and profiles.

Run after registry/resource updates, then commit the generated HTML.
Use --check in CI to reject stale static cards. No third-party packages needed.
"""
from pathlib import Path
import argparse
import html
import json
import re
from urllib.parse import urlencode, urlparse

def esc(value):
    return html.escape(str(value or ''), quote=True)

def link(value):
    parsed = urlparse(value)
    if parsed.scheme and parsed.scheme not in ('https', 'http'):
        raise ValueError('Unsupported discovery URL: '+value)
    if value.startswith('//'):
        raise ValueError('Protocol-relative discovery URL: '+value)
    return esc(value)

def replace_cards(source, attribute, content):
    start = '<!-- static-discovery:'+attribute+' -->'
    end = '<!-- /static-discovery:'+attribute+' -->'
    replacement = start + '\n' + content + '\n' + end
    if start in source:
        return re.sub(re.escape(start)+r'.*?'+re.escape(end), lambda _:replacement, source, count=1, flags=re.S)
    pattern = r'(<div\b[^>]*\b'+re.escape(attribute)+r'[^>]*>)<div class="resource-loading">.*?</div>(</div>)'
    source, count = re.subn(pattern, lambda m:m.group(1)+replacement+m.group(2), source, count=1, flags=re.S)
    if count != 1:
        raise ValueError('Discovery container not found: '+attribute)
    return source

def render(files):
    registry = json.loads(files['data/registry/index.json'])
    contributors = [json.loads(files['data/registry/'+p]) for p in registry['contributors']]
    contributions = [json.loads(files['data/registry/'+p]) for p in registry['contributions']]
    contributor_map = {c['id']:c for c in contributors}
    cards = []
    for c in contributors:
        href = 'contributor.html?' + urlencode({'id':c['id']})
        cards.append('<a class="contributor-card click-card" href="'+link(href)+'"><h3>'+esc(c['name'])+'</h3><p>'+esc(c.get('bio', c.get('headline')))+'</p><span class="card-link">View Profile →</span></a>')
    directory = replace_cards(files['contributors.html'], 'data-contributor-list', '\n'.join(cards))
    directory = directory.replace('Loading contributors…', str(len(contributors))+' contributors')
    # Individual query-string profiles remain noindex by policy; published work is static.
    cards = []
    for item in contributions:
        target = item.get('repository_url') or item.get('resource_url')
        if not target:
            continue
        author = contributor_map[item['contributor_id']]['name']
        cards.append('<article class="community-contribution-card"><h3><a href="'+link(target)+'">'+esc(item['title'])+'</a></h3><p>'+esc(item.get('summary'))+'</p><p>By '+esc(author)+'</p></article>')
    resources = replace_cards(files['developer-resources.html'], 'data-community-contributions', '\n'.join(cards))
    # Render the existing vendor list exactly; access labels remain visible.
    index = json.loads(files['data/resources/index.json'])
    resources_list = []
    for path in index['files']:
        resources_list.extend(json.loads(files[path]))
    cards = []
    for item in resources_list:
        cards.append('<article class="resource-card"><h3><a href="'+link(item['url'])+'">'+esc(item['title'])+'</a></h3><p>'+esc(item.get('description'))+'</p><p>'+esc(item['vendor'])+' · '+esc(item['access'])+'</p></article>')
    resources = replace_cards(resources, 'data-resource-grid', '\n'.join(cards))
    resources = re.sub(r'(data-resource-count>)Loading…', r'\g<1>'+str(len(resources_list))+' resources', resources)
    return {'contributors.html':directory, 'developer-resources.html':resources}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    files = {p.relative_to(root).as_posix():p.read_text(encoding='utf-8') for p in root.rglob('*.json') if '.git' not in p.parts}
    for p in ['contributors.html','developer-resources.html']:
        files[p] = (root/p).read_text(encoding='utf-8')
    output = render(files)
    stale = [p for p,s in output.items() if s != files[p]]
    if args.check and stale:
        raise SystemExit('Regenerate discovery HTML: '+', '.join(stale))
    if not args.check:
        for p,s in output.items():
            (root/p).write_text(s, encoding='utf-8')
    print('Static discovery cards are current.')

if __name__ == '__main__':
    main()
