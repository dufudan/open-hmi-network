"""Verify deployed content matches this checkout before notifying IndexNow."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import argparse
import subprocess
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://openhmi.network'
KEY = '076a019de67eb38a409c5f44faf20761.txt'

def local_path(url):
    path = urlparse(url).path.lstrip('/')
    return path + 'index.html' if not path or path.endswith('/') else path

def targets(root=ROOT):
    ns = {'sm':'http://www.sitemaps.org/schemas/sitemap/0.9'}
    tree = ET.parse(root / 'sitemap.xml')
    urls = {loc.text.strip() for loc in tree.findall('.//sm:loc', ns) if loc.text}
    urls.update(SITE+'/'+p for p in [
        'sitemap.xml', 'robots.txt', KEY, 'canonical-navigation.js',
        'agricultural-equipment-hmi.html', 'industrial-hmi.html',
        'instrumentation-hmi.html', 'smart-appliance-hmi.html',
        'solutions/agricultural-equipment-hmi.html', 'solutions/industrial-hmi.html',
        'solutions/instrumentation-hmi.html', 'solutions/smart-appliance-hmi.html',
    ])
    for url in urls:
        parsed = urlparse(url)
        if parsed.scheme != 'https' or parsed.netloc != 'openhmi.network':
            raise ValueError('Unexpected publication URL: '+url)
        if not (root / local_path(url)).is_file():
            raise ValueError('Publication target missing: '+local_path(url))
    return sorted(urls)

def normalized(data):
    return data.replace(b'\r\n',b'\n')

def verify(url, revision, root=ROOT, opener=urllib.request.urlopen):
    expected = normalized((root / local_path(url)).read_bytes())
    request = urllib.request.Request(url+'?openhmi_revision='+revision,
        headers={'User-Agent':'OpenHMI-Publication-Check/1.0','Cache-Control':'no-cache'})
    try:
        with opener(request, timeout=20) as response:
            actual = normalized(response.read())
            if response.status != 200:
                return url, 'HTTP '+str(response.status)
            if urlparse(response.url).netloc != 'openhmi.network':
                return url, 'unexpected redirect host'
            if actual != expected:
                return url, 'content differs from checkout'
            if 'noindex' in response.headers.get('X-Robots-Tag','').lower() and url != SITE+'/'+KEY:
                return url, 'unexpected X-Robots-Tag noindex'
            return url, None
    except (OSError, urllib.error.URLError) as error:
        return url, type(error).__name__

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--attempts', type=int, default=30)
    parser.add_argument('--interval', type=float, default=10)
    args=parser.parse_args()
    if args.attempts < 1 or args.interval < 0:
        parser.error('attempts must be positive; interval must be nonnegative')
    revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    urls=targets()
    for attempt in range(1,args.attempts+1):
        with ThreadPoolExecutor(max_workers=8) as pool:
            results=list(pool.map(lambda url:verify(url,revision),urls))
        failures=[(url,error) for url,error in results if error]
        if not failures:
            print(f'Publication verified: {revision}, {len(urls)} public URLs match checkout.')
            return 0
        print(f'Publication pending ({attempt}/{args.attempts}): {len(failures)} URLs differ.')
        for url,error in failures[:8]:
            print(url, error)
        if attempt < args.attempts:
            time.sleep(args.interval)
    print('Publication not verified; do not notify IndexNow for this checkout.')
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
