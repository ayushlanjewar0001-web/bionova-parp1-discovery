"""
BioNova PARP1 Candidate Ranking & Diversity Selection Module
Performs transparent multi-parametric prioritization and scaffold-diverse top-100 selection.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from rdkit import Chem, DataStructs
from rdkit.Chem import AllChem
from rdkit.Chem.Scaffolds import MurckoScaffold


def compute_morgan_fingerprints(smiles_list: List[str], radius: int = 2, n_bits: int = 2048):
    """Generate Morgan fingerprints for a list of SMILES."""
    fps = []
    valid_indices = []
    for idx, smi in enumerate(smiles_list):
        mol = Chem.MolFromSmiles(smi)
        if mol:
            fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius, nBits=n_bits)
            fps.append(fp)
            valid_indices.append(idx)
        else:
            fps.append(None)
    return fps, valid_indices


def select_top_diverse_candidates(
    df: pd.DataFrame,
    target_count: int = 100,
    potency_col: str = "predicted_pIC50",
    smiles_col: str = "smiles",
    similarity_threshold: float = 0.70
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict]:
    """
    Select top candidates balancing predicted potency and scaffold/structural diversity.
    1. Sort strictly by predicted pIC50 descending to retain pure potency rank.
    2. Greedily select top compounds, skipping compounds with Tanimoto similarity > threshold
       to already selected candidates unless insufficient candidates exist.
    
    Returns:
        (top100_df, full_sorted_df, stats)
    """
    # Pure potency sorting
    full_sorted = df.sort_values(by=potency_col, ascending=False).reset_index(drop=True)
    full_sorted["potency_rank"] = full_sorted.index + 1
    
    selected_indices = []
    selected_fps = []
    selected_scaffolds = set()
    
    # Precompute Murcko scaffolds
    scaffolds = []
    for smi in full_sorted[smiles_col]:
        mol = Chem.MolFromSmiles(smi)
        scaf = MurckoScaffold.GetScaffoldForMol(mol) if mol else None
        scaf_smi = Chem.MolToSmiles(scaf) if scaf and scaf.GetNumAtoms() > 0 else "ACYCLIC"
        scaffolds.append(scaf_smi)
    full_sorted["scaffold"] = scaffolds
    
    # Precompute FPs
    fps, _ = compute_morgan_fingerprints(full_sorted[smiles_col].tolist())
    
    # Pass 1: Strict diversity selection
    skipped_redundant = 0
    for idx, row in full_sorted.iterrows():
        fp = fps[idx]
        if fp is None:
            continue
        
        is_too_similar = False
        for s_fp in selected_fps:
            sim = DataStructs.TanimotoSimilarity(fp, s_fp)
            if sim > similarity_threshold:
                is_too_similar = True
                break
        
        if not is_too_similar:
            selected_indices.append(idx)
            selected_fps.append(fp)
            selected_scaffolds.add(row["scaffold"])
        else:
            skipped_redundant += 1
            
        if len(selected_indices) >= target_count:
            break
            
    # Pass 2: If diversity threshold yielded fewer than target_count, backfill from highest potency remaining
    backfilled = 0
    if len(selected_indices) < target_count:
        for idx in range(len(full_sorted)):
            if idx not in selected_indices and fps[idx] is not None:
                selected_indices.append(idx)
                selected_scaffolds.add(full_sorted.iloc[idx]["scaffold"])
                backfilled += 1
                if len(selected_indices) >= target_count:
                    break
                    
    top100 = full_sorted.iloc[selected_indices].copy().reset_index(drop=True)
    top100["selection_rank"] = top100.index + 1
    
    stats = {
        "total_screened": len(full_sorted),
        "target_selected": target_count,
        "actual_selected": len(top100),
        "unique_scaffolds": len(selected_scaffolds),
        "skipped_redundant_structural_analogues": skipped_redundant,
        "backfilled_count": backfilled,
        "selected_pic50_min": float(top100[potency_col].min()) if not top100.empty else 0.0,
        "selected_pic50_max": float(top100[potency_col].max()) if not top100.empty else 0.0,
        "selected_pic50_mean": float(top100[potency_col].mean()) if not top100.empty else 0.0,
    }
    
    return top100, full_sorted, stats
