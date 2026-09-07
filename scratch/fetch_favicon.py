import urllib.request
import re

url = 'https://www.sym-global.com'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        favicons = re.findall(r'<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\'](?:shortcut icon|icon|apple-touch-icon)["\']', html, re.I)
        favicons += re.findall(r'<link[^>]*rel=["\'](?:shortcut icon|icon|apple-touch-icon)["\'][^>]*href=["\']([^"\']+)["\']', html, re.I)
        print('Favicons found in HTML:', favicons)
        
        for fav in favicons:
            if not fav.startswith('http'):
                fav = 'https://www.sym-global.com/' + fav.lstrip('/')
            print('Downloading:', fav)
            req_fav = urllib.request.Request(fav, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_fav) as f_resp:
                data = f_resp.read()
                filename = 'public/official_' + fav.split('/')[-1].split('?')[0]
                with open(filename, 'wb') as f:
                    f.write(data)
                print(f'Saved {filename} ({len(data)} bytes)')
except Exception as e:
    print('Error:', e)
