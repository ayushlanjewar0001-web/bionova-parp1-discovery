"""
Unit tests for scaffold-balanced splitting and zero-leakage enforcement.
"""

import pandas as pd
import pytest
from bionova_parp1.splits import generate_bemis_murcko_scaffold, scaffold_balanced_split


def test_murcko_scaffold_generation():
    """Verify Murcko scaffold generation for standard ring systems."""
    # Aspirin -> benzene ring
    aspirin_smi = "CC(=O)Oc1ccccc1C(=O)O"
    scaf = generate_bemis_murcko_scaffold(aspirin_smi)
    assert scaf == "c1ccccc1"
    
    # Acyclic molecule -> ACYCLIC
    ethanol = "CCO"
    scaf_acyclic = generate_bemis_murcko_scaffold(ethanol)
    assert scaf_acyclic == "ACYCLIC"


def test_scaffold_balanced_split_zero_leakage():
    """Verify that train, val, and test partitions share ZERO scaffolds and ZERO SMILES."""
    data = []
    # Create 10 distinct scaffolds with 5 compounds each
    scaffolds = ["c1ccccc1", "c1ccncc1", "c1ncc2nc[nH]c2n1", "c1ccc2ccccc2c1", "c1ccoc1",
                 "c1ccsc1", "c1c[nH]cn1", "c1ccc2[nH]ccc2c1", "c1ccc2ncccc2c1", "c1cnccn1"]
    
    for s_idx, scaf in enumerate(scaffolds):
        for c_idx in range(5):
            # Attach a varying alkyl chain
            smi = f"CC{'C'*c_idx}" + scaf[1:] if scaf.startswith("c") else scaf
            data.append({
                "compound_id": f"C_{s_idx}_{c_idx}",
                "smiles": smi,
                "pIC50": 6.0 + (s_idx * 0.2) + (c_idx * 0.05)
            })
            
    df = pd.DataFrame(data)
    train_df, val_df, test_df, stats = scaffold_balanced_split(df, train_ratio=0.8, val_ratio=0.1, test_ratio=0.1)
    
    # Check partition sizes
    assert len(train_df) + len(val_df) + len(test_df) == len(df)
    
    # Check zero SMILES overlap
    train_smiles = set(train_df["smiles"])
    val_smiles = set(val_df["smiles"])
    test_smiles = set(test_df["smiles"])
    assert len(train_smiles.intersection(val_smiles)) == 0
    assert len(train_smiles.intersection(test_smiles)) == 0
    assert len(val_smiles.intersection(test_smiles)) == 0
    
    # Check zero scaffold overlap
    train_scafs = set(train_df["scaffold"])
    val_scafs = set(val_df["scaffold"])
    test_scafs = set(test_df["scaffold"])
    assert len(train_scafs.intersection(val_scafs)) == 0
    assert len(train_scafs.intersection(test_scafs)) == 0
    assert len(val_scafs.intersection(test_scafs)) == 0
