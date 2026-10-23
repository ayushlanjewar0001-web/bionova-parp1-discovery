# BioNova PARP1 — Agent Operational Contracts & SOPs

## Scientific Scope & Authority
- **Target Definition**: Human PARP1 / poly(ADP-ribose) polymerase 1 / ChEMBL ID `CHEMBL3105` / UniProt `P09874`.
- **Primary Investigator**: Ayush Lanjewar (B.Pharm candidate).
- **Critical Epistemic Truth**: In-silico modeling, D-MPNN predictions, AutoDock Vina affinities, and ADMET-AI estimates are computational prioritizations, not experimental verifications. Never claim computational outputs as confirmed biological or pharmacological facts.
- **Model Standard**: ChemProp v2 D-MPNN single-task regression on pIC50 ($-\log_{10}[\text{IC}_{50} \text{ (M)}]$). No non-ChemProp predictive ML models.
- **Experimental Grounding**: All training targets must be authentic, experimental human PARP1 $\text{IC}_{50}$ or pre-curated experimental $\text{pIC}_{50}$. Censored inequalities ($<, >$) are excluded from regression.
- **Docking Protocol & Hard Gate**: Co-crystal PDB 7KK4 with reference Olaparib must undergo redocking validation achieving heavy-atom RMSD $\le 2.0\text{ \AA}$ before any library docking commences.
- **Chronological Pipeline Ordering**:
  1. Dataset Acquisition & QA
  2. Scaffold Holdout & ChemProp Training/Eval
  3. External Screening & Top-100 Selection
  4. Docking Validation (PDB 7KK4) & Candidate Docking
  5. ADMET-AI Prediction (strictly post-docking)
  6. Final Multi-Parametric Ranking, Dashboard & Manuscript
