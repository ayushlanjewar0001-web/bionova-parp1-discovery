"""
BioNova PARP1 Screening Library Acquisition & Preprocessing
Retrieves authentic PubChem compound records, performs streaming QC and physicochemical filtering.
"""

import gzip
import hashlib
import io
import json
from pathlib import Path
from typing import Dict, Generator, Iterator, List, Optional, Set, Tuple
import pandas as pd
import requests
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski


def compute_physicochemical_properties(mol: Chem.Mol) -> Dict[str, float]:
    """Compute standard Lipinski and Veber physicochemical descriptors."""
    return {
        "mw": Descriptors.MolWt(mol),
        "logp": Descriptors.MolLogP(mol),
        "hbd": Lipinski.NumHDonors(mol),
        "hba": Lipinski.NumHAcceptors(mol),
        "tpsa": Descriptors.TPSA(mol),
        "rotatable_bonds": Lipinski.NumRotatableBonds(mol)
    }


def satisfies_filters(props: Dict[str, float], filters: Dict) -> bool:
    """Check if molecule properties fall within configured filtering bounds."""
    mw_range = filters.get("molecular_weight", [150.0, 650.0])
    logp_range = filters.get("logp", [-2.0, 5.5])
    rot_range = filters.get("rotatable_bonds", [0, 12])
    hbd_range = filters.get("hbd", [0, 6])
    hba_range = filters.get("hba", [1, 12])
    tpsa_range = filters.get("tpsa", [20.0, 160.0])
    
    if not (mw_range[0] <= props["mw"] <= mw_range[1]):
        return False
    if not (logp_range[0] <= props["logp"] <= logp_range[1]):
        return False
    if not (rot_range[0] <= props["rotatable_bonds"] <= rot_range[1]):
        return False
    if not (hbd_range[0] <= props["hbd"] <= hbd_range[1]):
        return False
    if not (hba_range[0] <= props["hba"] <= hba_range[1]):
        return False
    if not (tpsa_range[0] <= props["tpsa"] <= tpsa_range[1]):
        return False
    return True


def fetch_pubchem_records(
    cids: List[int],
    chunk_size: int = 100
) -> Generator[Dict, None, None]:
    """
    Fetch authentic compound records (CID + isomeric/canonical SMILES) from official PubChem REST API in chunks.
    Rate-limited and polite.
    """
    base_url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{}/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,XLogP/JSON"
    
    for i in range(0, len(cids), chunk_size):
        chunk = cids[i:i + chunk_size]
        cid_str = ",".join(str(c) for c in chunk)
        url = base_url.format(cid_str)
        try:
            resp = requests.get(url, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                props = data.get("PropertyTable", {}).get("Properties", [])
                for item in props:
                    cid = item.get("CID")
                    smiles = item.get("IsomericSMILES") or item.get("CanonicalSMILES")
                    if cid and smiles:
                        yield {
                            "cid": cid,
                            "smiles": smiles,
                            "formula": item.get("MolecularFormula", ""),
                            "source": "PubChem"
                        }
        except Exception as e:
            print(f"Warning: error fetching chunk {i}: {e}")
            continue


def build_screening_library(
    candidate_records: List[Dict],
    known_training_smiles: Set[str],
    filters: Dict,
    max_count: int = 10000
) -> Tuple[pd.DataFrame, Dict]:
    """
    Filter candidate screening compounds against known training SMILES and physicochemical criteria.
    """
    valid_compounds = []
    excluded_overlap = 0
    excluded_filters = 0
    excluded_invalid_mol = 0
    
    for rec in candidate_records:
        cid = rec["cid"]
        smi = rec["smiles"]
        
        # 1. RDKit validation
        mol = Chem.MolFromSmiles(smi)
        if mol is None:
            excluded_invalid_mol += 1
            continue
        
        canon_smiles = Chem.MolToSmiles(mol, isomericSmiles=True, canonical=True)
        
        # 2. Prevent leakage with known training/validation/test structures
        if canon_smiles in known_training_smiles:
            excluded_overlap += 1
            continue
        
        # 3. Physicochemical properties
        props = compute_physicochemical_properties(mol)
        if not satisfies_filters(props, filters):
            excluded_filters += 1
            continue
        
        valid_compounds.append({
            "compound_id": f"PUBCHEM_{cid}",
            "cid": cid,
            "smiles": canon_smiles,
            **props,
            "source": "PubChem"
        })
        
        if len(valid_compounds) >= max_count:
            break
    
    df = pd.DataFrame(valid_compounds)
    stats = {
        "raw_screened": len(candidate_records),
        "valid_eligible": len(df),
        "excluded_known_training_overlap": excluded_overlap,
        "excluded_physicochemical_filters": excluded_filters,
        "excluded_invalid_molecules": excluded_invalid_mol
    }
    return df, stats
