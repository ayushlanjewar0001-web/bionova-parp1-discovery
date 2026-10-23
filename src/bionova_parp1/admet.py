"""
BioNova PARP1 ADMET Profiling & Final Candidate Prioritization Module
Runs strictly post-docking on successfully docked candidates.
Integrates predicted bioactivity (ChemProp), docking energy (AutoDock Vina), and ADMET profile.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd


def integrate_candidate_evidence(
    docking_df: pd.DataFrame,
    admet_df: Optional[pd.DataFrame],
    output_final_csv: Path = Path("results/final_candidates.csv")
) -> pd.DataFrame:
    """
    Merge docking results, ChemProp predicted potency, and ADMET-AI predictions.
    Computes transparent multi-objective prioritization without manufacturing pseudo-probabilities.
    """
    output_final_csv.parent.mkdir(parents=True, exist_ok=True)
    
    # Merge docking with ADMET on compound_id / smiles
    if admet_df is not None and not admet_df.empty:
        # Determine merge key
        if "compound_id" in admet_df.columns and "compound_id" in docking_df.columns:
            merged = pd.merge(docking_df, admet_df, on="compound_id", how="left", suffixes=("", "_admet"))
        elif "smiles" in admet_df.columns and "smiles" in docking_df.columns:
            merged = pd.merge(docking_df, admet_df, on="smiles", how="left", suffixes=("", "_admet"))
        else:
            merged = pd.concat([docking_df.reset_index(drop=True), admet_df.reset_index(drop=True)], axis=1)
    else:
        merged = docking_df.copy()
        
    # Rank candidates based on:
    # 1. Docking affinity (lower is better in kcal/mol)
    # 2. Predicted pIC50 (higher is better)
    # 3. Drug-likeness / ADMET flags where available
    
    # Pareto rank or normalized score
    # Note: Keep original metrics pure and traceable!
    vina_score = merged["docking_affinity_kcal_mol"] if "docking_affinity_kcal_mol" in merged.columns else merged.get("vina_affinity", 0.0)
    pred_potency = merged["predicted_pIC50"] if "predicted_pIC50" in merged.columns else merged.get("pIC50", 7.0)
    
    # Normalize for integrated ranking
    # min-max scaling
    v_norm = (vina_score - vina_score.min()) / (vina_score.max() - vina_score.min() + 1e-6) # 0 is best affinity
    p_norm = (pred_potency.max() - pred_potency) / (pred_potency.max() - pred_potency.min() + 1e-6) # 0 is highest pIC50
    
    composite_rank_score = 0.5 * v_norm + 0.5 * p_norm
    merged["composite_priority_score"] = composite_rank_score
    merged = merged.sort_values(by="composite_priority_score", ascending=True).reset_index(drop=True)
    merged["final_priority_rank"] = merged.index + 1
    
    # Explicitly label candidates as computationally prioritized
    merged["evidence_tier"] = "Computationally Prioritized Candidate (In-Silico Only)"
    
    merged.to_csv(output_final_csv, index=False)
    print(f"Final integrated candidate prioritization saved: {len(merged)} candidates to {output_final_csv}")
    return merged
