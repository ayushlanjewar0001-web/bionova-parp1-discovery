import requests
import urllib.parse

def test():
    # Test fast similarity to Olaparib (CID 23725625) or 2-phenylbenzamide or phthalazinone
    # PUG REST: https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/similarity/smiles/{smiles}/cids/JSON?Threshold=70&MaxRecords=1000
    cores = [
        ("Phthalazinone", "O=C1NN=Cc2ccccc21"),
        ("Benzamide", "NC(=O)c1ccccc1"),
        ("Veliparib_Core", "NC(=O)c1cccc2nc[nH]c12"),
        ("Olaparib", "O=C1NN=C(Cc2ccc(C(=O)N3CCN(C(=O)C4CC4)CC3)cc2F)c2ccccc21")
    ]
    
    for name, smi in cores:
        encoded = urllib.parse.quote(smi)
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsimilarity_2d/smiles/{encoded}/cids/JSON?Threshold=60&MaxRecords=1000"
        r = requests.get(url, timeout=15)
        print(f"{name} fastsimilarity status: {r.status_code}")
        if r.status_code == 200:
            cids = r.json().get("IdentifierList", {}).get("CID", [])
            print(f"  -> Found {len(cids)} CIDs")
        elif r.status_code == 202:
            print("  -> Asynchronous job accepted (WaitingKey)")

if __name__ == "__main__":
    test()
