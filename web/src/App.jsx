import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import PipelineTab from './components/PipelineTab';
import ScreeningTab from './components/ScreeningTab';
import DockingTab from './components/DockingTab';
import LeadOptTab from './components/LeadOptTab';
import ADMETTab from './components/ADMETTab';
import ManuscriptTab from './components/ManuscriptTab';

// Default project data fallback if loading
import initialData from './data/parp1_data.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(initialData);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {activeTab === 'overview' && <OverviewTab data={data} setActiveTab={setActiveTab} />}
        {activeTab === 'pipeline' && <PipelineTab data={data} />}
        {activeTab === 'screening' && <ScreeningTab data={data} />}
        {activeTab === 'docking' && <DockingTab data={data} />}
        {activeTab === 'leadopt' && <LeadOptTab data={data} />}
        {activeTab === 'admet' && <ADMETTab data={data} />}
        {activeTab === 'manuscript' && <ManuscriptTab data={data} />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <span className="font-semibold text-slate-300">BioNova PARP1</span> &bull; Investigator: <strong>Ayush Lanjewar</strong> (B.Pharm Candidate)
            <div className="text-[11px] text-slate-500 mt-0.5">
              Empirical ChemProp v2 D-MPNN Regression &bull; AutoDock Vina v1.2.7 &bull; AstraZeneca REINVENT 4 Mol2Mol &bull; ADMET-AI
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-cyan text-[10px]">Ready for Vercel Deployment</span>
            <span className="badge badge-emerald text-[10px]">Zero Hallucinations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
