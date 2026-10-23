"""
Execution script for Phase 4: AutoDock Vina Docking of Selected Top 100 Candidates.
Enforces the Hard Gate: Redocking validation MUST pass before batch docking.
Checkpoints each candidate to results/docking_results.csv and poses/*.pdbqt.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
import time
import subprocess
from pathlib import Path
import pandas as pd
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors
from meeko import MoleculePreparation, PDBQTWriterLegacy


def run_batch_docking(exhaustiveness: int = 8, cpu_count: int = 4):
    results_dir = Path("results")
    poses_dir = Path("poses")
    interim_dir = Path("data/interim")
    poses_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. HARD GATE VERIFICATION
    val_json_path = results_dir / "docking_validation.json"
    if not val_json_path.exists():
        raise RuntimeError("HARD GATE VIOLATION: docking_validation.json not found! You must run validation first.")
        
    with open(val_json_path, "r") as f:
        val_data = json.load(f)
        
    if not val_data.get("gate_passed", False):
        raise RuntimeError(f"HARD GATE FAILED: Redocking RMSD {val_data.get('heavy_atom_rmsd_angstrom')} > 2.0 A threshold! Aborting batch docking as per scientific protocol.")
        
    print(f"HARD GATE VERIFIED: Olaparib redocking RMSD = {val_data['heavy_atom_rmsd_angstrom']} A <= 2.0 A. Proceeding to Top-100 Docking.")
    
    # 2. Load Top 100 pre-docking candidates
    top100_csv = results_dir / "top100_pre_docking.csv"
    df_top100 = pd.read_csv(top100_csv)
    print(f"Loaded {len(df_top100)} candidates from {top100_csv}.")
    
    # 3. Setup receptor and box
    receptor_pdbqt = interim_dir / "receptor_chainA.pdbqt"
    box_center = val_data["pocket_center"]
    box_size = val_data["grid_box_size"]
    vina_exe = Path("bin/vina.exe")
    
    # Check for existing checkpoint
    checkpoint_csv = results_dir / "docking_results.csv"
    completed_ids = set()
    docking_records = []
    
    if checkpoint_csv.exists():
        df_existing = pd.read_csv(checkpoint_csv)
        completed_ids = set(df_existing["compound_id"])
        docking_records = df_existing.to_dict("records")
        print(f"Found checkpoint with {len(completed_ids)} already docked candidates.")
        
    prep = MoleculePreparation()
    
    for idx, row in df_top100.iterrows():
        comp_id = row["compound_id"]
        smiles = row["smiles"]
        pred_pic50 = row["predicted_pIC50"]
        
        if comp_id in completed_ids:
            continue
            
        t0 = time.time()
        ligand_pdbqt_path = interim_dir / f"{comp_id}.pdbqt"
        out_pose_pdbqt = poses_dir / f"{comp_id}_docked.pdbqt"
        
        # A. 3D Conformer Generation
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            docking_records.append({
                "compound_id": comp_id,
                "smiles": smiles,
                "predicted_pIC50": pred_pic50,
                "docking_affinity_kcal_mol": None,
                "ligand_efficiency": None,
                "docking_status": "FAILED_SMILES_PARSE",
                "pose_path": None,
                "duration_seconds": round(time.time() - t0, 2)
            })
            continue
            
        mol_h = Chem.AddHs(mol)
        res = AllChem.EmbedMolecule(mol_h, randomSeed=42 + idx)
        if res < 0:
            res = AllChem.EmbedMolecule(mol_h, AllChem.ETKDGv3())
            if res < 0:
                docking_records.append({
                    "compound_id": comp_id,
                    "smiles": smiles,
                    "predicted_pIC50": pred_pic50,
                    "docking_affinity_kcal_mol": None,
                    "ligand_efficiency": None,
                    "docking_status": "FAILED_3D_EMBEDDING",
                    "pose_path": None,
                    "duration_seconds": round(time.time() - t0, 2)
                })
                continue
                
        try:
            AllChem.MMFFOptimizeMolecule(mol_h, maxIters=300)
        except Exception:
            pass
            
        # B. Meeko PDBQT conversion
        try:
            mol_setups = prep.prepare(mol_h)
            if not mol_setups:
                raise ValueError("Meeko could not produce molecule setup")
            pdbqt_str, is_ok, err = PDBQTWriterLegacy.write_string(mol_setups[0])
            if not is_ok:
                raise ValueError(f"Meeko write error: {err}")
            with open(ligand_pdbqt_path, "w", encoding="utf-8") as f:
                f.write(pdbqt_str)
        except Exception as e:
            docking_records.append({
                "compound_id": comp_id,
                "smiles": smiles,
                "predicted_pIC50": pred_pic50,
                "docking_affinity_kcal_mol": None,
                "ligand_efficiency": None,
                "docking_status": f"FAILED_MEEKO_PREP: {str(e)[:50]}",
                "pose_path": None,
                "duration_seconds": round(time.time() - t0, 2)
            })
            continue
            
        # C. AutoDock Vina Execution
        vina_cmd = [
            str(vina_exe),
            "--receptor", str(receptor_pdbqt),
            "--ligand", str(ligand_pdbqt_path),
            "--center_x", str(box_center[0]),
            "--center_y", str(box_center[1]),
            "--center_z", str(box_center[2]),
            "--size_x", str(box_size[0]),
            "--size_y", str(box_size[1]),
            "--size_z", str(box_size[2]),
            "--exhaustiveness", str(exhaustiveness),
            "--num_modes", "5",
            "--cpu", str(cpu_count),
            "--seed", str(42 + idx),
            "--out", str(out_pose_pdbqt)
        ]
        
        vina_res = subprocess.run(vina_cmd, capture_output=True, text=True)
        affinity_kcal = None
        for line in vina_res.stdout.split("\n"):
            parts = line.strip().split()
            if len(parts) >= 4 and parts[0] == "1":
                try:
                    affinity_kcal = float(parts[1])
                    break
                except ValueError:
                    pass
                    
        num_heavy_atoms = mol.GetNumHeavyAtoms()
        lig_eff = round(-affinity_kcal / num_heavy_atoms, 3) if affinity_kcal and num_heavy_atoms > 0 else None
        
        status = "COMPLETED" if affinity_kcal is not None else "FAILED_VINA_CONVERGENCE"
        dur = round(time.time() - t0, 2)
        
        record = {
            "compound_id": comp_id,
            "smiles": smiles,
            "predicted_pIC50": pred_pic50,
            "docking_affinity_kcal_mol": affinity_kcal,
            "ligand_efficiency": lig_eff,
            "docking_status": status,
            "pose_path": str(out_pose_pdbqt) if status == "COMPLETED" else None,
            "duration_seconds": dur
        }
        docking_records.append(record)
        completed_ids.add(comp_id)
        
        # Real-time checkpoint after each molecule with retry for Windows file locks
        for attempt in range(5):
            try:
                pd.DataFrame(docking_records).to_csv(checkpoint_csv, index=False)
                break
            except PermissionError:
                time.sleep(0.5)
        print(f"[{len(completed_ids)}/{len(df_top100)}] {comp_id}: Vina={affinity_kcal} kcal/mol | LE={lig_eff} | Status={status} ({dur}s)")
        
    print(f"\n=== BATCH DOCKING COMPLETE ===")
    df_final = pd.DataFrame(docking_records)
    for attempt in range(5):
        try:
            df_final.to_csv(checkpoint_csv, index=False)
            break
        except PermissionError:
            time.sleep(0.5)
    successful = df_final[df_final["docking_status"] == "COMPLETED"]
    print(f"Processed: {len(df_final)} | Successfully Docked: {len(successful)} | Failures: {len(df_final) - len(successful)}")
    if not successful.empty:
        print(f"Affinity Range: {successful['docking_affinity_kcal_mol'].min():.2f} to {successful['docking_affinity_kcal_mol'].max():.2f} kcal/mol (Mean: {successful['docking_affinity_kcal_mol'].mean():.2f})")
    print(f"Saved: {checkpoint_csv}")
    return df_final


if __name__ == "__main__":
    run_batch_docking(exhaustiveness=8, cpu_count=4)
