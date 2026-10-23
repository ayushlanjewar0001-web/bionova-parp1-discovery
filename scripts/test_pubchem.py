import requests

url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244,2245/property/ConnectivitySMILES,CanonicalSMILES,IsomericSMILES,MolecularWeight,XLogP,TPSA/JSON"
try:
    r = requests.get(url, headers={"User-Agent": "BioNova-PARP1/1.0"}, timeout=15)
    print("Status:", r.status_code)
    print("Response text:", r.text[:300])
except Exception as e:
    print("Error:", e)
