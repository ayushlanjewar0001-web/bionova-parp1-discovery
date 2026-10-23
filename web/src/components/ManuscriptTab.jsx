import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Award, 
  ExternalLink, 
  BookOpen, 
  User, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import NonTechnicalExplainer from './NonTechnicalExplainer';

export default function ManuscriptTab({ data }) {
  const [copied, setCopied] = useState(false);
  const manuscript = data?.manuscript_markdown || '';

  const bibtex = `@article{lanjewar2026parp1,
  title={Retrospective In-Silico Prioritization and RDKit-Based Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and ADMET-AI Profiling},
  author={Lanjewar, Ayush},
  journal={BioNova In-Silico Research Pre-print},
  year={2026},
  note={Bachelor of Pharmacy (B.Pharm) Candidate Investigation}
}`;

  const copyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadManuscript = () => {
    const blob = new Blob([manuscript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BioNova_PARP1_Research_Manuscript.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Non-Technical Guide for Manuscript */}
      <NonTechnicalExplainer 
        stageNumber="8"
        title="Scientific Research Manuscript & Publication Draft"
        what="We drafted a complete, formal scientific research manuscript detailing our methodology, validation gates, benchmark numbers, and discoveries, written according to the highest standards of peer-reviewed computational chemistry journals."
        why="Scientific research has no value if it cannot be audited and verified by other scientists. Writing a formal manuscript communicates our findings, documents our exact code and data sources, and upholds academic integrity by transparently stating the boundaries of what computers can and cannot prove."
        tools="Evidence-faithful Markdown documentation, BibTeX academic indexing, Papyrus benchmark citations, and reproducible GitHub repository links."
        results="A comprehensive 15-section pre-print manuscript documenting our curated 932 IC50 dataset, ChemProp D-MPNN test metrics (RMSE 0.621, r = 0.744), 1.419 Å Olaparib redocking validation, Top 50 docking leads (-11.98 kcal/mol), and RDKit lead optimization reaching -12.17 kcal/mol."
        meaning="Anyone in the scientific or pharmaceutical world—including university professors, journal reviewers, and biotech recruiters—can read, audit, and reproduce our entire study from scratch."
      />

      {/* Authorship & Publication Metadata Card */}
      <div className="card p-6 border-l-4 border-l-cyan-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Scientific Manuscript &amp; Pre-Print Draft</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2 flex-wrap">
            <span>Author &amp; Principal Investigator: <strong className="text-[var(--text-primary)]">Ayush Lanjewar</strong> (B.Pharm Candidate)</span>
            <span>&bull;</span>
            <span>Project: <strong>BioNova PARP1</strong></span>
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Peer-Review Category: <em>Computational Cheminformatics &amp; In-Silico Oncology Pre-Print</em> &bull; Zero synthetic data fabricated
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadManuscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--sub-card-bg)] hover:bg-[var(--card-border)] border border-[var(--sub-card-border)] text-xs font-medium text-[var(--text-primary)] transition"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Download (.md)
          </button>

          <button
            onClick={copyBibtex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--sub-card-bg)] hover:bg-[var(--card-border)] border border-[var(--sub-card-border)] text-xs font-mono text-[var(--text-primary)] transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-cyan-500" />}
            {copied ? 'Copied BibTeX!' : 'Copy BibTeX'}
          </button>
        </div>
      </div>

      {/* Manuscript Content Rendered */}
      <div className="card p-6 sm:p-8 space-y-6">
        {manuscript ? (
          <div className="prose max-w-none text-xs leading-relaxed space-y-4 font-sans text-[var(--text-secondary)]">
            <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed p-4 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] text-[var(--text-primary)] overflow-x-auto max-h-[750px] overflow-y-auto">
              {manuscript}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] text-xs text-[var(--text-secondary)] space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Retrospective In-Silico Prioritization and RDKit-Based Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and ADMET-AI Profiling
            </h3>
            <p className="leading-relaxed">
              <strong>Abstract:</strong> An end-to-end reproducible computational discovery pipeline was constructed targeting human PARP1 (UniProt P09874, ChEMBL CHEMBL3105). High-confidence experimental IC50 values (932 unique molecules) from Papyrus 2024 Tier ++ were split into Bemis-Murcko scaffold partitions (zero leakage). A single-task ChemProp v2 D-MPNN regression model was trained and evaluated on held-out scaffolds (RMSE = 0.621, Pearson r = 0.744, p = 1.33 × 10⁻¹⁷). Virtual screening of 10,000 PubChem compounds prioritized 50 leads for docking into PDB 7KK4. Olaparib redocking passed the hard gate (RMSD = 1.419 Å). RDKit rule-based lead optimization generated 40 targeted analogues, with top analogue PUBCHEM_71550931_OPT4 achieving -12.17 kcal/mol (ΔAffinity = -1.06 kcal/mol gain).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
