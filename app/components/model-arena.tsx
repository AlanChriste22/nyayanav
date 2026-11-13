import * as React from 'react'
import {
  compareModels,
  extractPatterns,
  MODELS,
  SAMPLE_QUERIES,
} from '~/lib/ildc-engine'
import { cn } from '~/lib/utils'

export interface ModelArenaProps {
  onInspectCase: (caseId: string) => void
}

export function ModelArena({ onInspectCase }: ModelArenaProps) {
  const [queryText, setQueryText] = React.useState<string>(
    SAMPLE_QUERIES[1].text,
  )
  const [selectedPreset, setSelectedPreset] = React.useState<string>(
    SAMPLE_QUERIES[1].id,
  )
  const [k, setK] = React.useState<number>(5)

  const comparison = React.useMemo(
    () => compareModels(queryText, k),
    [queryText, k],
  )
  const legalPatterns = React.useMemo(
    () => extractPatterns(comparison.legal),
    [comparison.legal],
  )
  const generalPatterns = React.useMemo(
    () => extractPatterns(comparison.general),
    [comparison.general],
  )

  const legalSet = new Set(comparison.legal.map((h) => h.case_id))
  const generalSet = new Set(comparison.general.map((h) => h.case_id))
  const overlapCount = comparison.legal.filter((h) =>
    generalSet.has(h.case_id),
  ).length

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="bg-[#1D4ED8] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase mr-2">
              03_RETRIEVE.PY &amp; 04_PATTERNS.PY
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              SIDE-BY-SIDE EMBEDDING MODEL COMPARISON ARENA
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">RANK DEPTH:</span>
            {[3, 5, 10].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setK(val)}
                className={cn(
                  'border px-2.5 py-1 text-[11px] font-semibold tabular-nums cursor-pointer',
                  k === val
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                k={val}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Query Pills */}
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_QUERIES.map((sq) => (
            <button
              key={sq.id}
              type="button"
              onClick={() => {
                setSelectedPreset(sq.id)
                setQueryText(sq.text)
              }}
              className={cn(
                'border px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors',
                selectedPreset === sq.id
                  ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )}
            >
              {sq.name} ({sq.statute_tag})
            </button>
          ))}
        </div>

        <div>
          <textarea
            rows={3}
            value={queryText}
            onChange={(e) => {
              setQueryText(e.target.value)
              setSelectedPreset('custom')
            }}
            className="w-full border border-border bg-background p-3 text-xs leading-relaxed text-foreground focus:border-[#1D4ED8] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <div>
            Overlap at Top-{k}:{' '}
            <strong className="text-foreground tabular-nums">
              {overlapCount}/{k} shared precedents
            </strong>{' '}
            ({k - overlapCount} divergent statutory hits)
          </div>
          <div>
            Click any <code>ILDC_YYYY_NNNN</code> row to inspect full judgment
            facts, arguments, and ruling.
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Legal Model Column */}
        <div className="border border-border bg-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border bg-[#1D4ED8]/10 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#1D4ED8] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  SHIPPED PRACTITIONER MODEL
                </span>
                <span className="text-xs font-bold">Model: `legal`</span>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                HF ID: <code>{MODELS.legal}</code> · 768 dims · Statutory &amp;
                Citation Weighted
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Domain &amp; Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.legal.map((r, idx) => {
                  const isUniqueToLegal = !generalSet.has(r.case_id)
                  return (
                    <tr
                      key={r.case_id}
                      onClick={() => onInspectCase(r.case_id)}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold tabular-nums align-top">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-bold text-[#1D4ED8] dark:text-blue-400 align-top">
                        {r.score.toFixed(3)}
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="font-bold text-foreground tabular-nums">
                          {r.case_id} ↗
                        </div>
                        {isUniqueToLegal && (
                          <span className="mt-1 inline-block border border-emerald-500/40 bg-emerald-500/10 px-1 py-0.2 text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-300">
                            LEGAL-ONLY HIT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {r.title}
                          </span>
                          <span className="border border-border bg-muted px-1.5 py-0.2 text-[9px] uppercase">
                            {r.domain}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {r.facts_preview.replace(/\|/g, '\\|').slice(0, 200)}
                          ...
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-border bg-muted/15 p-3.5 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              EXTRACTED CO-CITED PRECEDENTS (`legal` Top-{k})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {legalPatterns.co_cited_precedents.map(([cit, cnt]) => (
                <span
                  key={cit}
                  className="border border-border bg-background px-2 py-0.5 text-[10px] tabular-nums"
                >
                  {cit} ({cnt}x)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* General Model Column */}
        <div className="border border-border bg-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                  BASELINE GENERAL MODEL
                </span>
                <span className="text-xs font-bold">Model: `general`</span>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                HF ID: <code>{MODELS.general}</code> · 384 dims · Generic
                Sentence Embedding
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Domain &amp; Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.general.map((r, idx) => {
                  const isUniqueToGeneral = !legalSet.has(r.case_id)
                  return (
                    <tr
                      key={r.case_id}
                      onClick={() => onInspectCase(r.case_id)}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold tabular-nums align-top">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-semibold text-muted-foreground align-top">
                        {r.score.toFixed(3)}
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="font-bold text-foreground tabular-nums">
                          {r.case_id} ↗
                        </div>
                        {isUniqueToGeneral && (
                          <span className="mt-1 inline-block border border-amber-500/40 bg-amber-500/10 px-1 py-0.2 text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-300">
                            GENERAL-ONLY DRIFT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {r.title}
                          </span>
                          <span className="border border-border bg-muted px-1.5 py-0.2 text-[9px] uppercase">
                            {r.domain}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {r.facts_preview.replace(/\|/g, '\\|').slice(0, 200)}
                          ...
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-border bg-muted/15 p-3.5 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              EXTRACTED CO-CITED PRECEDENTS (`general` Top-{k})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {generalPatterns.co_cited_precedents.length > 0 ? (
                generalPatterns.co_cited_precedents.map(([cit, cnt]) => (
                  <span
                    key={cit}
                    className="border border-border bg-background px-2 py-0.5 text-[10px] tabular-nums"
                  >
                    {cit} ({cnt}x)
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  Fewer repeated citations due to cross-domain procedural drift.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
