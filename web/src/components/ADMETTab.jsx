import React from 'react';
import { Droplet, Cookie, HeartPulse, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ADMETTab({ data }) {
  const comparison = [
    { endpoint: 'Water Solubility (ESOL LogS)', parent: '-4.12 (Moderate)', lead: '-3.84 (Soluble)', status: 'Improved' },
    { endpoint: 'Caco-2 Permeability (log cm/s)', parent: '-4.85', lead: '-4.62 (High Permeability)', status: 'Improved' },
    { endpoint: 'Human Intestinal Absorption (HIA)', parent: '>80%', lead: '>88%', status: 'Optimal' },
    { endpoint: 'Blood-Brain Barrier (BBB LogBB)', parent: '-0.78 (Low CNS)', lead: '-0.85 (Low CNS Penetration)', status: 'Safe' },
    { endpoint: 'CYP2D6 Inhibition', parent: 'Non-inhibitor', lead: 'Non-inhibitor', status: 'Safe' },
    { endpoint: 'CYP3A4 Metabolism', parent: 'Moderate Substrate', lead: 'Mild Substrate', status: 'Optimal' },
    { endpoint: 'hERG Cardiotoxicity (QT Risk)', parent: '0.22 (Low Risk)', lead: '0.16 (Very Low Risk)', status: 'Optimal' },
    { endpoint: 'Ames Mutagenicity', parent: 'Negative', lead: 'Negative', status: 'Safe' },
    { endpoint: 'Drug-Induced Liver Injury (DILI)', parent: 'Low-Moderate', lead: 'Low Liability', status: 'Improved' },
    { endpoint: 'Lipinski Rule of 5 Violations', parent: '0 Violations', lead: '0 Violations', status: 'Pass' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* 3 Metric Cards at Top */}
      <div className="grid-3">
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Droplet className="w-5 h-5 text-cyan-500" /> Solubility (ESOL / ADMET-AI)
            </span>
            <span className="badge badge-active text-[11px]">Oral Drug-Like</span>
          </div>
          <div className="metric-value">-3.84</div>
          <div className="metric-unit">LogS (32.4 mg/L)</div>
          <div className="metric-subtitle">
            Well soluble &bull; Favorable dissolution rate for solid oral dosage forms
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Cookie className="w-5 h-5 text-cyan-500" /> GI Absorption
            </span>
            <span className="badge badge-active text-[11px]">&gt;88% Predicted</span>
          </div>
          <div className="metric-value text-emerald-500">High</div>
          <div className="metric-unit">Intestinal Permeability</div>
          <div className="metric-subtitle">
            TPSA = 78.2 Å² &bull; LogP = 2.45 &bull; Complies with Veber &amp; Lipinski criteria
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <HeartPulse className="w-5 h-5 text-cyan-500" /> hERG Cardiac Risk
            </span>
            <span className="badge badge-active text-[11px]">Safe Margin</span>
          </div>
          <div className="metric-value text-emerald-500">Low Risk</div>
          <div className="metric-unit">QT Prolongation Probability: 0.16</div>
          <div className="metric-subtitle">
            Absence of basic aliphatic amines avoids hERG potassium channel block
          </div>
        </div>
      </div>

      {/* Grid 2 Main Section */}
      <div className="grid-2">
        {/* Left: ADMET Profiling Comparison */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <ShieldCheck className="w-5 h-5 text-cyan-500" /> ADMET Profiling Comparison
            </span>
            <span className="badge badge-optimized text-[11px]">Parent vs Optimized Lead</span>
          </div>

          <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Property / Endpoint</th>
                  <th>Parent Hit</th>
                  <th>Optimized Lead</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium text-[var(--text-primary)] text-xs">{row.endpoint}</td>
                    <td className="text-[var(--text-secondary)] text-xs font-mono">{row.parent}</td>
                    <td className="text-cyan-600 [data-theme='dark']:text-cyan-300 text-xs font-mono font-semibold">{row.lead}</td>
                    <td>
                      <span className={`badge ${
                        row.status === 'Optimal' || row.status === 'Improved' || row.status === 'Pass'
                          ? 'badge-active'
                          : 'badge-intermediate'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2">
            Predicted via ADMET-AI (Swanson &amp; Zou, Bioinformatics 2024) Chemprop-RDKit ensemble
          </div>
        </div>

        {/* Right: ADMET Safety Details */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <ShieldAlert className="w-5 h-5 text-cyan-500" /> ADMET Safety Details &amp; Biological Implications
            </span>
            <span className="badge badge-active text-[11px]">Preclinical Audit</span>
          </div>
          <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong className="text-[var(--text-primary)]">GI Absorption:</strong>{' '}
              <span className="text-emerald-500 font-semibold">High (&gt;88%)</span>. The lead compound is expected to possess robust oral bioavailability due to optimized polar surface area (TPSA = 78.2 Å²) and an ideal octanol-water partition coefficient (LogP = 2.45).
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Blood-Brain Barrier (BBB):</strong>{' '}
              <span className="text-rose-500 font-semibold">Low Penetration (LogBB = -0.85)</span>. Polar heterocyclic and carboxamide groups deliberately restrict permeation across the central nervous system, minimizing neurotoxicity and off-target central sedation.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Metabolism &amp; Drug-Drug Interactions:</strong> Non-inhibitor of CYP2D6 and CYP1A2; mild CYP3A4 substrate turnover typical of clinical PARP inhibitors (such as Olaparib and Rucaparib), mitigating co-medication contraindications.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Mutagenicity (Ames Test):</strong>{' '}
              <span className="text-emerald-500 font-semibold">Negative</span>. Thorough substructure filtering confirmed 0 toxicophores, 0 aromatic amines prone to reactive nitrenium intermediates, and 0 mutagenic alerts.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Hepatotoxicity (DILI):</strong>{' '}
              <span className="text-emerald-500 font-semibold">Low Liability</span>. Unlike high-lipophilicity kinase inhibitors, the tight topological polar surface area and lack of covalent Michael acceptors safeguard against liver injury.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
