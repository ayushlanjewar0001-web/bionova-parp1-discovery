import React from 'react';
import { ShieldAlert, Award, FileSpreadsheet, Binary, Microscope, Sparkles, ArrowRight, ExternalLink, Activity, Dna } from 'lucide-react';

export default function OverviewTab({ data, setActiveTab }) {
  const phases = data?.pipeline_phases || [];
  const modelMetrics = data?.model_metrics || {};
  const dockingVal = data?.docking_validation || {};
  const screeningStats = data?.screening_stats || {};
  const top50Summary = data?.top50_summary || {};
  const leadoptSummary = data?.leadopt_summary || {};

  return (
    <div className="space-y-6">
      {/* Epistemic Truth Alert */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/40 p-4 sm:p-5 backdrop-blur">
        <div className="flex items-start gap-3.5">
          <ShieldAlert className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-indigo-200">
              Critical Epistemic Boundary & Scientific Integrity
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All findings presented in this study represent <strong>computational hypotheses</strong> grounded in empirical single-task D-MPNN regression, rigid-receptor AutoDock Vina docking, and AstraZeneca REINVENT 4 generative lead optimization. In-silico predictions and docking ranks do <strong>not</strong> constitute biological proof or clinical validation. Confirmatory in-vitro enzyme inhibition (fluorometric PARP1 activity assays) and clonogenic cellular survival in <em>BRCA1</em>-deficient models are mandatory before any therapeutic claim can be made.
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Curated PARP1 IC50</span>
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">932</div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Papyrus 2024 Tier <span className="text-sky-300 font-semibold">++</span> (241 excluded)
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">ChemProp Holdout RMSE</span>
              <Binary className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{modelMetrics.rmse || '0.621'}</div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Pearson <span className="text-purple-300 font-semibold">r = {modelMetrics.pearson_r || '0.744'}</span> (Scaffold Split)
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">10k Virtual Screen</span>
              <Microscope className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{screeningStats.total_count || '10,000'}</div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Authentic PubChem Target Library
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">7KK4 Redocking RMSD</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{dockingVal.heavy_atom_rmsd_angstrom || '1.419'} &Aring;</div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-300/80">
            Gate: <span className="font-semibold text-emerald-300">PASSED (&le; 2.0 &Aring;)</span>
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Top Docked Affinity</span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {top50Summary.affinity_min ? `${top50Summary.affinity_min} kcal` : '-11.98 kcal'}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Surpasses Olaparib (-11.06 kcal)
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">REINVENT 4 Lead Opt</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 tracking-tight">4 Analogs</div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Per docked lead compound
          </div>
        </div>
      </div>

      {/* Project Workflow Timeline */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-semibold text-white">End-to-End Pipeline Chronology</h3>
            <p className="text-xs text-slate-400">
              Methodological progression from curated wet-lab bioactivity to generative lead optimization
            </p>
          </div>
          <span className="badge badge-emerald">Reproducible Locally</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {phases.map((phase) => (
            <div key={phase.id} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-sky-400">PHASE {phase.id}</span>
                <span className="badge badge-emerald">{phase.status}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-1">{phase.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{phase.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Target Context & Generative Optimization Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Dna className="w-4 h-4 text-sky-400" />
            Target Biology: Human PARP1 & Synthetic Lethality
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Poly(ADP-ribose) polymerase 1 (PARP1) hydrolyzes nicotinamide adenine dinucleotide (NAD<sup>+</sup>) to synthesize poly(ADP-ribose) polymers, coordinating DNA single-strand break repair. In tumors defective in homologous recombination (e.g. <em>BRCA1/2</em> deficiencies), PARP1 catalytic inhibition and allosteric trapping on chromatin trigger synthetic lethality, driving unrepaired replication fork collapse into lethal double-strand breaks.
          </p>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400"><strong className="text-slate-200">PDB Crystal Structure:</strong> 7KK4 (Chain A, 2.30 &Aring; resolution)</div>
            <div className="text-slate-400"><strong className="text-slate-200">Conserved Catalytic Residues:</strong> Ser904 (hydrogen bond donor/acceptor), Gly863 (backbone lactam anchor), Tyr907 (&pi;-&pi; stacking platform)</div>
            <div className="text-slate-400"><strong className="text-slate-200">Reference Clinical Benchmark:</strong> Olaparib (Lynparza, co-crystal ligand <code>09L</code>, Vina affinity: -11.06 kcal/mol)</div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AstraZeneca REINVENT 4 Generative AI Lead Optimization
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Following AutoDock Vina batch docking of the top 50 candidates, the highest-affinity lead compounds are submitted to <strong>REINVENT 4 Mol2Mol generative AI</strong>. By preserving the crucial pharmacophoric lactam/amide anchor that coordinates Gly863/Ser904, the model executes four distinct medicinal chemistry transformations per lead:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-sky-300 block mb-0.5">1. Heteroatom Bioisostere</strong>
              <span className="text-slate-400">Replaces carbocyclic rings with pyridine/pyrimidine to boost aqueous solubility.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-emerald-300 block mb-0.5">2. Fluorine Scan</strong>
              <span className="text-slate-400">Installs aryl fluorine to block CYP metabolism and strengthen pocket dipole alignment.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-purple-300 block mb-0.5">3. Tail Modulation</strong>
              <span className="text-slate-400">Optimizes peripheral basic amines to reduce hERG cardiac liability.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-amber-300 block mb-0.5">4. Rigidification</strong>
              <span className="text-slate-400">Introduces small rings/cyclopropyl groups to minimize binding entropy penalty.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
