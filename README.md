# BioNova PARP1

> **Computational In-Silico Prioritization & Generative Lead Optimization of Human PARP1 Inhibitors**  
> **Author & Principal Investigator:** Ayush Lanjewar (*Bachelor of Pharmacy Candidate*)  
> **Target:** Human Poly(ADP-ribose) Polymerase 1 (`CHEMBL3105` / UniProt `P09874`)  
> **Reference Structural Complex:** PDB `7KK4` (PARP1 Catalytic Domain co-crystallized with Olaparib at 2.30 Å)  
> **Core Stack:** Python 3.11 • PyTorch 2.2 • ChemProp v2 (D-MPNN) • AutoDock Vina v1.2.7 • AstraZeneca REINVENT 4 • ADMET-AI • React 19 / Vite

---

## 1. Executive Summary

**BioNova PARP1** is an auditable, end-to-end computer-aided drug discovery (CADD) and generative AI pipeline designed to identify, prioritize, and optimize novel small-molecule inhibitors of human PARP1. 

Addressing fundamental reproducibility and methodological flaws prevalent in published literature—such as train/test congener memorization, mixing non-equivalent kinetic endpoints ($K_i / K_d / \text{EC}_{50} / \text{IC}_{50}$), unvalidated molecular docking grids, and unconstrained generative AI—this project enforces strict scientific quality gates at every stage:

1. **Curated Experimental Bioactivity:** 932 verified human PARP1 $\text{IC}_{50}$ records derived from the published Papyrus 2024 benchmark (Zenodo 13987985, Quality Tier `05.7++`). 241 non-$\text{IC}_{50}$, censored, or salt records were rigorously excluded.
2. **Zero-Leakage Scaffold Partitioning:** Bemis–Murcko scaffold-balanced splitting (80/10/10 ratio, seed 42) guaranteeing zero shared cyclic frameworks across train (490 scaffolds), validation (8 scaffolds), and test (5 scaffolds) partitions.
3. **Directed Message-Passing Regression:** Single-task ChemProp v2 D-MPNN continuous $\text{pIC}_{50}$ regression achieving held-out scaffold test $\text{RMSE} = 0.621$ and Pearson $r = 0.744$ ($p = 1.33 \times 10^{-17}$).
4. **Target-Relevant 10,000 PubChem Screen:** High-throughput virtual screening of 10,000 curated molecules filtered for PARP1 pharmacophores ($200 \le \text{MW} \le 550$, $\text{HBD} \ge 1$, $\text{TPSA} \le 140$, $\text{RotB} \le 8$, zero benchmark leakage).
5. **Crystallographic Redocking Hard Gate:** Automated redocking of Olaparib (`09L`) into PDB `7KK4` reproducing the experimental binding pose with an **$\text{RMSD}$ of $1.419\text{ \AA}$** across all 32 heavy atoms (passing the $\le 2.0\text{ \AA}$ acceptance heuristic).
6. **Top 50 AutoDock Vina Docking:** Rigid-receptor docking of prioritized candidates yielding binding affinities up to **$-11.98\text{ kcal/mol}$** (surpassing Olaparib at $-11.06\text{ kcal/mol}$) with 100% conservation of dual Gly863/Ser904 catalytic hydrogen bonds.
7. **AstraZeneca REINVENT 4 Generative Lead Optimization:** Mol2Mol generative transformation across the top 10 docked leads generating 4 targeted analogs per lead (40 total analogs); 13 analogs achieved binding affinity improvements up to **$\Delta\text{Affinity} = -1.06\text{ kcal/mol}$** (reaching **$-12.17\text{ kcal/mol}$** for `PUBCHEM_71550931_OPT4`).
8. **Post-Docking ADMET-AI Profiling:** 106 absorption, distribution, metabolism, excretion, and toxicity endpoints evaluated strictly post-docking, confirming favorable aqueous solubility and low cardiotoxic risk ($\text{hERG} < 0.30$).

---

## 2. End-to-End Pipeline Architecture

```
[Phase 1: Bioactivity Curation]
   └── Papyrus 2024 Tier ++ corpus (Zenodo 13987985)
   └── Strict IC50 filter (241 non-IC50 / censored entries removed)
   └── Desalted, uncharged, median-aggregated: N = 932 compounds

[Phase 2: Scaffold-Balanced Partitioning]
   └── Bemis–Murcko scaffold grouping (80/10/10 split, seed 42)
   └── 490 training scaffolds, 8 validation scaffolds, 5 test scaffolds (0% leakage)

[Phase 3: D-MPNN Model Training & Evaluation]
   └── ChemProp v2 single-task continuous pIC50 regression
   └── 3 message-passing layers, 300 hidden dimensions
   └── Test set: RMSE = 0.621, MAE = 0.525, Pearson r = 0.744, R² = 0.459

[Phase 4: Target-Relevant 10k Virtual Screening]
   └── 10,000 authentic PubChem compounds across 20+ PARP1 pharmacophoric cores
   └── Strict filters: MW 200–550, HBD 1–5, HBA 2–10, TPSA 40–140, RotB ≤ 8
   └── ChemProp inference in 27.00 s; Top 50 diverse candidates selected (pIC50: 9.10–10.37)

[Phase 5: Crystallographic Redocking Hard Gate]
   └── PDB 7KK4 co-crystal resolution 2.30 Å (Olaparib reference)
   └── Native ligand redocking: Heavy-atom RMSD = 1.419 Å (GATE PASSED: ≤ 2.0 Å)
   └── Native Vina affinity: -11.06 kcal/mol

[Phase 6: Top 50 Candidate Docking]
   └── AutoDock Vina v1.2.7 batch docking into catalytic pocket
   └── Top affinity: -11.98 kcal/mol (PUBCHEM_1010644)
   └── 100% preservation of Gly863 and Ser904 dual hydrogen bonds

[Phase 7: AstraZeneca REINVENT 4 Generative Lead Optimization]
   └── Top 10 docked leads × 4 Mol2Mol targeted analogs = 40 total analogs
   └── Analogs rescreened with ChemProp v2 and redocked into PDB 7KK4
   └── 13 analogs improved affinity (ΔAffinity < 0); max gain: -1.06 kcal/mol (-12.17 kcal/mol)

[Phase 8: Post-Docking ADMET-AI Profiling]
   └── 106 ADMET-AI pharmacokinetic & safety endpoints
   └── Aqueous solubility logS > -5.0; Caco-2 permeability > -4.7; hERG risk < 0.30

[Phase 9: Interactive Research Web Platform]
   └── React 19 + Vite + Tailwind glassmorphic dashboard
   └── Production-compiled and configured for instant Vercel deployment
```

---

## 3. Quantitative Benchmarks & Key Findings

### Model Evaluation on Unseen Scaffolds

| Evaluation Metric | Test Partition Value | 95% Confidence Interval | Methodological Interpretation |
| :--- | :---: | :---: | :--- |
| **Root-Mean-Square Error (RMSE)** | **0.621** | $[0.554, 0.685]$ | Matches intra-laboratory biological assay variance |
| **Mean Absolute Error (MAE)** | **0.525** | $[0.458, 0.594]$ | Consistent prediction fidelity on unencountered cores |
| **Coefficient of Determination ($R^2$)** | **0.459** | $[0.257, 0.583]$ | Strong predictive signal under strict scaffold holdout |
| **Pearson Correlation ($r$)** | **0.744** | $p = 1.33 \times 10^{-17}$ | Robust linear tracking of continuous bioactivity |
| **Spearman Rank Correlation ($\rho$)** | **0.571** | $p = 2.35 \times 10^{-9}$ | Reliable monotonic candidate ranking |

### Crystallographic Co-Crystal Validation Gate (PDB `7KK4`)

| Parameter | Specification | Result | Gate Criterion | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Target Structure** | Human PARP1 Catalytic Domain | Chain A ($2.30\text{ \AA}$) | Resolution $\le 2.5\text{ \AA}$ | **PASSED** |
| **Reference Ligand** | Olaparib (`09L`, 32 heavy atoms) | Cleanly isolated | Authenticated | **PASSED** |
| **Centroid Coordinates** | $(-9.294, 6.130, 26.348)\text{ \AA}$ | Verified pocket | Center on ligand | **PASSED** |
| **Native Pose RMSD** | All 32 heavy atoms | **$1.419\text{ \AA}$** | $\le 2.0\text{ \AA}$ | **PASSED** |
| **Native Vina Affinity** | Exhaustiveness 16 | **$-11.06\text{ kcal/mol}$** | Baseline reference | **PASSED** |

---

## 4. Top Docked Leads & REINVENT 4 Optimization

### Top 10 Docked Candidates from 10k Virtual Screen

| Rank | Compound ID | ChemProp Pred $\text{pIC}_{50}$ | Vina Affinity | Ligand Efficiency | Gly863 H-Bond | Ser904 H-Bond | Tyr907 $\pi$-Stack |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | `PUBCHEM_1010644` | $10.11$ | **$-11.98\text{ kcal/mol}$** | $0.386$ | Yes | Yes | Yes |
| **2** | `PUBCHEM_134817183` | $9.51$ | **$-11.84\text{ kcal/mol}$** | $0.382$ | Yes | Yes | Yes |
| **3** | `PUBCHEM_71550931` | $9.44$ | **$-11.11\text{ kcal/mol}$** | $0.370$ | Yes | Yes | Yes |
| **4** | `PUBCHEM_71562418` | $9.30$ | **$-10.96\text{ kcal/mol}$** | $0.365$ | Yes | Yes | Yes |
| **5** | `PUBCHEM_162533924` | $9.16$ | **$-10.75\text{ kcal/mol}$** | $0.358$ | Yes | Yes | Yes |
| **6** | `PUBCHEM_71533696` | $9.13$ | **$-10.75\text{ kcal/mol}$** | $0.358$ | Yes | Yes | Yes |
| **7** | `PUBCHEM_1002472` | $9.96$ | **$-10.74\text{ kcal/mol}$** | $0.369$ | Yes | Yes | Yes |
| **8** | `PUBCHEM_1002266` | $10.13$ | **$-10.64\text{ kcal/mol}$** | $0.355$ | Yes | Yes | Yes |
| **9** | `PUBCHEM_76287717` | $9.10$ | **$-10.63\text{ kcal/mol}$** | $0.354$ | Yes | Yes | Yes |
| **10**| `PUBCHEM_1002392` | $10.22$ | **$-10.59\text{ kcal/mol}$** | $0.353$ | Yes | Yes | Yes |
| *Ref*| **Olaparib (PDB 7KK4)** | *8.60 (exp)* | **$-11.06\text{ kcal/mol}$** | $0.346$ | **Yes** | **Yes** | **Yes** |

### AstraZeneca REINVENT 4 Lead Optimization

| Parent Lead ID | Optimized Analog ID | Generative AI Strategy | Analog Vina | $\Delta\text{Affinity}$ | AqSolDB | hERG Risk |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT4` | Core $\pi$-stacking optimization against Tyr907 | **$-12.17\text{ kcal/mol}$** | **$-1.06\text{ kcal/mol}$** | $-4.85\text{ logS}$ | $0.23$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT2` | Ser904 hydroxyl H-bond reinforcement | **$-11.71\text{ kcal/mol}$** | **$-0.96\text{ kcal/mol}$** | $-4.62\text{ logS}$ | $0.21$ (Safe) |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT3` | Solubilizing piperazine tail extension | **$-11.91\text{ kcal/mol}$** | **$-0.80\text{ kcal/mol}$** | $-4.41\text{ logS}$ | $0.26$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT4` | Lipophilic sub-pocket filling | **$-11.53\text{ kcal/mol}$** | **$-0.78\text{ kcal/mol}$** | $-4.91\text{ logS}$ | $0.24$ (Safe) |
| `PUBCHEM_76287717` | `PUBCHEM_76287717_OPT2` | Ser904 H-bond reinforcement | **$-11.38\text{ kcal/mol}$** | **$-0.75\text{ kcal/mol}$** | $-4.70\text{ logS}$ | $0.22$ (Safe) |

---

## 5. Critical Epistemic Boundary

> **Scientific Integrity & Truth In-Silico:** All affinities, $\text{pIC}_{50}$ estimates, and interaction coordinates reported in this study represent **computational hypotheses**. In-silico docking scores and neural network predictions do not constitute biological proof or therapeutic discovery. Confirmatory *in-vitro* recombinant enzyme inhibition assays (fluorometric PARP1 activity assays) and clonogenic survival assays in *BRCA1/2*-deficient cancer cell models are required before any clinical or pharmacological efficacy can be claimed.

---

## 6. Project Structure

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

## 7. Interactive Research Web Application

The interactive web dashboard provides complete exploratory visualization across all project datasets:
- **Overview:** Epistemic boundary notice, KPI metrics, target biology (PARP1 / PDB 7KK4 / Olaparib).
- **Pipeline & QA:** Papyrus curation waterfall and Bemis–Murcko scaffold split diagnostics.
- **10k Screening:** Interactive search, dynamic $\text{pIC}_{50}$ / MW filtering, and distribution histograms.
- **Molecular Docking:** Redocking validation gate ($1.419\text{ \AA}$ RMSD), Top 50 results table, and catalytic pocket interaction viewer.
- **REINVENT 4 Lead Opt:** AstraZeneca Mol2Mol analog comparison dashboard ($\Delta\text{Affinity}$ shifts).
- **ADMET-AI Profiling:** 106 absorption, distribution, metabolism, and safety endpoints.
- **Manuscript Pre-print:** Full draft by investigator Ayush Lanjewar with BibTeX citation copy.

### Running Locally
```powershell
cd web
npm install
npm run dev
# Live at http://localhost:5173
```

---

## 8. Citation & Authorship

```bibtex
@article{lanjewar2026parp1,
  title={Retrospective In-Silico Prioritization and Generative Lead Optimization of Human PARP1 Inhibitors via Scaffold-Aware D-MPNN, Validated Molecular Docking, and REINVENT 4},
  author={Lanjewar, Ayush},
  journal={BioNova In-Silico Research Pre-print},
  year={2026},
  note={Bachelor of Pharmacy (B.Pharm) Candidate Investigation}
}
```
