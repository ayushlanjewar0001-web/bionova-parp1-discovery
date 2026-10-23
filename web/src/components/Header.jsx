import React from 'react';
import { 
  Crosshair, 
  Filter, 
  Wrench, 
  Shield, 
  Anchor, 
  Handshake, 
  Scale, 
  FileText,
  Dna,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme }) {
  const tabs = [
    { id: 'target', label: 'Target Overview', icon: Crosshair },
    { id: 'screening', label: 'Screening', icon: Filter },
    { id: 'leadopt', label: 'Lead Optimization', icon: Wrench },
    { id: 'admet', label: 'ADMET', icon: Shield },
    { id: 'docking', label: 'Docking', icon: Anchor },
    { id: 'interactions', label: 'Interactions', icon: Handshake },
    { id: 'compare', label: 'Hit vs Optimized', icon: Scale },
    { id: 'manuscript', label: 'Manuscript & Methods', icon: FileText }
  ];

  return (
    <header className="app-header px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="logo-container">
        <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-sm shadow-cyan-500/10 flex items-center justify-center">
          <Dna className="w-6 h-6 animate-pulse text-cyan-500" />
        </span>
        <div className="logo-text">
          <div className="flex items-center gap-2">
            <h1>BioNova PARP1 Discovery Platform</h1>
            <span className="badge badge-optimized text-[10px] hidden sm:inline-block">REINVENT 4 Mol2Mol</span>
          </div>
          <p>
            Target: <span className="text-cyan-600 [data-theme='dark']:text-cyan-300 font-medium">Synthetic Lethality in BRCA-Deficient Cancers</span> &bull; Co-Crystal: <span className="font-medium">PDB 7KK4</span> &bull; Lead: <span className="font-semibold">Ayush Lanjewar</span> (B.Pharm)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Navigation Tabs */}
        <div className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-full border border-slate-700/60 [data-theme='light']:border-slate-300 bg-slate-800/50 [data-theme='light']:bg-white text-slate-300 [data-theme='light']:text-slate-700 hover:text-cyan-500 hover:border-cyan-500/40 transition-all flex items-center justify-center shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
}
