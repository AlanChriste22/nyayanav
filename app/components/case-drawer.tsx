import * as React from 'react'
import { type ILDCCase } from '~/data/ildc-corpus'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export interface CaseDrawerProps {
  caseData: ILDCCase | null
  onClose: () => void
  onSelectCitation?: (caseId: string) => void
}

const OUTCOME_BADGE: Record<ILDCCase['outcome'], string> = {
  Allowed:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  'Partly Allowed':
    'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-300',
  Remanded:
    'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  Dismissed:
    'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300',
}

export function CaseDrawer({
  caseData,
  onClose,
  onSelectCitation,
}: CaseDrawerProps) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (caseData) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [caseData, onClose])

  if (!caseData) return null

  const copyCitation = () => {
    const text = `${caseData.case_id} — ${caseData.title} (${caseData.court}, ${caseData.date}) [${caseData.outcome}]`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Judgment Record ${caseData.case_id}`}
        className="relative flex h-full w-full max-w-3xl flex-col border-l border-border bg-background text-foreground shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="border border-[#1D4ED8] bg-[#1D4ED8] px-2 py-0.5 text-xs font-bold text-white tabular-nums">
              {caseData.case_id}
            </span>
            <span
              className={cn(
                'border px-2 py-0.5 text-[11px] font-semibold uppercase',
                OUTCOME_BADGE[caseData.outcome],
              )}
            >
              {caseData.outcome}
            </span>
            <span className="border border-border bg-background px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
              SPLIT: {caseData.split}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyCitation}>
              {copied ? 'CITATION COPIED' : 'COPY CITATION'}
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              ESC · CLOSE
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {caseData.court} · DECIDED ON {caseData.date} ·{' '}
              {caseData.domain_label}
            </div>
            <h2 className="mt-1.5 text-base font-bold tracking-tight text-foreground">
              {caseData.title}
            </h2>
          </div>

          {/* Statutes & Citations Grid */}
          <div className="grid grid-cols-1 gap-4 border border-border bg-muted/15 p-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                STATUTES CITED ({caseData.statutes_cited.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {caseData.statutes_cited.map((st) => (
                  <span
                    key={st}
                    className="border border-border bg-background px-2 py-1 text-[11px] text-foreground"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                PRECEDENT CITATIONS ({caseData.citations.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {caseData.citations.map((cit) => {
                  const isInternal = cit.startsWith('ILDC_')
                  return (
                    <button
                      key={cit}
                      type="button"
                      onClick={() =>
                        isInternal && onSelectCitation && onSelectCitation(cit)
                      }
                      className={cn(
                        'border px-2 py-1 text-[11px] text-left',
                        isInternal
                          ? 'border-[#1D4ED8]/50 bg-[#1D4ED8]/10 text-[#1D4ED8] dark:text-blue-300 cursor-pointer hover:bg-[#1D4ED8]/20'
                          : 'border-border bg-background text-muted-foreground cursor-default',
                      )}
                    >
                      {cit}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Facts */}
          <section className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                01. MATERIAL FACTS OF THE CASE
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {caseData.facts.length} CHARS
              </span>
            </div>
            <div className="p-4 text-xs leading-relaxed text-foreground/90 max-w-[72ch]">
              {caseData.facts}
            </div>
          </section>

          {/* Arguments */}
          <section className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                02. SUBMISSIONS & FORENSIC ARGUMENTS
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {caseData.arguments.length} CHARS
              </span>
            </div>
            <div className="p-4 text-xs leading-relaxed text-foreground/90 max-w-[72ch]">
              {caseData.arguments}
            </div>
          </section>

          {/* Ruling */}
          <section className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                03. RATIO DECIDENDI & COURT RULING
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {caseData.ruling.length} CHARS
              </span>
            </div>
            <div className="p-4 text-xs leading-relaxed text-foreground/90 max-w-[72ch]">
              {caseData.ruling}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
