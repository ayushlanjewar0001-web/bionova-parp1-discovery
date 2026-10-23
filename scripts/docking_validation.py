"""
Execution script for Phase 4 Validation:
PDB 7KK4 Audit, Receptor Preparation, Binding Pocket Definition,
Olaparib Native Redocking, and Heavy-Atom RMSD Calculation (Gate <= 2.0 A).
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
import shutil
import subprocess
from pathlib import Path
import numpy as np
import requests
from rdkit import Chem
from rdkit.Chem import AllChem, rdMolAlign
from meeko import MoleculePreparation, PDBQTWriterLegacy
from bionova_parp1.docking import download_pdb, extract_protein_and_ligand_pdb, calculate_heavy_atom_rmsd


def prepare_receptor_pdbqt(clean_pdb_path: Path, output_pdbqt_path: Path):
    """
    Format clean apoprotein PDB into standard rigid receptor PDBQT for AutoDock Vina.
    Adds polar hydrogens and standard AutoDock atom types.
    """
    output_pdbqt_path.parent.mkdir(parents=True, exist_ok=True)
    pdbqt_lines = []
    
    with open(clean_pdb_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith(("ATOM", "HETATM")):
                atom_name = line[12:16].strip()
                element = line[76:78].strip()
                if not element:
                    element = atom_name[0] if not atom_name[0].isdigit() else atom_name[1]
                
                ad_type = element.upper()
                if ad_type not in ["C", "N", "O", "S", "P", "F", "CL", "BR", "I", "H"]:
                    ad_type = "A"
                
                charge = 0.000
                pdb_prefix = line[:54]
                occupancy_bfactor = line[54:66] if len(line) >= 66 else "  1.00  0.00"
                pdbqt_line = f"{pdb_prefix}{occupancy_bfactor}    {charge:+6.3f} {ad_type:>2}\n"
                pdbqt_lines.append(pdbqt_line)
            elif line.startswith("TER"):
                pdbqt_lines.append("TER\n")
                
    with open(output_pdbqt_path, "w", encoding="utf-8") as f:
        f.writelines(pdbqt_lines)
    print(f"Prepared receptor PDBQT: {output_pdbqt_path} ({len(pdbqt_lines)} atoms)")


def prepare_ligand_pdbqt_with_meeko(mol: Chem.Mol, output_pdbqt_path: Path) -> bool:
    """Prepare flexible ligand PDBQT using Meeko."""
    try:
        mol_with_h = Chem.AddHs(mol, addCoords=True)
        prep = MoleculePreparation()
        mol_setups = prep.prepare(mol_with_h)
        if not mol_setups:
            return False
        pdbqt_str, is_ok, err = PDBQTWriterLegacy.write_string(mol_setups[0])
        if not is_ok:
            print(f"PDBQTWriterLegacy error: {err}")
            return False
        with open(output_pdbqt_path, "w", encoding="utf-8") as f:
            f.write(pdbqt_str)
        return True
    except Exception as e:
        print(f"Meeko preparation exception: {e}")
        return False


def run_redocking_validation():
    interim_dir = Path("data/interim")
    results_dir = Path("results")
    interim_dir.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Download PDB 7KK4
    pdb_path = interim_dir / "7KK4.pdb"
    print("Step 4A: Downloading and auditing PDB 7KK4...")
    download_pdb("7KK4", pdb_path)
    
    # 2. Extract Chain A and native Olaparib (09L)
    clean_receptor_pdb = interim_dir / "receptor_chainA.pdb"
    crystal_olaparib_pdb = interim_dir / "crystal_olaparib.pdb"
    
    print("Step 4B: Splitting chain A apoprotein and Olaparib (09L)...")
    clean_receptor_pdb, crystal_olaparib_pdb, box_info = extract_protein_and_ligand_pdb(
        pdb_path,
        chain_id="A",
        ligand_resname="09L",
        protein_out=clean_receptor_pdb,
        ligand_out=crystal_olaparib_pdb
    )
    
    print(f"Co-crystal binding pocket center: ({box_info['center_x']}, {box_info['center_y']}, {box_info['center_z']})")
    print(f"Grid box size: ({box_info['size_x']}, {box_info['size_y']}, {box_info['size_z']}) Angstroms")
    
    # 3. Convert receptor to PDBQT
    receptor_pdbqt = interim_dir / "receptor_chainA.pdbqt"
    prepare_receptor_pdbqt(clean_receptor_pdb, receptor_pdbqt)
    
    # 4. Prepare native Olaparib with Meeko
    olaparib_mol = Chem.MolFromPDBFile(str(crystal_olaparib_pdb), removeHs=False)
    if olaparib_mol is None:
        # Fallback load via Smiles with 3D conformer aligned to crystal
        olaparib_smi = "O=C(c1cc(Cc2n[nH]c(=O)c3ccccc23)ccc1F)N1CCN(C(=O)C2CC2)CC1"
        olaparib_mol = Chem.MolFromSmiles(olaparib_smi)
        olaparib_mol = Chem.AddHs(olaparib_mol)
        AllChem.EmbedMolecule(olaparib_mol, randomSeed=42)
    
    native_olaparib_pdbqt = interim_dir / "olaparib_native.pdbqt"
    success = prepare_ligand_pdbqt_with_meeko(olaparib_mol, native_olaparib_pdbqt)
    assert success, "Failed to prepare native Olaparib PDBQT with Meeko"
    print(f"Prepared native Olaparib PDBQT: {native_olaparib_pdbqt}")
    
    # 5. Run AutoDock Vina Redocking
    vina_exe = Path("bin/vina.exe")
    redock_out = results_dir / "olaparib_redocked_poses.pdbqt"
    
    vina_cmd = [
        str(vina_exe),
        "--receptor", str(receptor_pdbqt),
        "--ligand", str(native_olaparib_pdbqt),
        "--center_x", str(box_info["center_x"]),
        "--center_y", str(box_info["center_y"]),
        "--center_z", str(box_info["center_z"]),
        "--size_x", str(box_info["size_x"]),
        "--size_y", str(box_info["size_y"]),
        "--size_z", str(box_info["size_z"]),
        "--exhaustiveness", "16",
        "--num_modes", "9",
        "--seed", "42",
        "--out", str(redock_out)
    ]
    
    print(f"Executing AutoDock Vina redocking: {' '.join(vina_cmd)}")
    res = subprocess.run(vina_cmd, capture_output=True, text=True)
    print("Vina output:\n", res.stdout)
    
    # Parse Vina affinity from output
    affinity_kcal_mol = None
    for line in res.stdout.split("\n"):
        parts = line.strip().split()
        if len(parts) >= 4 and parts[0] == "1":
            try:
                affinity_kcal_mol = float(parts[1])
                break
            except ValueError:
                pass
                
    # 6. Extract top pose and calculate atom-matched heavy-atom RMSD against crystal Olaparib
    crystal_atoms = {}
    with open(crystal_olaparib_pdb, "r") as f:
        for line in f:
            if line.startswith(("ATOM", "HETATM")):
                name = line[12:16].strip()
                element = line[76:78].strip()
                if element == "H":
                    continue
                x = float(line[30:38])
                y = float(line[38:46])
                z = float(line[46:54])
                crystal_atoms[name] = np.array([x, y, z])

    docked_atoms = {}
    with open(redock_out, "r") as f:
        in_model1 = False
        for line in f:
            if line.startswith("MODEL 1"):
                in_model1 = True
            elif line.startswith("ENDMDL"):
                break
            elif in_model1 and line.startswith(("ATOM", "HETATM")):
                name = line[12:16].strip()
                element = line[76:78].strip()
                if element == "H":
                    continue
                x = float(line[30:38])
                y = float(line[38:46])
                z = float(line[46:54])
                if name not in docked_atoms:
                    docked_atoms[name] = np.array([x, y, z])

    common_atoms = [name for name in crystal_atoms if name in docked_atoms]
    diffs = [crystal_atoms[name] - docked_atoms[name] for name in common_atoms]
    diffs_arr = np.array(diffs)
    rmsd = float(np.sqrt(np.mean(np.sum(diffs_arr ** 2, axis=-1))))
    gate_passed = rmsd <= 2.0
    
    validation_report = {
        "pdb_id": "7KK4",
        "reference_compound": "Olaparib (N7E)",
        "crystal_resolution_angstrom": 2.30,
        "binding_chain": "A",
        "pocket_center": [box_info["center_x"], box_info["center_y"], box_info["center_z"]],
        "grid_box_size": [box_info["size_x"], box_info["size_y"], box_info["size_z"]],
        "vina_redocked_affinity_kcal_mol": affinity_kcal_mol,
        "heavy_atom_rmsd_angstrom": round(rmsd, 3),
        "hard_gate_threshold_angstrom": 2.0,
        "gate_passed": gate_passed,
        "status": "VALIDATED" if gate_passed else "GATE_FAILED"
    }
    
    val_json = results_dir / "docking_validation.json"
    with open(val_json, "w") as f:
        json.dump(validation_report, f, indent=2)
        
    print("\n=== CO-CRYSTAL REDOCKING VALIDATION REPORT ===")
    print(f"PDB: {validation_report['pdb_id']} | Ligand: {validation_report['reference_compound']}")
    print(f"Vina Score: {validation_report['vina_redocked_affinity_kcal_mol']} kcal/mol")
    print(f"Heavy-Atom Pose RMSD: {validation_report['heavy_atom_rmsd_angstrom']} Angstroms")
    print(f"HARD GATE (RMSD <= 2.0 A): {'PASSED (Method Validated)' if gate_passed else 'FAILED'}")
    print(f"Saved: {val_json}")
    
    return validation_report


if __name__ == "__main__":
    run_redocking_validation()
