# BioNova PARP1 Discovery: Computer-Aided Drug Discovery Pipeline

**Investigator:** Ayush Lanjewar (B.Pharm Candidate)  
**Target:** Human Poly(ADP-ribose) polymerase 1 (PARP1, ChEMBL: `CHEMBL3105`, UniProt: `P09874`)  
**Core Frameworks:** ChemProp v2 (D-MPNN), AutoDock Vina v1.2.7, Meeko v0.8.0, RDKit, ADMET-AI, Streamlit, Plotly.

---

## 🔬 Scientific Epistemic Truth

> **CRITICAL SCIENTIFIC PRINCIPLE:**  
> In-silico modeling, ChemProp D-MPNN bioactivity predictions, AutoDock Vina affinities, and ADMET-AI estimations represent **computational prioritizations and exploratory hypotheses**. They do **NOT** constitute verified biological activity, prospective in-vitro inhibition, or clinical efficacy. All findings must be prospectively verified through recombinant enzymatic assays and cellular viability studies.

---

## 📋 Project Architecture

```
bionova-parp1-discovery/
├── AGENTS.md                  # Operational SOPs, agent contracts, and safety guardrails
├── README.md                  # Complete documentation, execution guide, and provenance
├── pyproject.toml             # Python package configuration and dependency specification
├── .gitignore                 # Exclusion rules for temporary files, caches, and models
├── configs/
│   ├── project.yaml           # Global paths, seeds, and target definitions
│   ├── model.yaml             # ChemProp v2 D-MPNN architecture & training hyperparameters
│   ├── screening.yaml         # Physicochemical filters and diversity selection rules
│   ├── docking.yaml           # PDB 7KK4 receptor config, grid coordinates, and Vina parameters
│   └── admet.yaml             # ADMET-AI endpoint configuration
├── docs/
│   ├── data_source_decision.md # Benchmark evaluation: Papyrus 2024 vs ChEMBL vs BindingDB
│   ├── methodology.md         # Scientific and mathematical descriptions of all algorithms
│   └── provenance.md          # Package versions, academic citations, and dataset origins
├── src/bionova_parp1/
│   ├── qa.py                  # SMILES standardization, desalting, and pIC50 mathematics
│   ├── data.py                # Dataset extraction and curation pipeline
│   ├── splits.py              # Bemis-Murcko scaffold-balanced splitting (zero leakage)
│   ├── train.py               # ChemProp v2 training interface & bootstrap statistics
│   ├── library.py             # PubChem PUG REST streaming and drug-likeness filtering
│   ├── rank.py                # Multi-parametric ranking and diversity selection
│   ├── docking.py             # PDB 7KK4 prep, co-crystal RMSD gate, and Vina engine
│   └── admet.py               # Post-docking ADMET-AI profiling and final prioritization
├── scripts/
│   ├── curate_dataset.py      # Phase 1: Curate raw Papyrus records into parp1_regression.csv
│   ├── run_splits.py          # Phase 2: Compute 80/10/10 scaffold partitions
│   ├── evaluate_holdout.py    # Phase 2: Compute RMSE, MAE, R², Pearson, and Spearman
│   ├── fetch_pubchem_library.py # Phase 3: Retrieve authentic screening library
│   ├── screen_library.py      # Phase 3: ChemProp inference & Top-100 selection
│   ├── docking_validation.py  # Phase 4A: PDB 7KK4 Olaparib redocking validation (RMSD <= 2.0 Å)
│   ├── dock_top100.py         # Phase 4B: Batch AutoDock Vina candidate docking
│   ├── run_admet.py           # Phase 5: ADMET-AI profiling strictly post-docking
│   ├── generate_figures.py    # Phase 6: High-resolution publication figures
│   ├── generate_brief.py      # Phase 6: manifest.json and morning_brief.md
│   └── resume_pipeline.py     # Master orchestrator & automated pipeline resumption
├── tests/
│   ├── test_data.py           # Unit tests for pIC50 transforms, desalting, and QA
│   ├── test_splits.py         # Unit tests enforcing zero scaffold and SMILES leakage
│   ├── test_docking.py        # Unit tests for 3D conformers and RMSD calculations
│   └── test_stage_order.py    # Unit tests proving Docking strictly precedes ADMET
├── data/
│   ├── raw/                   # Raw Papyrus 2024 files (SHA256 verified) & PubChem dump
│   ├── interim/               # Receptor PDBQT, native ligand PDBQT, grid definitions
│   └── processed/             # parp1_regression.csv and exclusion_log.csv
├── splits/                    # train.csv, val.csv, test.csv, chemprop_splits.json
├── models/                    # ChemProp v2 model checkpoints, best.pt, model_info.json
├── results/                   # Model metrics, docking results, ADMET predictions, final table
├── poses/                     # 3D docked PDBQT conformations for all candidates
├── figures/                   # 8 high-resolution publication-quality PNG figures
├── paper/
│   ├── manuscript.md          # Complete publication manuscript draft
│   └── references.bib         # Academic bibliography
├── app/
│   └── streamlit_app.py       # Premium interactive research dashboard
└── reports/
    └── morning_brief.md       # Comprehensive investigator summary
```

---

## ⚡ Quick Start & Reproduction

### 1. Environment Setup
The project utilizes `uv` to manage an isolated Python 3.11 environment on Windows 11:

```powershell
# Create venv and install dependencies
uv venv .venv --python 3.11
uv pip install --python .venv/Scripts/python.exe -r requirements.txt
```

### 2. Run the Full End-to-End Pipeline
To run all stages sequentially with automatic resumption:

```powershell
.\.venv\Scripts\python.exe scripts/resume_pipeline.py
```

### 3. Launch the Interactive Research Dashboard
```powershell
.\.venv\Scripts\streamlit.exe run app/streamlit_app.py
```
Access the dashboard at: **http://localhost:8501**

---

## 📊 Key Observed Experimental & Computational Results

- **Curated Dataset:** 932 unique experimental Human PARP1 IC50 molecules from Papyrus 2024 (Quality Tier `++`), with 241 non-IC50, mixed, or censored measurements logged and excluded.
- **Scaffold Holdout Performance:**
  - $\text{RMSE} = 0.621$ $\text{pIC}_{50}$ units ($95\%\text{ CI: } [0.554, 0.685]$)
  - $\text{MAE} = 0.525$
  - $R^2 = 0.459$
  - Pearson correlation $r = 0.744$ ($p = 1.33 \times 10^{-17}$)
  - Spearman rank correlation $\rho = 0.571$ ($p = 2.35 \times 10^{-9}$)
- **Co-Crystal Redocking Validation Gate (PDB 7KK4):**
  - Native Olaparib (`09L`) Vina Affinity: **$-11.06\text{ kcal/mol}$**
  - Heavy-Atom Pose RMSD: **$1.419\text{ \AA}$** (Strict Hard Gate $\le 2.0\text{ \AA}$ **PASSED**)
- **PubChem Screening & Batch Docking:**
  - 100 diverse candidates selected across 54 unique Bemis-Murcko scaffolds.
  - Top docking affinities reaching **$-10.16\text{ kcal/mol}$**.
  - Profiling completed with ADMET-AI across solubility, Caco-2 permeability, and hERG liability.

---

## 📜 Citations and Licenses
- **Papyrus 2024:** Bequignon et al., *J. Cheminform* 15, 3 (2023). CC-BY 4.0.
- **ChEMBL 34:** Mendez et al., *Nucleic Acids Res.* 47, D930 (2019). CC-BY-SA 3.0.
- **ChemProp v2:** Heid et al., *J. Chem. Inf. Model.* 64, 9 (2024). MIT License.
- **AutoDock Vina:** Eberhardt et al., *J. Chem. Inf. Model.* 61, 3891 (2021). Apache 2.0.
- **PDB 7KK4:** Johannes et al., *J. Med. Chem.* 64, 14498 (2021).
