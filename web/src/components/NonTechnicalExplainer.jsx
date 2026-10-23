import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Target, 
  HelpCircle, 
  Wrench, 
  BarChart3, 
  Lightbulb,
  Sparkles
} from 'lucide-react';

export default function NonTechnicalExplainer({ 
  stageNumber,
  title, 
  what, 
  why, 
  tools, 
  results, 
  meaning 
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-[var(--card-bg)] to-teal-500/5 p-5 shadow-sm transition-all">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 [data-theme='dark']:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-500/20 shadow-xs">
            {stageNumber ? `0${stageNumber}` : '💡'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
                Executive Plain-English Summary &bull; {title}
              </h3>
              <span className="badge badge-active text-[10px]">
                Non-Technical Guide
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Essential overview for researchers, recruiters, and visitors without computational jargon
            </p>
          </div>
        </div>
        <button 
          className="p-1.5 rounded-lg hover:bg-[var(--sub-card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          aria-label="Toggle Guide"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs animate-fade-in">
          {/* 1. What did we do? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 [data-theme='dark']:text-emerald-300 mb-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>1. What We Did</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {what}
              </p>
            </div>
          </div>

          {/* 2. Why did we do it? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-teal-700 [data-theme='dark']:text-teal-300 mb-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>2. Why We Did It</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {why}
              </p>
            </div>
          </div>

          {/* 3. Which scientific tools? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 [data-theme='dark']:text-slate-300 mb-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>3. Tools Used</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {tools}
              </p>
            </div>
          </div>

          {/* 4. What results did we obtain? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 [data-theme='dark']:text-emerald-300 mb-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>4. What We Found</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {results}
              </p>
            </div>
          </div>

          {/* 5. What does it actually mean? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800 [data-theme='dark']:text-emerald-200 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>5. What It Means</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {meaning}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
