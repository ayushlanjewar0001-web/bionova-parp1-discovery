import json
import urllib.request

url = 'https://zenodo.org/api/records/13987985'
req = urllib.request.Request(url, headers={'User-Agent': 'BioNova-PARP1/1.0'})
try:
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode())
        print('Title:', data.get('metadata', {}).get('title'))
        files = data.get('files', [])
        print(f'Total files: {len(files)}')
        for f in files:
            size_mb = f.get('size', 0) / (1024 * 1024)
            print(f"Key: {f.get('key')} | Size: {size_mb:.2f} MB")
except Exception as e:
    print('Zenodo API error:', e)
