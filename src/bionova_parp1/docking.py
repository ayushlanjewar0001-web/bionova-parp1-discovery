"""
BioNova PARP1 Molecular Docking Module
Coordinates receptor preparation, PDB 7KK4 Olaparib redocking validation (RMSD <= 2.0 A gate),
candidate ligand 3D conformer generation, PDBQT conversion, and AutoDock Vina execution.
"""

import math
import os
import shutil
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import requests
from rdkit import Chem
from rdkit.Chem import AllChem, rdMolAlign


def download_pdb(pdb_id: str, output_path: Path) -> Path:
    """Download authentic experimental PDB structure from RCSB."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists():
        return output_path
    
    url = f"https://files.rcsb.org/download/{pdb_id.upper()}.pdb"
    resp = requests.get(url, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"Failed to download PDB {pdb_id}: HTTP {resp.status_code}")
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(resp.text)
    return output_path


def extract_protein_and_ligand_pdb(
    pdb_path: Path,
    chain_id: str = "A",
    ligand_resname: str = "N7E", # Olaparib in 7KK4
    protein_out: Path = Path("data/interim/receptor_clean.pdb"),
    ligand_out: Path = Path("data/interim/crystal_olaparib.pdb")
) -> Tuple[Path, Path, Dict]:
    """
    Split co-crystal PDB into clean apoprotein chain and experimental reference ligand.
    Removes waters and crystallization buffers while preserving residue numbering and coordinate frame.
    Calculates exact bounding box center and size from experimental ligand coordinates.
    """
    protein_out.parent.mkdir(parents=True, exist_ok=True)
    
    protein_lines = []
    ligand_lines = []
    ligand_coords = []
    
    with open(pdb_path, "r", encoding="utf-8") as f:
        for line in f:
            record = line[:6].strip()
            chain = line[21:22]
            resname = line[17:20].strip()
            
            if record == "ATOM":
                if chain == chain_id:
                    protein_lines.append(line)
            elif record == "HETATM":
                if chain == chain_id and resname == ligand_resname:
                    ligand_lines.append(line)
                    x = float(line[30:38])
                    y = float(line[38:46])
                    z = float(line[46:54])
                    ligand_coords.append((x, y, z))
    
    if not ligand_coords:
        raise ValueError(f"Could not find ligand {ligand_resname} in chain {chain_id} of {pdb_path}")
    
    with open(protein_out, "w", encoding="utf-8") as f:
        f.writelines(protein_lines)
        f.write("END\n")
        
    with open(ligand_out, "w", encoding="utf-8") as f:
        f.writelines(ligand_lines)
        f.write("END\n")
        
    coords_arr = np.array(ligand_coords)
    center = coords_arr.mean(axis=0).tolist()
    box_size = (coords_arr.max(axis=0) - coords_arr.min(axis=0) + 10.0).tolist() # 10 A buffer
    
    box_info = {
        "center_x": round(center[0], 3),
        "center_y": round(center[1], 3),
        "center_z": round(center[2], 3),
        "size_x": max(18.0, round(box_size[0], 1)),
        "size_y": max(18.0, round(box_size[1], 1)),
        "size_z": max(18.0, round(box_size[2], 1)),
        "num_ligand_atoms": len(ligand_coords)
    }
    
    return protein_out, ligand_out, box_info


def calculate_heavy_atom_rmsd(ref_mol: Chem.Mol, query_mol: Chem.Mol) -> float:
    """
    Compute heavy-atom RMSD between reference crystal ligand and docked pose.
    Handles exact coordinate frames from experimental co-crystal and docked models.
    """
    ref_clean = Chem.RemoveHs(ref_mol)
    query_clean = Chem.RemoveHs(query_mol)
    
    ref_conf = ref_clean.GetConformer()
    query_conf = query_clean.GetConformer()
    
    ref_pos = ref_conf.GetPositions()
    query_pos = query_conf.GetPositions()
    
    n_atoms = min(len(ref_pos), len(query_pos))
    if n_atoms == 0:
        return 999.0
        
    diff = ref_pos[:n_atoms] - query_pos[:n_atoms]
    rmsd = float(np.sqrt(np.mean(np.sum(diff ** 2, axis=-1))))
    return round(rmsd, 3)


def generate_3d_conformer_from_smiles(
    smiles: str,
    output_mol_path: Optional[Path] = None,
    seed: int = 42
) -> Optional[Chem.Mol]:
    """
    Generate ETKDG 3D conformer with MMFF force field energy minimization.
    """
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None
        
        mol = Chem.AddHs(mol)
        params = AllChem.ETKDGv3()
        params.randomSeed = seed
        res = AllChem.EmbedMolecule(mol, params)
        if res < 0:
            # Fallback to standard ETKDG
            res = AllChem.EmbedMolecule(mol, randomSeed=seed)
            if res < 0:
                return None
        
        # MMFF94 energy minimization
        try:
            AllChem.MMFFOptimizeMolecule(mol, maxIters=500)
        except Exception:
            pass
            
        if output_mol_path:
            output_mol_path.parent.mkdir(parents=True, exist_ok=True)
            Chem.MolToMolFile(mol, str(output_mol_path))
            
        return mol
    except Exception as e:
        print(f"3D embedding error for {smiles}: {e}")
        return None
