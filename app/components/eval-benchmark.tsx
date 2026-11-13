import * as React from 'react'
import { getEvaluationReport } from '~/lib/ildc-engine'
import { AnimatedCounter } from '~/components/ui/animated-counter'
import { Button } from '~/components/ui/button'

export interface EvalBenchmarkProps {
  onInspectCase: (caseId: string) => void
}

export function EvalBenchmark({ onInspectCase }: EvalBenchmarkProps) {
  const report = React.useMemo(() => getEvaluationReport(), [])
  const [copiedMd, setCopiedMd] = React.useState(false)

  const { general, legal } = report.metrics

  const copyResultsMd = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(report.markdown)
      setCopiedMd(true)
      setTimeout(() => setCopiedMd(false), 1600)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Metrics Cards */}
      <div className="border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <span className="bg-[#1D4ED8] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase mr-2">
              05_EVALUATE.PY
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              CITATION-OVERLAP RETRIEVAL BENCHMARK (`eval/results.md`)
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={copyResultsMd}>
            {copiedMd ? 'COPIED eval/results.md' : 'COPY eval/results.md'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Legal Model Benchmark Card */}
          <div className="border border-[#1D4ED8] bg-[#1D4ED8]/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-[#1D4ED8] dark:text-blue-400">
                  MODEL: `legal` (SHIPPED)
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <code>{legal.hf_id}</code> · {legal.dim} dims ·{' '}
                  {legal.n_queries} held-out eval queries
                </div>
              </div>
              <span className="bg-[#1D4ED8] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                WINNER
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Recall@5
                </div>
                <div className="text-xl font-bold tabular-nums">
                  <AnimatedCounter value={legal.recall_at_5} decimals={3} />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Recall@10
                </div>
                <div className="text-xl font-bold tabular-nums">
                  <AnimatedCounter value={legal.recall_at_10} decimals={3} />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  MRR@10
                </div>
                <div className="text-xl font-bold tabular-nums">
                  <AnimatedCounter value={legal.mrr_at_10} decimals={3} />
                </div>
              </div>
            </div>
          </div>

          {/* General Model Benchmark Card */}
          <div className="border border-border bg-background p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-foreground">
                  MODEL: `general` (BASELINE)
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <code>{general.hf_id}</code> · {general.dim} dims ·{' '}
                  {general.n_queries} held-out eval queries
                </div>
              </div>
              <span className="border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                BASELINE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Recall@5
                </div>
                <div className="text-xl font-bold tabular-nums text-muted-foreground">
                  <AnimatedCounter value={general.recall_at_5} decimals={3} />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Recall@10
                </div>
                <div className="text-xl font-bold tabular-nums text-muted-foreground">
                  <AnimatedCounter value={general.recall_at_10} decimals={3} />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  MRR@10
                </div>
                <div className="text-xl font-bold tabular-nums text-muted-foreground">
                  <AnimatedCounter value={general.mrr_at_10} decimals={3} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Bar Comparison Chart matching evaluate.py */}
        <div className="border border-border bg-background p-4 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider">
            SIDE-BY-SIDE METRIC COMPARISON (CITATION-OVERLAP RELEVANCE)
          </div>
          <div className="space-y-3">
            {[
              {
                label: 'Recall@5',
                leg: legal.recall_at_5,
                gen: general.recall_at_5,
              },
              {
                label: 'Recall@10',
                leg: legal.recall_at_10,
                gen: general.recall_at_10,
              },
              {
                label: 'MRR@10',
                leg: legal.mrr_at_10,
                gen: general.mrr_at_10,
              },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{row.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    legal: <strong>{row.leg.toFixed(3)}</strong> vs general:{' '}
                    {row.gen.toFixed(3)} (+
                    {((row.leg - row.gen) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-[#1D4ED8] dark:text-blue-400 font-semibold">
                      legal
                    </span>
                    <div className="h-2.5 flex-1 bg-muted">
                      <div
                        className="h-full bg-[#1D4ED8] dark:bg-blue-400"
                        style={{ width: `${Math.round(row.leg * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-muted-foreground">
                      general
                    </span>
                    <div className="h-2.5 flex-1 bg-muted">
                      <div
                        className="h-full bg-zinc-500"
                        style={{ width: `${Math.round(row.gen * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Qualitative Divergence Examples */}
      <div className="border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            QUALITATIVE DIVERGENCE ANALYSIS (`find_divergence_examples`, k=5)
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Held-out evaluation queries showing precedents retrieved exclusively
            by <code>law-ai/InLegalBERT</code> vs <code>MiniLM-L6-v2</code>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[10px] uppercase text-muted-foreground">
                <th className="py-2.5 px-3">Eval Query Case</th>
                <th className="py-2.5 px-3">Legal-Only Hits (`InLegalBERT`)</th>
                <th className="py-2.5 px-3">General-Only Hits (`MiniLM`)</th>
                <th className="py-2.5 px-3">Shared Hits</th>
                <th className="py-2.5 px-3">Citation Precision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.divergences.map((ex) => (
                <tr key={ex.query_id} className="hover:bg-muted/20">
                  <td className="py-3 px-3 align-top">
                    <button
                      type="button"
                      onClick={() => onInspectCase(ex.query_id)}
                      className="font-bold text-[#1D4ED8] dark:text-blue-400 hover:underline cursor-pointer tabular-nums"
                    >
                      {ex.query_id} ↗
                    </button>
                    <div className="text-[11px] font-medium text-foreground mt-0.5">
                      {ex.query_title}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {ex.domain_label}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {ex.legal_only.map((cid) => (
                        <button
                          key={cid}
                          type="button"
                          onClick={() => onInspectCase(cid)}
                          className="border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer tabular-nums"
                        >
                          {cid}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {ex.general_only.map((cid) => (
                        <button
                          key={cid}
                          type="button"
                          onClick={() => onInspectCase(cid)}
                          className="border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 cursor-pointer tabular-nums"
                        >
                          {cid}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {ex.shared.length > 0 ? (
                        ex.shared.map((cid) => (
                          <button
                            key={cid}
                            type="button"
                            onClick={() => onInspectCase(cid)}
                            className="border border-border bg-muted px-1.5 py-0.5 text-[10px] hover:bg-accent cursor-pointer tabular-nums"
                          >
                            {cid}
                          </button>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top tabular-nums">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Legal: {ex.legal_precision_hits}/5 relevant
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      General: {ex.general_precision_hits}/5 relevant
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
