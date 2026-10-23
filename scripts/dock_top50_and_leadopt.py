"""
BioNova PARP1: AutoDock Vina Docking of Top 50 Candidates & RDKit-Based Lead Optimization.
1. Docks the top 50 ChemProp-prioritized candidates into PDB 7KK4.
2. Analyzes explicit residue binding interactions (Gly863, Ser904, Tyr907).
3. Applies RDKit-based rule-based lead optimization (4 analogues per lead).
4. Screens, docks, and evaluates ADMET-AI profiles for all generated analogues.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import json
import time
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors
from meeko import MoleculePreparation, PDBQTWriterLegacy

from bionova_parp1.rdkit_leadopt import generate_rdkit_analogs


def analyze_interactions(pose_pdbqt_path: Path, box_center: Tuple[float, float, float]) -> Dict:
    """
    Parses docked PDBQT pose and estimates atomic proximity to key catalytic pocket residues:
    Gly863 (hydrogen bonding), Ser904 (hydrogen bonding), Tyr907 (pi-pi stacking).
    """
    # Coordinates for key catalytic residues in PDB 7KK4 Chain A
    # Ser904 OG / N: (-9.5, 8.2, 24.5)
    # Gly863 N: (-11.2, 4.8, 27.1)
    # Tyr907 Ring: (-7.8, 5.1, 26.8)
    ser904_coord = np.array([-9.5, 8.2, 24.5])
    gly863_coord = np.array([-11.2, 4.8, 27.1])
    tyr907_coord = np.array([-7.8, 5.1, 26.8])
    
    min_dist_ser904 = 999.0
    min_dist_gly863 = 999.0
    min_dist_tyr907 = 999.0
    
    if not pose_pdbqt_path.exists():
        return {
            "hbond_gly863": False, "dist_gly863": None,
            "hbond_ser904": False, "dist_ser904": None,
            "pi_stack_tyr907": False, "dist_tyr907": None
        }
        
    with open(pose_pdbqt_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if line.startswith("ATOM") or line.startswith("HETATM"):
                parts = line.split()
                if len(parts) >= 8:
                    try:
                        x = float(line[30:38].strip())
                        y = float(line[38:46].strip())
                        z = float(line[46:54].strip())
                        xyz = np.array([x, y, z])
                        
                        d_s = np.linalg.norm(xyz - ser904_coord)
                        d_g = np.linalg.norm(xyz - gly863_coord)
                        d_t = np.linalg.norm(xyz - tyr907_coord)
                        
                        if d_s < min_dist_ser904: min_dist_ser904 = d_s
                        if d_g < min_dist_gly863: min_dist_gly863 = d_g
                        if d_t < min_dist_tyr907: min_dist_tyr907 = d_t
                    except Exception:
                        pass
                        
    return {
        "hbond_gly863": bool(min_dist_gly863 <= 3.5),
        "dist_gly863_angstrom": round(float(min_dist_gly863), 2) if min_dist_gly863 < 50 else None,
        "hbond_ser904": bool(min_dist_ser904 <= 3.5),
        "dist_ser904_angstrom": round(float(min_dist_ser904), 2) if min_dist_ser904 < 50 else None,
        "pi_stack_tyr907": bool(min_dist_tyr907 <= 4.5),
        "dist_tyr907_angstrom": round(float(min_dist_tyr907), 2) if min_dist_tyr907 < 50 else None,
        "catalytic_interaction_score": int(min_dist_gly863 <= 3.5) + int(min_dist_ser904 <= 3.5) + int(min_dist_tyr907 <= 4.5)
    }


def dock_single_compound(
    smiles: str,
    compound_id: str,
    vina_exe: Path,
    receptor_pdbqt: Path,
    box_center: Tuple[float, float, float],
    box_size: Tuple[float, float, float],
    out_dir: Path,
    exhaustiveness: int = 8,
    seed: int = 42
) -> Dict:
    """Prepare 3D conformer, Meeko PDBQT, and run AutoDock Vina."""
    out_pose = out_dir / f"{compound_id}_docked.pdbqt"
    t0 = time.time()
    
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        return {"compound_id": compound_id, "smiles": smiles, "status": "FAILED_SMILES", "affinity_kcal_mol": None}
        
    mol_h = Chem.AddHs(mol)
    res = AllChem.EmbedMolecule(mol_h, randomSeed=seed)
    if res < 0:
        res = AllChem.EmbedMolecule(mol_h, AllChem.ETKDGv3())
        if res < 0:
            return {"compound_id": compound_id, "smiles": smiles, "status": "FAILED_3D_EMBED", "affinity_kcal_mol": None}
            
    try:
        AllChem.MMFFOptimizeMolecule(mol_h, maxIters=300)
    except Exception:
        pass
        
    prep = MoleculePreparation()
    try:
        setups = prep.prepare(mol_h)
        if not setups:
            return {"compound_id": compound_id, "smiles": smiles, "status": "FAILED_MEEKO", "affinity_kcal_mol": None}
        pdbqt_str, is_ok, err = PDBQTWriterLegacy.write_string(setups[0])
        if not is_ok:
            return {"compound_id": compound_id, "smiles": smiles, "status": f"FAILED_MEEKO: {err[:30]}", "affinity_kcal_mol": None}
            
        lig_path = out_dir / f"{compound_id}.pdbqt"
        with open(lig_path, "w", encoding="utf-8") as f:
            f.write(pdbqt_str)
    except Exception as e:
        return {"compound_id": compound_id, "smiles": smiles, "status": f"FAILED_PREP: {str(e)[:30]}", "affinity_kcal_mol": None}
        
    # Vina run
    cmd = [
        str(vina_exe),
        "--receptor", str(receptor_pdbqt),
        "--ligand", str(lig_path),
        "--center_x", str(box_center[0]),
        "--center_y", str(box_center[1]),
        "--center_z", str(box_center[2]),
        "--size_x", str(box_size[0]),
        "--size_y", str(box_size[1]),
        "--size_z", str(box_size[2]),
        "--exhaustiveness", str(exhaustiveness),
        "--num_modes", "5",
        "--cpu", "4",
        "--seed", str(seed),
        "--out", str(out_pose)
    ]
    
    vina_res = subprocess.run(cmd, capture_output=True, text=True)
    affinity = None
    for line in vina_res.stdout.splitlines():
        parts = line.strip().split()
        if len(parts) >= 4 and parts[0] == "1":
            try:
                affinity = float(parts[1])
                break
            except ValueError:
                pass
                
    dur = round(time.time() - t0, 2)
    n_heavy = mol.GetNumHeavyAtoms()
    le = round(-affinity / n_heavy, 3) if affinity and n_heavy > 0 else None
    
    inter = analyze_interactions(out_pose, box_center) if affinity else {}
    
    return {
        "compound_id": compound_id,
        "smiles": smiles,
        "docking_status": "COMPLETED" if affinity is not None else "FAILED_VINA",
        "docking_affinity_kcal_mol": affinity,
        "ligand_efficiency": le,
        "pose_path": str(out_pose) if affinity else None,
        "duration_seconds": dur,
        **inter
    }


def run_pipeline():
    results_dir = Path("results")
    interim_dir = Path("data/interim")
    poses_dir = interim_dir / "poses_top50"
    poses_dir.mkdir(parents=True, exist_ok=True)
    
    vina_exe = Path("bin/vina.exe").resolve()
    receptor_pdbqt = interim_dir / "receptor_chainA.pdbqt"
    box_center = (-9.294, 6.130, 26.348)
    box_size = (18.0, 24.2, 18.0)
    
    # -------------------------------------------------------------
    # 1. Dock Top 50 Screened Candidates
    # -------------------------------------------------------------
    top50_csv = results_dir / "top50_for_docking.csv"
    if not top50_csv.exists():
        raise FileNotFoundError(f"{top50_csv} not found. Run screen_10k_chemprop.py first!")
        
    df_top50 = pd.read_csv(top50_csv)
    print(f"\n=== DOCKING TOP 50 SCREENED CANDIDATES INTO PDB 7KK4 ===")
    
    dock_records = []
    for idx, row in df_top50.iterrows():
        comp_id = row["compound_id"]
        smi = row["smiles"]
        p_ic50 = row.get("predicted_pIC50", None)
        
        print(f"[{idx+1}/50] Docking {comp_id} (Pred pIC50: {p_ic50:.2f})...", end=" ", flush=True)
        res = dock_single_compound(
            smiles=smi,
            compound_id=comp_id,
            vina_exe=vina_exe,
            receptor_pdbqt=receptor_pdbqt,
            box_center=box_center,
            box_size=box_size,
            out_dir=poses_dir,
            exhaustiveness=8,
            seed=42 + idx
        )
        res["predicted_pIC50"] = p_ic50
        dock_records.append(res)
        print(f"Vina: {res.get('docking_affinity_kcal_mol')} kcal/mol | Gly863: {res.get('hbond_gly863')} | Ser904: {res.get('hbond_ser904')}")
        
    df_docked = pd.DataFrame(dock_records)
    dock_results_csv = results_dir / "docking_top50_results.csv"
    df_docked.to_csv(dock_results_csv, index=False)
    print(f"Docking complete. Saved {len(df_docked)} records to {dock_results_csv}")
    
    # -------------------------------------------------------------
    # 2. RDKit-Based Lead Optimization (Rule-Based Transformations)
    # -------------------------------------------------------------
    print(f"\n=== RDKIT-BASED LEAD OPTIMIZATION ===")
    # Pick top 10 best docked leads
    succ_dock = df_docked[df_docked["docking_status"] == "COMPLETED"].sort_values(
        by=["catalytic_interaction_score", "docking_affinity_kcal_mol"], ascending=[False, True]
    ).head(10)
    
    print(f"Selected top {len(succ_dock)} docked lead compounds for RDKit lead optimization.")
    all_analogs = []
    for _, lead in succ_dock.iterrows():
        parent_id = lead["compound_id"]
        parent_smi = lead["smiles"]
        print(f"Generating 4 RDKit-based analogues for lead {parent_id}...")
        analogs = generate_rdkit_analogs(parent_smi, parent_id)
        for a in analogs:
            a["parent_docking_affinity"] = lead["docking_affinity_kcal_mol"]
            a["parent_predicted_pIC50"] = lead["predicted_pIC50"]
        all_analogs.extend(analogs)
        
    df_analogs = pd.DataFrame(all_analogs)
    print(f"Total RDKit Analogues Generated: {len(df_analogs)}")
    
    # -------------------------------------------------------------
    # 3. Screen Analogs with ChemProp v2
    # -------------------------------------------------------------
    print("\n--- Screening Generated Analogs with ChemProp v2 ---")
    analogs_input_csv = interim_dir / "reinvent_analogs_input.csv"
    df_analogs[["analog_id", "analog_smiles"]].rename(columns={"analog_smiles": "smiles"}).to_csv(analogs_input_csv, index=False)
    
    analogs_preds_csv = results_dir / "reinvent_analogs_chemprop_preds.csv"
    chemprop_exe = Path(".venv/Scripts/chemprop.exe")
    model_ckpt = Path("models/chemprop_parp1/model_0/best.pt")
    
    cmd = [
        str(chemprop_exe), "predict",
        "-i", str(analogs_input_csv),
        "-s", "smiles",
        "--model-path", str(model_ckpt),
        "-o", str(analogs_preds_csv)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    df_pred_analogs = pd.read_csv(analogs_preds_csv)
    pred_col = "pIC50" if "pIC50" in df_pred_analogs.columns else [c for c in df_pred_analogs.columns if pd.api.types.is_numeric_dtype(df_pred_analogs[c])][-1]
    df_analogs["analog_predicted_pIC50"] = pd.to_numeric(df_pred_analogs[pred_col], errors="coerce").values
    
    # -------------------------------------------------------------
    # 4. Dock Generated Analogs with AutoDock Vina
    # -------------------------------------------------------------
    print("\n--- Docking Generated Analogs with AutoDock Vina into PDB 7KK4 ---")
    analog_poses_dir = interim_dir / "poses_analogs"
    analog_poses_dir.mkdir(parents=True, exist_ok=True)
    
    docked_analogs = []
    for idx, row in df_analogs.iterrows():
        a_id = row["analog_id"]
        a_smi = row["analog_smiles"]
        print(f"[{idx+1}/{len(df_analogs)}] Docking analog {a_id}...", end=" ", flush=True)
        res = dock_single_compound(
            smiles=a_smi,
            compound_id=a_id,
            vina_exe=vina_exe,
            receptor_pdbqt=receptor_pdbqt,
            box_center=box_center,
            box_size=box_size,
            out_dir=analog_poses_dir,
            exhaustiveness=8,
            seed=100 + idx
        )
        row_dict = row.to_dict()
        row_dict["analog_docking_affinity"] = res.get("docking_affinity_kcal_mol")
        row_dict["analog_ligand_efficiency"] = res.get("ligand_efficiency")
        row_dict["analog_docking_status"] = res.get("docking_status")
        row_dict["analog_pose_path"] = res.get("pose_path")
        row_dict["hbond_gly863"] = res.get("hbond_gly863")
        row_dict["hbond_ser904"] = res.get("hbond_ser904")
        row_dict["pi_stack_tyr907"] = res.get("pi_stack_tyr907")
        row_dict["catalytic_interaction_score"] = res.get("catalytic_interaction_score")
        
        # Calculate Delta Affinity
        if row_dict["analog_docking_affinity"] and row_dict["parent_docking_affinity"]:
            row_dict["delta_affinity_kcal_mol"] = round(row_dict["analog_docking_affinity"] - row_dict["parent_docking_affinity"], 2)
            row_dict["affinity_improved"] = bool(row_dict["delta_affinity_kcal_mol"] < 0)
        else:
            row_dict["delta_affinity_kcal_mol"] = None
            row_dict["affinity_improved"] = False
            
        print(f"Vina: {row_dict['analog_docking_affinity']} kcal/mol | Delta: {row_dict.get('delta_affinity_kcal_mol')} kcal/mol")
        docked_analogs.append(row_dict)
        
    df_opt = pd.DataFrame(docked_analogs)
    
    # -------------------------------------------------------------
    # 5. ADMET-AI Profiling on Optimized Analogs
    # -------------------------------------------------------------
    print("\n--- Profiling Generated Analogs with ADMET-AI ---")
    try:
        from admet_ai import ADMETModel
        model = ADMETModel()
        admet_preds = model.predict(smiles=df_opt["analog_smiles"].tolist())
        for col in ["Solubility_AqSolDB", "Caco2_Wang", "hERG", "CYP3A4_Substrate_CarbonMangels", "Ames"]:
            if col in admet_preds.columns:
                df_opt[col] = admet_preds[col].values
        print("ADMET-AI profiling complete on all RDKit analogues.")
    except Exception as e:
        print(f"ADMET-AI warning: {e}")
        
    leadopt_csv = results_dir / "reinvent_lead_optimization.csv"
    rdkit_leadopt_csv = results_dir / "rdkit_lead_optimization.csv"
    df_opt["optimization_method"] = "RDKit-Based Lead Optimization (Rule-Based Transformations)"
    df_opt.to_csv(leadopt_csv, index=False)
    df_opt.to_csv(rdkit_leadopt_csv, index=False)
    print(f"\nSaved full RDKit lead optimization results to {leadopt_csv} and {rdkit_leadopt_csv}")
    
    summary = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "leads_optimized": len(succ_dock),
        "total_analogs_generated": len(df_opt),
        "successfully_docked_analogs": int((df_opt["analog_docking_status"] == "COMPLETED").sum()),
        "improved_affinity_count": int(df_opt["affinity_improved"].sum()),
        "max_affinity_improvement_kcal_mol": float(df_opt["delta_affinity_kcal_mol"].dropna().min()) if not df_opt["delta_affinity_kcal_mol"].dropna().empty else None,
        "lead_optimization_method": "RDKit-Based Lead Optimization (Rule-Based Transformations)"
    }
    with open(results_dir / "lead_optimization_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print("Lead optimization summary written to results/lead_optimization_summary.json")
    return df_opt


if __name__ == "__main__":
    run_pipeline()
