"""
BioNova PARP1: High-Throughput ChemProp v2 Screening on 10,000 Target-Relevant Compounds.
Executes trained D-MPNN model inference to predict continuous pIC50.
Ranks candidates and selects top 50 structurally diverse compounds for AutoDock Vina batch docking.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
import time
import subprocess
from pathlib import Path
import pandas as pd
import numpy as np

from bionova_parp1.rank import select_top_diverse_candidates


def screen_10k_library():
    lib_path = Path("data/raw/pubchem_10k_parp_screen.csv")
    model_dir = Path("models/chemprop_parp1/model_0")
    results_dir = Path("results")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    if not lib_path.exists():
        raise FileNotFoundError(f"Screening library {lib_path} does not exist yet!")
        
    print(f"Loading 10k target-relevant screening library from {lib_path}...")
    df_lib = pd.read_csv(lib_path)
    print(f"Loaded {len(df_lib)} compounds for ChemProp v2 screening.")
    
    preds_out = results_dir / "chemprop_10k_preds.csv"
    chemprop_exe = Path(".venv/Scripts/chemprop.exe")
    model_ckpt = model_dir / "best.pt"
    
    cmd = [
        str(chemprop_exe),
        "predict",
        "-i", str(lib_path),
        "-s", "smiles",
        "--model-path", str(model_ckpt),
        "-o", str(preds_out)
    ]
    print(f"Executing ChemProp v2 prediction across {len(df_lib)} compounds...")
    t0 = time.time()
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ChemProp predict failed: {res.stderr}")
        raise RuntimeError(f"ChemProp predict error: {res.stderr}")
        
    print(f"ChemProp screening complete in {time.time() - t0:.2f}s.")
    df_preds = pd.read_csv(preds_out)
    
    # Locate prediction column
    if "pIC50" in df_preds.columns:
        pred_col = "pIC50"
    elif "pred_pIC50" in df_preds.columns:
        pred_col = "pred_pIC50"
    else:
        numeric_cols = [c for c in df_preds.columns if pd.api.types.is_numeric_dtype(df_preds[c])]
        pred_col = numeric_cols[-1]
        
    print(f"Using prediction column: '{pred_col}'")
    df_lib["predicted_pIC50"] = pd.to_numeric(df_preds[pred_col], errors="coerce").values
    
    # Save full screened library
    screened_parquet = results_dir / "screened_10k_compounds.parquet"
    screened_csv = results_dir / "screened_10k_compounds.csv"
    df_lib.to_parquet(screened_parquet, index=False)
    df_lib.to_csv(screened_csv, index=False)
    print(f"Saved full screened library ({len(df_lib)} compounds) to {screened_parquet} and {screened_csv}")
    
    # Select top 50 diverse candidates for docking (as requested by user)
    print("\nSelecting Top 50 diverse candidates for AutoDock Vina docking...")
    top50_df, full_sorted_df, stats = select_top_diverse_candidates(
        df_lib,
        target_count=50,
        potency_col="predicted_pIC50",
        smiles_col="smiles",
        similarity_threshold=0.75
    )
    
    top50_csv = results_dir / "top50_for_docking.csv"
    top50_df.to_csv(top50_csv, index=False)
    
    top50_meta = results_dir / "top50_selection_metrics.json"
    with open(top50_meta, "w") as f:
        json.dump(stats, f, indent=2)
        
    print(f"\nTop 50 Candidates Selected (pIC50 range: {top50_df['predicted_pIC50'].min():.2f} - {top50_df['predicted_pIC50'].max():.2f}):")
    print(f"Saved to {top50_csv}")
    return top50_df


if __name__ == "__main__":
    screen_10k_library()
