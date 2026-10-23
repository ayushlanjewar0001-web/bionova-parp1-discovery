# Retrospective In-Silico Prioritization and RDKit-Based Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and ADMET-AI Profiling

**Author:** Ayush Lanjewar  
*Bachelor of Pharmacy (B.Pharm) Candidate*  
*Project BioNova PARP1*

---

## Abstract

**Background:** Poly(ADP-ribose) polymerase 1 (PARP1) is a critical nuclear zinc-finger enzyme responsible for orchestrating DNA single-strand break (SSB) repair. In tumors harboring homologous recombination deficiencies (HRD)—such as germline or somatic *BRCA1/2* mutations—pharmacological catalytic inhibition and chromatin trapping of PARP1 trigger selective synthetic lethality. However, contemporary computational drug discovery campaigns frequently suffer from methodological vulnerabilities: data leakage through shared Bemis–Murcko scaffold memorization across train and test partitions, confounding multiple non-equivalent biological endpoints ($K_i, K_d, \text{EC}_{50}, \text{IC}_{50}$), omitting crystallographic co-crystal redocking validation gates, and making unverified claims of generative neural AI when rule-based heuristic transformations were executed.

**Methods:** We developed an auditable, end-to-end computer-aided drug discovery pipeline focused on human PARP1 (`CHEMBL3105`, UniProt `P09874`). A verified bioactivity corpus was extracted from the Papyrus 2024 benchmark (Zenodo 13987985; Quality Tier `05.7++`). Stringent curation removed non-$\text{IC}_{50}$ measurements, censored values, and salts, yielding 932 unique molecules with experimental $\text{pIC}_{50}$ spanning $4.00$ to $9.60$. Compounds were partitioned using Bemis–Murcko scaffold grouping (80% train, 10% validation, 10% test) ensuring zero structural core leakage. A single-task Directed Message-Passing Neural Network (ChemProp v2 D-MPNN) was trained to predict continuous $\text{pIC}_{50}$ affinity. An external library of 10,000 authentic PubChem compounds was curated across 20+ PARP1-relevant pharmacophoric cores and screened via ChemProp v2. Top 50 diverse candidates ($\text{pIC}_{50} \ge 9.10$) were selected for molecular docking. Prior to screening docking, a strict crystallographic redocking gate was enforced using the high-resolution PARP1–Olaparib complex (PDB `7KK4`, $2.30\text{ \AA}$), requiring a heavy-atom pose $\text{RMSD} \le 2.0\text{ \AA}$. Following Top 50 docking, RDKit-based rule-based lead optimization was executed across the top 10 docked leads, generating exactly 4 distinct, chemically valid analogues per parent (40 total analogues) targeting polarity, metabolic shielding, hERG de-risking, and entropic rigidification. All 40 analogues were re-screened with ChemProp v2, redocked into PDB `7KK4`, and profiled across 106 absorption, distribution, metabolism, excretion, and toxicity endpoints using ADMET-AI.

**Results:** ChemProp v2 demonstrated robust generalization on the unseen scaffold test set, achieving a root-mean-square error ($\text{RMSE}$) of $0.621$ $\text{pIC}_{50}$ units ($95\%\text{ CI: } [0.554, 0.685]$), mean absolute error ($\text{MAE}$) of $0.525$, coefficient of determination ($R^2$) of $0.459$, and Pearson correlation $r = 0.744$ ($p = 1.33 \times 10^{-17}$). The crystallographic redocking validation gate successfully passed, reproducing Olaparib's experimental crystallographic pose with an AutoDock Vina affinity of $-11.06\text{ kcal/mol}$ and an all-heavy-atom $\text{RMSD}$ of $1.419\text{ \AA}$ (gate criterion: $\le 2.0\text{ \AA}$). Top 50 docking identified high-affinity leads reaching $-11.98\text{ kcal/mol}$ (`PUBCHEM_1010644`), with all 50 candidates maintaining critical dual Gly863/Ser904 catalytic hydrogen bonds. Subsequent RDKit-based lead optimization yielded 13 analogues (32.5%) with enhanced binding affinity over their parents ($\Delta\text{Affinity} < 0$), with top analogue `PUBCHEM_71550931_OPT4` achieving an affinity of **$-12.17\text{ kcal/mol}$** ($\Delta\text{Affinity} = -1.06\text{ kcal/mol}$ gain, 0 Lipinski violations, QED $0.74$) while maintaining safe cardiotoxicity liabilities ($\text{hERG} < 0.30$) and favorable predicted aqueous solubility.

**Conclusion:** Combining scaffold-aware D-MPNN architectures with verified crystallographic docking gates and deterministic RDKit lead optimization creates an auditable in-silico discovery funnel. Crucially, all reported affinities, scores, and interactions represent computational hypotheses requiring prospective chemical synthesis, recombinant enzymatic inhibition assays, and cellular survival validation before therapeutic utility can be claimed.

---

## 1. Introduction

Poly(ADP-ribose) polymerase 1 (PARP1) is an abundant nuclear chromatin-associated zinc-finger enzyme that functions as a frontline sensor of single-strand DNA breaks (SSBs). Detection of DNA strand breaks triggers binding via PARP1's N-terminal zinc-finger domains, which allosterically activates its catalytic domain to hydrolyze nicotinamide adenine dinucleotide ($\text{NAD}^+$) and synthesize negatively charged poly(ADP-ribose) (PAR) chains on itself (automodification) and nuclear acceptor proteins (histones, topoisomerases, XRCC1) (Lord & Ashworth, 2017).

Pharmacological inhibition of PARP1 has revolutionized targeted oncology through the paradigm of **synthetic lethality**. Small-molecule catalytic inhibitors compete with $\text{NAD}^+$ within the conserved catalytic binding cleft, preventing automodification and trapping PARP1 on damaged chromatin. When DNA replication forks collide with trapped PARP1–DNA complexes, stalled replication forks collapse into lethal double-strand breaks (DSBs). In normal cells, DSBs are repaired faithfully by high-fidelity homologous recombination repair (HRR). However, in tumors with homologous recombination deficiencies—most notably germline or somatic mutations in *BRCA1* or *BRCA2*—cells depend aberrantly on error-prone non-homologous end joining (NHEJ), resulting in catastrophic genomic instability and selective apoptosis (Farmer et al., 2005). Currently, four PARP inhibitors—Olaparib, Rucaparib, Niraparib, and Talazoparib—have obtained regulatory approval for *BRCA*-mutated ovarian, breast, prostate, and pancreatic malignancies.

Despite these clinical triumphs, current computational drug discovery literature on PARP1 suffers from widespread methodological flaws:
1. **Analogue Memorization and Scaffold Leakage:** Random train/test splits routinely place structural analogues and shared cyclic scaffolds in both training and test partitions. This inflates reported test metrics (e.g., $R^2 > 0.85$) while masking model failure when confronted with genuinely novel chemotypes.
2. **Endpoint Heterogeneity:** In-silico datasets frequently aggregate heterogeneous biological metrics—such as mixing non-equilibrium inhibition percentages, $K_i, K_d, \text{EC}_{50}$, and $\text{IC}_{50}$ values—distorting continuous thermodynamic modeling.
3. **Absence of Crystallographic Docking Validation:** Molecular docking studies frequently skip native co-crystal redocking validation, docking candidate libraries into uncalibrated grid boxes with unknown spatial fidelity.
4. **Misattribution of Chemical Transformations:** Several contemporary studies mislabel deterministic, rule-based chemical modifications as "neural generative AI" or "deep reinforcement learning," obscuring actual experimental provenance.

To address these vulnerabilities, **BioNova PARP1** enforces strict scientific rigor at every stage:
- Curating an authentic, single-endpoint experimental corpus (932 verified PARP1 $\text{IC}_{50}$ molecules from Papyrus 2024 Tier `05.7++`).
- Partitioning data via Bemis–Murcko scaffold grouping with zero structural leakage.
- Training a Directed Message-Passing Neural Network (ChemProp v2 D-MPNN) on continuous $\text{pIC}_{50}$.
- Virtual screening of 10,000 target-relevant PubChem molecules with target-specific pharmacophoric filters.
- Passing a mandatory crystallographic redocking gate on PDB `7KK4` ($\text{RMSD} \le 2.0\text{ \AA}$) before candidate docking.
- Executing an **RDKit-Based Rule-Based Lead Optimization** workflow that generates 4 targeted analogues per lead.
- Re-screening, re-docking, and evaluating all analogues with ADMET-AI.

---

## 2. Materials and Methods

### 2.1 Dataset Curation and Quality Assurance

Experimental bioactivity data was extracted from the **Papyrus 2024** benchmark corpus (Zenodo 13987985; Bequignon et al., 2023), querying human PARP1 (`P09874_WT`, ChEMBL `CHEMBL3105`) from the highest-confidence Quality Tier (`05.7++`).

Strict inclusion criteria were enforced:
- **Target Verification:** Organism *Homo sapiens*, target identifier `P09874_WT`.
- **Measurement Purity:** Only verified $\text{IC}_{50}$ records (`type_IC50 == '1'`) were admitted. All mixed, censored, or non-$\text{IC}_{50}$ entries ($K_i, K_d, \text{EC}_{50}$) were excluded ($n = 241$ logged exclusions).
- **Structure Standardization:** Compounds were desalted to the largest active organic fragment via RDKit (`rdMolStandardize.LargestFragmentChooser`), uncharged, and canonicalized.
- **Replicate Handling:** Multiple experimental replicates for identical canonical SMILES were aggregated by median $\text{pIC}_{50}$.
- **Final Curated Corpus:** $N = 932$ unique molecules with experimental $\text{pIC}_{50}$ spanning $4.00$ to $9.60$ ($\text{mean} = 7.09 \pm 1.04$).

### 2.2 Bemis–Murcko Scaffold-Balanced Splitting

To ensure real-world prospective generalization, molecules were partitioned based on Bemis–Murcko scaffolds (Bemis & Murcko, 1996) using an 80:10:10 ratio with fixed random seed 42. Zero overlap was computationally verified between partitions:
- **Training Set:** 746 molecules (490 distinct scaffolds, mean $\text{pIC}_{50} = 7.11 \pm 1.04$).
- **Validation Set:** 93 molecules (8 distinct scaffolds, mean $\text{pIC}_{50} = 6.84 \pm 1.02$).
- **Test Set (Held-Out):** 93 molecules (5 distinct scaffolds, mean $\text{pIC}_{50} = 7.18 \pm 0.85$).

### 2.3 Directed Message-Passing Neural Network (ChemProp v2 D-MPNN)

We constructed a single-task continuous regression model using ChemProp v2 (Heid et al., 2024). In the D-MPNN framework, hidden feature vectors are associated with directed bonds rather than individual atoms, avoiding message oscillation:
$$m_{vw}^{(t)} = \sum_{u \in \mathcal{N}(v) \setminus \{w\}} \text{ReLU}\left(W_m h_{uv}^{(t-1)} + W_v x_v + W_w x_w\right)$$
Bond representations are updated iteratively across $T = 3$ message-passing steps, pooled by norm readout into a molecular representation vector, and passed through a 1-layer feed-forward regression head (300 hidden units) trained with mean squared error loss, Adam optimizer, and Noam learning rate warm-up.

### 2.4 Target-Relevant 10,000 Compound Virtual Screening Library

An external screening collection of 10,000 authentic PubChem compounds was queried via the NCBI PubChem PUG REST API across 20+ established PARP1 pharmacophoric cores (phthalazinones, benzamides, quinazolinones, isoquinolinones, indazoles, benzimidazoles). Target-directed physicochemical filters were enforced:
- $200 \le \text{MW} \le 550\text{ Da}$
- $-1.0 \le \text{cLogP} \le 4.5$
- $1 \le \text{H-Bond Donors (HBD)} \le 5$ (essential for Gly863/Ser904 dual catalytic interaction)
- $2 \le \text{H-Bond Acceptors (HBA)} \le 10$
- $40 \le \text{TPSA} \le 140\text{ \AA}^2$
- $\text{Rotatable Bonds} \le 8$
- Zero overlap with the Papyrus training, validation, or test sets.

Inference on the 10,000 molecules was completed in 27.00 seconds. Top 50 diverse candidates ($\text{pIC}_{50}$ range: $9.10$ to $10.37$) representing 37 distinct Bemis–Murcko scaffolds were prioritized for molecular docking.

### 2.5 Receptor Preparation and Co-Crystal Redocking Validation Gate

The high-resolution co-crystal structure of the human PARP1 catalytic domain co-crystallized with Olaparib was retrieved from the Protein Data Bank (PDB `7KK4`, Chain A, $2.30\text{ \AA}$ resolution; Johannes et al., 2021):
- Chain A was isolated; water molecules, buffer salts, and crystallization additives were stripped.
- The reference ligand Olaparib (`09L`, 32 heavy atoms, formula $\text{C}_{24}\text{H}_{23}\text{FN}_4\text{O}_3$) was cleanly separated.
- Pocket center coordinates were defined from the crystallographic ligand centroid: $x = -9.294\text{ \AA}, y = 6.130\text{ \AA}, z = 26.348\text{ \AA}$. Grid box size: $18.0 \times 24.2 \times 18.0\text{ \AA}$.
- Native ligand and receptor PDBQT files were prepared using Meeko 0.8.0.
- AutoDock Vina v1.2.7 redocking was performed at exhaustiveness 16.
- **Mandatory Hard Gate:** Native pose heavy-atom $\text{RMSD} \le 2.0\text{ \AA}$. Only passing this gate permitted candidate screening docking.

### 2.6 AutoDock Vina Docking of Top 50 Candidates

The Top 50 candidates were subjected to 3D conformer generation using RDKit's ETKDGv3 algorithm, energy-minimized using the MMFF94 force field, converted to PDBQT format with Meeko, and docked into PDB `7KK4` using AutoDock Vina v1.2.7 (exhaustiveness 8, random seed 42). Atomic proximities were calculated to determine explicit interaction flags with the key catalytic triad:
- **Gly863:** Hydrogen bond donor/acceptor distance $\le 3.5\text{ \AA}$.
- **Ser904:** Hydrogen bond donor/acceptor distance $\le 3.5\text{ \AA}$.
- **Tyr907:** Aromatic centroid-to-ring distance $\le 4.5\text{ \AA}$ ($\pi$-$\pi$ stacking).

### 2.7 RDKit-Based Rule-Based Lead Optimization

Rather than using unconstrained black-box generative models, lead optimization was executed via deterministic, rule-based chemical transformations implemented in RDKit (`rdkit_leadopt.py`). The top 10 docked lead compounds were selected. For each parent lead, exactly four distinct, chemically valid analogues were generated using medicinal chemistry heuristics:
1. **Heteroatom / Heterocyclic Bioisostere (Polarity & Solubility Optimization):** Replacement of an aryl C-H with nitrogen ($\text{C} \rightarrow \text{N}$, pyridine/pyrimidine bioisostere) using `Chem.RWMol` to modulate polarity and lower lipophilicity.
2. **Fluorine Scan / Halogen Bioisostere (Metabolic Shielding):** Strategic monofluorination ($[\text{c};\text{H1}] \rightarrow [\text{c}](\text{F})$) via `AllChem.ReactionFromSmarts` to block oxidative cytochrome P450 metabolism and strengthen electrostatic pocket dipole alignment.
3. **Peripheral Tail Modulation (hERG De-Risking & Permeability):** Modification of basic aliphatic pendant groups or amine termini ($[\text{N};\text{H1}] \rightarrow [\text{N}](\text{cyclopropyl})$ or methyl $\rightarrow \text{CF}_3$) to attenuate basic pKa and decrease hERG potassium channel affinity.
4. **Conformational Rigidification (Entropic Optimization):** Cyclopropyl or gem-dimethyl insertion at rotatable bonds ($[\text{C};\text{H2}][\text{C};\text{H2}] \rightarrow [\text{C}]1[\text{C}]\text{C}1$) to restrict conformational flexibility and minimize binding entropy loss upon pocket engagement.

All 40 generated analogues were standardized, screened with ChemProp v2, prepared with Meeko, docked into PDB `7KK4`, and evaluated for affinity shift ($\Delta\text{Affinity} = \text{Affinity}_{\text{analogue}} - \text{Affinity}_{\text{parent}}$).

### 2.8 ADMET-AI Pharmacokinetic & Safety Profiling

All 40 optimized analogues were evaluated across 106 ADMET endpoints using ADMET-AI (Swanson & Zou, 2024), focusing on aqueous solubility ($\text{logS}$ via AqSolDB), intestinal permeability (Caco-2 log Papp), hERG cardiotoxicity probability, CYP3A4 substrate liability, and Ames mutagenicity.

---

## 3. Results

### 3.1 Data Curation & Partition Diagnostics

The curated Papyrus PARP1 dataset comprised 932 verified unique $\text{IC}_{50}$ molecules after filtering 241 non-$\text{IC}_{50}$ entries. Bemis–Murcko scaffold partitioning allocated 490 unique scaffolds to train, 8 to validation, and 5 to testing with 0% overlap.

| Partition | Compounds | Percentage | Unique Scaffolds | Mean pIC50 | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Train** | 746 | 80.0% | 490 | 7.11 | 1.04 |
| **Validation** | 93 | 10.0% | 8 | 6.84 | 1.02 |
| **Test (Held-Out)** | 93 | 10.0% | 5 | 7.18 | 0.85 |
| **Total** | 932 | 100.0% | 503 | 7.09 | 1.04 |

### 3.2 ChemProp v2 D-MPNN Model Evaluation

On the strictly held-out scaffold test partition, ChemProp v2 demonstrated robust generalization on unencountered chemotypes:
- $\text{RMSE} = 0.621$ ($95\%\text{ CI: } [0.554, 0.685]$)
- $\text{MAE} = 0.525$ ($95\%\text{ CI: } [0.458, 0.594]$)
- $R^2 = 0.459$ ($95\%\text{ CI: } [0.257, 0.583]$)
- Pearson correlation $r = 0.744$ ($p = 1.33 \times 10^{-17}$)
- Spearman rank correlation $\rho = 0.571$ ($p = 2.35 \times 10^{-9}$)

### 3.3 Crystallographic Redocking Validation Gate (PDB `7KK4`)

The redocking validation hard gate on Olaparib co-crystallized in PDB `7KK4` passed with high fidelity:
- **Redocked Binding Affinity:** $-11.06\text{ kcal/mol}$
- **All-Heavy-Atom RMSD:** **$1.419\text{ \AA}$** (comfortably below the $\le 2.0\text{ \AA}$ gate threshold)
- **Catalytic Coordination:** Full spatial reproduction of the dual hydrogen bonds between Olaparib's phthalazinone amide core and Gly863 / Ser904, as well as the face-to-face $\pi$-$\pi$ stacking against Tyr907.

### 3.4 10,000-Compound Virtual Screening & Top 50 Docking

ChemProp v2 inference across the 10,000 PubChem library yielded predicted $\text{pIC}_{50}$ values ranging from $3.20$ to $10.37$ ($\text{mean} = 6.42 \pm 0.88$). The prioritized Top 50 candidates demonstrated:
- High predicted potency ($\text{pIC}_{50}$ range: $9.10$ to $10.37$, mean $= 9.68$).
- AutoDock Vina binding affinities from $-8.26$ to **$-11.98\text{ kcal/mol}$** ($\text{mean} = -9.79\text{ kcal/mol}$).
- Lead candidate `PUBCHEM_1010644` achieved $-11.98\text{ kcal/mol}$, outperforming Olaparib ($-11.06\text{ kcal/mol}$).
- 100% conservation of dual Gly863 and Ser904 hydrogen bonds.

#### Top 10 Docked Lead Candidates

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

### 3.5 RDKit-Based Lead Optimization & Structure-Activity Shifts

The 40 RDKit-generated analogues (4 analogues per parent across 10 parents) underwent continuous ChemProp v2 re-screening and AutoDock Vina redocking:
- **Completion Rate:** 40/40 (100%) analogues successfully docked.
- **Affinity Improvements:** 13/40 (32.5%) analogues demonstrated improved binding affinity over their parent leads ($\Delta\text{Affinity} < 0$).
- **Maximal Affinity Gain:** $\Delta\text{Affinity} = -1.06\text{ kcal/mol}$ achieved by `PUBCHEM_71550931_OPT4` (analogue binding affinity: **$-12.17\text{ kcal/mol}$** vs parent lead: $-11.11\text{ kcal/mol}$).
- **Mechanistic Basis:** Conformational rigidification reduced rotatable bond flexibility, locking the aromatic pharmacophore into optimal geometry for persistent van der Waals packing and $\pi$-$\pi$ stacking against Tyr907, while preserving the dual Gly863/Ser904 hydrogen bonds.

#### Prioritized RDKit Lead Optimization Analogues

| Parent Lead ID | Optimized Analogue ID | Optimization Strategy | Analogue Vina | Parent Vina | $\Delta\text{Affinity}$ | AqSolDB (logS) | hERG Risk |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT4` | Conformational rigidification against Tyr907 | **$-12.17\text{ kcal/mol}$** | $-11.11$ | **$-1.06\text{ kcal/mol}$** | $-4.85$ | $0.23$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT2` | Aryl fluorination (metabolic shielding) | **$-11.71\text{ kcal/mol}$** | $-10.75$ | **$-0.96\text{ kcal/mol}$** | $-4.62$ | $0.21$ (Safe) |
| `PUBCHEM_71550931` | `PUBCHEM_71550931_OPT3` | Tail modulation (hERG de-risking) | **$-11.91\text{ kcal/mol}$** | $-11.11$ | **$-0.80\text{ kcal/mol}$** | $-4.41$ | $0.26$ (Safe) |
| `PUBCHEM_162533924` | `PUBCHEM_162533924_OPT4` | Conformational rigidification | **$-11.53\text{ kcal/mol}$** | $-10.75$ | **$-0.78\text{ kcal/mol}$** | $-4.91$ | $0.24$ (Safe) |
| `PUBCHEM_76287717` | `PUBCHEM_76287717_OPT2` | Aryl fluorination (dipole alignment) | **$-11.38\text{ kcal/mol}$** | $-10.63$ | **$-0.75\text{ kcal/mol}$** | $-4.70$ | $0.22$ (Safe) |

### 3.6 ADMET-AI Pharmacokinetic & Safety Profiling

Post-docking evaluation across 106 ADMET-AI endpoints confirmed favorable drug-like profiles:
- **Aqueous Solubility:** $\text{logS}$ remained between $-4.41$ and $-5.20\text{ mol/L}$, within the acceptable range for oral delivery.
- **Intestinal Permeability:** Caco-2 $\text{log Papp}$ values averaged $-4.65\text{ cm/s}$, predicting moderate-to-high intestinal absorption.
- **Cardiac Safety:** hERG potassium channel inhibition probability was $<0.30$ across all prioritized analogues (mean $= 0.24 \pm 0.05$), well below the toxic flag threshold ($0.50$).
- **Mutagenicity:** Ames mutagenicity predictions were negative for all prioritized analogues.

---

## 4. Discussion and Limitations

This study demonstrates that scaffold-aware machine learning combined with structurally validated molecular docking and deterministic RDKit-based lead optimization provides a reproducible, auditable in-silico discovery campaign for PARP1 inhibitors.

Unlike unconstrained black-box generative models that can produce synthetic abominations or non-physical geometries, our rule-based optimization workflow enforces established medicinal chemistry transformations (heteroaryl bioisosteres, fluorine scans, tail modifications, conformational rigidification) that are chemically interpretable, synthetically accessible, and directly tied to structural hypotheses within the PARP1 catalytic cleft.

**Scientific Boundaries and Critical Limitations:**
1. **Computational Nature:** Neither ChemProp predictions nor AutoDock Vina binding scores represent measured biological affinity. Rigid-receptor docking neglects active-site loop flexibility and water-mediated hydrogen-bonding networks.
2. **Catalytic Inhibition vs. PARP Trapping:** Clinical efficacy of approved PARP inhibitors correlates predominantly with allosteric PARP1–DNA trapping rather than catalytic $\text{IC}_{50}$ alone. While catalytic binding is a prerequisite for allosteric trapping, our models predict catalytic affinity and must not be conflated with direct trapping potency.
3. **Mandatory Prospective Validation:** All candidates are computational hypotheses. Chemical synthesis, in-vitro recombinant PARP1 fluorometric enzyme inhibition assays, and clonogenic cell survival assays in *BRCA1/2*-deficient cell models (e.g., MDA-MB-436, SUM149PT) are strictly required before any therapeutic claims can be made.

---

## 5. Data, Code, and Artifact Availability

The complete codebase, curated datasets, model checkpoints, docking poses, and analytical scripts are fully open-source and locally executable in the `bionova-parp1-discovery` repository:
- Curation & Quality Assurance: `scripts/curate_dataset.py`, `scripts/run_splits.py`
- Training & Evaluation: `scripts/evaluate_holdout.py`
- High-Throughput Screening: `scripts/screen_10k_chemprop.py`
- Docking & RDKit Lead Optimization: `scripts/dock_top50_and_leadopt.py`, `src/bionova_parp1/rdkit_leadopt.py`
- Interactive Research Web Platform: `web/` (React 19 / Vite / Tailwind)

---

## References

1. Bemis, G. W., & Murcko, M. A. (1996). The properties of known drugs. 1. Molecular frameworks. *Journal of Medicinal Chemistry*, 39(15), 2887–2893.
2. Bequignon, O. J. M., et al. (2023). Papyrus: A large-scale curated dataset aimed at bioactivity predictions. *Journal of Cheminformatics*, 15(1), 3.
3. Eberhardt, J., et al. (2021). AutoDock Vina 1.2.0: New docking methods, expanded force field, and Python bindings. *Journal of Chemical Information and Modeling*, 61(8), 3891–3898.
4. Farmer, H., et al. (2005). Targeting the DNA repair defect in BRCA mutant cells as a therapeutic strategy. *Nature*, 434(7035), 917–921.
5. Heid, E., et al. (2024). Chemprop: A machine learning package for chemical property prediction. *Journal of Chemical Information and Modeling*, 64(1), 9–17.
6. Johannes, J. W., et al. (2021). Discovery of clinical candidate AZD5305: A highly selective PARP1 inhibitor and trapper. *Journal of Medicinal Chemistry*, 64(19), 14498–14512.
7. Landrum, G., et al. (2023). RDKit: Open-source cheminformatics toolkit. *https://www.rdkit.org*.
8. Lord, C. J., & Ashworth, A. (2017). PARP inhibitors: synthetic lethality in the clinic. *Science*, 355(6330), 1152–1158.
9. Meanwell, N. A. (2011). Synopsis of some recent tactical application of bioisosteres in drug design. *Journal of Medicinal Chemistry*, 54(8), 2529–2591.
10. Mendez, D., et al. (2019). ChEMBL: towards direct depiction of biological systems. *Nucleic Acids Research*, 47(D1), D930–D940.
11. Swanson, K., & Zou, J. (2024). ADMET-AI: A machine learning tool for predicting ADMET properties. *Bioinformatics*, 40(7), btae442.
