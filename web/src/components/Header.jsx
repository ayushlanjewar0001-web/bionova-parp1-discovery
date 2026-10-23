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
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'dataset', label: 'Dataset & Prep', icon: Database },
    { id: 'predictive-ai', label: 'Predictive AI', icon: Brain },
    { id: 'screening', label: '10K Screening', icon: Filter },
    { id: 'docking', label: 'Docking', icon: Anchor },
    { id: 'leadopt', label: 'RDKit Lead Opt', icon: Wrench },
    { id: 'admet', label: 'ADMET-AI', icon: ShieldCheck },
    { id: 'paper', label: 'Manuscript', icon: FileText },
    { id: 'integrity', label: 'Integrity', icon: ShieldAlert }
  ];

  return (
    <header className="app-header px-4 sm:px-6 lg:px-8 py-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
      {/* Brand Identity */}
      <div className="logo-container">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 [data-theme='dark']:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
          <Dna className="w-5 h-5 text-emerald-600 [data-theme='dark']:text-emerald-400" />
        </div>
        <div className="logo-text">
          <div className="flex items-center gap-2">
            <h1>BioNova PARP1</h1>
            <span className="badge badge-active text-[10px] hidden sm:inline-flex">
              Biotech Research Platform
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
            <span>Target: <strong className="text-[var(--text-secondary)]">Human PARP1 (P09874)</strong></span>
            <span>&bull;</span>
            <span>Complex: <strong className="text-[var(--text-secondary)]">PDB 7KK4</strong></span>
            <span>&bull;</span>
            <span>Lead: <strong className="text-[var(--text-secondary)]">Ayush Lanjewar</strong> (B.Pharm)</span>
          </p>
        </div>
      </div>

      {/* Navigation Pills & Theme Toggle */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 overflow-x-auto w-full xl:w-auto">
        <nav className="nav-tabs">
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
        </nav>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Biotech Light'} Mode`}
          className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--sub-card-bg)] text-[var(--text-secondary)] hover:text-emerald-600 transition-all flex items-center justify-center shadow-sm shrink-0"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
}
