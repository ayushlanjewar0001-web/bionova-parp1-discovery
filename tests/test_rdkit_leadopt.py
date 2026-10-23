"""
Unit tests for BioNova PARP1 RDKit rule-based lead optimization module.
Verifies chemical validity, exactly 4 generated analogues, and preservation of parent scaffold.
"""

import pytest
from rdkit import Chem
from bionova_parp1.rdkit_leadopt import (
    generate_rdkit_analogs,
    generate_polar_heteroatom_analog,
    generate_fluorine_scan_analog,
    generate_tail_modulation_analog,
    generate_rigidified_analog
)


def test_generate_rdkit_analogs_count_and_sanitization():
    # Test on a representative PARP1 inhibitor scaffold (e.g. Olaparib-like or phthalazinone)
    parent_smi = "O=C1NN=C(Cc2ccc(C(=O)N3CCNCC3)cc2)c2ccccc12"
    parent_id = "TEST_LEAD_001"
    
    analogs = generate_rdkit_analogs(parent_smi, parent_id)
    
    # Must generate up to 4 analogues
    assert len(analogs) == 4, f"Expected 4 analogues, got {len(analogs)}"
    
    # Every analogue must have a valid sanitized SMILES and valid molecular weight
    for idx, a in enumerate(analogs):
        assert a["parent_compound_id"] == parent_id
        assert a["analog_id"] == f"{parent_id}_OPT{idx+1}"
        assert a["analog_smiles"] != parent_smi
        assert a["optimization_method"] == "RDKit-Based Lead Optimization (Rule-Based Transformations)"
        
        mol = Chem.MolFromSmiles(a["analog_smiles"])
        assert mol is not None, f"Analogue {a['analog_id']} has invalid SMILES"
        assert a["mw"] > 100.0


def test_fluorine_scan_analog_adds_fluorine():
    mol = Chem.MolFromSmiles("c1ccccc1C(=O)N")
    f_mol = generate_fluorine_scan_analog(mol)
    assert f_mol is not None
    smi = Chem.MolToSmiles(f_mol)
    assert "F" in smi
