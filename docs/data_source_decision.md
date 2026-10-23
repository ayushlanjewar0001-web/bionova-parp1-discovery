# BioNova PARP1 — Dataset Source Evaluation & Decision Record

## 1. Objective
Identify and acquire a rigorous, pre-curated, continuous experimental bioactivity dataset for Human Poly(ADP-ribose) Polymerase 1 (PARP1, UniProt: `P09874`, ChEMBL ID: `CHEMBL3105`) with measured $\text{IC}_{50}$ / $\text{pIC}_{50}$ endpoints suitable for D-MPNN regression modeling.

---

## 2. Dataset Candidates Evaluated

### Option A: Papyrus 2024 (Zenodo 13987985 / 10.5281/zenodo.13987985)
- **Source**: Published large-scale bioactivity corpus (Bequignon et al., J. Cheminform / Zenodo).
- **Curated Status**: Fully pre-curated, standardized, quality-tier annotated.
- **License**: CC-BY 4.0.
- **Endpoint**: High-quality $\text{pIC}_{50}$ measurements mapped directly to UniProt identifiers (`P09874`).
- **Pros**:
  - Gold-standard benchmark dataset in computational medicinal chemistry.
  - Standardized InChIKeys, stereochemistry handling, explicit quality tiers (High/Medium/Low).
  - Explicit distinction between $\text{IC}_{50}$ and $\text{K}_i$.
- **Cons**:
  - Full dataset archive is tens of gigabytes; target-specific subsets or API extraction require careful targeted querying or streaming to avoid multi-GB local downloads.
- **Evaluation**: Selected as Primary Candidate.

### Option B: Curated ChEMBL 34 PARP1 Bioactivity Dataset
- **Source**: EMBL-EBI ChEMBL Database (`CHEMBL3105`).
- **Curated Status**: Curated raw repository records requiring downstream project-level curation and audit.
- **License**: CC-BY-SA 3.0.
- **Endpoint**: Experimental $\text{IC}_{50}$ in nM/$\mu$M with explicit assay IDs and organism verification (`Homo sapiens`).
- **Pros**:
  - Direct provenance back to primary literature references, assay descriptions, and PubMed IDs.
  - Highly accessible via ChEMBL API and filtered downloads without multi-gigabyte monolithic archives.
- **Cons**:
  - Requires strict local QA: duplicate resolution, stereoisomer verification, salt stripping, inequality filtering, and log transformation.
- **Evaluation**: Designated as Audited Fallback Source if Papyrus archive requires excessive bandwidth.

### Option C: BindingDB Target-Specific Set
- **Source**: BindingDB (PARP1, Target 50013919).
- **Curated Status**: Semi-curated literature extraction.
- **License**: CC-BY 3.0.
- **Pros**:
  - Clean target mapping with $\text{IC}_{50}$ and $\text{K}_i$.
- **Cons**:
  - High degree of overlap with ChEMBL; frequently mixes assay measurement protocols without detailed assay confidence metadata.
- **Evaluation**: Kept as tertiary reference.

---

## 3. Decision & Audit Protocol
1. We target **Papyrus 2024 (Zenodo 13987985)** target-specific extraction for UniProt `P09874` / Human PARP1.
2. In parallel, we query ChEMBL API / structured download for `CHEMBL3105` single-protein human PARP1 assays to verify record concordance.
3. Every record included in `data/processed/parp1_regression.csv` must satisfy:
   - Target verified: Human PARP1 (`P09874` / `CHEMBL3105`).
   - Endpoint: Continuous $\text{IC}_{50}$ strictly positive and uncensored (no `$<$` or `$>$`).
   - $\text{pIC}_{50}$ formula: $\text{pIC}_{50} = 9 - \log_{10}(\text{IC}_{50}\text{ [nM]})$.
   - Valid, canonicalized, desalted SMILES.
