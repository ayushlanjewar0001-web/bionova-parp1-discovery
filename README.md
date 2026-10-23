# BioNova PARP1: Retrospective In-Silico Prioritization & Generative Lead Optimization of Human PARP1 Inhibitors

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Framework: PyTorch](https://img.shields.io/badge/PyTorch-2.2+-ee4c2c.svg)](https://pytorch.org/)
[![Model: ChemProp v2](https://img.shields.io/badge/ChemProp-v2.0.5%20D--MPNN-00c853.svg)](https://chemprop.readthedocs.io/)
[![Docking: AutoDock Vina](https://img.shields.io/badge/AutoDock%20Vina-v1.2.7-ff6f00.svg)](https://vina.scripps.edu/)
[![Generative AI: REINVENT 4](https://img.shields.io/badge/AstraZeneca-REINVENT%204-7928ca.svg)](https://github.com/MolecularAI/Reinvent)
[![ADMET: ADMET-AI](https://img.shields.io/badge/ADMET--AI-Bioinformatics%202024-00b4d8.svg)](https://admet.ai.greenstone.ch/)
[![Web App: React 19 + Vite](https://img.shields.io/badge/Vercel-Production%20Live-black.svg?logo=vercel)](https://vercel.com/)

> **Investigator:** Ayush Lanjewar (*Bachelor of Pharmacy Candidate*)  
> **Target:** Human Poly(ADP-ribose) Polymerase 1 (`CHEMBL3105` / UniProt `P09874`)  
> **Co-Crystal Complex:** PDB `7KK4` (PARP1 catalytic domain co-crystallized with Olaparib at $2.30\text{ \AA}$)  
> **Interactive Research Web App:** [Live on Vercel](https://bionova-parp1.vercel.app) *(or `http://localhost:5173` locally)*

---

## Executive Summary

**BioNova PARP1** is an auditable, end-to-end computer-aided drug discovery (CADD) and generative AI platform investigating novel chemical inhibitors of human Poly(ADP-ribose) Polymerase 1 (PARP1). Designed to overcome pervasive failure modes in academic computational screening—such as train/test analogue leakage, mixed assay endpoints, unvalidated docking scoring grids, and unconstrained generative AI—this project enforces strict scientific reproducibility gates across eight stages:

1. **Curated Experimental Bioactivity:** 932 verified human PARP1 $\text{IC}_{50}$ entries extracted from the published **Papyrus 2024** benchmark (Zenodo 13987985, Quality Tier `05.7++`), eliminating 241 mixed or censored records.
2. **Scaffold-Balanced Partitioning:** Bemis–Murcko scaffold grouping (80/10/10 split, seed 42) ensuring **zero shared core frameworks** between training, validation, and test sets.
3. **Directed Message-Passing Regression:** Single-task **ChemProp v2 D-MPNN** continuous $\text{pIC}_{50}$ regression achieving test $\text{RMSE} = 0.621$ and Pearson $r = 0.744$ ($p = 1.33 \times 10^{-17}$).
4. **Target-Relevant 10,000 PubChem Screen:** High-throughput inference across 10,000 curated molecules filtered for PARP1 pharmacophores ($200 \le \text{MW} \le 550$, $\text{HBD} \ge 1$, $\text{TPSA} \le 140$, zero benchmark leakage).
5. **Crystallographic Redocking Hard Gate:** Automated redocking of Olaparib (`09L`) into PDB `7KK4` reproducing the experimental co-crystal pose with an **$\text{RMSD}$ of $1.419\text{ \AA}$** (passing the strict $\le 2.0\text{ \AA}$ gate).
6. **Top 50 AutoDock Vina Docking:** Rigid-receptor docking of prioritized candidates yielding binding affinities up to **$-11.98\text{ kcal/mol}$** (surpassing Olaparib at $-11.06\text{ kcal/mol}$) with 100% conservation of dual **Gly863** and **Ser904** catalytic hydrogen bonds.
7. **AstraZeneca REINVENT 4 Generative Lead Optimization:** Targeted Mol2Mol transformation generating exactly 4 analogs per top docked lead (40 total analogs); 13 analogs achieved binding affinity improvements up to **$\Delta\text{Affinity} = -1.06\text{ kcal/mol}$** (reaching **$-12.17\text{ kcal/mol}$** for `PUBCHEM_71550931_OPT4`).
8. **Post-Docking ADMET-AI Profiling:** 106 absorption, distribution, metabolism, excretion, and toxicity endpoints evaluated strictly post-docking, confirming high aqueous solubility and low hERG cardiotoxic liabilities ($<0.30$).

---

## Pipeline Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Papyrus 2024 Benchmark                   │
                    │         (Zenodo 13987985, Tier 05.7++, PARP1)          │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                    [Data QA & Standardization]
                                    • Exact IC50 only (241 excluded)
                                    • Desalted & uncharged via RDKit
                                    • Median-aggregated replicates
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │          Bemis–Murcko Scaffold Partition               │
                    │   Train: 746 (490 Scaffolds) | Val: 93 | Test: 93     │
                    │            Zero Shared Scaffolds (Seed 42)             │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                   [ChemProp v2 D-MPNN Training]
                                   • Directed bond message passing
                                   • 3 layers, 300 hidden dims
                                   • Test RMSE: 0.621 | Pearson r: 0.744
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │        Target-Relevant 10,000 PubChem Screen           │
                    │    20+ Cores (Phthalazinones, Benzamides, Indazoles)   │
                    │       MW 200-550, HBD 1-5, TPSA 40-140, RotB <= 8      │
                    │           Screened via ChemProp in 27.00 s             │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                  [Greedy Diversity Selection]
                                  • MaxMin on Morgan Fingerprints
                                  • Top 50 Diverse Candidates
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │         PDB 7KK4 Redocking Validation Gate             │
                    │     Olaparib Pose RMSD: 1.419 Å (Passed <= 2.0 Å)      │
                    │             Affinity: -11.06 kcal/mol                  │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                    [Top 50 AutoDock Vina Docking]
                                    • Rigid receptor (Chain A, 2.30 Å)
                                    • Top affinity: -11.98 kcal/mol
                                    • 100% Gly863 & Ser904 dual H-bonds
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │       AstraZeneca REINVENT 4 Lead Optimization         │
                    │     Top 10 Docked Leads x 4 Mol2Mol Analogs = 40       │
                    │     13 Analogs with Delta Affinity < 0 kcal/mol        │
                    │     Max Affinity Gain: -1.06 kcal/mol (-12.17 kcal)    │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                   [ADMET-AI Post-Docking Profiling]
                                   • Aqueous Solubility (AqSolDB logS)
                                   • Intestinal Caco-2 Permeability
                                   • hERG Cardiotoxicity (<0.30 safe)
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │          Interactive Research Web Dashboard            │
                    │        Vercel Production App (React 19 + Vite)         │
                    └────────────────────────────────────────────────────────┘
```

---

## Scientific Results & Benchmarks

### 1. ChemProp v2 D-MPNN Holdout Performance
Evaluated strictly on held-out Bemis–Murcko scaffold clusters never observed during training:

| Metric | Holdout Value | 95% Confidence Interval | Benchmark Interpretation |
| :--- | :---: | :---: | :--- |
| **Root-Mean-Square Error (RMSE)** | **0.621** | $[0.554, 0.685]$ | Close to experimental inter-laboratory assay variance ($\sim 0.50$ log units) |
| **Mean Absolute Error (MAE)** | **0.525** | $[0.458, 0.594]$ | Low average prediction error on unseen scaffolds |
| **Coefficient of Determination ($R^2$)** | **0.459** | $[0.257, 0.583]$ | Exceptional for pure scaffold-split cross-validation |
| **Pearson Correlation ($r$)** | **0.744** | $p = 1.33 \times 10^{-17}$ | Strong linear bioactivity tracking |
| **Spearman Rank Correlation ($\rho$)** | **0.571** | $p = 2.35 \times 10^{-9}$ | Reliable monotonic candidate ranking |

### 2. AutoDock Vina Crystallographic Redocking Gate (PDB `7KK4`)
To prevent unvalidated virtual screening, AutoDock Vina v1.2.7 was tested for its capacity to reproduce the experimental co-crystal pose of Olaparib (`09L`):

- **Receptor:** Human PARP1 catalytic domain, Chain A, $2.30\text{ \AA}$ resolution.
- **Reference Ligand:** Olaparib ($32$ heavy atoms, formula $\text{C}_{24}\text{H}_{23}\text{FN}_4\text{O}_3$).
- **Binding Pocket Centroid:** $x = -9.294, y = 6.130, z = 26.348\text{ \AA}$ (Grid box: $18.0 \times 24.2 \times 18.0\text{ \AA}$).
- **Observed Native Redocking RMSD:** **$1.419\text{ \AA}$** across all 32 heavy atoms.
- **Validation Status:** **PASSED** ($\le 2.0\text{ \AA}$ standard acceptance criterion).

---

## Top Prioritized Leads & Generative Lead Optimization

### Top 10 Docked Candidates from 10k Screening Pool
All top candidates demonstrated dual hydrogen-bonding to **Gly863** and **Ser904** and aromatic $\pi$-stacking against **Tyr907**:

| Rank | Compound ID | ChemProp Pred $\text{pIC}_{50}$ | Vina Score ($\text{kcal/mol}$) | Ligand Efficiency | Gly863 H-Bond | Ser904 H-Bond | Tyr907 $\pi$-Stack |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | `PUBCHEM_1010644` | $10.11$ | **$-11.98$** | $0.386$ | **Yes** ($\le 3.5\text{ \AA}$) | **Yes** ($\le 3.5\text{ \AA}$) | Yes |
| **2** | `PUBCHEM_134817183` | $9.51$ | **$-11.84$** | $0.382$ | **Yes** | **Yes** | Yes |
| **3** | `PUBCHEM_71550931` | $9.44$ | **$-11.11$** | $0.370$ | **Yes** | **Yes** | Yes |
| **4** | `PUBCHEM_71562418` | $9.30$ | **$-10.96$** | $0.365$ | **Yes** | **Yes** | Yes |
| **5** | `PUBCHEM_162533924` | $9.16$ | **$-10.75$** | $0.358$ | **Yes** | **Yes** | Yes |
| **6** | `PUBCHEM_71533696` | $9.13$ | **$-10.75$** | $0.358$ | **Yes** | **Yes** | Yes |
| **7** | `PUBCHEM_1002472` | $9.96$ | **$-10.74$** | $0.369$ | **Yes** | **Yes** | Yes |
| **8** | `PUBCHEM_1002266` | $10.13$ | **$-10.64$** | $0.355$ | **Yes** | **Yes** | Yes |
| **9** | `PUBCHEM_76287717` | $9.10$ | **$-10.63$** | $0.354$ | **Yes** | **Yes** | Yes |
| **10**| `PUBCHEM_1002392` | $10.22$ | **$-10.59$** | $0.353$ | **Yes** | **Yes** | Yes |
| *Ref*| **Olaparib (7KK4)** | *8.60 (exp)* | **$-11.06$** | $0.346$ | **Yes** | **Yes** | **Yes** |

### AstraZeneca REINVENT 4 Lead Optimization Highlights
Generative transformations preserved the catalytic binding hinge while systematically improving receptor complementarity:

| Parent Compound | Top Optimized Analog | Transformation Mechanism | Analog Vina ($\text{kcal/mol}$) | $\Delta\text{Affinity}$ ($\text{kcal/mol}$) | AqSolDB ($\text{logS}$) | hERG Risk |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT4` | Core $\pi$-stacking optimization against Tyr907 | **$-12.17$** | **$-1.06$** | $-4.85$ | $0.23$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT2` | Ser904 hydroxyl H-bond reinforcement | **$-11.71$** | **$-0.96$** | $-4.62$ | $0.21$ (Safe) |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT3` | Solubilizing piperazine tail extension | **$-11.91$** | **$-0.80$** | $-4.41$ | $0.26$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT4` | Lipophilic sub-pocket filling | **$-11.53$** | **$-0.78$** | $-4.91$ | $0.24$ (Safe) |
| `PUBCHEM_76287717` | `PUBCHEM_76287717_OPT2` | Ser904 H-bond reinforcement | **$-11.38$** | **$-0.75$** | $-4.70$ | $0.22$ (Safe) |

---

## Critical Epistemic Boundary

> [!IMPORTANT]
> **Scientific Integrity & Truth In-Silico:** All affinities, $\text{pIC}_{50}$ estimates, and interaction coordinates reported in this study represent **computational hypotheses**. In-silico docking scores and neural network predictions do not constitute biological proof or therapeutic discovery. Confirmatory *in-vitro* recombinant enzyme inhibition assays (fluorometric PARP1 activity assays) and clonogenic survival assays in *BRCA1/2*-deficient cancer cell models are required before any clinical or pharmacological efficacy can be claimed.

---

## Repository Structure

```
bionova-parp1-discovery/
├── data/
│   ├── raw/
│   │   ├── papyrus_parp1_raw.tsv         # Original Papyrus 2024 Tier ++ corpus
│   │   └── pubchem_10k_parp_screen.csv   # 10,000 curated target-relevant compounds
│   └── processed/
│       ├── curated_parp1_ic50.csv        # 932 standardized IC50 molecules
│       └── scaffold_splits/              # Bemis-Murcko 80/10/10 split files
├── models/
│   └── chemprop_parp1/                   # Trained single-task D-MPNN weights
├── results/
│   ├── screened_10k_compounds.parquet    # 10k ChemProp prediction catalog
│   ├── top50_for_docking.csv             # Prioritized diverse Top 50 candidates
│   ├── docking_top50_results.csv         # PDB 7KK4 docking scores & interaction flags
│   ├── reinvent_lead_optimization.csv    # 40 REINVENT 4 analogs with Vina & ADMET scores
│   └── lead_optimization_summary.json    # Summary metrics of lead optimization
├── scripts/
│   ├── curate_dataset.py                 # Automated Papyrus extraction & QA
│   ├── run_splits.py                     # Zero-leakage Bemis-Murcko partitioner
│   ├── screen_10k_chemprop.py            # High-throughput ChemProp screening
│   ├── dock_top50_and_leadopt.py         # Vina docking & REINVENT 4 lead optimization
│   └── build_web_data.py                 # Compiles results into web JSON bundle
├── src/bionova_parp1/
│   └── reinvent_leadopt.py               # REINVENT 4 Mol2Mol generative transformation engine
├── paper/
│   └── manuscript.md                     # Evidence-faithful pre-print manuscript draft
├── web/                                  # React 19 + Vite + Tailwind web application
│   ├── src/components/                   # Overview, Pipeline, Screening, Docking, LeadOpt, ADMET
│   └── vercel.json                       # One-click Vercel deployment configuration
└── vercel.json                           # Root deployment router
```

---

## Local Installation & Reproduction

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/bionova-parp1-discovery.git
cd bionova-parp1-discovery

# 2. Set up Python environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 3. Launch the Web Application
cd web
npm install
npm run dev
# Open http://localhost:5173
```

---

## Citation & Authorship

If you utilize this workflow or data in academic research, please cite:

```bibtex
@article{lanjewar2026parp1,
  title={Retrospective In-Silico Prioritization and Generative Lead Optimization of Human PARP1 Inhibitors via Scaffold-Aware D-MPNN, Validated Molecular Docking, and REINVENT 4},
  author={Lanjewar, Ayush},
  journal={BioNova In-Silico Research Pre-print},
  year={2026},
  note={Bachelor of Pharmacy (B.Pharm) Candidate Investigation}
}
```
