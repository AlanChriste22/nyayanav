import * as React from 'react'
import FluidOrb from '~/components/ui/fluid-orb'
import { InlineAIStatus } from '~/components/ui/inline-ai-status'
import { ProximityTabs } from '~/components/ui/proximity-tabs'
import { CodeBlock } from '~/components/ui/code-block'
import { Button } from '~/components/ui/button'
import { AgentWorkbench } from '~/components/agent-workbench'
import { ModelArena } from '~/components/model-arena'
import { CorpusExplorer } from '~/components/corpus-explorer'
import { EvalBenchmark } from '~/components/eval-benchmark'
import { CaseDrawer } from '~/components/case-drawer'
import { getCaseById } from '~/lib/ildc-engine'
import { type ILDCCase } from '~/data/ildc-corpus'

const WORKBENCH_TABS = [
  {
    id: 'agent',
    label: 'Agentic Legal Research Studio',
    scriptTag: 'AGENT + 04',
    badge: 'LAWYER WORKBENCH',
  },
  {
    id: 'arena',
    label: 'Dual-Model Retrieval Arena',
    scriptTag: '03_retrieve.py',
    badge: 'InLegalBERT vs MiniLM',
  },
  {
    id: 'corpus',
    label: 'ILDC Corpus & FAISS Inspector',
    scriptTag: '01_injest + 02_index',
    badge: '65 CASES',
  },
  {
    id: 'eval',
    label: 'Evaluation & Divergence Benchmark',
    scriptTag: '05_evaluate.py',
    badge: 'R@5 · R@10 · MRR@10',
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<string>('agent')
  const [showPipelineCode, setShowPipelineCode] = React.useState<boolean>(false)
  const [showDeployGuide, setShowDeployGuide] = React.useState<boolean>(false)
  const [isDark, setIsDark] = React.useState<boolean>(true)
  const [selectedCase, setSelectedCase] = React.useState<ILDCCase | null>(null)

  const [aiState, setAiState] = React.useState<
    'idle' | 'intake' | 'researching' | 'synthesizing' | 'ready'
  >('ready')
  const [latencyMs, setLatencyMs] = React.useState<number>(129)

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', nextDark)
    }
  }

  const handleInspectCase = (caseId: string) => {
    const found = getCaseById(caseId)
    if (found) setSelectedCase(found)
  }

  const handleStatusChange = (
    state: 'idle' | 'intake' | 'researching' | 'synthesizing' | 'ready',
    ms?: number,
  ) => {
    setAiState(state)
    if (typeof ms === 'number') setLatencyMs(ms)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Architectural Command Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          {/* Brand + Rare UI FluidOrb */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center border border-border p-1 bg-muted/20">
              <FluidOrb size={32} color="#1D4ED8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight uppercase">
                  LEX-ILDC // AGENTIC PRECEDENT NAVIGATOR
                </h1>
                <span className="border border-[#1D4ED8] bg-[#1D4ED8]/10 px-1.5 py-0.2 text-[10px] font-semibold text-[#1D4ED8] dark:text-blue-300">
                  v2.4 PRODUCTION
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Indian Legal Documents Corpus · Dual FAISS Vector Engine (
                <code>law-ai/InLegalBERT</code> &amp; <code>MiniLM-L6-v2</code>)
              </p>
            </div>
          </div>

          {/* Center/Right: Rare UI InlineAIStatus + Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <InlineAIStatus state={aiState} latencyMs={latencyMs} />
            <Button
              variant={showPipelineCode ? 'cobalt' : 'outline'}
              size="sm"
              onClick={() => setShowPipelineCode((v) => !v)}
            >
              {showPipelineCode
                ? 'HIDE PYTHON SCRIPTS (01–05)'
                : 'PYTHON SCRIPTS (01–05)'}
            </Button>
            <Button
              variant={showDeployGuide ? 'cobalt' : 'outline'}
              size="sm"
              onClick={() => setShowDeployGuide((v) => !v)}
            >
              SHIP / GITHUB GUIDE
            </Button>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {isDark ? 'LIGHT SURFACE' : 'DARK SURFACE'}
            </Button>
          </div>
        </div>

        {/* Rare UI ProximityTabs */}
        <div className="mx-auto max-w-[1440px]">
          <ProximityTabs
            items={WORKBENCH_TABS}
            activeId={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 space-y-6">
        {/* Optional Collapsible Python Pipeline Viewer (Rare UI CodeBlock) */}
        {showPipelineCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                CANONICAL PYTHON PIPELINE SCRIPTS (`injest.py`, `index.py`,
                `retrieve.py`, `patterns.py`, `evaluate.py`)
              </span>
              <button
                type="button"
                onClick={() => setShowPipelineCode(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <CodeBlock />
          </div>
        )}

        {/* Optional Collapsible Ship & GitHub Deployment Guide */}
        {showDeployGuide && (
          <section className="border border-[#1D4ED8] bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#1D4ED8] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  REAL-TIME PRODUCTION DEPLOYMENT
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  HOW TO PUSH TO GITHUB &amp; DEPLOY FOR LIVE LAWYERS
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDeployGuide(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
              <div className="border border-border bg-background p-3 space-y-1.5">
                <div className="font-bold uppercase text-[#1D4ED8] dark:text-blue-400">
                  1. Push Monorepo to GitHub
                </div>
                <pre className="overflow-x-auto bg-muted/40 p-2 text-[11px]">
                  {`git remote add origin https://github.com/<your-username>/lex-ildc-navigator.git
git branch -M main
git push -u origin main`}
                </pre>
              </div>

              <div className="border border-border bg-background p-3 space-y-1.5">
                <div className="font-bold uppercase text-[#1D4ED8] dark:text-blue-400">
                  2. Deploy Web App (Vercel / Render / Docker)
                </div>
                <pre className="overflow-x-auto bg-muted/40 p-2 text-[11px]">
                  {`# Instant Vercel / Render / Railway Deploy:
npx vercel --prod
# Or run Production Docker container:
docker build -t lex-ildc . && docker run -p 3000:3000 lex-ildc`}
                </pre>
              </div>

              <div className="border border-border bg-background p-3 space-y-1.5">
                <div className="font-bold uppercase text-[#1D4ED8] dark:text-blue-400">
                  3. Run Python Pipeline &amp; FastAPI Service
                </div>
                <pre className="overflow-x-auto bg-muted/40 p-2 text-[11px]">
                  {`python injest.py && python index.py
python retrieve.py && python patterns.py
python evaluate.py
uvicorn api.server:app --reload --port 8000`}
                </pre>
              </div>
            </div>
          </section>
        )}

        {/* Active Tab Workspace */}
        {activeTab === 'agent' && (
          <AgentWorkbench
            onInspectCase={handleInspectCase}
            onStatusChange={handleStatusChange}
          />
        )}
        {activeTab === 'arena' && (
          <ModelArena onInspectCase={handleInspectCase} />
        )}
        {activeTab === 'corpus' && (
          <CorpusExplorer onInspectCase={handleInspectCase} />
        )}
        {activeTab === 'eval' && (
          <EvalBenchmark onInspectCase={handleInspectCase} />
        )}
      </main>

      {/* Architectural Footer */}
      <footer className="border-t border-border bg-muted/20 px-4 py-3 text-[11px] text-muted-foreground">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2">
          <div>
            <strong>LEX-ILDC</strong> · Indian Legal Documents Corpus Precedent
            Navigator · Built with Rare UI &amp; React Router v7 + Python{' '}
            <code>src/</code> Pipeline
          </div>
          <div className="tabular-nums">
            65 Canonical Cases · 52 Train / 13 Held-Out Eval · Recall@10 (legal)
            = 1.000
          </div>
        </div>
      </footer>

      {/* Judgment Deep-Dive Drawer */}
      <CaseDrawer
        caseData={selectedCase}
        onClose={() => setSelectedCase(null)}
        onSelectCitation={handleInspectCase}
      />
    </div>
  )
}
