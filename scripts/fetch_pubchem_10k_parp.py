"""
BioNova PARP1: Target-Relevant 10,000 Compound Screening Library Fetcher.
Retrieves 10k authentic PubChem compounds grounded in PARP1 catalytic pharmacophores:
Phthalazinones, Benzamides, Isoquinolinones, Quinazolinones, Indazoles, and Benzimidazoles.
Applies target-specific physicochemical filters (HBD 1-5, MW 200-550, cLogP -1 to 4.5, TPSA 40-140, RotB <= 8).
Enforces zero overlap with curated training/validation/test datasets.
"""

import os
import sys
import time
import json
import urllib.parse
from pathlib import Path
from typing import List, Set, Dict

import requests
import pandas as pd
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski
from rdkit.Chem.MolStandardize import rdMolStandardize


def get_known_parp1_dataset_smiles() -> Set[str]:
    """Load canonical SMILES from training, validation, and test sets to guarantee zero leakage."""
    known = set()
    for p in ["splits/train.csv", "splits/val.csv", "splits/test.csv", "data/processed/parp1_regression.csv"]:
        path = Path(p)
        if path.exists():
            df = pd.read_csv(path)
            if "smiles" in df.columns:
                known.update(df["smiles"].dropna().tolist())
    print(f"Loaded {len(known)} known benchmark PARP1 SMILES to exclude from screening.")
    return known


def fetch_cids_for_core(name: str, smiles: str, threshold: int = 65, max_records: int = 1500) -> List[int]:
    """Query PubChem PUG REST fastsimilarity_2d for target pharmacophore cores."""
    encoded = urllib.parse.quote(smiles)
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsimilarity_2d/smiles/{encoded}/cids/JSON?Threshold={threshold}&MaxRecords={max_records}"
    try:
        r = requests.get(url, timeout=20)
        if r.status_code == 200:
            cids = r.json().get("IdentifierList", {}).get("CID", [])
            print(f"  [+] Core '{name}' (Threshold {threshold}%): Retrieved {len(cids)} CIDs")
            return cids
        else:
            print(f"  [-] Core '{name}' failed with status {r.status_code}")
            return []
    except Exception as e:
        print(f"  [-] Core '{name}' query error: {e}")
        return []


def fetch_properties_for_cids(cids: List[int], batch_size: int = 400) -> pd.DataFrame:
    """Batch fetch physicochemical properties and SMILES from PubChem PUG REST."""
    props = "MolecularWeight,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,ConnectivitySMILES,CanonicalSMILES"
    records = []
    
    total_batches = (len(cids) + batch_size - 1) // batch_size
    print(f"Fetching properties for {len(cids)} CIDs in {total_batches} batches...")
    
    for i in range(0, len(cids), batch_size):
        batch = cids[i:i + batch_size]
        cid_str = ",".join(map(str, batch))
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid_str}/property/{props}/JSON"
        
        success = False
        for retry in range(3):
            try:
                r = requests.get(url, timeout=25)
                if r.status_code == 200:
                    data = r.json().get("PropertyTable", {}).get("Properties", [])
                    records.extend(data)
                    success = True
                    break
                elif r.status_code == 503 or r.status_code == 429:
                    time.sleep(2.0 * (retry + 1))
            except Exception:
                time.sleep(1.5)
                
        if not success:
            print(f"  Warning: batch {i // batch_size + 1}/{total_batches} failed.")
        else:
            if (i // batch_size + 1) % 5 == 0 or (i // batch_size + 1) == total_batches:
                print(f"  Fetched {len(records)} compound properties ({i // batch_size + 1}/{total_batches} batches done)...")
        time.sleep(0.3)
        
    df = pd.DataFrame(records)
    return df


def curate_and_filter_10k_library(target_count: int = 10000):
    output_dir = Path("data/raw")
    output_dir.mkdir(parents=True, exist_ok=True)
    results_dir = Path("results")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    output_csv = output_dir / "pubchem_10k_parp_screen.csv"
    meta_json = results_dir / "screening_10k_provenance.json"
    
    known_benchmark_smiles = get_known_parp1_dataset_smiles()
    
    # Target-relevant pharmacophoric cores representative of PARP1 active site binders
    pharmacophore_cores = [
        ("Phthalazinone_OlaparibCore", "O=C1NN=Cc2ccccc21", 60, 2000),
        ("Benzamide_NicotinamideMimetic", "NC(=O)c1ccccc1", 60, 2000),
        ("Isoquinolinone_Core", "O=C1NC=Cc2ccccc21", 60, 2000),
        ("Benzimidazole_VeliparibCore", "NC(=O)c1cccc2nc[nH]c12", 60, 2000),
        ("Indazole_NiraparibCore", "NC(=O)c1cccc2[nH]ncc12", 60, 2000),
        ("Indole_RucaparibCore", "NC(=O)c1cccc2[nH]ccc12", 60, 2000),
        ("Quinazolinone_Core", "O=C1NC=Nc2ccccc21", 60, 2000),
        ("4-Benzylphthalazinone", "O=C1NN=C(Cc2ccccc2)c2ccccc21", 55, 2000),
        ("Phenanthridinone_Core", "O=C1Nc2ccccc2-c2ccccc21", 55, 2000),
        ("Nicotinamide_Pyridine", "NC(=O)c1cccnc1", 60, 2000),
        ("Olaparib_Full_Similarity", "O=C1NN=C(Cc2ccc(C(=O)N3CCN(C(=O)C4CC4)CC3)cc2F)c2ccccc21", 55, 2000),
        ("Niraparib_Full_Similarity", "NC(=O)c1cccc(c1)c1ccc2[nH]ncc2c1", 55, 2000),
        ("Rucaparib_Full_Similarity", "NC(=O)c1cccc2c1[nH]c1c2ccc2c1CCNC2", 55, 2000),
        ("Veliparib_Full_Similarity", "CC1(CCCN1)c1nc2c(cccc2[nH]1)C(=O)N", 55, 2000),
        ("Talazoparib_Core", "c1ccc(c(c1)F)C2c3cc(ccc3C(=O)NN2)c4cn[nH]c4", 55, 2000),
        ("Benzamide_Extended", "NC(=O)c1ccc(cc1)c1ccccc1", 55, 2000),
        ("Pyrrolopyridine_Carboxamide", "NC(=O)c1ccnc2[nH]ccc12", 55, 2000),
        ("Pyrazole_Carboxamide", "NC(=O)c1c[nH]nc1-c1ccccc1", 55, 2000),
        ("Thienopyridinone", "O=C1Nc2sccc2C=C1", 55, 2000),
        ("Isoindolinone_Core", "O=C1NCc2ccccc21", 55, 2000)
    ]
    
    print("=== Step 1: Querying PubChem for PARP1 Pharmacophoric Cores ===")
    all_cids: Set[int] = set()
    for name, smi, thresh, max_rec in pharmacophore_cores:
        cids = fetch_cids_for_core(name, smi, thresh, max_rec)
        all_cids.update(cids)
        time.sleep(0.3)
        
    print(f"Total Unique Pharmacophore-Relevant CIDs Collected: {len(all_cids)}")
    
    # Step 2: Fetch compound properties
    print("\n=== Step 2: Fetching Physicochemical Properties from PubChem ===")
    raw_df = fetch_properties_for_cids(list(all_cids))
    print(f"Retrieved properties for {len(raw_df)} compounds.")
    
    # Step 3: Target-Specific Physicochemical Filtering & Standardization
    print("\n=== Step 3: Applying Target-Specific Physicochemical Filtering ===")
    # Requirements:
    # 200 <= MW <= 550 (PARP catalytic pocket size)
    # -1.0 <= cLogP <= 4.5 (drug-like oral bioavailability)
    # 1 <= HBD <= 5 (mandatory hydrogen bond donor for Ser904/Gly863 backbone)
    # 2 <= HBA <= 10
    # 40 <= TPSA <= 140
    # RotatableBonds <= 8 (minimizes binding entropy penalty)
    
    filtered_records = []
    excluded_stats = {
        "mw_out_of_range": 0,
        "logp_out_of_range": 0,
        "hbd_zero_or_excessive": 0,
        "hba_out_of_range": 0,
        "tpsa_out_of_range": 0,
        "rotb_excessive": 0,
        "invalid_smiles": 0,
        "benchmark_leakage": 0
    }
    
    chooser = rdMolStandardize.LargestFragmentChooser()
    
    for idx, row in raw_df.iterrows():
        smi = row.get("ConnectivitySMILES") or row.get("CanonicalSMILES") or row.get("SMILES") or row.get("IsomericSMILES")
        if not smi or pd.isna(smi):
            excluded_stats["invalid_smiles"] += 1
            continue
            
        try:
            mol = Chem.MolFromSmiles(smi)
            if not mol:
                excluded_stats["invalid_smiles"] += 1
                continue
                
            # Desalt to parent organic
            mol = chooser.choose(mol)
            canon_smi = Chem.MolToSmiles(mol, canonical=True)
            
            # Zero-leakage check
            if canon_smi in known_benchmark_smiles:
                excluded_stats["benchmark_leakage"] += 1
                continue
                
            # Target-specific parameters
            mw = float(row.get("MolecularWeight", Descriptors.MolWt(mol)))
            xlogp = float(row.get("XLogP", Descriptors.MolLogP(mol))) if pd.notna(row.get("XLogP")) else Descriptors.MolLogP(mol)
            tpsa = float(row.get("TPSA", Descriptors.TPSA(mol)))
            hbd = int(row.get("HBondDonorCount", Lipinski.NumHDonors(mol)))
            hba = int(row.get("HBondAcceptorCount", Lipinski.NumHAcceptors(mol)))
            rotb = int(row.get("RotatableBondCount", Lipinski.NumRotatableBonds(mol)))
            
            if not (200.0 <= mw <= 550.0):
                excluded_stats["mw_out_of_range"] += 1
                continue
            if not (-1.0 <= xlogp <= 4.5):
                excluded_stats["logp_out_of_range"] += 1
                continue
            if not (1 <= hbd <= 5):
                excluded_stats["hbd_zero_or_excessive"] += 1
                continue
            if not (2 <= hba <= 10):
                excluded_stats["hba_out_of_range"] += 1
                continue
            if not (40.0 <= tpsa <= 140.0):
                excluded_stats["tpsa_out_of_range"] += 1
                continue
            if rotb > 8:
                excluded_stats["rotb_excessive"] += 1
                continue
                
            cid = row.get("CID")
            filtered_records.append({
                "compound_id": f"PUBCHEM_{cid}",
                "cid": int(cid),
                "smiles": canon_smi,
                "mw": round(mw, 2),
                "logp": round(xlogp, 2),
                "tpsa": round(tpsa, 1),
                "hbd": hbd,
                "hba": hba,
                "rotb": rotb,
                "source": "PubChem PUG REST (PARP1 Targeted)",
                "target_pharmacophore": "PARP1 Catalytic Active Site"
            })
            
            if len(filtered_records) >= target_count:
                break
        except Exception:
            continue
            
    filtered_df = pd.DataFrame(filtered_records).drop_duplicates(subset=["smiles"]).reset_index(drop=True)
    print(f"\nFinal Curated Target-Relevant Screening Compounds: {len(filtered_df)}")
    print(f"Exclusion Breakdown: {json.dumps(excluded_stats, indent=2)}")
    
    # Save screening library
    filtered_df.to_csv(output_csv, index=False)
    print(f"Saved: {output_csv}")
    
    # Save provenance metadata
    meta = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "target": "Human PARP1 (P09874 / CHEMBL3105)",
        "source": "NCBI PubChem PUG REST",
        "pharmacophore_cores_queried": [c[0] for c in pharmacophore_cores],
        "total_cids_queried": len(all_cids),
        "total_passing_target_filters": len(filtered_df),
        "target_physicochemical_ranges": {
            "mw": [200.0, 550.0],
            "logp": [-1.0, 4.5],
            "hbd": [1, 5],
            "hba": [2, 10],
            "tpsa": [40.0, 140.0],
            "rotatable_bonds_max": 8
        },
        "zero_leakage_enforced": True,
        "exclusions": excluded_stats
    }
    with open(meta_json, "w") as f:
        json.dump(meta, f, indent=2)
        
    return filtered_df


if __name__ == "__main__":
    curate_and_filter_10k_library()
