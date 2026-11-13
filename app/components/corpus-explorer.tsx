import * as React from 'react'
import { getAllCases, getCorpusStats } from '~/lib/ildc-engine'
import { AnimatedCounter } from '~/components/ui/animated-counter'
import { cn } from '~/lib/utils'

export interface CorpusExplorerProps {
  onInspectCase: (caseId: string) => void
}

export function CorpusExplorer({ onInspectCase }: CorpusExplorerProps) {
  const stats = React.useMemo(() => getCorpusStats(), [])
  const allCases = React.useMemo(() => getAllCases(), [])

  const [domainFilter, setDomainFilter] = React.useState<string>('all')
  const [splitFilter, setSplitFilter] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  const filteredCases = React.useMemo(() => {
    return allCases.filter((c) => {
      if (domainFilter !== 'all' && c.domain !== domainFilter) return false
      if (splitFilter !== 'all' && c.split !== splitFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          c.case_id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.facts.toLowerCase().includes(q) ||
          c.statutes_cited.some((s) => s.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [allCases, domainFilter, splitFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Top KPI Telemetry Strip (01_injest.py & 02_index.py) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="border border-border bg-card p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            TOTAL ILDC CASES
          </div>
          <div className="mt-1 text-2xl font-bold">
            <AnimatedCounter value={stats.total_cases} />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground tabular-nums">
            Train: {stats.train_count} · Eval: {stats.eval_count}
          </div>
        </div>

        <div className="border border-border bg-card p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            MEAN FACTS LENGTH
          </div>
          <div className="mt-1 text-2xl font-bold">
            <AnimatedCounter value={stats.avg_facts_len} suffix=" ch" />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            01_injest.py distribution
          </div>
        </div>

        <div className="border border-border bg-card p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            MEAN ARGUMENTS LEN
          </div>
          <div className="mt-1 text-2xl font-bold">
            <AnimatedCounter value={stats.avg_arguments_len} suffix=" ch" />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            TF-IDF bigram source
          </div>
        </div>

        <div className="border border-border bg-card p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            MEAN CITATIONS / CASE
          </div>
          <div className="mt-1 text-2xl font-bold">
            <AnimatedCounter value={stats.avg_citations} decimals={2} />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            3.00 – 4.00 per judgment
          </div>
        </div>

        {stats.models.map((m) => (
          <div key={m.name} className="border border-border bg-card p-3.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              FAISS INDEX: `{m.name}`
            </div>
            <div className="mt-1 text-2xl font-bold text-[#1D4ED8] dark:text-blue-400">
              <AnimatedCounter value={m.dim} suffix="d" />
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground truncate tabular-nums">
              {m.hf_id} ({m.mem_mb} MB)
            </div>
          </div>
        ))}
      </div>

      {/* Distributions Grid matching injest.py */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              FACTS LENGTH (CHARS) HISTOGRAM
            </span>
            <span className="text-[10px] text-muted-foreground">
              axes[0].hist
            </span>
          </div>
          <div className="space-y-2">
            {stats.facts_len_bins.map((b) => {
              const pct = Math.round((b.count / stats.total_cases) * 100)
              return (
                <div key={b.range} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{b.range}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {b.count} cases ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted">
                    <div
                      className="h-full bg-sky-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              ARGUMENTS LENGTH (CHARS) HISTOGRAM
            </span>
            <span className="text-[10px] text-muted-foreground">
              axes[1].hist
            </span>
          </div>
          <div className="space-y-2">
            {stats.args_len_bins.map((b) => {
              const pct = Math.round((b.count / stats.total_cases) * 100)
              return (
                <div key={b.range} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{b.range}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {b.count} cases ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              LEGAL DOMAIN COVERAGE (8 DOMAINS)
            </span>
            <span className="text-[10px] text-muted-foreground">
              ILDC Split
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {stats.domain_counts.map((d) => (
              <button
                key={d.domain}
                type="button"
                onClick={() =>
                  setDomainFilter(domainFilter === d.domain ? 'all' : d.domain)
                }
                className={cn(
                  'flex items-center justify-between border px-2.5 py-1.5 text-left text-[11px] cursor-pointer',
                  domainFilter === d.domain
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                    : 'border-border bg-background hover:bg-muted/40',
                )}
              >
                <span className="truncate">{d.domain}</span>
                <span className="tabular-nums font-bold ml-1">{d.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full Case Registry Table */}
      <div className="border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              ILDC CORPUS REGISTRY ({filteredCases.length} OF{' '}
              {stats.total_cases} CASES)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Case ID, statute, or keyword..."
              className="border border-border bg-background px-2.5 py-1 text-xs focus:border-[#1D4ED8] focus:outline-none"
            />
            {(['all', 'train', 'eval'] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSplitFilter(sp)}
                className={cn(
                  'border px-2.5 py-1 text-[10px] font-semibold uppercase cursor-pointer',
                  splitFilter === sp
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                {sp}
              </button>
            ))}
            {domainFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setDomainFilter('all')}
                className="border border-border bg-background px-2 py-1 text-[10px] uppercase hover:bg-accent cursor-pointer"
              >
                CLEAR DOMAIN ({domainFilter}) ✕
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-xs border-b border-border text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Split</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Matter Title &amp; Court</th>
                <th className="py-2.5 px-3">Statutes</th>
                <th className="py-2.5 px-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCases.map((c) => (
                <tr
                  key={c.case_id}
                  onClick={() => onInspectCase(c.case_id)}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-[#1D4ED8] dark:text-blue-400 tabular-nums whitespace-nowrap">
                    {c.case_id} ↗
                  </td>
                  <td className="py-2.5 px-3 uppercase text-[10px] tabular-nums">
                    <span
                      className={cn(
                        'border px-1.5 py-0.5',
                        c.split === 'eval'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                          : 'border-border bg-muted/40 text-muted-foreground',
                      )}
                    >
                      {c.split}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-muted-foreground whitespace-nowrap">
                    {c.domain}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-foreground">
                      {c.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {c.court} · {c.date} · Facts: {c.facts.length}c
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                    {c.statutes_cited.slice(0, 2).join('; ')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                    {c.outcome}
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
