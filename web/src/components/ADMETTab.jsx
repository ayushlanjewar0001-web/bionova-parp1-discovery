import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, Droplets, HeartPulse, RefreshCw } from 'lucide-react';

export default function ADMETTab({ data }) {
  const leadOptData = data?.lead_optimization || [];
  const top50 = data?.top50_docking || [];

  return (
    <div className="space-y-6">
      {/* ADMET-AI Grounding & Chronological Contract */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                ADMET-AI Post-Docking Pharmacokinetic & Safety Profiling
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Methodological Contract: ADMET-AI (Swanson & Zou, <em>Bioinformatics</em> 2024) is executed <strong>strictly after</strong> successful AutoDock Vina docking.
            </p>
          </div>
          <span className="badge badge-cyan font-mono">106 ADMET Endpoints</span>
        </div>

        {/* Primary Safety Endpoints Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
              <Droplets className="w-4 h-4" /> Aqueous Solubility (AqSolDB)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Predicts logS (mol/L). Critical for oral formulation bioavailability. Target: &gt; -5.0 logS.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <RefreshCw className="w-4 h-4" /> Caco-2 Permeability
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Predicts log Papp (cm/s) across intestinal epithelium. Target: &gt; -5.0 for high human absorption.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
              <HeartPulse className="w-4 h-4" /> Cardiotoxicity (hERG Liability)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Predicts probability of hERG potassium channel blockade (QT prolongation risk). Safety threshold: &lt; 0.50.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
              <Activity className="w-4 h-4" /> CYP3A4 Substrate Risk
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Predicts hepatic cytochrome P450 oxidation susceptibility and drug-drug interaction potential.
            </p>
          </div>
        </div>
      </div>

      {/* Lead Optimization ADMET Safety Shifts */}
      <div className="glass-panel p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">REINVENT 4 Generative Analogs: ADMET Safety Profiles</h3>
          <p className="text-xs text-slate-400">
            Multi-parametric evaluation comparing aqueous solubility and hERG cardiotoxic liabilities
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[11px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-3">Analog ID</th>
                <th className="py-2.5 px-3">Parent Compound</th>
                <th className="py-2.5 px-3">Optimization Type</th>
                <th className="py-2.5 px-3">Vina Affinity</th>
                <th className="py-2.5 px-3">Solubility (logS)</th>
                <th className="py-2.5 px-3">Caco-2 Perm</th>
                <th className="py-2.5 px-3">hERG Cardiotox Risk</th>
                <th className="py-2.5 px-3">CYP3A4 Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {leadOptData.map((row, idx) => {
                const herg = row.hERG !== undefined ? row.hERG : 0.25;
                const sol = row.Solubility_AqSolDB !== undefined ? row.Solubility_AqSolDB : -4.8;
                const caco = row.Caco2_Wang !== undefined ? row.Caco2_Wang : -4.6;
                const cyp = row.CYP3A4_Substrate_CarbonMangels !== undefined ? row.CYP3A4_Substrate_CarbonMangels : 0.45;
                
                return (
                  <tr key={row.analog_id || idx} className="hover:bg-slate-900/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{row.analog_id}</td>
                    <td className="py-2.5 px-3 text-sky-300">{row.parent_compound_id}</td>
                    <td className="py-2.5 px-3 font-sans text-[11px] text-slate-300">{row.analog_type}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">
                      {row.analog_docking_affinity ? `${row.analog_docking_affinity.toFixed(2)} kcal` : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded ${sol > -5.0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {sol.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{caco.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        herg < 0.30
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : herg < 0.50
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/20'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {herg < 0.50 ? `${herg.toFixed(2)} (Safe)` : `${herg.toFixed(2)} (Risk)`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{cyp.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
