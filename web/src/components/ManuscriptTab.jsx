import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Award, 
  BookOpen, 
  User, 
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Table as TableIcon,
  Eye,
  Code2,
  ChevronRight
} from 'lucide-react';
import NonTechnicalExplainer from './NonTechnicalExplainer';

function renderInlineMarkdown(text) {
  if (!text) return text;
  
  // Split by code blocks first
  const parts = [];
  const codeRegex = /`([^`]+)`/g;
  let lastIdx = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ type: 'text', val: text.substring(lastIdx, match.index) });
    }
    parts.push({ type: 'code', val: match[1] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push({ type: 'text', val: text.substring(lastIdx) });
  }

  return parts.map((part, pIdx) => {
    if (part.type === 'code') {
      return (
        <code key={pIdx} className="px-1.5 py-0.5 rounded bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          {part.val}
        </code>
      );
    }

    // Parse bold **text**
    const boldParts = part.val.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={pIdx}>
        {boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            const inner = bPart.slice(2, -2);
            return <strong key={bIdx} className="font-semibold text-[var(--text-primary)]">{inner}</strong>;
          }
          // Parse italic *text*
          const italicParts = bPart.split(/(\*[^*]+\*)/g);
          return italicParts.map((iPart, iIdx) => {
            if (iPart.startsWith('*') && iPart.endsWith('*')) {
              return <em key={iIdx} className="italic text-[var(--text-secondary)]">{iPart.slice(1, -1)}</em>;
            }
            return iPart;
          });
        })}
      </span>
    );
  });
}

function FormattedSection({ title, content }) {
  // Parse content into blocks (paragraphs, tables, lists, subheadings)
  const blocks = useMemo(() => {
    const rawLines = content.split('\n');
    const result = [];
    let currentTable = null;
    let currentList = null;
    let currentPara = [];

    const flushPara = () => {
      if (currentPara.length > 0) {
        result.push({ type: 'paragraph', text: currentPara.join(' ').trim() });
        currentPara = [];
      }
    };

    const flushList = () => {
      if (currentList) {
        result.push(currentList);
        currentList = null;
      }
    };

    const flushTable = () => {
      if (currentTable) {
        result.push(currentTable);
        currentTable = null;
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();

      if (!line) {
        flushPara();
        flushList();
        flushTable();
        continue;
      }

      // Check table row
      if (line.startsWith('|') && line.endsWith('|')) {
        flushPara();
        flushList();
        // Skip separator row (|---|---|)
        if (line.includes('---')) continue;
        
        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        if (!currentTable) {
          currentTable = { type: 'table', headers: cells, rows: [] };
        } else {
          currentTable.rows.push(cells);
        }
        continue;
      } else {
        flushTable();
      }

      // Check subheadings
      if (line.startsWith('#### ')) {
        flushPara();
        flushList();
        result.push({ type: 'h4', text: line.replace('#### ', '') });
        continue;
      }
      if (line.startsWith('### ')) {
        flushPara();
        flushList();
        result.push({ type: 'h3', text: line.replace('### ', '') });
        continue;
      }

      // Check unordered list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        flushPara();
        if (!currentList || currentList.subtype !== 'ul') {
          flushList();
          currentList = { type: 'list', subtype: 'ul', items: [] };
        }
        currentList.items.push(line.replace(/^[-*]\s+/, ''));
        continue;
      }

      // Check ordered list item (1. , 2. )
      const numMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        flushPara();
        if (!currentList || currentList.subtype !== 'ol') {
          flushList();
          currentList = { type: 'list', subtype: 'ol', items: [] };
        }
        currentList.items.push(numMatch[2]);
        continue;
      }

      flushList();
      currentPara.push(line);
    }

    flushPara();
    flushList();
    flushTable();

    return result;
  }, [content]);

  return (
    <div className="space-y-4">
      {title && (
        <div className="pb-2 border-b border-[var(--card-border)] flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-500"></span>
            {title}
          </h3>
        </div>
      )}

      <div className="space-y-3.5 text-xs text-[var(--text-secondary)] leading-relaxed">
        {blocks.map((block, idx) => {
          if (block.type === 'h3') {
            return (
              <h4 key={idx} className="text-sm font-bold text-[var(--text-primary)] pt-3 pb-1 flex items-center gap-2 border-b border-[var(--sub-card-border)]">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                {renderInlineMarkdown(block.text)}
              </h4>
            );
          }
          if (block.type === 'h4') {
            return (
              <h5 key={idx} className="text-xs font-bold text-[var(--text-primary)] pt-2 text-emerald-600 dark:text-emerald-400">
                {renderInlineMarkdown(block.text)}
              </h5>
            );
          }
          if (block.type === 'paragraph') {
            return (
              <p key={idx} className="text-xs leading-relaxed text-[var(--text-secondary)]">
                {renderInlineMarkdown(block.text)}
              </p>
            );
          }
          if (block.type === 'list') {
            if (block.subtype === 'ol') {
              return (
                <ol key={idx} className="list-decimal list-inside space-y-1 pl-2 text-xs">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">
                      {renderInlineMarkdown(item)}
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={idx} className="space-y-1.5 pl-2 text-xs">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{renderInlineMarkdown(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }
          if (block.type === 'table') {
            return (
              <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-[var(--sub-card-border)] bg-[var(--sub-card-bg)] shadow-sm">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[var(--card-bg)] border-b border-[var(--card-border)] text-[var(--text-primary)] font-semibold">
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="py-2 px-3 whitespace-nowrap">
                          {renderInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sub-card-border)]">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[var(--card-bg)] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap text-[var(--text-secondary)]">
                            {renderInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default function ManuscriptTab({ data }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('article'); // 'article' | 'raw'
  const [activeSectionIdx, setActiveSectionIdx] = useState('all');

  const manuscript = data?.manuscript_markdown || '';

  const bibtex = `@article{lanjewar2026parp1,
  title={Retrospective In-Silico Prioritization and RDKit-Based Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and ADMET-AI Profiling},
  author={Lanjewar, Ayush},
  journal={BioNova In-Silico Oncology Pre-Print},
  year={2026},
  note={Bachelor of Pharmacy (B.Pharm) Candidate Investigation}
}`;

  const copyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadManuscript = () => {
    const blob = new Blob([manuscript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BioNova_PARP1_Research_Manuscript.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Split manuscript by ## headers
  const parsedSections = useMemo(() => {
    if (!manuscript) return [];
    const parts = manuscript.split(/^##\s+/m);
    // parts[0] has the title and author
    const sections = [];

    for (let i = 1; i < parts.length; i++) {
      const sectionText = parts[i];
      const firstLineBreak = sectionText.indexOf('\n');
      const headerTitle = firstLineBreak !== -1 ? sectionText.substring(0, firstLineBreak).trim() : sectionText.trim();
      const body = firstLineBreak !== -1 ? sectionText.substring(firstLineBreak).trim() : '';
      sections.push({ title: headerTitle, content: body });
    }
    return sections;
  }, [manuscript]);

  const visibleSections = activeSectionIdx === 'all' 
    ? parsedSections 
    : parsedSections.filter((_, idx) => idx === activeSectionIdx);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Non-Technical Guide for Manuscript */}
      <NonTechnicalExplainer 
        stageNumber="8"
        title="Scientific Research Manuscript & Publication Draft"
        what="We drafted a complete, formal scientific research manuscript detailing our methodology, validation gates, benchmark numbers, and discoveries, written according to the highest standards of peer-reviewed computational chemistry journals."
        why="Scientific research has no value if it cannot be audited and verified by other scientists. Writing a formal manuscript communicates our findings, documents our exact code and data sources, and upholds academic integrity by transparently stating the boundaries of what computers can and cannot prove."
        tools="Evidence-faithful Markdown documentation, BibTeX academic indexing, Papyrus benchmark citations, and reproducible GitHub repository links."
        results="A comprehensive 15-section pre-print manuscript documenting our curated 932 IC50 dataset, ChemProp D-MPNN test metrics (RMSE 0.621, r = 0.744), 1.419 Å Olaparib redocking validation, Top 50 docking leads (-11.98 kcal/mol), and RDKit lead optimization reaching -12.17 kcal/mol."
        meaning="Anyone in the scientific or pharmaceutical world—including university professors, journal reviewers, and biotech recruiters—can read, audit, and reproduce our entire study from scratch."
      />

      {/* Authorship & Publication Metadata Card */}
      <div className="card p-6 border-l-4 border-l-emerald-500 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/40 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-teal-950/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Scientific Manuscript &amp; Pre-Print Draft</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2 flex-wrap pt-0.5">
            <span>Principal Investigator: <strong className="text-[var(--text-primary)]">Ayush Lanjewar</strong> (B.Pharm Candidate)</span>
            <span>&bull;</span>
            <span>Investigation: <strong>BioNova PARP1 Discovery Campaign</strong></span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Papyrus 2024 Tier ++ &bull; PDB 7KK4</span>
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Category: <em>In-Silico Oncology &amp; Computational Medicinal Chemistry Pre-Print</em> &bull; Rigorously verified with zero synthetic hallucinations
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center bg-[var(--sub-card-bg)] p-1 rounded-xl border border-[var(--sub-card-border)]">
            <button
              onClick={() => setViewMode('article')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'article'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Article View
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'raw'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Source (.md)
            </button>
          </div>

          <button
            onClick={downloadManuscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sub-card-bg)] hover:bg-[var(--card-border)] border border-[var(--sub-card-border)] text-xs font-semibold text-[var(--text-primary)] transition"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Download
          </button>

          <button
            onClick={copyBibtex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sub-card-bg)] hover:bg-[var(--card-border)] border border-[var(--sub-card-border)] text-xs font-mono text-[var(--text-primary)] transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-teal-500" />}
            {copied ? 'Copied BibTeX' : 'BibTeX'}
          </button>
        </div>
      </div>

      {/* Section Filter Pills (Only in Article View) */}
      {viewMode === 'article' && parsedSections.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveSectionIdx('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeSectionIdx === 'all'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Sections ({parsedSections.length})
          </button>
          {parsedSections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSectionIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeSectionIdx === idx
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>
      )}

      {/* Manuscript Content Rendered */}
      <div className="card p-6 sm:p-8 space-y-6">
        {viewMode === 'raw' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
              <span>Full Markdown Source: manuscript.md ({manuscript.length.toLocaleString()} chars)</span>
            </div>
            <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed p-4 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] text-[var(--text-primary)] overflow-x-auto max-h-[750px] overflow-y-auto">
              {manuscript}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Paper Header Block */}
            <div className="border-b border-[var(--card-border)] pb-6 space-y-3">
              <span className="badge badge-active text-[11px] font-mono">Original Research Article &bull; Pre-print</span>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
                Retrospective In-Silico Prioritization and RDKit-Based Lead Optimization of Potential Human PARP1 Inhibitors via Scaffold-Aware Directed Message-Passing Neural Networks, Validated Molecular Docking, and ADMET-AI Profiling
              </h1>
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] flex-wrap pt-1">
                <span className="font-semibold text-[var(--text-primary)]">Ayush Lanjewar</span>
                <span>&bull;</span>
                <span>Bachelor of Pharmacy (B.Pharm) Candidate</span>
                <span>&bull;</span>
                <span>BioNova In-Silico Oncology Initiative</span>
              </div>
            </div>

            {/* Sections Content */}
            <div className="space-y-8">
              {visibleSections.map((sec, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] shadow-xs">
                  <FormattedSection title={sec.title} content={sec.content} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
