# BioNova PARP1

<div align="center">

[![Vercel Deploy](https://img.shields.io/badge/Vercel-Deploy_Live-black?logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fayushlanjewar0001-web%2Fbionova-parp1-discovery)
[![Target](https://img.shields.io/badge/Target-PARP1_(P09874)-0d9488?logo=dna&logoColor=white)](https://www.uniprot.org/uniprotkb/P09874)
[![PDB Complex](https://img.shields.io/badge/PDB-7KK4_(2.30%C3%85)-10b981)](https://www.rcsb.org/structure/7KK4)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-ee4c2c?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![ChemProp](https://img.shields.io/badge/ChemProp-v2.0-7c3aed)](https://chemprop.readthedocs.io/)
[![RDKit](https://img.shields.io/badge/RDKit-2023.09-0284c7)](https://www.rdkit.org/)
[![AutoDock Vina](https://img.shields.io/badge/Vina-1.2.7-0369a1)](https://vina.scripps.edu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray.svg)](LICENSE)

**Retrospective In-Silico Prioritization & RDKit-Based Lead Optimization of Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and ADMET-AI Profiling**

*A rigorous, zero-leakage computational drug discovery campaign for targeted synthetic lethality in BRCA-deficient oncology.*

**Principal Investigator:** **Ayush Lanjewar** *(Bachelor of Pharmacy Candidate)*  
**Institution / Focus:** Computational Medicinal Chemistry & In-Silico Drug Discovery  
**GitHub Repository:** [ayushlanjewar0001-web/bionova-parp1-discovery](https://github.com/ayushlanjewar0001-web/bionova-parp1-discovery)  
**Live Research Platform:** [https://bionova-parp1-discovery.vercel.app](https://bionova-parp1-discovery.vercel.app) *(Deploy with 1-click via the Vercel button above)*

</div>

---

## 📖 Table of Contents
1. [What is BioNova PARP1? (In Simple Terms)](#1-what-is-bionova-parp1-in-simple-terms)
2. [🌐 Live Interactive Research Platform](#2--live-interactive-research-platform)
3. [🚀 How to Deploy on Vercel](#3--how-to-deploy-on-vercel)
4. [7-Stage Computational Workflow](#4-7-stage-computational-workflow)
5. [Key Scientific Findings & Benchmark Metrics](#5-key-scientific-findings--benchmark-metrics)
6. [Top Docked Leads & RDKit-Based Lead Optimization](#6-top-docked-leads--rdkit-based-lead-optimization)
7. [Scientific Integrity & Epistemic Preclinical Boundary](#7-scientific-integrity--epistemic-preclinical-boundary)
8. [Repository Architecture](#8-repository-architecture)
9. [Local Quickstart & Reproduction](#9-local-quickstart--reproduction)
10. [Citation & Authorship](#10-citation--authorship)

---

## 1. What is BioNova PARP1? (In Simple Terms)

### The Biological Problem
Cancer cells harboring mutations in the **BRCA1** or **BRCA2** genes (frequently found in hereditary breast, ovarian, prostate, and pancreatic cancers) have lost their primary DNA repair engine known as *homologous recombination*. To survive, these tumors become desperately dependent on a backup DNA repair enzyme called **PARP1 (Poly(ADP-ribose) Polymerase 1)**.

When a small-molecule drug locks into the catalytic pocket of PARP1, it **traps** the enzyme onto damaged DNA. While normal healthy cells can bypass this block using functional BRCA genes, BRCA-deficient tumor cells experience catastrophic replication fork collapse and selectively die. This therapeutic phenomenon is termed **synthetic lethality**.

### What This Project Achieved
Instead of relying on unverified claims or simulated shortcuts, **BioNova PARP1** established an auditable, end-to-end computer-aided discovery funnel:
- 🧪 **Cleaned 932 Real Laboratory Molecules:** Extracted high-confidence experimental PARP1 $\text{IC}_{50}$ data from the Papyrus 2024 benchmark, filtering out all ambiguous non-$\text{IC}_{50}$ values.
- 🧱 **Prevented Artificial Memorization:** Partitioned molecules based on strict **Bemis–Murcko molecular scaffolds** so the AI was evaluated exclusively on completely unseen chemical families (zero data leakage).
- 🧠 **Trained a Deep Molecular Graph AI (ChemProp D-MPNN):** Learned how molecular bonds and atoms dictate potency, achieving strong prospective generalization ($\text{RMSE} = 0.621$, Pearson $r = 0.744$).
- 🔍 **Screened 10,000 Real PubChem Compounds:** Screened 10k target-relevant drug candidates in 27 seconds, picking the Top 50 diverse leads for physical 3D docking.
- 🎯 **Enforced a Strict Crystallographic Docking Gate:** Validated our docking simulation against the FDA-approved reference drug **Olaparib** in PDB `7KK4`, reproducing its exact experimental 3D shape with an ultra-accurate **$1.419\text{ \AA}$ RMSD** (passing the $\le 2.0\text{ \AA}$ scientific requirement).
- 🧬 **RDKit Rule-Based Lead Optimization:** Executed deterministic medicinal chemistry transformations across the top leads (bioisosteric shifts, strategic fluorination, conformational rigidification), identifying an optimized analogue (`PUBCHEM_71550931_OPT4`) with a superior binding affinity of **$-12.17\text{ kcal/mol}$** ($\Delta\text{Affinity} = -1.06\text{ kcal/mol}$ gain).
- 🛡️ **Comprehensive Preclinical Safety Profiling (ADMET-AI):** Evaluated 106 absorption, distribution, metabolism, and safety endpoints, confirming excellent oral solubility and low cardiotoxic liability ($\text{hERG} < 0.30$).

---

## 2. 🌐 Live Interactive Research Platform

[![Deploy with Vercel](https://img.shields.io/badge/Deploy_with-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fayushlanjewar0001-web%2Fbionova-parp1-discovery)

The interactive research platform is designed for researchers, biotech recruiters, investors, and pharmacy students. It features a clean, high-contrast **Biotech Light Theme** (with an instant Dark Mode toggle) and delivers full exploratory transparency across the entire investigation:

- **Live Production URL:** [https://bionova-parp1-discovery.vercel.app](https://bionova-parp1-discovery.vercel.app) *(Once deployed via Vercel)*
- **Instant 1-Click Deployment:** Click the **Deploy with Vercel** button above to connect your GitHub repository and go live in ~30 seconds.
- **Local Interactive App:** Run `cd web; npm install; npm run dev` to launch locally at `http://localhost:5173`.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  BioNova PARP1 — Interactive Research Platform Overview                                          │
├────────────────────────────────┬─────────────────────────────────────────────────────────────────┤
│ Tab                            │ Key Capability & Non-Technical Insight                          │
├────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 1. 🔬 Research Overview        │ Executive summary, key KPIs, 7-step visual workflow flow,       │
│                                │ target biology, and interactive 3D WebGL protein-ligand viewer. │
│ 2. 🗄️ Dataset & Preparation    │ Papyrus curation waterfall (-241 exclusions) and zero-leakage   │
│                                │ Bemis-Murcko scaffold train/val/test diagnostics.              │
│ 3. 🧠 Predictive AI (ChemProp) │ Directed Message-Passing Neural Network architecture, test      │
│                                │ metrics (RMSE 0.621, r = 0.744), and error distribution.        │
│ 4. 🔍 10K Virtual Screen       │ 10,000 PubChem screening explorer with dynamic pIC50, MW, TPSA  │
│                                │ sliders, and real-time candidate inspector.                     │
│ 5. ⚓ Molecular Docking         │ Olaparib redocking validation gate (RMSD 1.419 Å) and Top 50    │
│                                │ docking results with Gly863/Ser904 dual catalytic checks.       │
│ 6. 🛠️ RDKit Lead Optimization  │ Rule-based transformations (fluorine scan, bioisostere, tail,   │
│                                │ rigidification) with 4-analogue side-by-side comparison.        │
│ 7. 🛡️ ADMET-AI Profiling       │ 106 pharmacokinetic endpoints filtered by Absorption,           │
│                                │ Distribution, Metabolism, Toxicity, and Preclinical comparison. │
│ 8. 📄 Research Manuscript      │ Full 15-section academic pre-print manuscript with formatted    │
│                                │ article reader, table rendering, and BibTeX citation export.    │
│ 9. ⚖️ Scientific Integrity     │ Data provenance accessions, locked software toolchain, and the  │
│                                │ mandatory 5-step wet-lab experimental validation roadmap.       │
└────────────────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 3. 🚀 How to Deploy on Vercel

The application is pre-configured with root and web-level `vercel.json` manifests for immediate, zero-configuration deployment to Vercel.

### Option A: Automatic Git Deployment (Recommended)

1. **Push your code to GitHub:**
   ```powershell
   git checkout main
   git push origin main
   ```
2. **Import into Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account (`ayushlanjewar0001-web`).
   - Click **"Add New..."** → **"Project"**.
   - Select `bionova-parp1-discovery` from the repository list.
   - Vercel automatically detects the Vite framework and builds using:
     - **Build Command:** `cd web && npm install && npm run build`
     - **Output Directory:** `web/dist`
   - Click **"Deploy"**.
3. **Your App is Live:**
   Vercel assigns a permanent production URL (e.g., `https://bionova-parp1-discovery.vercel.app`). Any future `git push` to `main` automatically rebuilds and deploys the latest version!

### Option B: Deploy via Vercel CLI (1-Minute Command)

If you prefer deploying directly from your computer terminal:
```powershell
cd web
npx vercel
```
- Sign in with GitHub when prompted in the browser.
- Accept the default project settings.
- Run `npx vercel --prod` to push directly to production.

---

## 4. 7-Stage Computational Workflow

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

[Phase 7: RDKit-Based Lead Optimization]
   └── Top 10 docked leads × 4 RDKit rule-based targeted analogues = 40 total analogues
   └── Analogues rescreened with ChemProp v2 and redocked into PDB 7KK4
   └── 13 analogues improved affinity (ΔAffinity < 0); max gain: -1.06 kcal/mol (-12.17 kcal/mol)
```

---

## 5. Key Scientific Findings & Benchmark Metrics

### Model Performance on Held-Out Scaffolds
Standard random splits allow neural networks to memorize common chemical scaffolds, creating artificially high $R^2$ scores that collapse when confronted with novel chemotypes. BioNova enforces strict Bemis-Murcko scaffold separation:

| Evaluation Metric | Test Partition Value | 95% Confidence Interval | Methodological Interpretation |
| :--- | :---: | :---: | :--- |
| **Root-Mean-Square Error (RMSE)** | **0.621** | $[0.554, 0.685]$ | Comparable to experimental inter-laboratory bioassay noise |
| **Mean Absolute Error (MAE)** | **0.525** | $[0.458, 0.594]$ | Consistent prediction fidelity on unencountered cores |
| **Coefficient of Determination ($R^2$)** | **0.459** | $[0.257, 0.583]$ | Strong prospective predictive signal under strict holdout |
| **Pearson Correlation ($r$)** | **0.744** | $p = 1.33 \times 10^{-17}$ | Robust linear tracking of continuous binding potency |
| **Spearman Rank Correlation ($\rho$)** | **0.571** | $p = 2.35 \times 10^{-9}$ | Reliable rank-ordering of high-potency candidates |

### Crystallographic Co-Crystal Validation Gate (PDB `7KK4`)
Before docking screening candidates, the docking grid was calibrated by redocking the co-crystallized reference drug Olaparib into the native receptor:

| Parameter | Specification | Result | Scientific Gate Criterion | Gate Status |
| :--- | :--- | :--- | :--- | :---: |
| **Target Structure** | Human PARP1 Catalytic Domain | Chain A ($2.30\text{ \AA}$) | Resolution $\le 2.5\text{ \AA}$ | **PASSED** |
| **Reference Ligand** | Olaparib (`09L`, 32 heavy atoms) | Cleanly isolated | Co-crystallized coordinates | **PASSED** |
| **Pocket Centroid** | $(-9.294, 6.130, 26.348)\text{ \AA}$ | Catalytic Cleft | Centered on native ligand | **PASSED** |
| **All-Heavy-Atom RMSD** | Coordinate perturbation test | **$1.419\text{ \AA}$** | $\le 2.0\text{ \AA}$ (Hard Gate) | **PASSED** |
| **Native Vina Affinity** | Exhaustiveness 16 | **$-11.06\text{ kcal/mol}$** | Benchmark reference | **PASSED** |

---

## 6. Top Docked Leads & RDKit-Based Lead Optimization

### Top 10 Docked Screening Hits

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

### RDKit-Based Lead Optimization (Deterministic Transformations)

Instead of unverified neural generative AI claims, lead optimization was executed using **RDKit-based rule-based medicinal chemistry transformations**. For each top parent lead, exactly four chemically valid analogues were constructed:
1. **Bioisostere:** Pyridine/heteroaryl replacement for polarity and aqueous solubility modulation.
2. **Fluorine Scan:** Strategic aryl monofluorination for oxidative metabolic shielding and dipole optimization.
3. **Tail Modulation:** Basic amine / pendant modification for hERG cardiac de-risking and cellular permeability.
4. **Conformational Rigidification:** Cyclopropyl / gem-dimethyl insertion to restrict rotatable bonds and lower entropic penalty.

| Parent Lead ID | Optimized Analogue ID | Optimization Transformation | Analogue Vina | $\Delta\text{Affinity}$ | AqSolDB | hERG Risk |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT4` | Conformational rigidification against Tyr907 | **$-12.17\text{ kcal/mol}$** | **$-1.06\text{ kcal/mol}$** | $-4.85\text{ logS}$ | $0.23$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT2` | Aryl fluorination (metabolic shielding) | **$-11.71\text{ kcal/mol}$** | **$-0.96\text{ kcal/mol}$** | $-4.62\text{ logS}$ | $0.21$ (Safe) |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT3` | Tail modulation (hERG de-risking) | **$-11.91\text{ kcal/mol}$** | **$-0.80\text{ kcal/mol}$** | $-4.41\text{ logS}$ | $0.26$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT4` | Conformational rigidification | **$-11.53\text{ kcal/mol}$** | **$-0.78\text{ kcal/mol}$** | $-4.91\text{ logS}$ | $0.24$ (Safe) |
| `PUBCHEM_76287717` | `PUBCHEM_76287717_OPT2` | Aryl fluorination (dipole alignment) | **$-11.38\text{ kcal/mol}$** | **$-0.75\text{ kcal/mol}$** | $-4.70\text{ logS}$ | $0.22$ (Safe) |

---

## 7. Scientific Integrity & Epistemic Preclinical Boundary

> ⚠️ **The Scientific Truth In-Silico:** No matter how sophisticated a deep neural network or how favorable a docking free energy score, **computational models produce hypotheses, not approved medicines**. Negative docking scores and predicted $\text{pIC}_{50}$ values do not prove chromatin trapping or cellular tumor death. 
> 
> To transition top computational leads (`PUBCHEM_71550931_OPT4` and `PUBCHEM_1010644`) from in-silico candidates to verified chemical probes, the following **5 prospective wet-lab assays** must be performed:
> 1. **Fluorometric Recombinant PARP1 Inhibition Assay:** Empirical determination of biochemical $\text{IC}_{50}$.
> 2. **Chromatin Trapping Assay:** Verification of PARP1–DNA physical complex retention.
> 3. **Clonogenic Survival in BRCA-Deficient Cells:** Proof of selective killing in *BRCA1/2* knockout cells vs. wild-type.
> 4. **Microsomal Liver Clearance (HLM):** Metabolic half-life and CYP450 phenotyping.
> 5. **Patch-Clamp hERG Electrophysiology:** Physical verification of cardiac safety.

---

## 8. Repository Architecture

```
bionova-parp1-discovery/
├── data/
│   ├── raw/
│   │   ├── papyrus_parp1_raw.tsv         # Curated Papyrus 2024 Tier ++ dataset
│   │   └── pubchem_10k_parp_screen.csv   # 10,000 target-relevant screening molecules
│   └── processed/
│       ├── curated_parp1_ic50.csv        # 932 standardized IC50 molecules
│       └── scaffold_splits/              # Bemis-Murcko 80/10/10 split files (0% leakage)
├── models/
│   └── chemprop_parp1/                   # Trained single-task D-MPNN model weights
├── results/
│   ├── screened_10k_compounds.parquet    # 10k screening predictions catalog
│   ├── top50_for_docking.csv             # Prioritized diverse Top 50 candidates
│   ├── docking_top50_results.csv         # PDB 7KK4 docking scores & interaction flags
│   ├── rdkit_lead_optimization.csv       # 40 RDKit analogues with Vina & ADMET scores
│   └── lead_optimization_summary.json    # Summary metrics of lead optimization
├── scripts/
│   ├── curate_dataset.py                 # Automated Papyrus bioactivity curation
│   ├── run_splits.py                     # Zero-leakage Bemis-Murcko partitioner
│   ├── screen_10k_chemprop.py            # High-throughput ChemProp screening
│   ├── dock_top50_and_leadopt.py         # Vina docking & RDKit lead optimization
│   └── build_web_data.py                 # Compiles results into web JSON bundle
├── src/bionova_parp1/
│   ├── rdkit_leadopt.py                  # RDKit rule-based lead optimization module
│   └── reinvent_leadopt.py               # Backward compatibility wrapper
├── tests/                                # 14 automated pytest scientific contracts
├── paper/
│   └── manuscript.md                     # Complete academic pre-print manuscript
├── web/                                  # React 19 + Vite + Tailwind web application
│   ├── src/components/                   # 9 structured research views
│   └── vercel.json                       # Subdirectory Vercel deployment config
├── vercel.json                           # Root Vercel deployment router
└── README.md                             # Project documentation
```

---

## 9. Local Quickstart & Reproduction

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Git

### 1. Clone Repository & Setup Virtual Environment
```powershell
git clone https://github.com/ayushlanjewar0001-web/bionova-parp1-discovery.git
cd bionova-parp1-discovery

# Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Run Automated Scientific Contracts
Verify that all 14 unit and integration tests pass:
```powershell
pytest tests/ -v
# Output: 14 passed in 1.17s
```

### 3. Launch the Interactive Web Platform Locally
```powershell
cd web
npm install
npm run dev
# Open in browser: http://localhost:5173
```

---

## 10. Citation & Authorship

If you find this computational methodology, scaffold partitioning, or screening library useful in your academic or pharmacological research, please cite:

```bibtex
@article{lanjewar2026parp1,
  title={Retrospective In-Silico Prioritization and RDKit-Based Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and ADMET-AI Profiling},
  author={Lanjewar, Ayush},
  journal={BioNova In-Silico Oncology Pre-Print},
  year={2026},
  note={Bachelor of Pharmacy (B.Pharm) Candidate Investigation},
  url={https://github.com/ayushlanjewar0001-web/bionova-parp1-discovery}
}
```

---

<div align="center">
  <sub>Developed with scientific integrity by <strong>Ayush Lanjewar</strong> • BioNova PARP1 Discovery Campaign</sub>
</div>
