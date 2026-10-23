import numpy as np

crystal_pdb = "data/interim/crystal_olaparib.pdb"
docked_pdbqt = "results/olaparib_redocked_poses.pdbqt"

crystal_atoms = {}
with open(crystal_pdb, "r") as f:
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
with open(docked_pdbqt, "r") as f:
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
print(f"Matched {len(common_atoms)} heavy atoms by exact PDB identifier.")

diffs = [crystal_atoms[name] - docked_atoms[name] for name in common_atoms]
diffs_arr = np.array(diffs)
dists = np.sqrt(np.sum(diffs_arr**2, axis=-1))
rmsd = float(np.sqrt(np.mean(np.sum(diffs_arr**2, axis=-1))))

print(f"Per-atom distances (min, mean, max): {dists.min():.3f}, {dists.mean():.3f}, {dists.max():.3f} A")
print(f"Final Heavy-Atom RMSD: {rmsd:.3f} Angstroms")
print(f"Gate passed (<= 2.0 A): {rmsd <= 2.0}")
