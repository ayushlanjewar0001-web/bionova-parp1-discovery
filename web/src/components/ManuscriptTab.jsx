import React, { useState } from 'react';
import { FileText, Copy, Check, ExternalLink, Award } from 'lucide-react';

export default function ManuscriptTab({ data }) {
  const [copied, setCopied] = useState(false);
  const manuscript = data?.manuscript_markdown || '';

  const bibtex = `@article{lanjewar2026parp1,
  title={Retrospective In-Silico Prioritization and Generative Lead Optimization of Human PARP1 Inhibitors via Scaffold-Aware D-MPNN, Validated Molecular Docking, and REINVENT 4},
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

  return (
    <div className="space-y-6">
      {/* Authorship & Publication Metadata */}
      <div className="glass-panel p-6 border-l-4 border-l-sky-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Scientific Manuscript & Pre-Print Draft</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Author: <span className="font-semibold text-white">Ayush Lanjewar</span> (B.Pharm Candidate) &bull; Project BioNova PARP1
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Peer-Review Status: <em>Academic In-Silico Pre-Print Draft</em> (No synthetic wet-lab data fabricated)
          </p>
        </div>

        <button
          onClick={copyBibtex}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
          {copied ? 'Copied BibTeX!' : 'Copy BibTeX Citation'}
        </button>
      </div>

      {/* Manuscript Content Rendered */}
      <div className="glass-panel p-8 space-y-6">
        <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed space-y-4 font-sans">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h1 className="text-xl font-bold text-white mb-2">
              Retrospective In-Silico Prioritization and Generative Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and REINVENT 4
            </h1>
            <div className="text-xs text-slate-400 font-mono">
              <strong>Ayush Lanjewar</strong> &bull; Bachelor of Pharmacy (B.Pharm) Candidate &bull; BioNova PARP1
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider">Abstract</h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Background:</strong> Poly(ADP-ribose) polymerase 1 (PARP1) coordinates DNA repair. Pharmacological inhibition and allosteric trapping on damaged DNA induce synthetic lethality in homologous recombination-deficient tumors. In-silico discovery campaigns frequently suffer from structural congener leakage and unvalidated docking gates.
              <br /><br />
              <strong>Methods:</strong> An end-to-end reproducible computational discovery pipeline was constructed targeting human PARP1 (UniProt P09874, ChEMBL CHEMBL3105). High-confidence experimental IC50 values (932 unique molecules) from Papyrus 2024 Tier ++ were split into Bemis-Murcko scaffold partitions (zero leakage). A single-task ChemProp v2 D-MPNN regression model was trained and evaluated on held-out scaffolds. A target-relevant library of 10,000 authentic PubChem compounds was screened. Prior to batch docking, PDB 7KK4 co-crystal Olaparib redocking was validated (&le;2.0 &Aring; heavy-atom RMSD hard gate). Top 50 candidates were docked, and the highest-affinity leads were subjected to AstraZeneca REINVENT 4 Mol2Mol generative lead optimization (4 analogs per lead), followed by post-docking ADMET-AI safety profiling.
              <br /><br />
              <strong>Results:</strong> ChemProp v2 demonstrated robust generalization on held-out scaffolds (RMSE = 0.621, MAE = 0.525, R&sup2; = 0.459, Pearson r = 0.744, p = 1.33 &times; 10<sup>-17</sup>). Co-crystal redocking passed the hard gate (RMSD = 1.419 &Aring;, Vina affinity = -11.06 kcal/mol). Virtual screening identified candidates with binding energies reaching -11.98 kcal/mol, maintaining key Ser904/Gly863 dual hydrogen bonds. REINVENT 4 generative lead optimization produced 40 analogs across heteroatom bioisosteres, fluorine scans, tail modifications, and rigidification, with multiple analogs demonstrating superior binding energy and improved aqueous solubility.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-1">Key Scientific Conclusions</h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              1. <strong>Scaffold Integrity:</strong> Scaffold-balanced D-MPNNs capture generalizable features of the nicotinamide-binding pocket without trivial memory effects.
              <br />
              2. <strong>Redocking Prerequisite:</strong> The 1.419 &Aring; Olaparib redocking gate proves that the rigid-receptor grid faithfully recapitulates crystallographic binding geometry.
              <br />
              3. <strong>Generative AI Lead Optimization:</strong> AstraZeneca REINVENT 4 Mol2Mol successfully generates bioisosteric variants that de-risk hERG liabilities and optimize aqueous solubility while preserving essential catalytic pocket coordination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
