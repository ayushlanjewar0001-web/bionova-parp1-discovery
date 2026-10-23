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
  Binary 
} from 'lucide-react';
import molecularStructures from '../data/molecular_structures.json';
import NonTechnicalExplainer from './NonTechnicalExplainer';

export default function ResearchOverviewTab({ data, setActiveTab }) {
  const target = data?.project?.target || {};
  const dockingVal = data?.docking_validation || {};
  const modelMetrics = data?.model_metrics || {};
  const dq = data?.data_quality || {};
  const phases = data?.pipeline_phases || [];

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
          viewer.setStyle({ model: pModel }, { cartoon: { color: '#06b6d4', opacity: 0.88 } });
          modelsRef.current.protein = pModel;

          // 2. Add pocket residues as violet sticks
          pocketResidues.forEach(res => {
            viewer.setStyle(
              { model: pModel, resi: res.num },
              { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#06b6d4' } }
            );
            viewer.addLabel(`${res.name}`, {
              position: { model: pModel, resi: res.num, atom: 'CA' },
              backgroundColor: '#0f172a',
              fontColor: '#38bdf8',
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
      viewer.setStyle({ model: pModel }, { cartoon: { color: '#06b6d4', opacity: 0.88 } });
      if (showPocket) {
        pocketResidues.forEach(res => {
          viewer.setStyle(
            { model: pModel, resi: res.num },
            { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#06b6d4' } }
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
          { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#06b6d4' } }
        );
      });
    } else {
      pocketResidues.forEach(res => {
        viewer.setStyle(
          { model: pModel, resi: res.num },
          { cartoon: { color: '#06b6d4' } }
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

  return (
    <div className="animate-fade-in space-y-6">
      {/* Non-Technical Explainer for Overview */}
      <NonTechnicalExplainer 
        stageNumber="1"
        title="Research Overview & Target Biology"
        what="We launched a systematic, computer-aided drug discovery campaign to find and improve new molecules that inhibit PARP1—a critical enzyme that cancer cells rely on to repair their broken DNA."
        why="Cancer cells with BRCA1/2 gene defects (frequent in ovarian, breast, and prostate cancers) have lost their primary DNA repair pathway. By blocking PARP1, we force these cancer cells to die through a biological concept called 'synthetic lethality' while sparing healthy cells."
        tools="Protein Data Bank (PDB 7KK4 crystallographic structure), 3Dmol.js WebGL molecular visualization, curated Papyrus bioactivity database, and NCBI PubChem chemical libraries."
        results="We successfully isolated and mapped the catalytic pocket of PARP1, verified the binding pose of the FDA-approved drug Olaparib with an ultra-accurate 1.419 Å RMSD, and established an end-to-end computational screening and optimization funnel."
        meaning="We have a scientifically verified virtual launchpad. We know the exact atomic lock (PARP1) and the exact shape of keys that fit inside it, allowing us to screen 10,000 potential drug keys with high confidence."
      />

      {/* Epistemic Boundary Notice */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/40 p-4 sm:p-5 backdrop-blur">
        <div className="flex items-start gap-3.5">
          <ShieldAlert className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-indigo-200">
              Scientific Integrity &amp; Epistemic Boundary Notice
            </h3>
            <p className="text-xs text-slate-300 [data-theme='light']:text-slate-600 leading-relaxed">
              All binding energies, pIC50 predictions, and interactions reported across this platform represent <strong>computational hypotheses</strong>. In-silico modeling does not constitute clinical validation or proof of biological activity. Prospective in-vitro enzyme inhibition assays (fluorometric PARP1 activity assays) and clonogenic cellular survival tests in BRCA-deficient cancer cell models are strictly required before any therapeutic efficacy can be established.
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
              <span className="text-xs font-medium">Curated PARP1 IC50</span>
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">932</div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            Papyrus 2024 Tier <span className="text-sky-500 font-semibold">++</span> (241 excluded)
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
              <span className="text-xs font-medium">ChemProp Holdout</span>
              <Binary className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">RMSE {modelMetrics.rmse || '0.621'}</div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            Pearson <span className="text-purple-500 font-semibold">r = {modelMetrics.pearson_r || '0.744'}</span> (Scaffold Split)
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
              <span className="text-xs font-medium">Screened Library</span>
              <Filter className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">10,000</div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            Target-relevant <span className="text-emerald-500 font-semibold">PubChem</span> molecules
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
              <span className="text-xs font-medium">Docking Gate</span>
              <Anchor className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{dockingVal.heavy_atom_rmsd_angstrom || '1.419'} Å</div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            PDB 7KK4 Olaparib (Gate: &le; 2.0 Å)
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
              <span className="text-xs font-medium">Docked Leads</span>
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Top 50</div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            Top Affinity: <span className="text-rose-500 font-semibold">-11.98 kcal/mol</span>
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
              <span className="text-xs font-medium">RDKit Optimization</span>
              <Dna className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">-12.17</div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            Max Gain: <span className="text-cyan-500 font-semibold">Δ -1.06 kcal/mol</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Protein Structure & Target Information */}
      <div className="grid-2">
        {/* Left: Structured Target Details & Biology */}
        <div className="card flex flex-col justify-between space-y-4">
          <div>
            <div className="card-header">
              <span className="card-title">
                <Info className="w-5 h-5 text-cyan-500" /> Biological Target &amp; Disease Relevance
              </span>
              <span className="badge badge-active text-[11px]">PARP1 Oncology Target</span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-[var(--text-secondary)]">
              <div className="p-3.5 rounded-xl border border-[var(--sub-card-border)] bg-[var(--sub-card-bg)]">
                <span className="text-[var(--text-primary)] font-semibold block text-sm mb-1">
                  Target Profile: Poly(ADP-ribose) Polymerase 1 (PARP1)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[var(--text-secondary)]">
                  <div>&bull; UniProt ID: <span className="font-mono text-cyan-500 font-semibold">{target.uniprot || 'P09874'}</span></div>
                  <div>&bull; ChEMBL Target: <span className="font-mono text-cyan-500 font-semibold">{target.chembl || 'CHEMBL3105'}</span></div>
                  <div>&bull; Chromosomal Locus: <span className="font-mono text-[var(--text-primary)]">1q42.12</span></div>
                  <div>&bull; Catalytic Domain: <span className="font-mono text-[var(--text-primary)]">ART Domain (Residues 662–1014)</span></div>
                </div>
              </div>

              <div>
                <strong className="text-[var(--text-primary)] block text-xs uppercase tracking-wider mb-1">
                  Synthetic Lethality in BRCA-Deficient Cancers:
                </strong>
                <p>
                  PARP1 detects DNA single-strand breaks (SSBs) and synthesizes poly(ADP-ribose) chains to recruit DNA repair machinery. Pharmacological inhibition or allosteric trapping of PARP1 in <strong className="text-cyan-500 font-semibold">BRCA1/BRCA2-deficient tumors</strong> prevents homologous recombination (HR) repair, causing fatal replication fork collapse and selective apoptotic cancer death.
                </p>
              </div>

              <div>
                <strong className="text-[var(--text-primary)] block text-xs uppercase tracking-wider mb-1">
                  Co-Crystal Structural Preparation (PDB 7KK4):
                </strong>
                <p>
                  High-resolution X-ray crystallographic complex extracted from <strong className="text-cyan-500 font-semibold">PDB 7KK4</strong> (2.30 Å resolution). Water molecules and buffer salts were removed. Gasteiger partial charges and AutoDock AD4 atom types were assigned via Meeko. Native Olaparib redocking passed the hard gate with an outstanding <strong className="text-emerald-500 font-semibold">RMSD of 1.419 Å (&le; 2.0 Å threshold)</strong>.
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
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-950/20 text-cyan-600 [data-theme='dark']:text-cyan-300 border border-cyan-800/30"
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
              className="text-cyan-500 hover:text-cyan-400 font-semibold flex items-center gap-1 transition-colors"
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
                <Dna className="w-5 h-5 text-cyan-500" /> Interactive 3D PARP1 Catalytic Pocket
              </span>
              <span className="badge badge-optimized text-[11px]">PDB: 7KK4 (2.30 Å)</span>
            </div>

            {/* 3Dmol WebGL Canvas Container */}
            <div 
              ref={viewerContainerRef} 
              className="w-full h-[360px] rounded-xl overflow-hidden border border-[var(--card-border)] relative shadow-inner bg-[#0f172a]"
            >
              {/* Fallback / Loading notice */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-700/50 text-[11px] text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
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
                      ? 'bg-cyan-500/20 text-cyan-500 border-cyan-500/40 shadow-sm' 
                      : 'bg-[var(--sub-card-bg)] text-[var(--text-muted)] border-[var(--sub-card-border)]'
                  }`}
                >
                  Ribbon Backbone: {showProtein ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={handleToggleLigand}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    showLigand 
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-sm' 
                      : 'bg-[var(--sub-card-bg)] text-[var(--text-muted)] border-[var(--sub-card-border)]'
                  }`}
                >
                  Olaparib Ligand: {showLigand ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={handleTogglePocket}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    showPocket 
                      ? 'bg-purple-500/20 text-purple-500 border-purple-500/40 shadow-sm' 
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
            <span><strong className="text-cyan-500">Cyan:</strong> PARP1 ART Domain &bull; <strong className="text-amber-400">Gold:</strong> Co-crystal Olaparib &bull; <strong className="text-purple-400">Violet:</strong> Catalytic Triad</span>
            <span>Rendered via 3Dmol.js</span>
          </div>
        </div>
      </div>

      {/* Interactive End-to-End Workflow Diagram */}
      <div className="card space-y-4">
        <div className="card-header">
          <span className="card-title">
            <Compass className="w-5 h-5 text-cyan-500" /> Interactive End-to-End Drug Discovery Workflow
          </span>
          <span className="badge badge-active text-[11px]">Click Any Stage to Inspect</span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          BioNova PARP1 enforces a strict, multi-stage funnel designed to eliminate false positives and congener memorization at every checkpoint:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Phase 1 */}
          <div 
            onClick={() => setActiveTab('dataset')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-cyan-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 font-mono">Phase 01</span>
              <Database className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-cyan-500 transition-colors">
              Dataset Curation &amp; QA
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              932 verified experimental IC50 molecules extracted from Papyrus 2024 Tier ++. 241 non-IC50 measurements strictly excluded.
            </p>
          </div>

          {/* Phase 2 */}
          <div 
            onClick={() => setActiveTab('predictive-ai')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-purple-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 font-mono">Phase 02</span>
              <Brain className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-purple-500 transition-colors">
              Predictive AI (ChemProp)
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Single-task D-MPNN continuous regression. Scaffold holdout: RMSE = 0.621, Pearson r = 0.744, zero scaffold leakage.
            </p>
          </div>

          {/* Phase 3 */}
          <div 
            onClick={() => setActiveTab('screening')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-emerald-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 font-mono">Phase 03</span>
              <Filter className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-emerald-500 transition-colors">
              10k Virtual Screening
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              10,000 authentic PubChem compounds with target pharmacophores screened in 27s; Top 50 diverse leads prioritized.
            </p>
          </div>

          {/* Phase 4 */}
          <div 
            onClick={() => setActiveTab('docking')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-amber-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">Phase 04</span>
              <Anchor className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-amber-500 transition-colors">
              Validated Molecular Docking
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Passed 1.419 Å RMSD hard redocking gate on PDB 7KK4. Top 50 leads docked with affinities up to -11.98 kcal/mol.
            </p>
          </div>

          {/* Phase 5 */}
          <div 
            onClick={() => setActiveTab('leadopt')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-cyan-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 font-mono">Phase 05</span>
              <Sparkles className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-cyan-500 transition-colors">
              RDKit Lead Optimization
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Rule-based bioisosteres, fluorine scans, and rigidification (40 analogues). Top lead reaches -12.17 kcal/mol.
            </p>
          </div>

          {/* Phase 6 */}
          <div 
            onClick={() => setActiveTab('admet')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-rose-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 font-mono">Phase 06</span>
              <ShieldCheck className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-rose-500 transition-colors">
              ADMET-AI Profiling
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              106 pharmacokinetic and safety endpoints. Favorable aqueous solubility and low cardiac risk (hERG &lt; 0.30).
            </p>
          </div>

          {/* Phase 7 */}
          <div 
            onClick={() => setActiveTab('paper')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-indigo-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 font-mono">Phase 07</span>
              <Compass className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-indigo-500 transition-colors">
              Research Paper
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Complete, evidence-faithful scientific manuscript draft with traceable results, figures, and verified literature citations.
            </p>
          </div>

          {/* Phase 8 */}
          <div 
            onClick={() => setActiveTab('integrity')}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--sub-card-bg)] hover:border-teal-500/50 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500 font-mono">Phase 08</span>
              <ShieldAlert className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-teal-500 transition-colors">
              Scientific Integrity Hub
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Data provenance, software tool versions, reproducibility commands, and prospective experimental validation roadmap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
