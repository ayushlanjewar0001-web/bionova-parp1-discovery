import json
import urllib.request

url = "https://api.github.com/repos/ccsb-scripps/AutoDock-Vina/releases"
req = urllib.request.Request(url, headers={"User-Agent": "BioNova-PARP1/1.0"})
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())
        for rel in data[:3]:
            print("Release:", rel.get("tag_name"))
            for asset in rel.get("assets", []):
                print("  Asset:", asset.get("name"), "| URL:", asset.get("browser_download_url"))
except Exception as e:
    print("Error:", e)
