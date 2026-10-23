import React from 'react';
import { 
  Compass, 
  Database, 
  Brain, 
  Filter, 
  Anchor, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  ShieldAlert, 
  Dna, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme }) {
  const tabs = [
    { id: 'overview', label: 'Research Overview', icon: Compass },
    { id: 'dataset', label: 'Dataset & Preparation', icon: Database },
    { id: 'predictive-ai', label: 'Predictive AI (ChemProp)', icon: Brain },
    { id: 'screening', label: 'Molecular Screening', icon: Filter },
    { id: 'docking', label: 'Molecular Docking', icon: Anchor },
    { id: 'leadopt', label: 'RDKit Lead Optimization', icon: Wrench },
    { id: 'admet', label: 'ADMET-AI Analysis', icon: ShieldCheck },
    { id: 'paper', label: 'Research Paper', icon: FileText },
    { id: 'integrity', label: 'Scientific Integrity', icon: ShieldAlert }
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
            <span className="badge badge-optimized text-[10px] hidden sm:inline-block">RDKit Lead Optimization</span>
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
                title={tab.label}
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
          className="p-2 rounded-full border border-slate-700/60 [data-theme='light']:border-slate-300 bg-slate-800/50 [data-theme='light']:bg-white text-slate-300 [data-theme='light']:text-slate-700 hover:text-cyan-500 hover:border-cyan-500/40 transition-all flex items-center justify-center shadow-sm shrink-0"
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
