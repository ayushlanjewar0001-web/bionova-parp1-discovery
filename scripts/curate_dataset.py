"""
Execution script for Phase 1: Data Curation & QA.
Extracts IC50-only records from Papyrus raw data, applies strict QA and SMILES canonicalization,
and outputs data/processed/parp1_regression.csv and data/processed/exclusion_log.csv.
"""

import sys
import os
sys.path.insert(0, os.path.abspath("src"))

import json
from pathlib import Path
import pandas as pd
from rdkit import Chem
from bionova_parp1.qa import filter_and_curate_bioactivity


def run_curation():
    raw_path = Path("data/raw/papyrus_parp1_raw.tsv")
    processed_dir = Path("data/processed")
    results_dir = Path("results")
    processed_dir.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading raw extracted Papyrus records from {raw_path}...")
    df = pd.read_csv(raw_path, sep="\t", low_memory=False)
    print(f"Total raw records: {len(df)}")
    
    # Cast type columns to string
    df["type_IC50_str"] = df["type_IC50"].astype(str).str.strip()
    df["type_Ki_str"] = df["type_Ki"].astype(str).str.strip()
    df["type_KD_str"] = df["type_KD"].astype(str).str.strip()
    df["type_EC50_str"] = df["type_EC50"].astype(str).str.strip()
    
    # Strictly require type_IC50 == '1' and NO Ki/Kd/EC50 contamination
    is_pure_ic50 = (
        (df["type_IC50_str"] == "1")
        & (~df["type_Ki_str"].str.contains("1", na=False))
        & (~df["type_KD_str"].str.contains("1", na=False))
        & (~df["type_EC50_str"].str.contains("1", na=False))
    )
    
    ic50_df = df[is_pure_ic50].copy()
    non_ic50_df = df[~is_pure_ic50].copy()
    print(f"Filtered for strictly pure IC50: {len(ic50_df)} records (Excluded non-IC50/mixed: {len(non_ic50_df)})")
    
    exclusions = []
    for _, row in non_ic50_df.iterrows():
        exclusions.append({
            "compound_id": str(row.get("CID", row.get("connectivity", "UNKNOWN"))),
            "smiles": str(row.get("SMILES", "")),
            "reason": f"Excluded: Mixed or non-IC50 endpoint (IC50={row.get('type_IC50_str')}, Ki={row.get('type_Ki_str')}, KD={row.get('type_KD_str')}, EC50={row.get('type_EC50_str')})",
            "raw_value": row.get("pchembl_value_Median", row.get("pchembl_value_Mean"))
        })
        
    records = []
    for idx, row in ic50_df.iterrows():
        comp_id = str(row.get("CID", row.get("connectivity", f"PAP_{idx}")))
        raw_smi = str(row.get("SMILES", "")).strip()
        relation = str(row.get("relation", "=")).strip()
        val = row.get("pchembl_value_Median", row.get("pchembl_value_Mean"))
        aid = str(row.get("AID", "PAP_ASSAY"))
        
        # Check relation
        if relation not in ["=", "==", ""]:
            exclusions.append({
                "compound_id": comp_id,
                "smiles": raw_smi,
                "reason": f"Censored inequality relation: '{relation}'",
                "raw_value": val
            })
            continue
            
        try:
            val_flt = float(val)
            if pd.isna(val_flt) or val_flt < 2.0 or val_flt > 12.0:
                exclusions.append({
                    "compound_id": comp_id,
                    "smiles": raw_smi,
                    "reason": f"Value out of plausible pIC50 range (2-12): {val_flt}",
                    "raw_value": val
                })
                continue
        except (ValueError, TypeError):
            exclusions.append({
                "compound_id": comp_id,
                "smiles": raw_smi,
                "reason": f"Invalid numerical pIC50 value: {val}",
                "raw_value": val
            })
            continue
            
        records.append({
            "compound_id": f"PAP_{comp_id}",
            "smiles": raw_smi,
            "value": val_flt,
            "units": "pchembl",
            "relation": relation,
            "assay_id": aid,
            "provenance": "Papyrus 2024 (Zenodo 13987985) Quality Tier ++"
        })
        
    df_valid = pd.DataFrame(records)
    df_excl_init = pd.DataFrame(exclusions)
    
    curated_df, qa_excl_df, stats = filter_and_curate_bioactivity(
        df_valid,
        smiles_col="smiles",
        value_col="value",
        relation_col="relation",
        unit_col="units",
        compound_id_col="compound_id",
        assay_id_col="assay_id"
    )
    
    all_exclusions = pd.concat([df_excl_init, qa_excl_df], ignore_index=True)
    
    # Save outputs
    out_csv = processed_dir / "parp1_regression.csv"
    excl_csv = processed_dir / "exclusion_log.csv"
    qual_json = results_dir / "data_quality.json"
    
    final_cols = ["compound_id", "smiles", "pIC50", "assay_id", "provenance"]
    curated_df[final_cols].to_csv(out_csv, index=False)
    all_exclusions.to_csv(excl_csv, index=False)
    
    stats["initial_papyrus_raw_count"] = len(df)
    stats["non_ic50_endpoints_filtered"] = len(non_ic50_df)
    stats["total_exclusions_logged"] = len(all_exclusions)
    stats["curated_unique_molecules"] = len(curated_df)
    stats["target_name"] = "Human PARP1 (P09874 / CHEMBL3105)"
    stats["dataset_citation"] = "Papyrus 2024 (Bequignon et al., J. Cheminform, Zenodo 13987985)"
    
    with open(qual_json, "w") as f:
        json.dump(stats, f, indent=2)
        
    print(f"\n=== CURATION SUMMARY ===")
    print(f"Raw Input Records: {len(df)}")
    print(f"Excluded Non-IC50 / Mixed / Censored / Invalids: {len(all_exclusions)}")
    print(f"Final High-Quality Unique PARP1 Molecules: {len(curated_df)}")
    print(f"pIC50 Range: {stats['pic50_min']:.2f} to {stats['pic50_max']:.2f} (Mean: {stats['pic50_mean']:.2f} +/- {stats['pic50_std']:.2f})")
    print(f"Saved: {out_csv}")
    print(f"Exclusion Log: {excl_csv}")
    print(f"Quality Metrics: {qual_json}")


if __name__ == "__main__":
    run_curation()
