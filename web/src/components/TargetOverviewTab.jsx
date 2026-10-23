import React, { useEffect, useRef, useState } from 'react';
import { Box, Crosshair, Info, ShieldCheck, Eye, RotateCcw, Sparkles, Layers } from 'lucide-react';
import molecularStructures from '../data/molecular_structures.json';

export default function TargetOverviewTab({ data, setActiveTab }) {
  const target = data?.project?.target || {};
  const dockingVal = data?.docking_validation || {};

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
      {/* 3 Metric Cards at Top */}
      <div className="grid-3">
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Box className="w-5 h-5 text-cyan-500" /> Receptor Structure
            </span>
            <span className="badge badge-active text-[11px]">1.45 Å High-Res</span>
          </div>
          <div className="metric-value">{dockingVal.pdb_id || '7KK4'}</div>
          <div className="metric-unit">PDB ID &bull; Monomeric Chain A</div>
          <div className="metric-subtitle">
            Human PARP1 catalytic domain bound to Olaparib (Lynparza)
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Crosshair className="w-5 h-5 text-cyan-500" /> Pocket Centroid
            </span>
            <span className="badge badge-optimized text-[11px]">Grid Origin</span>
          </div>
          <div className="metric-value font-mono" style={{ fontSize: '1.45rem', lineHeight: '2.1rem' }}>
            X: {dockingVal.pocket_center?.[0] ?? -9.294}<br />
            Y: {dockingVal.pocket_center?.[1] ?? 6.130}<br />
            Z: {dockingVal.pocket_center?.[2] ?? 26.348}
          </div>
          <div className="metric-unit">Coordinates (Å)</div>
          <div className="metric-subtitle">Centroid of native co-crystallized Olaparib ligand</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Box className="w-5 h-5 text-cyan-500" /> Search Box Dimensions
            </span>
            <span className="badge badge-intermediate text-[11px]">7,840.8 Å³ Vol</span>
          </div>
          <div className="metric-value font-mono" style={{ fontSize: '1.45rem', lineHeight: '2.1rem' }}>
            X: {dockingVal.grid_box_size?.[0] ?? 18.0} Å<br />
            Y: {dockingVal.grid_box_size?.[1] ?? 24.2} Å<br />
            Z: {dockingVal.grid_box_size?.[2] ?? 18.0} Å
          </div>
          <div className="metric-unit">Docking Search Space</div>
          <div className="metric-subtitle">Configured with 8 Å padding enclosing the NAD⁺ pocket</div>
        </div>
      </div>

      {/* Grid 2 Main Section: Target Information & Interactive 3D Protein Structure */}
      <div className="grid-2">
        {/* Left: Structured Target Details & Biology */}
        <div className="card flex flex-col justify-between space-y-4">
          <div>
            <div className="card-header">
              <span className="card-title">
                <Info className="w-5 h-5 text-cyan-500" /> Biological Target & Disease Relevance
              </span>
              <span className="badge badge-active text-[11px]">Oncology Target</span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="p-3.5 rounded-xl border border-slate-700/50 bg-slate-900/40 [data-theme='light']:bg-slate-50 [data-theme='light']:border-slate-200">
                <span className="text-white [data-theme='light']:text-slate-900 font-semibold block text-sm mb-1">
                  Target Profile: Poly(ADP-ribose) Polymerase 1 (PARP1)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-400 [data-theme='light']:text-slate-600">
                  <div>&bull; UniProt ID: <span className="font-mono text-cyan-400 font-semibold">P09874</span></div>
                  <div>&bull; ChEMBL Target: <span className="font-mono text-cyan-400 font-semibold">CHEMBL3105</span></div>
                  <div>&bull; Chromosomal Locus: <span className="font-mono text-slate-300 [data-theme='light']:text-slate-800">1q42.12</span></div>
                  <div>&bull; Domain: <span className="font-mono text-slate-300 [data-theme='light']:text-slate-800">ART Catalytic (662–1014)</span></div>
                </div>
              </div>

              <div>
                <strong className="text-white [data-theme='light']:text-slate-900 block text-xs uppercase tracking-wider mb-1">
                  Mechanism of Synthetic Lethality:
                </strong>
                <p className="text-slate-300 [data-theme='light']:text-slate-700">
                  PARP1 detects DNA single-strand breaks (SSBs) and synthesizes poly(ADP-ribose) chains to recruit repair machinery. Inhibition or allosteric trapping of PARP1 in <strong className="text-cyan-400">BRCA1/BRCA2-deficient tumors</strong> prevents homologous recombination (HR) repair, causing fatal replication fork collapse and cancer-selective apoptosis.
                </p>
              </div>

              <div>
                <strong className="text-white [data-theme='light']:text-slate-900 block text-xs uppercase tracking-wider mb-1">
                  Structural Preparation &amp; Curation Strategy:
                </strong>
                <p className="text-slate-300 [data-theme='light']:text-slate-700">
                  Extracted from <strong className="text-cyan-400 font-semibold">PDB 7KK4</strong> (1.45 Å resolution). Stripped non-catalytic waters and crystallographic buffer ions. Gasteiger partial atomic charges and AutoDock AD4 atom types assigned via OpenBabel. Heavy-atom co-crystal redocking validation strictly surpassed the benchmark (<strong className="text-emerald-400 font-semibold">RMSD = 1.419 Å &le; 2.0 Å</strong>).
                </p>
              </div>

              <div>
                <strong className="text-white [data-theme='light']:text-slate-900 block text-xs uppercase tracking-wider mb-1.5">
                  Essential Catalytic Pocket Anchor Residues:
                </strong>
                <div className="flex flex-wrap gap-1.5">
                  {pocketResidues.map((r, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-950/30 text-cyan-300 border border-cyan-800/40 [data-theme='light']:bg-cyan-50 [data-theme='light']:text-cyan-800 [data-theme='light']:border-cyan-200"
                    >
                      {r.name} ({r.role})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 [data-theme='light']:border-slate-200 flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('screening')}
              className="control-btn active text-xs px-3.5 py-2 font-medium"
            >
              Explore 10k Virtual Screening &rarr;
            </button>
            <span className="text-[11px] text-slate-500">
              Co-crystal reference: Olaparib (AZD2281)
            </span>
          </div>
        </div>

        {/* Right: Interactive 3D Protein Structure Viewer */}
        <div className="card flex flex-col justify-between">
          <div className="card-header">
            <span className="card-title">
              <Layers className="w-5 h-5 text-cyan-500" /> Interactive 3D Protein Receptor Structure
            </span>
            <div className="flex items-center gap-2">
              <span className="badge badge-active text-[10px]">PDB: 7KK4</span>
              <span className="badge badge-optimized text-[10px]">WebGL 3D</span>
            </div>
          </div>

          {/* 3Dmol container */}
          <div className="viewer-container">
            <div 
              ref={viewerContainerRef} 
              id="target_3dmol_viewer" 
              style={{ width: '100%', height: '100%' }}
            />

            {/* Viewer Controls */}
            <div className="viewer-controls">
              <button 
                onClick={handleToggleProtein}
                className={`control-btn ${showProtein ? 'active' : ''}`}
              >
                <Eye className="w-3.5 h-3.5" /> Protein Ribbon (Cyan)
              </button>
              <button 
                onClick={handleToggleLigand}
                className={`control-btn ${showLigand ? 'active' : ''}`}
              >
                <Eye className="w-3.5 h-3.5" /> Bound Drug: Olaparib (Gold)
              </button>
              <button 
                onClick={handleTogglePocket}
                className={`control-btn ${showPocket ? 'active' : ''}`}
              >
                <Eye className="w-3.5 h-3.5" /> Active Pocket Residues (Violet)
              </button>
            </div>

            {/* Legend */}
            <div className="structure-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#06b6d4' }}></div>
                <span>PARP1 Catalytic Ribbon</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#eab308' }}></div>
                <span>Co-crystal Olaparib</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                <span>Ser904 / Gly863 / Tyr907</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 [data-theme='light']:text-slate-600 mt-3 flex items-center justify-between">
            <span>🖱️ Drag: Rotate &bull; Scroll: Zoom &bull; Right-Click: Pan</span>
            <button 
              onClick={handleResetCamera}
              className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
