"""
Execution script for Phase 3: External PubChem Screening Library Acquisition.
Retrieves authentic compound records from PubChem, applies physicochemical filters,
and eliminates any overlap with training/validation/test datasets.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import hashlib
import json
import time
from pathlib import Path
import pandas as pd
import requests
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski


def run_library_acquisition(target_count: int = 1000):
    raw_dir = Path("data/raw")
    results_dir = Path("results")
    raw_dir.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Load known training/val/test SMILES to prevent contamination
    train_df = pd.read_csv("splits/train.csv")
    val_df = pd.read_csv("splits/val.csv")
    test_df = pd.read_csv("splits/test.csv")
    
    known_smiles = set(train_df["smiles"]).union(set(val_df["smiles"])).union(set(test_df["smiles"]))
    print(f"Loaded {len(known_smiles)} known project structures to enforce zero leakage.")
    
    # 2. Query PubChem CIDs across diverse drug-like ranges
    cids = []
    # Mix diverse ranges across PubChem
    for base in [2000, 10000, 25000, 50000, 75000, 100000, 150000, 250000, 500000, 750000, 1000000]:
        cids.extend(list(range(base, base + 150)))
    
    print(f"Targeting {len(cids)} authentic PubChem CIDs across diverse chemical space...")
    
    candidate_records = []
    chunk_size = 100
    base_url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{}/property/ConnectivitySMILES,CanonicalSMILES,IsomericSMILES,MolecularWeight,XLogP,TPSA/JSON"
    
    for i in range(0, len(cids), chunk_size):
        chunk = cids[i:i + chunk_size]
        cid_str = ",".join(str(c) for c in chunk)
        url = base_url.format(cid_str)
        try:
            resp = requests.get(url, headers={"User-Agent": "BioNova-PARP1/1.0"}, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                props = data.get("PropertyTable", {}).get("Properties", [])
                for item in props:
                    cid = item.get("CID")
                    smi = item.get("SMILES") or item.get("ConnectivitySMILES") or item.get("CanonicalSMILES")
                    if cid and smi:
                        candidate_records.append({
                            "cid": cid,
                            "smiles": smi,
                            "mw": float(item.get("MolecularWeight", 0)),
                            "logp": float(item.get("XLogP", 0)) if item.get("XLogP") is not None else None,
                            "tpsa": float(item.get("TPSA", 0)) if item.get("TPSA") is not None else None,
                            "source": "PubChem"
                        })
            time.sleep(0.2)
        except Exception as e:
            print(f"Warning fetching PubChem chunk {i}: {e}")
            continue
            
        if len(candidate_records) >= target_count:
            break
            
    print(f"Acquired {len(candidate_records)} authentic PubChem compound records.")
    
    # 3. Filter against known training/val/test structures and physicochemical rules
    clean_candidates = []
    excluded_overlap = 0
    excluded_filters = 0
    excluded_invalids = 0
    
    for rec in candidate_records:
        mol = Chem.MolFromSmiles(rec["smiles"])
        if mol is None:
            excluded_invalids += 1
            continue
            
        canon_smi = Chem.MolToSmiles(mol, isomericSmiles=True, canonical=True)
        if canon_smi in known_smiles:
            excluded_overlap += 1
            continue
            
        # Compute exact RDKit descriptors
        mw = Descriptors.MolWt(mol)
        logp = Descriptors.MolLogP(mol)
        tpsa = Descriptors.TPSA(mol)
        rot_bonds = Lipinski.NumRotatableBonds(mol)
        hbd = Lipinski.NumHDonors(mol)
        hba = Lipinski.NumHAcceptors(mol)
        
        # Lipinski & Veber drug-likeness bounds
        if not (150.0 <= mw <= 650.0 and -2.0 <= logp <= 5.5 and rot_bonds <= 12 and hbd <= 6 and hba <= 12 and tpsa <= 160.0):
            excluded_filters += 1
            continue
            
        clean_candidates.append({
            "compound_id": f"PUBCHEM_{rec['cid']}",
            "cid": rec["cid"],
            "smiles": canon_smi,
            "mw": round(mw, 2),
            "logp": round(logp, 2),
            "tpsa": round(tpsa, 1),
            "rotatable_bonds": rot_bonds,
            "hbd": hbd,
            "hba": hba,
            "source": "PubChem"
        })
        
    df_screen = pd.DataFrame(clean_candidates)
    out_csv = raw_dir / "pubchem_screen_library.csv"
    df_screen.to_csv(out_csv, index=False)
    
    provenance = {
        "source": "PubChem PUG REST API",
        "sample_strategy": "Spaced authentic CID sampling across diverse chemical space",
        "total_fetched": len(candidate_records),
        "excluded_known_training_overlap": excluded_overlap,
        "excluded_physicochemical_filters": excluded_filters,
        "excluded_invalid_molecules": excluded_invalids,
        "eligible_screening_compounds": len(df_screen),
        "saved_path": str(out_csv)
    }
    
    with open(results_dir / "screening_library_provenance.json", "w") as f:
        json.dump(provenance, f, indent=2)
        
    print(f"\n=== SCREENING LIBRARY ACQUISITION SUMMARY ===")
    print(f"Total Fetched: {len(candidate_records)}")
    print(f"Excluded Training Overlaps: {excluded_overlap}")
    print(f"Excluded Physicochemical Filters: {excluded_filters}")
    print(f"Eligible Compounds for Screening: {len(df_screen)}")
    print(f"Saved: {out_csv}")
    return df_screen


if __name__ == "__main__":
    run_library_acquisition()
