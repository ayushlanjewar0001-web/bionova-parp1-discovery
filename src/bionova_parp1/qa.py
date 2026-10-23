"""
BioNova PARP1 QA and Standardization Module
Handles molecular sanitation, salt stripping, deduplication, and mathematical endpoint validation.
"""

import math
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from rdkit import Chem
from rdkit.Chem.MolStandardize import rdMolStandardize


def calculate_pic50(value: float, unit: str = "nM") -> Optional[float]:
    """
    Calculate pIC50 from experimental IC50 value.
    - If unit == 'nM': pIC50 = 9 - log10(IC50_nM)
    - If unit == 'M': pIC50 = -log10(IC50_M)
    - If unit == 'uM': pIC50 = 6 - log10(IC50_uM)
    Returns None for non-positive or invalid inputs.
    """
    if value is None or np.isnan(value) or value <= 0:
        return None
    
    unit_lower = unit.strip().lower()
    if unit_lower in ["pchembl", "pic50", "pchembl_value"]:
        return float(value)
    elif unit_lower in ["nm", "nanomolar"]:
        return 9.0 - math.log10(value)
    elif unit_lower in ["m", "molar"]:
        return -math.log10(value)
    elif unit_lower in ["um", "micromolar", "µm"]:
        return 6.0 - math.log10(value)
    else:
        # Default assumption if unspecified or standard nM
        return 9.0 - math.log10(value)


def standardize_smiles(smiles: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Standardize a SMILES string:
    1. Parse with RDKit
    2. Extract largest fragment (desalt)
    3. Neutralize/standardize where appropriate
    4. Generate canonical SMILES
    
    Returns:
        (canonical_smiles, parent_smiles, error_message)
    """
    if not smiles or not isinstance(smiles, str) or not smiles.strip():
        return None, None, "Empty or invalid SMILES string"
    
    try:
        mol = Chem.MolFromSmiles(smiles.strip())
        if mol is None:
            return None, None, "RDKit MolFromSmiles failed"
        
        # Desalt: Keep largest fragment
        remover = rdMolStandardize.LargestFragmentChooser()
        clean_mol = remover.choose(mol)
        if clean_mol is None:
            return None, None, "Fragment chooser failed"
        
        canonical_smiles = Chem.MolToSmiles(clean_mol, isomericSmiles=True, canonical=True)
        # Parent non-isomeric SMILES for duplicate grouping across stereoisomers
        parent_smiles = Chem.MolToSmiles(clean_mol, isomericSmiles=False, canonical=True)
        
        return canonical_smiles, parent_smiles, None
    except Exception as e:
        return None, None, f"Standardization exception: {str(e)}"


def filter_and_curate_bioactivity(
    df: pd.DataFrame,
    smiles_col: str = "smiles",
    value_col: str = "value",
    relation_col: Optional[str] = "relation",
    unit_col: Optional[str] = "units",
    compound_id_col: Optional[str] = "compound_id",
    assay_id_col: Optional[str] = "assay_id"
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict]:
    """
    Filter, clean, and standardize bioactivity records for PARP1 regression.
    Strictly removes censored values (<, >) and handles duplicate measurements via median aggregation.
    """
    exclusions = []
    clean_records = []
    
    total_raw = len(df)
    
    for idx, row in df.iterrows():
        comp_id = row.get(compound_id_col, f"CMP_{idx}") if compound_id_col else f"CMP_{idx}"
        raw_smiles = row.get(smiles_col, "")
        val = row.get(value_col, None)
        relation = str(row.get(relation_col, "=")).strip() if relation_col in row else "="
        unit = str(row.get(unit_col, "nM")).strip() if unit_col in row else "nM"
        assay_id = row.get(assay_id_col, "ASSAY_UNKNOWN") if assay_id_col else "ASSAY_UNKNOWN"
        
        # 1. Check censorship
        if relation not in ["=", "==", "exact", ""]:
            exclusions.append({
                "compound_id": comp_id,
                "smiles": raw_smiles,
                "reason": f"Censored measurement relation: '{relation}'",
                "raw_value": val
            })
            continue
        
        # 2. Check value positivity
        try:
            val_float = float(val)
            if val_float <= 0 or np.isnan(val_float):
                exclusions.append({
                    "compound_id": comp_id,
                    "smiles": raw_smiles,
                    "reason": f"Non-positive or NaN bioactivity value: {val}",
                    "raw_value": val
                })
                continue
        except (ValueError, TypeError):
            exclusions.append({
                "compound_id": comp_id,
                "smiles": raw_smiles,
                "reason": f"Invalid numerical value: {val}",
                "raw_value": val
            })
            continue
        
        # 3. Calculate pIC50
        pic50 = calculate_pic50(val_float, unit=unit)
        if pic50 is None or pic50 < 2.0 or pic50 > 12.0:
            exclusions.append({
                "compound_id": comp_id,
                "smiles": raw_smiles,
                "reason": f"pIC50 out of plausible pharmacological range (2-12): {pic50}",
                "raw_value": val
            })
            continue
        
        # 4. Standardize SMILES
        canon_smiles, parent_smiles, err = standardize_smiles(raw_smiles)
        if err or not canon_smiles:
            exclusions.append({
                "compound_id": comp_id,
                "smiles": raw_smiles,
                "reason": f"SMILES standardization failure: {err}",
                "raw_value": val
            })
            continue
        
        clean_records.append({
            "compound_id": comp_id,
            "smiles": canon_smiles,
            "parent_smiles": parent_smiles,
            "raw_value": val_float,
            "units": unit,
            "pIC50": pic50,
            "assay_id": assay_id,
            "provenance": row.get("provenance", "Experimental Curation")
        })
    
    clean_df = pd.DataFrame(clean_records)
    excl_df = pd.DataFrame(exclusions)
    
    if clean_df.empty:
        return clean_df, excl_df, {"total_raw": total_raw, "valid_clean": 0, "replicates_consolidated": 0}
    
    # 5. Handle duplicate measurements for identical canonical SMILES via median aggregation
    initial_valid = len(clean_df)
    grouped = clean_df.groupby("smiles").agg({
        "pIC50": "median",
        "compound_id": "first",
        "parent_smiles": "first",
        "assay_id": lambda s: ";".join(str(x) for x in set(s)),
        "provenance": "first",
        "raw_value": "count"  # count of replicates
    }).reset_index()
    
    grouped.rename(columns={"raw_value": "replicate_count"}, inplace=True)
    replicates_consolidated = initial_valid - len(grouped)
    
    stats = {
        "total_raw": total_raw,
        "excluded_records": len(excl_df),
        "valid_pre_dedup": initial_valid,
        "unique_structures": len(grouped),
        "replicates_consolidated": replicates_consolidated,
        "pic50_min": float(grouped["pIC50"].min()),
        "pic50_max": float(grouped["pIC50"].max()),
        "pic50_mean": float(grouped["pIC50"].mean()),
        "pic50_std": float(grouped["pIC50"].std())
    }
    
    return grouped, excl_df, stats
