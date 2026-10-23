"""
Unit tests for data QA, pIC50 mathematical transformations, and SMILES standardization.
"""

import math
import pytest
from bionova_parp1.qa import calculate_pic50, standardize_smiles, filter_and_curate_bioactivity
import pandas as pd


def test_pic50_calculation_exact():
    """Verify standard pIC50 values: 10 nM = 8.0, 100 nM = 7.0, 1000 nM = 6.0."""
    assert math.isclose(calculate_pic50(10.0, "nM"), 8.0, rel_tol=1e-6)
    assert math.isclose(calculate_pic50(100.0, "nM"), 7.0, rel_tol=1e-6)
    assert math.isclose(calculate_pic50(1000.0, "nM"), 6.0, rel_tol=1e-6)
    assert math.isclose(calculate_pic50(1.0, "nM"), 9.0, rel_tol=1e-6)
    assert math.isclose(calculate_pic50(0.1, "nM"), 10.0, rel_tol=1e-6)


def test_pic50_molar_calculation():
    """Verify molar conversion: 1e-8 M = 8.0, 1e-7 M = 7.0."""
    assert math.isclose(calculate_pic50(1e-8, "M"), 8.0, rel_tol=1e-6)
    assert math.isclose(calculate_pic50(1e-7, "M"), 7.0, rel_tol=1e-6)


def test_pic50_invalid_inputs():
    """Verify that zero, negative, or NaN values return None."""
    assert calculate_pic50(0.0, "nM") is None
    assert calculate_pic50(-10.0, "nM") is None
    assert calculate_pic50(float("nan"), "nM") is None


def test_smiles_standardization_and_desalting():
    """Verify that salts are stripped to the largest organic active fragment."""
    # Olaparib hydrochloride salt representation
    salt_smiles = "Cl.O=C(c1cc(Cc2n[nH]c(=O)c3ccccc23)ccc1F)N1CCN(C(=O)C2CC2)CC1"
    canon_smi, parent_smi, err = standardize_smiles(salt_smiles)
    
    assert err is None
    assert canon_smi is not None
    assert "Cl" not in canon_smi  # Chloride ion stripped


def test_filter_and_curate_censored_exclusion():
    """Verify that censored measurements (<, >) are strictly excluded from regression."""
    raw_data = pd.DataFrame([
        {"compound_id": "C1", "smiles": "CC(=O)Oc1ccccc1C(=O)O", "value": 10.0, "relation": "=", "units": "nM"},
        {"compound_id": "C2", "smiles": "CC(=O)Oc1ccccc1C(=O)O", "value": 50.0, "relation": ">", "units": "nM"},
        {"compound_id": "C3", "smiles": "c1ccccc1", "value": 100.0, "relation": "<", "units": "nM"},
        {"compound_id": "C4", "smiles": "c1ccccc1", "value": 200.0, "relation": "=", "units": "nM"},
    ])
    
    clean_df, excl_df, stats = filter_and_curate_bioactivity(raw_data)
    
    assert len(excl_df) >= 2  # C2 and C3 excluded
    assert len(clean_df) == 2  # C1 and C4 retained (or deduped if identical)
    reasons = " ".join(excl_df["reason"].tolist())
    assert "Censored measurement" in reasons
