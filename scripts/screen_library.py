"""
Execution script for Phase 3: ChemProp Screening & Top-100 Selection.
Runs ChemProp v2 inference on the authentic PubChem screening library,
ranks compounds, enforces structural diversity, and selects top-100 candidates for docking.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
from pathlib import Path
import pandas as pd
import numpy as np
import subprocess
from bionova_parp1.rank import select_top_diverse_candidates


def run_screening():
    lib_path = Path("data/raw/pubchem_screen_library.csv")
    model_dir = Path("models/chemprop_parp1/model_0")
    results_dir = Path("results")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading screening library from {lib_path}...")
    df_lib = pd.read_csv(lib_path)
    print(f"Loaded {len(df_lib)} eligible screening compounds.")
    
    # Run ChemProp v2 predict CLI
    # chemprop predict -i data/raw/pubchem_screen_library.csv -s smiles --model-path models/chemprop_parp1/model_0/best.pt -o results/chemprop_screen_preds.csv
    preds_out = results_dir / "chemprop_screen_preds.csv"
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
    print(f"Executing ChemProp prediction: {' '.join(cmd)}")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ChemProp predict failed: {res.stderr}")
        raise RuntimeError(f"ChemProp predict error: {res.stderr}")
        
    print(f"ChemProp prediction complete. Loading predictions from {preds_out}...")
    df_preds = pd.read_csv(preds_out)
    print("ChemProp prediction columns:", df_preds.columns.tolist())
    
    # Locate actual prediction column (named 'pIC50' or 'pIC50_pred' or last numeric column)
    if "pIC50" in df_preds.columns:
        pred_col = "pIC50"
    elif "pred_pIC50" in df_preds.columns:
        pred_col = "pred_pIC50"
    else:
        # Pick the numeric column
        numeric_cols = [c for c in df_preds.columns if pd.api.types.is_numeric_dtype(df_preds[c])]
        pred_col = numeric_cols[-1]
        
    print(f"Using prediction column: '{pred_col}'")
    df_lib["predicted_pIC50"] = pd.to_numeric(df_preds[pred_col], errors="coerce").values
    
    # Save full screened results
    screened_parquet = results_dir / "screened_compounds.parquet"
    screened_csv = results_dir / "screened_compounds.csv"
    df_lib.to_parquet(screened_parquet, index=False)
    df_lib.to_csv(screened_csv, index=False)
    print(f"Saved {len(df_lib)} screened compounds to {screened_parquet} and {screened_csv}")
    
    # Diversity-aware top 100 selection
    print("Selecting top 100 diverse candidates using Bemis-Murcko and Morgan Fingerprint Tanimoto filtering...")
    top100_df, full_sorted_df, stats = select_top_diverse_candidates(
        df_lib,
        target_count=100,
        potency_col="predicted_pIC50",
        smiles_col="smiles",
        similarity_threshold=0.70
    )
    
    top100_out = results_dir / "top100_pre_docking.csv"
    top100_df.to_csv(top100_out, index=False)
    
    with open(results_dir / "top100_selection_metrics.json", "w") as f:
        json.dump(stats, f, indent=2)
        
    print("\n=== TOP 100 CANDIDATE SELECTION SUMMARY ===")
    print(f"Total Screened: {stats['total_screened']}")
    print(f"Selected Candidates: {stats['actual_selected']}")
    print(f"Unique Scaffolds: {stats['unique_scaffolds']}")
    print(f"Excluded Redundant Analogues: {stats['skipped_redundant_structural_analogues']}")
    print(f"Predicted pIC50 Range: {stats['selected_pic50_min']:.2f} to {stats['selected_pic50_max']:.2f} (Mean: {stats['selected_pic50_mean']:.2f})")
    print(f"Saved: {top100_out}")


if __name__ == "__main__":
    run_screening()
