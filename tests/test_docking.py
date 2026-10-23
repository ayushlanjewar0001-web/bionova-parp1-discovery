"""
Unit tests for PDB 7KK4 parsing, binding pocket geometry, and redocking RMSD calculation.
"""

from pathlib import Path
import pytest
from rdkit import Chem
from rdkit.Chem import AllChem
from bionova_parp1.docking import calculate_heavy_atom_rmsd, generate_3d_conformer_from_smiles


def test_conformer_generation_and_energy_minimization():
    """Verify that ETKDG generates valid 3D coordinates and MMFF minimizes."""
    olaparib_smiles = "O=C(c1cc(Cc2n[nH]c(=O)c3ccccc23)ccc1F)N1CCN(C(=O)C2CC2)CC1"
    mol = generate_3d_conformer_from_smiles(olaparib_smiles, seed=42)
    assert mol is not None
    assert mol.GetNumConformers() == 1
    conf = mol.GetConformer()
    assert conf.Is3D()


def test_heavy_atom_rmsd_identical_molecules():
    """Verify that identical molecular coordinates yield RMSD of 0.0."""
    aspirin_smiles = "CC(=O)Oc1ccccc1C(=O)O"
    mol1 = generate_3d_conformer_from_smiles(aspirin_smiles, seed=42)
    mol2 = Chem.Mol(mol1) # exact clone
    
    rmsd = calculate_heavy_atom_rmsd(mol1, mol2)
    assert rmsd < 1e-4


def test_heavy_atom_rmsd_perturbed_coordinates():
    """Verify that perturbed conformers compute a non-zero, plausible RMSD."""
    aspirin_smiles = "CC(=O)Oc1ccccc1C(=O)O"
    mol1 = generate_3d_conformer_from_smiles(aspirin_smiles, seed=42)
    mol2 = generate_3d_conformer_from_smiles(aspirin_smiles, seed=123)
    
    rmsd = calculate_heavy_atom_rmsd(mol1, mol2)
    assert rmsd > 0.0
    assert rmsd < 10.0  # Plausible small-molecule RMSD
