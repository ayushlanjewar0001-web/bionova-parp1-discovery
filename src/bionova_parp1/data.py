"""
BioNova PARP1 Data Curation & QA Module
Converts raw bioactivity records into standardized, quality-assured regression datasets.
"""

import json
from pathlib import Path
from typing import Dict, Optional, Tuple
import pandas as pd

from bionova_parp1.qa import filter_and_curate_bioactivity


def process_papyrus_raw_data(
    input_tsv: Path = Path("data/raw/papyrus_parp1_raw.tsv"),
    output_csv: Path = Path("data/processed/parp1_regression.csv"),
    exclusion_csv: Path = Path("data/processed/exclusion_log.csv"),
    quality_json: Path = Path("results/data_quality.json")
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict]:
    """
    Load raw extracted Papyrus records for Human PARP1 and curate for D-MPNN regression.
    """
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    exclusion_csv.parent.mkdir(parents=True, exist_ok=True)
    quality_json.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Reading raw records from {input_tsv}...")
    df_raw = pd.read_csv(input_tsv, sep="\t", low_memory=False)
    print(f"Loaded {len(df_raw)} raw records.")
    
    # Identify relevant columns in Papyrus format
    # Papyrus columns typically include: 'SMILES', 'pchembl_value_Mean', 'Activity_class', 'type', 'relation', etc.
    smiles_col = "SMILES" if "SMILES" in df_raw.columns else "smiles"
    
    # Value column: pchembl_value_Mean or pchembl_value or Value
    val_col = None
    unit = "pchembl" # If already pChEMBL/pIC50
    for cand in ["pchembl_value_Mean", "pchembl_value", "Value", "pIC50", "activity_value"]:
        if cand in df_raw.columns:
            val_col = cand
            break
            
    if not val_col:
        raise ValueError(f"Could not find bioactivity value column in {df_raw.columns.tolist()}")
    
    # In Papyrus++, values in pchembl_value_Mean are already continuous pIC50 / pChEMBL values
    # Filter for IC50 type if 'type' column is present
    if "type" in df_raw.columns:
        ic50_mask = df_raw["type"].str.upper().str.contains("IC50", na=False)
        if ic50_mask.sum() > 0:
            df_filtered = df_raw[ic50_mask].copy()
        else:
            df_filtered = df_raw.copy()
    else:
        df_filtered = df_raw.copy()
        
    records = []
    exclusions = []
    
    for idx, row in df_filtered.iterrows():
        raw_smi = str(row.get(smiles_col, "")).strip()
        val = row.get(val_col, None)
        relation = str(row.get("relation", "=")).strip()
        comp_id = str(row.get("CID", row.get("connectivity", f"PAP_{idx}")))
        aid = str(row.get("AID", "PAP_ASSAY"))
        
        # Check relation
        if relation not in ["=", "==", ""]:
            exclusions.append({
                "compound_id": comp_id,
                "smiles": raw_smi,
                "reason": f"Censored inequality relation: {relation}",
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
                "reason": f"Non-numeric value: {val}",
                "raw_value": val
            })
            continue
            
        records.append({
            "compound_id": comp_id,
            "smiles": raw_smi,
            "value": val_flt,
            "units": "pchembl",
            "relation": relation,
            "assay_id": aid,
            "provenance": "Papyrus 2024 (Zenodo 13987985) Quality Tier ++"
        })
        
    df_candidates = pd.DataFrame(records)
    df_excl_init = pd.DataFrame(exclusions)
    
    # Run through QA standardization and deduplication
    curated_df, qa_excl_df, stats = filter_and_curate_bioactivity(
        df_candidates,
        smiles_col="smiles",
        value_col="value",
        relation_col="relation",
        unit_col="units",
        compound_id_col="compound_id",
        assay_id_col="assay_id"
    )
    
    # Combine exclusions
    all_exclusions = pd.concat([df_excl_init, qa_excl_df], ignore_index=True)
    all_exclusions.to_csv(exclusion_csv, index=False)
    
    # Save clean dataset
    curated_df.to_csv(output_csv, index=False)
    
    # Update stats
    stats["dataset_source"] = "Papyrus 2024"
    stats["target"] = "Human PARP1 (P09874 / CHEMBL3105)"
    stats["output_file"] = str(output_csv)
    stats["total_exclusions"] = len(all_exclusions)
    
    with open(quality_json, "w") as f:
        json.dump(stats, f, indent=2)
        
    print(f"Data curation complete: {len(curated_df)} clean unique compounds saved to {output_csv}")
    print(f"Exclusion log with {len(all_exclusions)} entries saved to {exclusion_csv}")
    
    return curated_df, all_exclusions, stats
