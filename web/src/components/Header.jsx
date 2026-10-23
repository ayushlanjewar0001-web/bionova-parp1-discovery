import React from 'react';
import { Dna, ShieldAlert, CheckCircle2, Cpu, Globe2, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Globe2 },
    { id: 'pipeline', label: 'Scientific Pipeline & QA', icon: Activity },
    { id: 'screening', label: '10k Virtual Screening', icon: Cpu },
    { id: 'docking', label: 'Top 50 Docking & Poses', icon: Dna },
    { id: 'leadopt', label: 'REINVENT 4 Lead Optimization', icon: CheckCircle2 },
    { id: 'admet', label: 'ADMET-AI Profiling', icon: Activity },
    { id: 'manuscript', label: 'Research Manuscript', icon: Globe2 }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Dna className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">BioNova PARP1</h1>
                  <span className="badge badge-cyan">In-Silico Discovery</span>
                  <span className="badge badge-purple">REINVENT 4</span>
                </div>
                <p className="text-xs text-slate-400">
                  Target: <span className="text-sky-300 font-medium">Human PARP1 (P09874 / CHEMBL3105)</span> &bull; Co-Crystal: <span className="text-sky-300 font-medium">PDB 7KK4</span> &bull; Investigator: <span className="text-slate-200 font-semibold">Ayush Lanjewar</span> (B.Pharm Candidate)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              All 6 Phases Grounded & Audited
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
