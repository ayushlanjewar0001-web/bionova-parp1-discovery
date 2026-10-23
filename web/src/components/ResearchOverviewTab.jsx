import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Crosshair, 
  Info, 
  ShieldCheck, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Compass, 
  ArrowRight, 
  Activity, 
  Dna, 
  Database, 
  Brain, 
  Filter, 
  Anchor, 
  ShieldAlert, 
  FileSpreadsheet, 
  Binary,
  FileText,
  TrendingUp,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import molecularStructures from '../data/molecular_structures.json';
import NonTechnicalExplainer from './NonTechnicalExplainer';

export default function ResearchOverviewTab({ data, setActiveTab }) {
  const target = data?.project?.target || {};
  const dockingVal = data?.docking_validation || {};
  const modelMetrics = data?.model_metrics || {};
  const dq = data?.data_quality || {};

  const viewerContainerRef = useRef(null);
  const glViewerRef = useRef(null);
  const modelsRef = useRef({});

  const [showProtein, setShowProtein] = useState(true);
  const [showLigand, setShowLigand] = useState(true);
  const [showPocket, setShowPocket] = useState(true);

  const pocketResidues = [
    { num: 904, name: 'SER904', role: 'H-Bond Anchor' },
    { num: 863, name: 'GLY863', role: 'Backbone H-Bond' },
    { num: 907, name: 'TYR907', role: 'π-π Stacking' },
    { num: 903, name: 'LYS903', role: 'Cation-π Wall' },
    { num: 898, name: 'ALA898', role: 'Hydrophobic Cleft' },
    { num: 988, name: 'GLU988', role: 'Catalytic Triad' }
  ];

  // Initialize 3Dmol viewer for 7KK4 Target Receptor
  useEffect(() => {
    let timer = setTimeout(() => {
      if (window.$3Dmol && viewerContainerRef.current) {
        try {
          const $element = window.$(viewerContainerRef.current);
          $element.empty();

          const viewer = window.$3Dmol.createViewer($element, { backgroundColor: '#0f172a' });
          glViewerRef.current = viewer;

          // 1. Add catalytic domain protein ribbon
          const pModel = viewer.addModel(molecularStructures.pocket_pdb, 'pdb');
          viewer.setStyle({ model: pModel }, { cartoon: { color: '#0d9488', opacity: 0.90 } });
          modelsRef.current.protein = pModel;

          // 2. Add pocket residues as distinct sticks
          pocketResidues.forEach(res => {
            viewer.setStyle(
              { model: pModel, resi: res.num },
              { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#0d9488' } }
            );
            viewer.addLabel(`${res.name}`, {
              position: { model: pModel, resi: res.num, atom: 'CA' },
              backgroundColor: '#0f172a',
              fontColor: '#34d399',
              fontSize: 10,
              backgroundOpacity: 0.85
            });
          });

          // 3. Add Co-crystal Olaparib Ligand (Amber / Gold sticks)
          const lModel = viewer.addModel(molecularStructures.olaparib_pdb, 'pdb');
          viewer.setStyle({ model: lModel }, { stick: { colorscheme: 'yellowCarbon', radius: 0.28 } });
          modelsRef.current.ligand = lModel;

          viewer.zoomTo({ model: lModel }, 1000);
          viewer.render();
        } catch (e) {
          console.error("Target 3D viewer initialization error:", e);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const handleToggleProtein = () => {
    const viewer = glViewerRef.current;
    const pModel = modelsRef.current.protein;
    if (!viewer || !pModel) return;

    const nextState = !showProtein;
    setShowProtein(nextState);

    if (nextState) {
      viewer.setStyle({ model: pModel }, { cartoon: { color: '#0d9488', opacity: 0.90 } });
      if (showPocket) {
        pocketResidues.forEach(res => {
          viewer.setStyle(
            { model: pModel, resi: res.num },
            { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#0d9488' } }
          );
        });
      }
    } else {
      viewer.setModelStyle({ model: pModel }, {});
    }
    viewer.render();
  };

  const handleToggleLigand = () => {
    const viewer = glViewerRef.current;
    const lModel = modelsRef.current.ligand;
    if (!viewer || !lModel) return;

    const nextState = !showLigand;
    setShowLigand(nextState);

    if (nextState) {
      viewer.setStyle({ model: lModel }, { stick: { colorscheme: 'yellowCarbon', radius: 0.28 } });
    } else {
      viewer.setModelStyle({ model: lModel }, {});
    }
    viewer.render();
  };

  const handleTogglePocket = () => {
    const viewer = glViewerRef.current;
    const pModel = modelsRef.current.protein;
    if (!viewer || !pModel) return;

    const nextState = !showPocket;
    setShowPocket(nextState);

    if (nextState) {
      pocketResidues.forEach(res => {
        viewer.setStyle(
          { model: pModel, resi: res.num },
          { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#0d9488' } }
        );
      });
    } else {
      pocketResidues.forEach(res => {
        viewer.setStyle(
          { model: pModel, resi: res.num },
          { cartoon: { color: '#0d9488' } }
        );
      });
    }
    viewer.render();
  };

  const handleResetCamera = () => {
    const viewer = glViewerRef.current;
    const lModel = modelsRef.current.ligand;
    if (viewer && lModel) {
      viewer.zoomTo({ model: lModel }, 800);
      viewer.render();
    }
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Dataset & Curation',
      desc: 'Papyrus Tier ++ corpus: 932 curated experimental IC50 values (241 exclusions logged).',
      metric: '932 Curated IC50',
      tab: 'dataset',
      icon: Database,
      color: 'text-emerald-600'
    },
    {
      step: '02',
      title: 'Predictive AI (ChemProp)',
      desc: 'Directed Message-Passing Neural Network (D-MPNN) with Bemis-Murcko scaffold holdout.',
      metric: 'RMSE 0.621 • r 0.744',
      tab: 'predictive-ai',
      icon: Brain,
      color: 'text-teal-600'
    },
    {
      step: '03',
      title: '10K Virtual Screen',
      desc: 'High-throughput screening of 10,000 target-relevant PubChem molecules in 27 seconds.',
      metric: 'Top 50 Selected',
      tab: 'screening',
      icon: Filter,
      color: 'text-emerald-700'
    },
    {
      step: '04',
      title: 'Molecular Docking',
      desc: 'PDB 7KK4 co-crystal Olaparib redocking validation (1.419 Å RMSD) and batch docking.',
      metric: 'Affinity: -11.98 kcal/mol',
      tab: 'docking',
      icon: Anchor,
      color: 'text-teal-700'
    },
    {
      step: '05',
      title: 'RDKit Lead Optimization',
      desc: 'Rule-based bioisosteres, fluorine scans, tail modulation, and rigidification (40 analogues).',
      metric: 'Lead: -12.17 kcal/mol',
      tab: 'leadopt',
      icon: Sparkles,
      color: 'text-emerald-600'
    },
    {
      step: '06',
      title: 'ADMET-AI Profiling',
      desc: '106 pharmacokinetic endpoints: oral solubility, low cardiac risk (hERG 0.16), zero Ames alerts.',
      metric: '106 Safety Endpoints',
      tab: 'admet',
      icon: ShieldCheck,
      color: 'text-teal-600'
    },
    {
      step: '07',
      title: 'Research Manuscript',
      desc: 'Pre-print manuscript with traceable metrics, academic figures, and BibTeX indexing.',
      metric: 'Pre-Print Ready',
      tab: 'paper',
      icon: FileText,
      color: 'text-slate-700'
    }
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* 1. HERO / OVERVIEW SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-[var(--card-bg)] to-teal-500/5 p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-active text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Computer-Aided Drug Discovery
            </span>
            <span className="badge badge-optimized text-xs">
              Human PARP1 &bull; PDB 7KK4
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            BioNova PARP1: In-Silico Prioritization &amp; RDKit-Based Lead Optimization
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            An auditable, zero-leakage computational drug discovery campaign identifying novel small-molecule inhibitors of human Poly(ADP-ribose) Polymerase 1 (PARP1) for targeted synthetic lethality in <em>BRCA1/2</em>-deficient oncology.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button 
              onClick={() => {
                const el = document.getElementById('workflow-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary"
            >
              <Compass className="w-4 h-4" />
              Explore 7-Step Workflow
            </button>

            <button 
              onClick={() => setActiveTab('docking')}
              className="btn-secondary"
            >
              <Anchor className="w-4 h-4 text-emerald-600" />
              View Docked Leads
            </button>

            <button 
              onClick={() => setActiveTab('paper')}
              className="btn-secondary"
            >
              <FileText className="w-4 h-4 text-teal-600" />
              Read Research Manuscript
            </button>
          </div>
        </div>
      </section>

      {/* Non-Technical Explainer for Overview */}
      <NonTechnicalExplainer 
        stageNumber="1"
        title="Research Overview & Target Biology"
        what="We launched a systematic, computer-aided drug discovery campaign to find and improve new molecules that inhibit PARP1—a critical enzyme that cancer cells rely on to repair their broken DNA."
        why="Cancer cells with BRCA1/2 gene defects (frequent in ovarian, breast, and prostate cancers) have lost their primary DNA repair pathway. By blocking PARP1, we force these cancer cells to die through 'synthetic lethality' while sparing healthy cells."
        tools="Protein Data Bank (PDB 7KK4 crystallographic structure), 3Dmol.js WebGL molecular visualization, curated Papyrus bioactivity database, and NCBI PubChem chemical libraries."
        results="We successfully isolated and mapped the catalytic pocket of PARP1, verified the binding pose of the FDA-approved drug Olaparib with an ultra-accurate 1.419 Å RMSD, and established an end-to-end computational screening and optimization funnel."
        meaning="We have a scientifically verified virtual launchpad. We know the exact atomic lock (PARP1) and the exact shape of keys that fit inside it, allowing us to screen 10,000 potential drug keys with high confidence."
      />

      {/* KEY STATS KPI CARDS */}
      <div className="grid-3">
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Database className="w-4 h-4" /> Curated PARP1 IC50
            </span>
            <span className="badge badge-active text-[11px]">Papyrus Tier ++</span>
          </div>
          <div className="metric-value font-mono">932</div>
          <div className="metric-unit">Verified Unique Molecules</div>
          <div className="metric-subtitle">
            241 non-IC50 / censored entries excluded &bull; Zero synthetic leakage
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Brain className="w-4 h-4" /> ChemProp Test Error
            </span>
            <span className="badge badge-optimized text-[11px]">D-MPNN Holdout</span>
          </div>
          <div className="metric-value font-mono">0.621</div>
          <div className="metric-unit">Test RMSE (pIC50 Scale)</div>
          <div className="metric-subtitle">
            Pearson r = 0.744 (p &lt; 10⁻¹⁶) &bull; Tested on completely novel scaffolds
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Filter className="w-4 h-4" /> Virtual Screen Size
            </span>
            <span className="badge badge-active text-[11px]">10,000 Compounds</span>
          </div>
          <div className="metric-value font-mono">Top 50</div>
          <div className="metric-unit">Prioritized Candidates Docked</div>
          <div className="metric-subtitle">
            Curated from NCBI PubChem across 20+ PARP pharmacophores
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Anchor className="w-4 h-4" /> Redocking Validation
            </span>
            <span className="badge badge-active text-[11px]">PDB 7KK4 Gate</span>
          </div>
          <div className="metric-value font-mono" style={{ fontSize: '1.75rem', lineHeight: '2.1rem' }}>
            1.419 Å <span className="text-emerald-600 text-xs font-bold">(PASSED)</span>
          </div>
          <div className="metric-unit">All-Heavy-Atom RMSD</div>
          <div className="metric-subtitle">
            Experimental Olaparib pose reproduced across all 32 heavy atoms
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <TrendingUp className="w-4 h-4" /> Virtual Screening Hit
            </span>
            <span className="badge badge-optimized text-[11px]">PUBCHEM_1010644</span>
          </div>
          <div className="metric-value font-mono text-emerald-600">-11.98</div>
          <div className="metric-unit">kcal/mol AutoDock Vina Score</div>
          <div className="metric-subtitle">
            Surpasses Olaparib co-crystal reference (-11.06 kcal/mol)
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Sparkles className="w-4 h-4" /> Top RDKit Lead Score
            </span>
            <span className="badge badge-active text-[11px]">PUBCHEM_71550931_OPT4</span>
          </div>
          <div className="metric-value font-mono text-emerald-600">-12.17</div>
          <div className="metric-unit">kcal/mol (&Delta; -1.06 kcal/mol Gain)</div>
          <div className="metric-subtitle">
            Conformational rigidification &bull; 0 Lipinski violations &bull; QED 0.74
          </div>
        </div>
      </div>

      {/* 2. WORKFLOW SECTION: STEP-BY-STEP VISUAL FLOW */}
      <section id="workflow-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" /> End-to-End Computational Research Workflow
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Click any stage below to inspect its data, models, metrics, and methodology
            </p>
          </div>
          <span className="badge badge-active text-xs">7 Disciplined Stages</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {workflowSteps.map((ws, idx) => {
            const Icon = ws.icon;
            return (
              <div 
                key={idx}
                onClick={() => setActiveTab(ws.tab)}
                className="card p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md cursor-pointer transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono text-emerald-700 [data-theme='dark']:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      STEP {ws.step}
                    </span>
                    <Icon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1 group-hover:text-emerald-600 transition-colors">
                    {ws.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {ws.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--card-border)] flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-emerald-700 [data-theme='dark']:text-emerald-300 font-mono">{ws.metric}</span>
                  <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TARGET BIOLOGY & 3D INTERACTIVE PROTEIN STRUCTURE */}
      <section className="grid-2">
        {/* Left: Structured Target Details & Biology */}
        <div className="card flex flex-col justify-between space-y-4">
          <div>
            <div className="card-header">
              <span className="card-title">
                <Info className="w-5 h-5 text-emerald-600" /> Target Profile &amp; Disease Biology
              </span>
              <span className="badge badge-active text-[11px]">PARP1 Oncology Target</span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-[var(--text-secondary)]">
              <div className="p-3.5 rounded-xl border border-[var(--sub-card-border)] bg-[var(--sub-card-bg)] space-y-2">
                <span className="text-[var(--text-primary)] font-bold block text-sm">
                  Human Poly(ADP-ribose) Polymerase 1 (PARP1)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>&bull; UniProt ID: <span className="font-mono text-emerald-600 font-semibold">{target.uniprot || 'P09874'}</span></div>
                  <div>&bull; ChEMBL Target: <span className="font-mono text-emerald-600 font-semibold">{target.chembl || 'CHEMBL3105'}</span></div>
                  <div>&bull; Chromosomal Locus: <span className="font-mono text-[var(--text-primary)]">1q42.12</span></div>
                  <div>&bull; Catalytic Domain: <span className="font-mono text-[var(--text-primary)]">ART Domain (Residues 662–1014)</span></div>
                </div>
              </div>

              <div>
                <strong className="text-[var(--text-primary)] block text-xs uppercase tracking-wider mb-1">
                  Mechanism of Synthetic Lethality:
                </strong>
                <p>
                  PARP1 senses DNA single-strand breaks (SSBs) and synthesizes poly(ADP-ribose) polymers to recruit DNA repair enzymes. When small-molecule inhibitors bind the catalytic pocket, they trap PARP1 on chromatin. In <strong className="text-emerald-700 [data-theme='dark']:text-emerald-300 font-semibold">BRCA1/BRCA2-deficient cancer cells</strong>, homologous recombination repair is non-functional, collapsing DNA replication forks and triggering selective tumor apoptosis.
                </p>
              </div>

              <div>
                <strong className="text-[var(--text-primary)] block text-xs uppercase tracking-wider mb-1.5">
                  Essential Catalytic Pocket Anchor Residues:
                </strong>
                <div className="flex flex-wrap gap-1.5">
                  {pocketResidues.map((r, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-800 [data-theme='dark']:text-emerald-300 border border-emerald-500/20"
                    >
                      <strong className="text-[var(--text-primary)]">{r.name}</strong> ({r.role})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Reference Drug: <strong>Olaparib (Lynparza)</strong></span>
            <button 
              onClick={() => setActiveTab('docking')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
            >
              Explore Molecular Docking &rarr;
            </button>
          </div>
        </div>

        {/* Right: Interactive 3D Molecular Receptor Viewer */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="card-header">
              <span className="card-title">
                <Dna className="w-5 h-5 text-emerald-600" /> Interactive 3D PARP1 Catalytic Pocket
              </span>
              <span className="badge badge-optimized text-[11px]">PDB: 7KK4 (2.30 Å)</span>
            </div>

            {/* 3Dmol WebGL Canvas Container */}
            <div 
              ref={viewerContainerRef} 
              className="w-full h-[360px] rounded-xl overflow-hidden border border-[var(--card-border)] relative shadow-inner bg-[#0f172a]"
            >
              <div className="absolute top-3 left-3 z-10 pointer-events-none bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-700/50 text-[11px] text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Interactive 3D Structure: Drag to rotate, scroll to zoom
              </div>
            </div>

            {/* Viewer Controls */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleToggleProtein}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    showProtein 
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs' 
                      : 'bg-[var(--sub-card-bg)] text-[var(--text-muted)] border-[var(--sub-card-border)]'
                  }`}
                >
                  Ribbon Backbone: {showProtein ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={handleToggleLigand}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    showLigand 
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs' 
                      : 'bg-[var(--sub-card-bg)] text-[var(--text-muted)] border-[var(--sub-card-border)]'
                  }`}
                >
                  Olaparib Ligand: {showLigand ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={handleTogglePocket}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    showPocket 
                      ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 shadow-xs' 
                      : 'bg-[var(--sub-card-bg)] text-[var(--text-muted)] border-[var(--sub-card-border)]'
                  }`}
                >
                  Key Residues: {showPocket ? 'ON' : 'OFF'}
                </button>
              </div>

              <button 
                onClick={handleResetCamera}
                className="px-3 py-1.5 rounded-lg bg-[var(--sub-card-bg)] hover:bg-[var(--card-border)] text-[var(--text-primary)] border border-[var(--sub-card-border)] flex items-center gap-1.5 transition-all text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Camera
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--card-border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span><strong className="text-teal-600">Teal:</strong> ART Domain &bull; <strong className="text-amber-500">Gold:</strong> Co-crystal Olaparib &bull; <strong className="text-purple-600">Violet:</strong> Catalytic Triad</span>
            <span>Rendered via 3Dmol.js</span>
          </div>
        </div>
      </section>

      {/* Epistemic Truth Banner */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-amber-900 [data-theme='dark']:text-amber-200 uppercase tracking-wider">
              Scientific Integrity &amp; Preclinical Epistemic Boundary
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              All binding energies, pIC50 predictions, and interactions reported across this platform represent <strong>computational hypotheses</strong>. In-silico modeling does not constitute clinical proof of efficacy. Prospective wet-lab recombinant enzyme assays and cellular survival assays in BRCA-deficient cancer cell models remain mandatory.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
