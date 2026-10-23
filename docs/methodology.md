# BioNova PARP1 — Scientific Methodology

## 1. Machine Learning Paradigm: ChemProp v2 D-MPNN
- **Architecture**: Directed Message Passing Neural Network (D-MPNN).
- **Task**: Single-task regression of continuous $\text{pIC}_{50}$.
- **Node/Edge Representations**: Atom features (atomic number, degree, formal charge, chirality, hybridization, hydrogen count, aromaticity) and bond features (bond type, conjugation, ring membership, stereo).
- **Graph Pooling**: Mean readout pooling across molecular graph.
- **Feed-Forward Layers**: 2-layer MLP with ReLU activations and dropout ($p=0.10$).
- **Loss Function**: Mean Squared Error (MSE), optimized with Adam and Noam learning rate scheduler.

## 2. Scaffold-Balanced Holdout Splitting
- **Principle**: Standard random splits overestimate model generalizability due to analogue memorization.
- **Algorithm**: RDKit Bemis-Murcko scaffold clustering.
- **Partition**: 80% Training, 10% Validation (early stopping/model selection), 10% Test (strictly held-out final evaluation).
- **Leakage Prevention**: No identical canonical SMILES or Bemis-Murcko core structures shared between partitions.

## 3. Structure-Based Evaluation: AutoDock Vina
- **Target Complex**: PDB `7KK4` (Human PARP1 catalytic domain co-crystallized with Olaparib, resolution 2.30 Å).
- **Validation Protocol**:
  1. Extraction and preparation of chain A apoprotein.
  2. Native ligand (`N7E`) extraction, coordinate tracking, and redocking into defined grid box.
  3. RMSD Calculation: Symmetry-aware heavy-atom RMSD relative to experimental crystal pose.
  4. Hard Acceptance Gate: RMSD $\le 2.0\text{ \AA}$.

## 4. In Silico ADMET Profiling (Strictly Post-Docking)
- **Engine**: ADMET-AI (fast, accurate machine learning property prediction).
- **Constraint**: Executed only on candidates that successfully pass Vina docking.
- **Key Profiles**: Caco-2 permeability, logS aqueous solubility, CYP isoform interactions, hERG liability, Ames mutagenicity.
