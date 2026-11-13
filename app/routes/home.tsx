import * as React from 'react'
import FluidOrb from '~/components/ui/fluid-orb'
import { CodeBlock } from '~/components/ui/code-block'
import { Button } from '~/components/ui/button'
import { AgentWorkbench } from '~/components/agent-workbench'
import { ModelArena } from '~/components/model-arena'
import { CorpusExplorer } from '~/components/corpus-explorer'
import { EvalBenchmark } from '~/components/eval-benchmark'
import { CaseDrawer } from '~/components/case-drawer'
import { getCaseById } from '~/lib/ildc-engine'
import { type ILDCCase } from '~/data/ildc-corpus'
import { cn } from '~/lib/utils'

export default function Home() {
  const [view, setView] = React.useState<'lawyer' | 'advanced'>('lawyer')
  const [advancedSubTab, setAdvancedSubTab] = React.useState<
    'arena' | 'corpus' | 'eval' | 'code'
  >('arena')
  const [isDark, setIsDark] = React.useState<boolean>(false)
  const [selectedCase, setSelectedCase] = React.useState<ILDCCase | null>(null)

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Clean, Calm Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <FluidOrb size={34} color="#1D4ED8" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">
                LexIndia
              </h1>
              <p className="text-xs text-muted-foreground">
                AI Legal Precedent &amp; Memo Assistant
              </p>
            </div>
          </div>

          {/* Simple 2-Mode Switch + Theme Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setView('lawyer')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  view === 'lawyer'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Legal Assistant
              </button>
              <button
                type="button"
                onClick={() => setView('advanced')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  view === 'advanced'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Benchmarks &amp; Data
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={toggleTheme}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {view === 'lawyer' ? (
          <AgentWorkbench onInspectCase={handleInspectCase} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Technical Benchmarks &amp; ILDC Dataset
                </h2>
                <p className="text-xs text-muted-foreground">
                  Inspect the 65-case dataset, compare AI search models, and
                  view the Python scripts.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'arena', label: 'Model Comparison' },
                  { id: 'corpus', label: '65-Case Dataset' },
                  { id: 'eval', label: 'Accuracy Scores' },
                  { id: 'code', label: 'Python Scripts' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setAdvancedSubTab(
                        tab.id as 'arena' | 'corpus' | 'eval' | 'code',
                      )
                    }
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors',
                      advancedSubTab === tab.id
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {advancedSubTab === 'arena' && (
              <ModelArena onInspectCase={handleInspectCase} />
            )}
            {advancedSubTab === 'corpus' && (
              <CorpusExplorer onInspectCase={handleInspectCase} />
            )}
            {advancedSubTab === 'eval' && (
              <EvalBenchmark onInspectCase={handleInspectCase} />
            )}
            {advancedSubTab === 'code' && <CodeBlock />}
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border bg-muted/20 px-4 py-4 text-center text-xs text-muted-foreground">
        LexIndia · Indian Legal Documents Corpus (ILDC) Precedent Assistant
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
