"""
BioNova PARP1 Scaffold-Balanced Splitting Module
Generates Bemis-Murcko scaffolds and partitions data into zero-leakage Train/Val/Test subsets.
"""

import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
from rdkit import Chem
from rdkit.Chem.Scaffolds import MurckoScaffold


def generate_bemis_murcko_scaffold(smiles: str, generic: bool = False) -> str:
    """
    Compute Bemis-Murcko scaffold string from SMILES.
    If no ring is present, returns an empty string or acyclic identifier.
    """
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return ""
        scaffold = MurckoScaffold.GetScaffoldForMol(mol)
        if scaffold is None or scaffold.GetNumAtoms() == 0:
            return "ACYCLIC"
        if generic:
            scaffold = MurckoScaffold.MakeScaffoldGeneric(scaffold)
        return Chem.MolToSmiles(scaffold, isomericSmiles=False, canonical=True)
    except Exception:
        return "ERROR_SCAFFOLD"


def scaffold_balanced_split(
    df: pd.DataFrame,
    smiles_col: str = "smiles",
    target_col: str = "pIC50",
    train_ratio: float = 0.80,
    val_ratio: float = 0.10,
    test_ratio: float = 0.10,
    seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict]:
    """
    Split DataFrame into train, val, and test partitions based on Bemis-Murcko scaffolds.
    Enforces strict zero-leakage: no scaffold or canonical SMILES appears in more than one partition.
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"
    
    # 1. Compute scaffolds
    df = df.copy()
    df["scaffold"] = df[smiles_col].apply(generate_bemis_murcko_scaffold)
    
    # 2. Group compound indices by scaffold
    scaffold_to_indices = defaultdict(list)
    for idx, scaf in enumerate(df["scaffold"]):
        scaffold_to_indices[scaf].append(idx)
    
    # Sort scaffolds by group size descending for greedy bin packing, then tie-break deterministically
    sorted_scaffolds = sorted(
        scaffold_to_indices.keys(),
        key=lambda s: (len(scaffold_to_indices[s]), s),
        reverse=True
    )
    
    total_samples = len(df)
    target_train = int(round(total_samples * train_ratio))
    target_val = int(round(total_samples * val_ratio))
    target_test = total_samples - target_train - target_val
    
    train_indices: List[int] = []
    val_indices: List[int] = []
    test_indices: List[int] = []
    
    train_scaffolds = set()
    val_scaffolds = set()
    test_scaffolds = set()
    
    for scaf in sorted_scaffolds:
        indices = scaffold_to_indices[scaf]
        # Assign to partition that needs samples most
        # Priority: test, val, train to ensure holdouts receive diverse scaffolds
        needed_test = target_test - len(test_indices)
        needed_val = target_val - len(val_indices)
        needed_train = target_train - len(train_indices)
        
        if len(test_indices) + len(indices) <= target_test or (needed_test >= needed_val and needed_test >= needed_train and needed_test > 0):
            test_indices.extend(indices)
            test_scaffolds.add(scaf)
        elif len(val_indices) + len(indices) <= target_val or (needed_val >= needed_train and needed_val > 0):
            val_indices.extend(indices)
            val_scaffolds.add(scaf)
        else:
            train_indices.extend(indices)
            train_scaffolds.add(scaf)
    
    train_df = df.iloc[train_indices].copy().reset_index(drop=True)
    val_df = df.iloc[val_indices].copy().reset_index(drop=True)
    test_df = df.iloc[test_indices].copy().reset_index(drop=True)
    
    # 3. Validation of zero leakage
    train_smiles = set(train_df[smiles_col])
    val_smiles = set(val_df[smiles_col])
    test_smiles = set(test_df[smiles_col])
    
    assert len(train_smiles.intersection(val_smiles)) == 0, "Leakage detected: SMILES in train and val"
    assert len(train_smiles.intersection(test_smiles)) == 0, "Leakage detected: SMILES in train and test"
    assert len(val_smiles.intersection(test_smiles)) == 0, "Leakage detected: SMILES in val and test"
    
    assert len(train_scaffolds.intersection(val_scaffolds)) == 0, "Leakage detected: Scaffold in train and val"
    assert len(train_scaffolds.intersection(test_scaffolds)) == 0, "Leakage detected: Scaffold in train and test"
    assert len(val_scaffolds.intersection(test_scaffolds)) == 0, "Leakage detected: Scaffold in val and test"
    
    stats = {
        "total_compounds": total_samples,
        "total_scaffolds": len(scaffold_to_indices),
        "train_count": len(train_df),
        "val_count": len(val_df),
        "test_count": len(test_df),
        "train_fraction": round(len(train_df) / total_samples, 4),
        "val_fraction": round(len(val_df) / total_samples, 4),
        "test_fraction": round(len(test_df) / total_samples, 4),
        "train_scaffolds": len(train_scaffolds),
        "val_scaffolds": len(val_scaffolds),
        "test_scaffolds": len(test_scaffolds),
        "leakage_smiles_count": 0,
        "leakage_scaffold_count": 0
    }
    
    return train_df, val_df, test_df, stats


def save_splits(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    stats: Dict,
    output_dir: str = "splits",
    results_dir: str = "results"
):
    """Save split files and metadata JSON."""
    out_path = Path(output_dir)
    res_path = Path(results_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    res_path.mkdir(parents=True, exist_ok=True)
    
    train_df.to_csv(out_path / "train.csv", index=False)
    val_df.to_csv(out_path / "val.csv", index=False)
    test_df.to_csv(out_path / "test.csv", index=False)
    
    with open(res_path / "splits.json", "w") as f:
        json.dump(stats, f, indent=2)
