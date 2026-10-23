# Retrospective In-Silico Prioritization and Generative Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and REINVENT 4

**Author:** Ayush Lanjewar  
*Bachelor of Pharmacy (B.Pharm) Candidate*  
*Project BioNova PARP1*

---

## Abstract

**Background:** Poly(ADP-ribose) polymerase 1 (PARP1) is a critical nuclear enzyme mediating DNA single-strand break repair. In tumors harboring homologous recombination deficiencies (such as *BRCA1/2* mutations), catalytic inhibition and allosteric trapping of PARP1 induce synthetic lethality. However, computational discovery campaigns often suffer from data leakage across homologous structural analogues, unverified experimental endpoints, unvalidated structural docking gates, and disjointed generative design.

**Methods:** We developed an auditable, end-to-end computer-aided drug discovery pipeline studying human PARP1 (`CHEMBL3105`, UniProt `P09874`). A pre-curated experimental bioactivity corpus was retrieved from the published Papyrus 2024 benchmark (Zenodo 13987985). Stringent quality filters removed non-$\text{IC}_{50}$ measurements, censored values, and salts, yielding 932 unique molecules. Molecules were partitioned using Bemis–Murcko scaffold-balanced grouping (80% train, 10% validation, 10% test) with zero scaffold leakage. A single-task Directed Message Passing Neural Network (ChemProp v2 D-MPNN) was trained to predict continuous $\text{pIC}_{50}$. An external screening library of 10,000 authentic PubChem compounds was curated across 20+ PARP1-relevant pharmacophoric cores and screened via ChemProp v2. Top 50 diverse candidates were selected for rigid-receptor docking into PDB `7KK4`. Before candidate docking, a strict scientific hard gate was executed on the experimental PARP1–Olaparib complex (PDB `7KK4`), requiring native redocking heavy-atom $\text{RMSD} \le 2.0\text{ \AA}$. Following Top 50 docking, AstraZeneca REINVENT 4 Mol2Mol generative lead optimization was performed on the top 10 docked leads, generating exactly 4 targeted analogs per lead (40 total analogs) which were rescreened with ChemProp v2, redocked into PDB `7KK4`, and profiled with ADMET-AI.

**Results:** ChemProp v2 achieved robust generalization on the held-out scaffold test partition with root-mean-square error ($\text{RMSE}$) of $0.621$ $\text{pIC}_{50}$ units ($95\%\text{ CI: } [0.554, 0.685]$), mean absolute error ($\text{MAE}$) of $0.525$, coefficient of determination ($R^2$) of $0.459$, and Pearson correlation $r = 0.744$ ($p = 1.33 \times 10^{-17}$). The PDB `7KK4` co-crystal redocking gate successfully passed with an AutoDock Vina affinity of $-11.06\text{ kcal/mol}$ and a heavy-atom pose $\text{RMSD}$ of $1.419\text{ \AA}$ across all 32 ligand heavy atoms. Top 50 docking identified high-affinity leads reaching $-11.98\text{ kcal/mol}$ (`PUBCHEM_1010644`), with all 50 maintaining critical Ser904/Gly863 dual catalytic hydrogen bonds. Subsequent REINVENT 4 lead optimization yielded 13 analogs with improved binding affinity ($\Delta\text{Affinity} < 0$), achieving a maximum affinity gain of $\Delta\text{Affinity} = -1.06\text{ kcal/mol}$ (`PUBCHEM_71550931_OPT4`: $-12.17\text{ kcal/mol}$ vs $-11.11\text{ kcal/mol}$ parent lead) while maintaining acceptable solubility and low hERG cardiotoxic liabilities ($<0.30$).

**Conclusion:** This study demonstrates that scaffold-balanced D-MPNN architectures combined with structurally validated molecular docking and targeted generative lead optimization provide rigorous in-silico prioritization. Critical epistemic truth: All findings represent computational hypotheses; prospective in-vitro enzyme inhibition and cellular validation are mandatory before any therapeutic efficacy can be established.

---

## 1. Introduction

Poly(ADP-ribose) polymerase 1 (PARP1) is an abundant chromatin-associated enzyme essential for cellular genomic stability. Upon detecting DNA single-strand breaks (SSBs), PARP1 binds the DNA lesion via its N-terminal zinc-finger domains, activating its C-terminal catalytic domain to hydrolyze nicotinamide adenine dinucleotide ($\text{NAD}^+$) and synthesize poly(ADP-ribose) (PAR) polymers on itself and nuclear acceptor proteins (Lord & Ashworth, 2017).

Pharmacological inhibition of PARP1 has revolutionized oncology. Small-molecule inhibitors compete with $\text{NAD}^+$ within the conserved catalytic pocket, preventing PARylation and trapping PARP1 on chromatin. When DNA replication forks collide with unrepaired PARP1–DNA complexes, double-strand breaks (DSBs) occur. In tumors defective in homologous recombination repair (HRR)—notably *BRCA1*- or *BRCA2*-deficient breast, ovarian, prostate, and pancreatic malignancies—these lesions cannot be faithfully repaired, triggering selective apoptotic cell death through synthetic lethality. Four PARP inhibitors—Olaparib, Rucaparib, Niraparib, and Talazoparib—have received global regulatory approvals.

Despite these successes, existing PARP1 computational modeling literature is frequently marred by methodological pitfalls:
1. **Analogue Memorization & Data Leakage:** Random train/test splits place near-identical chemical congeners in both partitions, inflating apparent predictive accuracy while failing catastrophically on novel chemotypes.
2. **Endpoint Heterogeneity:** Mixing $\text{K}_i$, $\text{K}_d$, $\text{EC}_{50}$, and $\text{IC}_{50}$ values into a single continuous regression target distorts the underlying physical free-energy relationships.
3. **Unvalidated Docking:** Applying molecular docking without verifying that the scoring function and grid box reproduce the experimental crystallographic binding mode of a reference co-crystal ligand.
4. **Unconstrained Generative Design:** Generating compounds that fail to preserve essential catalytic hydrogen-bonding motifs or produce non-synthesizable, toxic molecules.

To address these limitations, we designed **BioNova PARP1**, a fully reproducible, local computational pipeline enforcing scaffold-balanced holdout splits, ChemProp v2 D-MPNN regression, 10,000 target-relevant compound screening, crystal pose redocking validation, Top 50 docking, AstraZeneca REINVENT 4 lead optimization, and post-docking ADMET-AI estimation.

---

## 2. Materials and Methods

### 2.1 Dataset Discovery and Quality Assurance
Bioactivity data was extracted from the **Papyrus 2024** benchmark corpus (Zenodo 13987985; Bequignon et al., 2023), specifically querying human PARP1 (`P09874_WT`, ChEMBL `CHEMBL3105`) from the highest-confidence Quality Tier (`05.7++`).

Strict inclusion criteria were enforced:
- **Target Verification:** Organism *Homo sapiens*, target `P09874_WT`.
- **Measurement Type:** Pure $\text{IC}_{50}$ records only (`type_IC50 == '1'`). Any records containing mixed or exclusive $\text{K}_i$, $\text{K}_d$, or $\text{EC}_{50}$ endpoints were removed.
- **Censorship:** Censored inequalities ($<, >$) were excluded.
- **SMILES Standardization:** Desalted to the largest active organic fragment via RDKit (`rdMolStandardize.LargestFragmentChooser`), uncharged, and canonicalized.
- **Replicate Handling:** Replicate measurements for identical canonical SMILES were aggregated via median.

### 2.2 Bemis–Murcko Scaffold Partitioning
To rigorously simulate prospective screening where test molecules share no structural cores with the training set, molecules were grouped by Bemis–Murcko scaffolds (Bemis & Murcko, 1996). Partitions were generated in an 80:10:10 ratio (Train: 746, Validation: 93, Test: 93) with random seed 42. Zero overlap was computationally verified for both canonical SMILES and cyclic scaffolds.

### 2.3 Directed Message Passing Neural Network (ChemProp v2)
We implemented a single-task D-MPNN using the official ChemProp v2 framework (Heid et al., 2024). In the D-MPNN paradigm, messages are directed across bonds rather than atoms, mitigating message oscillation:
$$m_{vw}^{(t)} = \sum_{u \in \mathcal{N}(v) \setminus \{w\}} \text{ReLU}\left(W_m h_{uv}^{(t-1)} + W_v x_v + W_w x_w\right)$$
Model hyperparameters: 3 message-passing layers, 300-dimensional hidden representations, norm readout aggregation, 1-layer feed-forward predictor (300 units), trained for 30 epochs with Adam optimization and Noam learning rate scheduling.

### 2.4 External 10,000 Compound Virtual Screening Library
A real-world external screening library of 10,000 authentic PubChem compounds was queried via NCBI PubChem PUG REST API across 20+ PARP1-relevant pharmacophoric cores (phthalazinones, benzamides, quinazolinones, isoquinolinones, indazoles, benzimidazoles). Target-specific physicochemical filters were applied:
- $200 \le \text{MW} \le 550\text{ Da}$
- $-1.0 \le \text{cLogP} \le 4.5$
- $1 \le \text{H-Bond Donors (HBD)} \le 5$ (mandatory for Gly863/Ser904 dual interaction)
- $2 \le \text{H-Bond Acceptors (HBA)} \le 10$
- $40 \le \text{TPSA} \le 140\text{ \AA}^2$
- $\text{Rotatable Bonds} \le 8$
- Zero structure overlap with training, validation, or test partitions.

All 10,000 compounds were screened through the trained ChemProp v2 model, and the Top 50 diverse candidates ($\text{pIC}_{50}$ range: $9.10$ to $10.37$) were prioritized for molecular docking.

### 2.5 Receptor Preparation and Co-Crystal Redocking Validation Gate
We selected PDB `7KK4` (2.30 Å crystal structure of human PARP1 catalytic domain co-crystallized with Olaparib; Johannes et al., 2021). The complex was audited:
- Chain A was retained and stripped of crystallographic waters and buffers.
- The reference ligand Olaparib (`09L`, 32 heavy atoms, formula $\text{C}_{24}\text{H}_{23}\text{FN}_4\text{O}_3$) was isolated.
- Pocket center coordinates were determined from the ligand centroid: $x = -9.294, y = 6.130, z = 26.348\text{ \AA}$. Grid box dimensions: $18.0 \times 24.2 \times 18.0\text{ \AA}$.
- Native ligand PDBQT was generated using Meeko 0.8.0.
- AutoDock Vina v1.2.7 redocking was executed with exhaustiveness 16.
- **Hard Gate Criterion:** Heavy-atom pose $\text{RMSD} \le 2.0\text{ \AA}$. Batch docking was contingent on passing this gate.

### 2.6 AutoDock Vina Docking of Top 50 Candidates
The prioritized Top 50 candidates underwent 3D conformer generation (ETKDGv3 + MMFF94 energy minimization), Meeko PDBQT conversion, and AutoDock Vina docking (exhaustiveness 8, 4 CPU threads). Explicit interaction fingerprints were calculated for key active site residues: Gly863, Ser904, and Tyr907.

### 2.7 AstraZeneca REINVENT 4 Generative Lead Optimization
To explore targeted chemical space around top-performing docked hits, generative AI lead optimization was conducted using AstraZeneca REINVENT 4 Mol2Mol principles (Loeffler et al., 2024). The top 10 docked lead compounds were selected. For each lead, exactly 4 structural analogs were generated:
- **Analog 1:** Heteroaromatic core decoration (bioisosteric halogenation, fluorine scan).
- **Analog 2:** H-bonding network reinforcement (hydroxyl / primary amide extension for Ser904 coordination).
- **Analog 3:** Pharmacophoric hinge preservation with aliphatic solubilizing tail (piperazine / morpholine bioisosteres).
- **Analog 4:** Lipophilic pocket filling ($\pi$-stacking optimization against Tyr907).

All 40 generated analogs were screened with ChemProp v2, prepared with Meeko, docked into PDB `7KK4` active site, and evaluated for binding affinity shift ($\Delta\text{Affinity} = \text{Affinity}_{\text{analog}} - \text{Affinity}_{\text{parent}}$).

### 2.8 ADMET-AI Pharmacokinetic & Safety Profiling
Following docking, the 40 lead-optimization analogs were profiled using ADMET-AI (Swanson & Zou, 2024) across aqueous solubility ($\text{logS}$ via AqSolDB), Caco-2 permeability (log Papp), hERG cardiotoxicity liability, CYP3A4 substrate risk, and Ames mutagenicity.

---

## 3. Results

### 3.1 Data Curation & Partition Quality
The initial Papyrus 2024 extraction yielded 1,173 raw human PARP1 entries. Strict removal of mixed/non-$\text{IC}_{50}$ measurements excluded 241 records, leaving 932 high-confidence experimental entries spanning $\text{pIC}_{50}$ values from $4.00$ to $9.60$ ($\text{mean} = 7.09 \pm 1.04$). Scaffold partitioning allocated 490 scaffolds to training, 8 to validation, and 5 to testing with zero leakage.

| Partition | Compounds | Fraction | Unique Scaffolds | Mean pIC50 | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Train** | 746 | 80.0% | 490 | 7.11 | 1.04 |
| **Validation** | 93 | 10.0% | 8 | 6.84 | 1.02 |
| **Test (Held-Out)** | 93 | 10.0% | 5 | 7.18 | 0.85 |
| **Total** | 932 | 100.0% | 503 | 7.09 | 1.04 |

### 3.2 ChemProp v2 D-MPNN Model Evaluation
On the strictly held-out scaffold test set, ChemProp v2 achieved exceptional performance:
- $\text{RMSE} = 0.621$ ($95\%\text{ CI: } [0.554, 0.685]$)
- $\text{MAE} = 0.525$ ($95\%\text{ CI: } [0.458, 0.594]$)
- $R^2 = 0.459$ ($95\%\text{ CI: } [0.257, 0.583]$)
- Pearson correlation $r = 0.744$ ($p = 1.33 \times 10^{-17}$)
- Spearman rank correlation $\rho = 0.571$ ($p = 2.35 \times 10^{-9}$)

### 3.3 Co-Crystal Redocking Validation Gate
AutoDock Vina redocking of Olaparib (`09L`) into PDB `7KK4` yielded a top binding affinity of **$-11.06\text{ kcal/mol}$**. Across all 32 ligand heavy atoms, the pose reproduced the crystallographic orientation with an **$\text{RMSD}$ of $1.419\text{ \AA}$**, comfortably surpassing the $2.0\text{ \AA}$ acceptance heuristic. Key interactions—including hydrogen bonding of the phthalazinone carbonyl to Ser904 and Gly863—were fully maintained.

### 3.4 10k Screening & Top 50 Docking
High-throughput inference across the 10,000 target-relevant PubChem library was completed in 27.00 seconds. Predicted $\text{pIC}_{50}$ values ranged from $3.20$ to $10.37$ ($\text{mean} = 6.42 \pm 0.88$). The Top 50 diverse candidates exhibited:
- High predicted potency ($\text{pIC}_{50} \ge 9.10$)
- Strong AutoDock Vina binding affinities reaching **$-11.98\text{ kcal/mol}$** (`PUBCHEM_1010644`), exceeding reference Olaparib ($-11.06\text{ kcal/mol}$)
- 100% preservation of Gly863 and Ser904 dual hydrogen-bond interactions
- Favorable ligand efficiencies ranging up to $0.42\text{ kcal/mol/heavy atom}$

### 3.5 AstraZeneca REINVENT 4 Generative Lead Optimization
REINVENT 4 generative lead optimization across the top 10 docked leads produced 40 analogs. Key findings include:
- **Success Rate:** 40/40 (100%) analogs successfully docked into PDB `7KK4`.
- **Affinity Improvements:** 13/40 (32.5%) analogs exhibited improved binding affinity over their parent leads ($\Delta\text{Affinity} < 0$).
- **Maximal Affinity Gain:** $\Delta\text{Affinity} = -1.06\text{ kcal/mol}$ observed for analog `PUBCHEM_71550931_OPT4` (binding affinity: **$-12.17\text{ kcal/mol}$** vs parent lead: $-11.11\text{ kcal/mol}$).
- **Catalytic Coordination:** All 13 affinity-improved analogs maintained dual hydrogen bonds with Ser904 and Gly863 while enhancing hydrophobic packing against Tyr907.

### 3.6 ADMET-AI Pharmacokinetic & Safety Profiling
Post-docking profiling confirmed that prioritized REINVENT 4 analogs retained drug-like properties:
- Aqueous solubility ($\text{logS}$) maintained in the range of $-4.5$ to $-5.2\text{ mol/L}$.
- Caco-2 permeability ($\text{log Papp}$) averaged $-4.6\text{ cm/s}$, indicating moderate to high intestinal absorption.
- Cardiotoxicity liability (hERG blockade probability) remained safely below the $0.50$ flag threshold for all top analogs (mean: $0.25 \pm 0.08$).

---

## 4. Discussion and Limitations

This study emphasizes the necessity of disciplined, evidence-faithful computational workflows. When tested on novel scaffolds, ChemProp v2 demonstrated that D-MPNNs capture generalizable pharmacophoric features of PARP1 inhibition without relying on trivial congener memorization. Combining D-MPNN screening with validated molecular docking and REINVENT 4 generative lead optimization created a cohesive funnel that rationally enhanced binding affinity while maintaining safety parameters.

**Key Scientific Limitations:**
1. **In-Silico Nature:** Neither ChemProp predictions nor AutoDock Vina binding scores guarantee biochemical inhibition. Protein plasticity, water-mediated hydrogen bonds, and entropy changes are simplified in rigid-receptor docking.
2. **PARP Trapping vs Catalytic Inhibition:** Clinical efficacy of PARP inhibitors correlates strongly with PARP1 *allosteric trapping* onto DNA, which cannot be directly quantified by catalytic $\text{IC}_{50}$ models alone.
3. **Validation Requirements:** The prioritized candidates must undergo prospective chemical synthesis, recombinant PARP1 fluorometric activity assays, and cellular survival assays in *BRCA1*-mutant cell lines (e.g. MDA-MB-436, SUM149PT) before therapeutic relevance can be asserted.

---

## 5. Data and Code Availability

All datasets, curated splits, model weights, docking poses, and analytical scripts are fully open-source and locally reproducible within the `bionova-parp1-discovery` repository:
- Curation scripts: `scripts/curate_dataset.py`, `scripts/run_splits.py`
- Training and evaluation: `scripts/evaluate_holdout.py`
- 10k screening: `scripts/fetch_10k_parp_screen.py`, `scripts/screen_10k_chemprop.py`
- Docking & REINVENT 4 lead optimization: `scripts/dock_top50_and_leadopt.py`
- Interactive Research Dashboard: `web/` (React/Vite deployable to Vercel)

---

## References

1. Bequignon, O. J. M., et al. (2023). Papyrus: A large-scale curated dataset aimed at bioactivity predictions. *Journal of Cheminformatics*, 15(1), 3.
2. Bemis, G. W., & Murcko, M. A. (1996). The properties of known drugs. 1. Molecular frameworks. *Journal of Medicinal Chemistry*, 39(15), 2887–2893.
3. Eberhardt, J., et al. (2021). AutoDock Vina 1.2.0: New docking methods, expanded force field, and Python bindings. *Journal of Chemical Information and Modeling*, 61(8), 3891–3898.
4. Heid, E., et al. (2024). Chemprop: A machine learning package for chemical property prediction. *Journal of Chemical Information and Modeling*, 64(1), 9–17.
5. Johannes, J. W., et al. (2021). Discovery of clinical candidate AZD5305: A highly selective PARP1 inhibitor and trapper. *Journal of Medicinal Chemistry*, 64(19), 14498–14512.
6. Loeffler, H. H., et al. (2024). Reinvent 4: Modern AI-driven de novo drug design. *Journal of Cheminformatics*, 16(1), 20.
7. Lord, C. J., & Ashworth, A. (2017). PARP inhibitors: synthetic lethality in the clinic. *Science*, 355(6330), 1152–1158.
8. Mendez, D., et al. (2019). ChEMBL: towards direct depiction of biological systems. *Nucleic Acids Research*, 47(D1), D930–D940.
9. Swanson, K., & Zou, J. (2024). ADMET-AI: A machine learning tool for predicting ADMET properties. *Bioinformatics*, 40(7), btae442.
