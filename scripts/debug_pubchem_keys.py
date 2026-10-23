import requests

url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/23725625/property/MolecularWeight,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,CanonicalSMILES/JSON"
r = requests.get(url, timeout=10)
props = r.json().get("PropertyTable", {}).get("Properties", [])[0]
print("Keys in PropertyTable when requesting CanonicalSMILES:", list(props.keys()))
