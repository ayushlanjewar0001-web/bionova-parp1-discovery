import React, { useEffect, useRef, useState } from 'react';
import { Handshake, HelpCircle, RotateCcw, Eye, Layers } from 'lucide-react';
import molecularStructures from '../data/molecular_structures.json';

export default function InteractionsTab({ data }) {
  const viewerContainerRef = useRef(null);
  const glViewerRef = useRef(null);
  const modelsRef = useRef({});

  const [showProtein, setShowProtein] = useState(true);
  const [showOptimized, setShowOptimized] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showPocket, setShowPocket] = useState(true);
  const [viewerReady, setViewerReady] = useState(false);

  const interactions = [
    { residue: 'SER904', num: 904, type: 'Hydrogen Bond', pAtom: 'OG', lAtom: 'O (Carbonyl)', dist: '2.84 Å' },
    { residue: 'GLY863', num: 863, type: 'Hydrogen Bond', pAtom: 'N (Backbone)', lAtom: 'O (Amide)', dist: '2.91 Å' },
    { residue: 'TYR907', num: 907, type: 'π-π Stacking', pAtom: 'Aromatic Ring', lAtom: 'Phthalazinone Ring', dist: '3.65 Å' },
    { residue: 'LYS903', num: 903, type: 'Cation-π / Polar', pAtom: 'NZ', lAtom: 'Heterocycle π', dist: '3.82 Å' },
    { residue: 'ALA898', num: 898, type: 'Hydrophobic', pAtom: 'CB', lAtom: 'Cyclopropyl C', dist: '3.71 Å' },
    { residue: 'GLU988', num: 988, type: 'Catalytic Triad', pAtom: 'OE1', lAtom: 'Amide NH Donor', dist: '3.95 Å' },
    { residue: 'HIS862', num: 862, type: 'Pocket Wall Contact', pAtom: 'NE2', lAtom: 'Aromatic CH', dist: '3.42 Å' },
  ];

  // Initialize 3Dmol viewer
  useEffect(() => {
    let timer = setTimeout(() => {
      if (window.$3Dmol && viewerContainerRef.current) {
        try {
          const $element = window.$(viewerContainerRef.current);
          $element.empty();
          
          const viewer = window.$3Dmol.createViewer($element, { backgroundColor: '#111827' });
          glViewerRef.current = viewer;

          // 1. Add pocket protein cartoon
          const pModel = viewer.addModel(molecularStructures.pocket_pdb, 'pdb');
          viewer.setStyle({ model: pModel }, { cartoon: { color: '#06b6d4', opacity: 0.85 } });
          modelsRef.current.protein = pModel;

          // 2. Add pocket contact residues as violet sticks
          interactions.forEach(inter => {
            viewer.setStyle(
              { model: pModel, resi: inter.num },
              { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#06b6d4' } }
            );
            viewer.addLabel(`${inter.residue}`, {
              position: { model: pModel, resi: inter.num, atom: 'CA' },
              backgroundColor: '#1f2937',
              fontColor: '#f3f4f6',
              fontSize: 10,
              backgroundOpacity: 0.85
            });
          });

          // 3. Add Original Hit (Red)
          const oModel = viewer.addModel(molecularStructures.orig_hit_pdb, 'pdb');
          viewer.setStyle({ model: oModel }, { stick: { colorscheme: 'redCarbon', radius: 0.26 } });
          modelsRef.current.original = oModel;
          // Hide original hit by default
          viewer.setModelStyle({ model: oModel }, {});

          // 4. Add Optimized Lead (Green)
          const dModel = viewer.addModel(molecularStructures.opt_lead_pdb, 'pdb');
          viewer.setStyle({ model: dModel }, { stick: { colorscheme: 'greenCarbon', radius: 0.28 } });
          modelsRef.current.optimized = dModel;

          viewer.zoomTo({ model: dModel }, 1000);
          viewer.render();
          setViewerReady(true);
        } catch (e) {
          console.error("3Dmol initialization error:", e);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Control handlers
  const handleToggleProtein = () => {
    const viewer = glViewerRef.current;
    const pModel = modelsRef.current.protein;
    if (!viewer || !pModel) return;

    const nextState = !showProtein;
    setShowProtein(nextState);

    if (nextState) {
      viewer.setStyle({ model: pModel }, { cartoon: { color: '#06b6d4', opacity: 0.85 } });
      if (showPocket) {
        interactions.forEach(inter => {
          viewer.setStyle(
            { model: pModel, resi: inter.num },
            { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#06b6d4' } }
          );
        });
      }
    } else {
      viewer.setModelStyle({ model: pModel }, {});
    }
    viewer.render();
  };

  const handleToggleOptimized = () => {
    const viewer = glViewerRef.current;
    const dModel = modelsRef.current.optimized;
    if (!viewer || !dModel) return;

    const nextState = !showOptimized;
    setShowOptimized(nextState);

    if (nextState) {
      viewer.setStyle({ model: dModel }, { stick: { colorscheme: 'greenCarbon', radius: 0.28 } });
    } else {
      viewer.setModelStyle({ model: dModel }, {});
    }
    viewer.render();
  };

  const handleToggleOriginal = () => {
    const viewer = glViewerRef.current;
    const oModel = modelsRef.current.original;
    if (!viewer || !oModel) return;

    const nextState = !showOriginal;
    setShowOriginal(nextState);

    if (nextState) {
      viewer.setStyle({ model: oModel }, { stick: { colorscheme: 'redCarbon', radius: 0.26 } });
    } else {
      viewer.setModelStyle({ model: oModel }, {});
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
      interactions.forEach(inter => {
        viewer.setStyle(
          { model: pModel, resi: inter.num },
          { stick: { colorscheme: 'violetCarbon', radius: 0.22 }, cartoon: { color: '#06b6d4' } }
        );
      });
    } else {
      interactions.forEach(inter => {
        viewer.setStyle(
          { model: pModel, resi: inter.num },
          { cartoon: { color: '#06b6d4' } }
        );
      });
    }
    viewer.render();
  };

  const handleResetCamera = () => {
    const viewer = glViewerRef.current;
    const dModel = modelsRef.current.optimized;
    if (viewer && dModel) {
      viewer.zoomTo({ model: dModel }, 800);
      viewer.render();
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="tab-content-grid">
        {/* Left Column: Tables & Text Info */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Handshake className="w-5 h-5 text-cyan-400" /> Interaction Analysis
              </span>
              <span className="badge badge-active text-[11px]">Geometric Breakdown</span>
            </div>
            <div className="text-xs text-slate-400 mb-3 leading-relaxed">
              Specific atomic-level interactions calculated geometrically between PARP1 active site residue sidechains and our REINVENT 4 optimized lead:
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Residue</th>
                    <th>Type</th>
                    <th>Protein Atom</th>
                    <th>Ligand Atom</th>
                    <th>Distance (Å)</th>
                  </tr>
                </thead>
                <tbody>
                  {interactions.map((inter, i) => (
                    <tr key={i}>
                      <td className="font-mono text-xs font-bold text-white">{inter.residue}</td>
                      <td className="text-slate-300 text-xs">{inter.type}</td>
                      <td className="text-slate-400 text-xs font-mono">{inter.pAtom}</td>
                      <td className="text-slate-400 text-xs font-mono">{inter.lAtom}</td>
                      <td style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{inter.dist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <HelpCircle className="w-5 h-5 text-cyan-400" /> Interacting Residues Key Role
              </span>
              <span className="badge badge-optimized text-[11px]">Mechanistic Anchor</span>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Ser904 &amp; Gly863 (Nicotinamide Pocket):</strong> PARP1 catalytic inhibitors mimic the nicotinamide carboxamide moiety of NAD⁺. The dual hydrogen-bonding clamp formed with the sidechain of Ser904 (2.84 Å) and the backbone NH of Gly863 (2.91 Å) provides the thermodynamic anchor required for high-affinity binding.
              </p>
              <p>
                <strong className="text-white">Tyr907 &amp; Tyr896 (Aromatic Stacking):</strong> Forms an extensive sandwich π-π stacking network with the bicyclic phthalazinone aromatic ring (3.65 Å distance), stabilizing the planar conformation within the hydrophobic cleft.
              </p>
              <p>
                <strong className="text-white">Glu988 (Catalytic Triad):</strong> Glu988 is the essential catalytic carboxylate driving the transfer of ADP-ribose to nuclear target proteins. Steric and electrostatic occupation by the lead's core prevents substrate engagement and abforces synthetic lethality.
              </p>
              <p>
                <strong className="text-white">Ala898 &amp; Lys903 (Hydrophobic Subpocket):</strong> Cradles the cyclopropyl group introduced by REINVENT 4, enhancing shape complementarity and reducing entropic penalty upon binding.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3Dmol.js Viewer */}
        <div className="card flex flex-col justify-between">
          <div className="card-header">
            <span className="card-title">
              <Layers className="w-5 h-5 text-cyan-400" /> Interactive 3D Protein-Ligand Complex
            </span>
            <span className="badge badge-active text-[11px]">WebGL Powered</span>
          </div>

          <div className="viewer-container">
            <div 
              ref={viewerContainerRef} 
              id="3dmol_viewer" 
              style={{ width: '100%', height: '100%' }}
            />

            {/* Viewer Controls */}
            <div className="viewer-controls">
              <button 
                onClick={handleToggleProtein}
                className={`control-btn ${showProtein ? 'active' : ''}`}
              >
                <Eye className="w-3.5 h-3.5" /> Protein Cartoon
              </button>
              <button 
                onClick={handleToggleOptimized}
                className={`control-btn ${showOptimized ? 'active' : ''}`}
              >
                <Eye className="w-3.5 h-3.5" /> Optimized Lead (Green)
              </button>
              <button 
                onClick={handleToggleOriginal}
                className={`control-btn ${showOriginal ? 'active' : ''}`}
              >
                <Eye className="w-3.5 h-3.5" /> Original Hit (Red)
              </button>
              <button 
                onClick={handleTogglePocket}
                className={`control-btn ${showPocket ? 'active' : ''}`}
              >
                <Eye className="w-3.5 h-3.5" /> Contact Residues (Violet)
              </button>
            </div>

            {/* Legend */}
            <div className="structure-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#06b6d4' }}></div>
                <span>PARP1 Ribbon</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                <span>Contact Residues</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                <span>Optimized Lead (Green)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Original Hit (Red)</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
            <span>🖱️ Drag: Rotate &bull; Scroll: Zoom &bull; Right-Click: Pan</span>
            <button 
              onClick={handleResetCamera}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
