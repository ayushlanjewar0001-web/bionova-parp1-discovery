"""
Execution script for Phase 5: ADMET-AI Profiling (Strictly Post-Docking).
Profiles successfully docked candidates across physicochemical, pharmacokinetic, and toxicity endpoints.
Integrates ChemProp predicted potency, AutoDock Vina affinity, and ADMET profiles into final prioritization.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
import time
import subprocess
from pathlib import Path
import pandas as pd
from bionova_parp1.admet import integrate_candidate_evidence


def run_admet_profiling():
    results_dir = Path("results")
    interim_dir = Path("data/interim")
    dock_results_csv = results_dir / "docking_results.csv"
    
    # 1. Enforce Ordering Constraint
    if not dock_results_csv.exists():
        raise RuntimeError("ORDERING VIOLATION: results/docking_results.csv does not exist! ADMET must strictly follow docking.")
        
    df_dock = pd.read_csv(dock_results_csv)
    print(f"Loaded {len(df_dock)} docking records.")
    
    successful_dock = df_dock[df_dock["docking_status"] == "COMPLETED"].copy()
    print(f"Candidates eligible for ADMET profiling (successful docking): {len(successful_dock)}")
    
    if successful_dock.empty:
        raise RuntimeError("No candidates successfully completed docking. Cannot run ADMET.")
        
    admet_input_csv = interim_dir / "admet_input.csv"
    successful_dock[["compound_id", "smiles"]].to_csv(admet_input_csv, index=False)
    
    admet_preds_csv = results_dir / "admet_predictions.csv"
    
    # 2. Run ADMET-AI
    # We can invoke admet_predict CLI or Python API
    print("Executing ADMET-AI prediction on successfully docked candidates...")
    t0 = time.time()
    try:
        from admet_ai import ADMETModel
        model = ADMETModel()
        preds_df = model.predict(smiles=successful_dock["smiles"].tolist())
        # Attach compound_id
        preds_df.insert(0, "compound_id", successful_dock["compound_id"].values)
        preds_df.insert(1, "smiles", successful_dock["smiles"].values)
        preds_df.to_csv(admet_preds_csv, index=False)
        print(f"ADMET-AI Python API prediction complete: {len(preds_df)} compounds, {preds_df.shape[1]} endpoints.")
    except Exception as e:
        print(f"Python API encountered exception: {e}. Falling back to admet_predict CLI...")
        admet_cli = Path(".venv/Scripts/admet_predict.exe")
        cmd = [
            str(admet_cli),
            "--data_path", str(admet_input_csv),
            "--save_path", str(admet_preds_csv),
            "--smiles_column", "smiles"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"ADMET CLI error: {res.stderr}")
            raise RuntimeError(f"ADMET-AI failed: {res.stderr}")
        preds_df = pd.read_csv(admet_preds_csv)
        
    print(f"ADMET profiling duration: {time.time() - t0:.2f}s")
    
    # 3. Final Multi-Parametric Integration
    print("Integrating potency, docking energy, and ADMET profiles into final prioritization...")
    final_df = integrate_candidate_evidence(
        docking_df=successful_dock,
        admet_df=preds_df,
        output_final_csv=results_dir / "final_candidates.csv"
    )
    
    print("\n=== TOP 5 COMPUTATIONALLY PRIORITIZED CANDIDATES ===")
    top5_cols = ["final_priority_rank", "compound_id", "predicted_pIC50", "docking_affinity_kcal_mol"]
    for c in ["Solubility_AqSolDB", "Caco2_Wang", "hERG", "CYP3A4_Substrate_CarbonMangels"]:
        if c in final_df.columns:
            top5_cols.append(c)
    print(final_df[top5_cols].head(5).to_string(index=False))
    return final_df


if __name__ == "__main__":
    run_admet_profiling()
