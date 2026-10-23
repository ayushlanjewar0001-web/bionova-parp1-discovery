import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Filter, Database, ArrowUpDown } from 'lucide-react';

export default function ScreeningTab({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minPic50, setMinPic50] = useState(8.5);
  const [maxMw, setMaxMw] = useState(550);
  const [sortField, setSortField] = useState('predicted_pIC50');
  const [sortAsc, setSortAsc] = useState(false);

  const stats = data?.screening_stats || {};
  const meta = data?.screening_10k_meta || {};
  const top50 = data?.top50_docking || [];

  // Filtered Top Compounds for table view
  const filteredCandidates = useMemo(() => {
    return top50
      .filter((c) => {
        const matchesSearch =
          c.compound_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.smiles?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPic50 = (c.predicted_pIC50 || 0) >= minPic50;
        const matchesMw = (c.mw || 400) <= maxMw;
        return matchesSearch && matchesPic50 && matchesMw;
      })
      .sort((a, b) => {
        const valA = a[sortField] || 0;
        const valB = b[sortField] || 0;
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [top50, searchTerm, minPic50, maxMw, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 10k Screening Header & Pharmacophore Strategy */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Target-Relevant 10,000 Compound Virtual Screening</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Screened using single-task ChemProp v2 D-MPNN continuous pIC50 regression trained on curated Papyrus 2024 Tier ++
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="badge badge-cyan font-mono">N = 10,000 UNIQUE</span>
            <span className="badge badge-emerald">ZERO BENCHMARK LEAKAGE</span>
          </div>
        </div>

        {/* Target-Specific Pharmacophoric & Physicochemical Filters */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Molecular Weight</div>
            <div className="text-base font-bold text-white mt-0.5">200 &ndash; 550 Da</div>
            <div className="text-[10px] text-slate-500 mt-0.5">PARP1 pocket volume</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Lipophilicity (cLogP)</div>
            <div className="text-base font-bold text-white mt-0.5">-1.0 to 4.5</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Optimal permeability</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">H-Bond Donors (HBD)</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">1 &ndash; 5 (Mandatory)</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Ser904 / Gly863 H-bond</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">H-Bond Acceptors (HBA)</div>
            <div className="text-base font-bold text-white mt-0.5">2 &ndash; 10</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Catalytic pocket network</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Polar Surface Area</div>
            <div className="text-base font-bold text-white mt-0.5">40 &ndash; 140 &Aring;&sup2;</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Veber oral bioavailability</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Rotatable Bonds</div>
            <div className="text-base font-bold text-white mt-0.5">&le; 8 Bonds</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Low binding entropy loss</div>
          </div>
        </div>

        {/* Pharmacophore Queries Breakdown */}
        <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Target Pharmacophore Cores Sourced from PubChem PUG REST
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Phthalazin-1(2H)-one (Olaparib)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Benzamide / Nicotinamide (Iniparib)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">1H-Indazole-4-carboxamide (Niraparib)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">1H-Benzimidazole-4-carboxamide (Veliparib)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Tricyclic Indole (Rucaparib)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Triazolophthalazine (Talazoparib)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Isoquinolin-1(2H)-one</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Quinazolin-4(3H)-one</span>
          </div>
        </div>
      </div>

      {/* Screened Candidates Interactive Explorer */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">ChemProp v2 Prioritized Candidates</h3>
            <p className="text-xs text-slate-400">Displaying top candidates filtered from the 10,000 compound screening library</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search CID or SMILES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Min Predicted pIC50:</span>
            <input
              type="range"
              min="7.0"
              max="10.5"
              step="0.1"
              value={minPic50}
              onChange={(e) => setMinPic50(parseFloat(e.target.value))}
              className="accent-sky-500 cursor-pointer w-24"
            />
            <span className="font-mono text-sky-300 font-bold">{minPic50}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Max MW:</span>
            <input
              type="range"
              min="250"
              max="550"
              step="10"
              value={maxMw}
              onChange={(e) => setMaxMw(parseInt(e.target.value))}
              className="accent-sky-500 cursor-pointer w-24"
            />
            <span className="font-mono text-slate-200">{maxMw} Da</span>
          </div>

          <div className="ml-auto text-[11px] text-slate-400">
            Showing <strong className="text-sky-300">{filteredCandidates.length}</strong> matching candidates
          </div>
        </div>

        {/* Interactive Candidates Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('compound_id')}>
                  <div className="flex items-center gap-1">Compound ID <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('predicted_pIC50')}>
                  <div className="flex items-center gap-1">Pred pIC50 <ArrowUpDown className="w-3 h-3 text-sky-400" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('docking_affinity_kcal_mol')}>
                  <div className="flex items-center gap-1">Vina Affinity <ArrowUpDown className="w-3 h-3 text-rose-400" /></div>
                </th>
                <th className="py-2.5 px-3">Catalytic Pocket Contacts</th>
                <th className="py-2.5 px-3">Canonical SMILES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredCandidates.map((cand, idx) => (
                <tr key={cand.compound_id || idx} className="hover:bg-slate-900/50 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{cand.compound_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                      {cand.predicted_pIC50 ? cand.predicted_pIC50.toFixed(2) : '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-bold border border-rose-500/20">
                      {cand.docking_affinity_kcal_mol ? `${cand.docking_affinity_kcal_mol.toFixed(2)} kcal/mol` : 'Docking in prog'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-1 text-[10px]">
                      {cand.hbond_gly863 && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Gly863 H-Bond</span>}
                      {cand.hbond_ser904 && <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300">Ser904 H-Bond</span>}
                      {cand.pi_stack_tyr907 && <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300">Tyr907 &pi;-Stack</span>}
                      {!cand.hbond_gly863 && !cand.hbond_ser904 && <span className="text-slate-500">Outer groove</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-xs truncate" title={cand.smiles}>
                    {cand.smiles}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
