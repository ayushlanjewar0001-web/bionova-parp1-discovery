"""
Automated Pipeline Orchestrator & Resumption Controller for BioNova PARP1.
Inspects existing artifacts and checkpoints, executing remaining stages sequentially.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
import subprocess
from pathlib import Path


def resume():
    print("=== BIONOVA PARP1 PIPELINE ORCHESTRATOR ===")
    py = sys.executable
    
    # Stage 1: Data Curation
    curated_csv = Path("data/processed/parp1_regression.csv")
    if not curated_csv.exists():
        print("\n--- Running Stage 1: Dataset Curation & QA ---")
        subprocess.run([py, "scripts/curate_dataset.py"], check=True)
    else:
        print("[x] Stage 1 (Data Curation) already completed.")
        
    # Stage 2: Scaffold Splits & Training
    model_pt = Path("models/chemprop_parp1/model_0/best.pt")
    if not model_pt.exists():
        print("\n--- Running Stage 2: Scaffold Splitting & ChemProp v2 Training ---")
        subprocess.run([py, "scripts/run_splits.py"], check=True)
        subprocess.run([py, "scripts/prepare_chemprop_splits.py"], check=True)
        chemprop_cmd = [
            ".venv/Scripts/chemprop.exe", "train",
            "-i", "data/processed/parp1_regression.csv",
            "-s", "smiles",
            "--target-columns", "pIC50",
            "-t", "regression",
            "--splits-file", "splits/chemprop_splits.json",
            "-o", "models/chemprop_parp1",
            "--epochs", "30",
            "--patience", "10",
            "--batch-size", "64",
            "--data-seed", "42",
            "--pytorch-seed", "42",
            "--metrics", "rmse", "mae", "r2"
        ]
        subprocess.run(chemprop_cmd, check=True)
        subprocess.run([py, "scripts/evaluate_holdout.py"], check=True)
    else:
        print("[x] Stage 2 (Scaffold Splits & ChemProp Training) already completed.")
        
    # Stage 3: Screening & Top 100 Selection
    top100_csv = Path("results/top100_pre_docking.csv")
    if not top100_csv.exists():
        print("\n--- Running Stage 3: Screening & Top-100 Selection ---")
        if not Path("data/raw/pubchem_screen_library.csv").exists():
            subprocess.run([py, "scripts/fetch_pubchem_library.py"], check=True)
        subprocess.run([py, "scripts/screen_library.py"], check=True)
    else:
        print("[x] Stage 3 (Screening & Top-100 Selection) already completed.")
        
    # Stage 4: Docking Validation & Batch Docking
    val_json = Path("results/docking_validation.json")
    if not val_json.exists():
        print("\n--- Running Stage 4A: Co-Crystal Redocking Validation Gate ---")
        subprocess.run([py, "scripts/docking_validation.py"], check=True)
    else:
        print("[x] Stage 4A (Docking Gate Validation) already completed.")
        
    dock_results = Path("results/docking_results.csv")
    docking_needed = True
    if dock_results.exists():
        try:
            import pandas as pd
            df_d = pd.read_csv(dock_results)
            if len(df_d) >= 100:
                docking_needed = False
                print(f"[x] Stage 4B (Docking Results) complete: {len(df_d)}/100 processed.")
            else:
                print(f"Stage 4B in progress: {len(df_d)}/100 processed.")
        except Exception:
            pass
            
    if docking_needed:
        print("\n--- Running Stage 4B: Top 100 Batch AutoDock Vina Docking ---")
        subprocess.run([py, "scripts/dock_top100.py"], check=True)
        
    # Stage 5: ADMET-AI Profiling
    final_csv = Path("results/final_candidates.csv")
    if not final_csv.exists():
        print("\n--- Running Stage 5: ADMET-AI Profiling & Integration ---")
        subprocess.run([py, "scripts/run_admet.py"], check=True)
    else:
        print("[x] Stage 5 (ADMET-AI Profiling) already completed.")
        
    # Stage 6: Figures & Report
    print("\n--- Generating Research Figures & Morning Brief ---")
    subprocess.run([py, "scripts/generate_figures.py"], check=True)
    subprocess.run([py, "scripts/generate_brief.py"], check=True)
    print("\n[SUCCESS] Entire BioNova PARP1 pipeline verified and complete!")


if __name__ == "__main__":
    resume()
