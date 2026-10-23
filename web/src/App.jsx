import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TargetOverviewTab from './components/TargetOverviewTab';
import ScreeningTab from './components/ScreeningTab';
import LeadOptTab from './components/LeadOptTab';
import ADMETTab from './components/ADMETTab';
import DockingTab from './components/DockingTab';
import InteractionsTab from './components/InteractionsTab';
import HitVsOptimizedTab from './components/HitVsOptimizedTab';
import ManuscriptTab from './components/ManuscriptTab';

import initialData from './data/parp1_data.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('target');
  const [data, setData] = useState(initialData);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bionova_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bionova_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {activeTab === 'target' && <TargetOverviewTab data={data} setActiveTab={setActiveTab} />}
        {activeTab === 'screening' && <ScreeningTab data={data} />}
        {activeTab === 'leadopt' && <LeadOptTab data={data} />}
        {activeTab === 'admet' && <ADMETTab data={data} />}
        {activeTab === 'docking' && <DockingTab data={data} />}
        {activeTab === 'interactions' && <InteractionsTab data={data} />}
        {activeTab === 'compare' && <HitVsOptimizedTab data={data} />}
        {activeTab === 'manuscript' && <ManuscriptTab data={data} />}
      </main>

      <footer className="border-t border-[var(--card-border)] bg-[var(--footer-bg)] backdrop-blur py-6 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <span className="font-semibold text-[var(--text-primary)]">BioNova PARP1 Discovery Platform</span> &bull; Principal Investigator: <strong>Ayush Lanjewar</strong> (B.Pharm Candidate)
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Target: Human PARP1 (PDB 7KK4) &bull; ChemProp v2 D-MPNN &bull; AutoDock Vina v1.2.7 &bull; AstraZeneca REINVENT 4 Mol2Mol &bull; ADMET-AI
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-active text-[10px]">Production Build</span>
            <span className="badge badge-optimized text-[10px]">Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
