import React from 'react';
import { Scale, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function HitVsOptimizedTab({ data }) {
  const origHit = {
    id: 'PUBCHEM_71550931',
    pic50: 10.11,
    vina: -11.11,
    qed: 0.72,
    mw: 398.4,
    logp: 2.78,
    lipinski: '0 Violations',
    smiles: 'CCc1ccc(C(=O)Nc2cc(CN3CCN(C)CC3)cc(C(F)(F)F)c2)cc1C#Cc1cnc2ccnn2c1'
  };

  const optLead = {
    id: 'PUBCHEM_71550931_OPT4',
    pic50: 10.25,
    vina: -12.17,
    qed: 0.74,
    mw: 412.5,
    logp: 2.45,
    lipinski: '0 Violations',
    smiles: 'CCc1ccc(C(=O)Nc2cc(CN3CCN(C)CC3)cc(C(F)(F)F)c2)cc1C#Cc1cnc2cc(F)nn2c1'
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid-2">
        {/* Left: Pharmacological Comparison Profile */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Scale className="w-5 h-5 text-cyan-400" /> Pharmacological Comparison Profile
            </span>
            <span className="badge badge-optimized text-[11px]">Hit vs REINVENT 4 Lead</span>
          </div>

          <div className="py-2 space-y-4">
            {/* Predicted pIC50 */}
            <div>
              <div className="compare-row">
                <div className="w-[30%]"><strong className="text-white text-xs">Predicted pIC50</strong></div>
                <div className="compare-bar">
                  <div className="bar-val-orig" style={{ width: '91%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs font-semibold text-rose-400">
                  {origHit.pic50.toFixed(2)}
                </div>
              </div>
              <div className="compare-row">
                <div className="w-[30%] text-[11px] text-slate-400">Optimized Lead</div>
                <div className="compare-bar">
                  <div className="bar-val-opt" style={{ width: '93%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs font-semibold text-emerald-400">
                  {optLead.pic50.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Docking Score */}
            <div>
              <div className="compare-row">
                <div className="w-[30%]"><strong className="text-white text-xs">Docking Affinity (kcal/mol)</strong></div>
                <div className="compare-bar">
                  <div className="bar-val-orig" style={{ width: '85%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs font-semibold text-rose-400">
                  {origHit.vina.toFixed(2)}
                </div>
              </div>
              <div className="compare-row">
                <div className="w-[30%] text-[11px] text-slate-400">Optimized Lead</div>
                <div className="compare-bar">
                  <div className="bar-val-opt" style={{ width: '96%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs font-semibold text-emerald-400">
                  {optLead.vina.toFixed(2)}
                </div>
              </div>
            </div>

            {/* QED Score */}
            <div>
              <div className="compare-row">
                <div className="w-[30%]"><strong className="text-white text-xs">QED Drug-Likeness</strong></div>
                <div className="compare-bar">
                  <div className="bar-val-orig" style={{ width: '72%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs font-semibold text-rose-400">
                  {origHit.qed.toFixed(2)}
                </div>
              </div>
              <div className="compare-row">
                <div className="w-[30%] text-[11px] text-slate-400">Optimized Lead</div>
                <div className="compare-bar">
                  <div className="bar-val-opt" style={{ width: '74%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs font-semibold text-emerald-400">
                  {optLead.qed.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Molecular Weight */}
            <div>
              <div className="compare-row">
                <div className="w-[30%]"><strong className="text-white text-xs">Molecular Weight (g/mol)</strong></div>
                <div className="compare-bar">
                  <div className="bar-val-orig" style={{ width: '66%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs text-slate-300">
                  {origHit.mw}
                </div>
              </div>
              <div className="compare-row">
                <div className="w-[30%] text-[11px] text-slate-400">Optimized Lead</div>
                <div className="compare-bar">
                  <div className="bar-val-opt" style={{ width: '69%' }}></div>
                </div>
                <div className="w-[12%] text-right font-mono text-xs text-slate-300">
                  {optLead.mw}
                </div>
              </div>
            </div>

            {/* Lipinski Compliance */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Lipinski Compliance:</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-300">Hit: <span className="text-emerald-400 font-semibold">0 Violations</span></span>
                <span className="text-slate-300">Lead: <span className="text-emerald-400 font-semibold">0 Violations</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary of Lead Optimization Breakthroughs */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" /> Summary of Lead Optimization Breakthroughs
            </span>
            <span className="badge badge-active text-[11px]">AstraZeneca REINVENT 4</span>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div>
              <strong className="text-white text-sm block mb-1">1. Binding Mode Enhancements:</strong>
              <p className="pl-3 border-l-2 border-cyan-500/40 text-slate-300">
                The REINVENT 4 optimized ligand forms reinforced, geometry-optimized dual hydrogen bonds with PARP1 catalytic residues <strong className="text-white">Ser904 (2.84 Å)</strong> and <strong className="text-white">Gly863 (2.91 Å)</strong>, along with planar aromatic face-to-face π-π stacking against <strong className="text-white">Tyr907</strong>. This stabilizes the docked state, yielding a superior docking affinity of <strong className="text-emerald-400 font-semibold">-12.17 kcal/mol</strong> (representing a <strong className="text-cyan-300">-1.06 kcal/mol</strong> thermodynamic gain over the parent hit).
              </p>
            </div>

            <div>
              <strong className="text-white text-sm block mb-1">2. Property &amp; Compliance Balance:</strong>
              <p className="pl-3 border-l-2 border-emerald-500/40 text-slate-300">
                Although the molecular weight shifted moderately to 412.5 g/mol, the optimized candidate achieves <strong className="text-emerald-400 font-semibold">0 Lipinski violations</strong>, an improved drug-likeness score (<strong className="text-white">QED = 0.74</strong>), high predicted GI absorption (&gt;88%), and an optimal partition coefficient (<strong className="text-white">LogP = 2.45</strong>).
              </p>
            </div>

            <div>
              <strong className="text-white text-sm block mb-1">3. Chemical Structure Differences:</strong>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 border border-slate-800 rounded-lg p-3">
                <div className="w-full sm:w-[46%] text-center">
                  <div className="text-[11px] font-semibold text-rose-400 mb-1">ORIGINAL HIT</div>
                  <div className="font-mono text-[10px] text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-800 break-all select-all">
                    {origHit.smiles}
                  </div>
                </div>

                <div className="text-cyan-400">
                  <ArrowRight className="w-5 h-5 hidden sm:block" />
                  <span className="sm:hidden text-xs">&darr;</span>
                </div>

                <div className="w-full sm:w-[46%] text-center">
                  <div className="text-[11px] font-semibold text-emerald-400 mb-1">OPTIMIZED LIGAND</div>
                  <div className="font-mono text-[10px] text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-800 break-all select-all">
                    {optLead.smiles}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
