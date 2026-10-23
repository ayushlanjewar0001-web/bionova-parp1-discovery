import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Target, HelpCircle as WhyIcon, Wrench, BarChart3, Lightbulb } from 'lucide-react';

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
    <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-slate-900/30 to-indigo-950/20 [data-theme='light']:from-cyan-50/80 [data-theme='light']:via-white [data-theme='light']:to-indigo-50/80 p-5 backdrop-blur-md shadow-lg transition-all">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 [data-theme='light']:bg-cyan-100 text-cyan-600 [data-theme='dark']:text-cyan-400 flex items-center justify-center font-bold text-sm shadow-sm border border-cyan-500/30">
            {stageNumber || '💡'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-cyan-500 transition-colors">
                Plain-English Summary: {title}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 [data-theme='dark']:text-cyan-400 border border-cyan-500/20">
                Non-Technical Guide
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Everything you need to know about this phase without needing a PhD in chemistry or machine learning
            </p>
          </div>
        </div>
        <button 
          className="p-1.5 rounded-lg hover:bg-slate-800/40 [data-theme='light']:hover:bg-slate-200 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          aria-label="Toggle Guide"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs animate-fade-in">
          {/* 1. What did we do? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-cyan-600 [data-theme='dark']:text-cyan-400 mb-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>1. What did we do?</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {what}
              </p>
            </div>
          </div>

          {/* 2. Why did we do it? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-indigo-600 [data-theme='dark']:text-indigo-400 mb-1.5">
                <WhyIcon className="w-3.5 h-3.5" />
                <span>2. Why did we do it?</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {why}
              </p>
            </div>
          </div>

          {/* 3. Which scientific tools? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-amber-600 [data-theme='dark']:text-amber-400 mb-1.5">
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
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600 [data-theme='dark']:text-emerald-400 mb-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>4. What we found</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                {results}
              </p>
            </div>
          </div>

          {/* 5. What does it actually mean? */}
          <div className="p-3.5 rounded-xl bg-[var(--sub-card-bg)] border border-[var(--sub-card-border)] flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-rose-600 [data-theme='dark']:text-rose-400 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>5. What it means</span>
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
