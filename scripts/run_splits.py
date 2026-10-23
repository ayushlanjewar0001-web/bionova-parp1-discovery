"""
Execution script for Phase 2: Scaffold-Balanced Splitting.
Partitions data/processed/parp1_regression.csv into train (80%), val (10%), and test (10%) sets.
Enforces strict zero-leakage across partitions.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
from pathlib import Path
import pandas as pd
from bionova_parp1.splits import scaffold_balanced_split, save_splits


def run_splitting():
    input_csv = Path("data/processed/parp1_regression.csv")
    splits_dir = Path("splits")
    results_dir = Path("results")
    
    print(f"Loading curated dataset from {input_csv}...")
    df = pd.read_csv(input_csv)
    print(f"Loaded {len(df)} curated PARP1 molecules.")
    
    print("Generating Bemis-Murcko scaffolds and computing 80/10/10 balanced split...")
    train_df, val_df, test_df, stats = scaffold_balanced_split(
        df,
        smiles_col="smiles",
        target_col="pIC50",
        train_ratio=0.80,
        val_ratio=0.10,
        test_ratio=0.10,
        seed=42
    )
    
    save_splits(train_df, val_df, test_df, stats, output_dir="splits", results_dir="results")
    
    print("\n=== SPLIT SUMMARY ===")
    print(f"Total Compounds: {stats['total_compounds']}")
    print(f"Total Unique Scaffolds: {stats['total_scaffolds']}")
    print(f"Train Set: {stats['train_count']} ({stats['train_fraction']*100:.1f}%) | Scaffolds: {stats['train_scaffolds']}")
    print(f"Val Set:   {stats['val_count']} ({stats['val_fraction']*100:.1f}%) | Scaffolds: {stats['val_scaffolds']}")
    print(f"Test Set:  {stats['test_count']} ({stats['test_fraction']*100:.1f}%) | Scaffolds: {stats['test_scaffolds']}")
    print(f"Leakage SMILES: {stats['leakage_smiles_count']} | Leakage Scaffolds: {stats['leakage_scaffold_count']}")
    print("Saved splits/train.csv, splits/val.csv, splits/test.csv, results/splits.json")


if __name__ == "__main__":
    run_splitting()
