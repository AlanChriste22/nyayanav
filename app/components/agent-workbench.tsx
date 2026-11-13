import * as React from 'react'
import { SAMPLE_QUERIES } from '~/lib/ildc-engine'
import {
  analyzeIntakeFacts,
  runAutonomousResearch,
  type AgentResearchResult,
  type IntakeAnalysis,
} from '~/lib/legal-agent'
import { Button } from '~/components/ui/button'
import { StepPlayer } from '~/components/ui/step-player'
import { RailTOC } from '~/components/ui/rail-toc'
import { AnimatedCounter } from '~/components/ui/animated-counter'
import { cn } from '~/lib/utils'

export interface AgentWorkbenchProps {
  onInspectCase: (caseId: string) => void
  onStatusChange?: (
    state: 'idle' | 'intake' | 'researching' | 'synthesizing' | 'ready',
    latencyMs?: number,
  ) => void
}

export function AgentWorkbench({
  onInspectCase,
  onStatusChange,
}: AgentWorkbenchProps) {
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>(
    SAMPLE_QUERIES[0].id,
  )
  const [factsInput, setFactsInput] = React.useState<string>(
    SAMPLE_QUERIES[0].text,
  )
  const [refinements, setRefinements] = React.useState<Record<string, string>>(
    {},
  )
  const [customAddendum, setCustomAddendum] = React.useState<string>('')
  const [topK, setTopK] = React.useState<number>(10)

  const [intake, setIntake] = React.useState<IntakeAnalysis>(() =>
    analyzeIntakeFacts(SAMPLE_QUERIES[0].text),
  )
  const [research, setResearch] = React.useState<AgentResearchResult>(() =>
    runAutonomousResearch(SAMPLE_QUERIES[0].text, {}, 10),
  )

  const [activeStepIdx, setActiveStepIdx] = React.useState<number>(4)
  const [isPlayingTrace, setIsPlayingTrace] = React.useState<boolean>(false)
  const [activeMemoSectionId, setActiveMemoSectionId] = React.useState<string>(
    'questions-presented',
  )
  const [copiedMemo, setCopiedMemo] = React.useState<boolean>(false)

  const selectPreset = (preset: (typeof SAMPLE_QUERIES)[number]) => {
    setSelectedPresetId(preset.id)
    setFactsInput(preset.text)
    setRefinements({})
    setCustomAddendum('')
    onStatusChange?.('intake', 18)
    const nextIntake = analyzeIntakeFacts(preset.text)
    setIntake(nextIntake)
    const nextRes = runAutonomousResearch(preset.text, {}, topK)
    setResearch(nextRes)
    setActiveStepIdx(4)
    setTimeout(() => onStatusChange?.('ready', 129), 180)
  }

  const handleAnalyzeIntake = () => {
    onStatusChange?.('intake', 18)
    const nextIntake = analyzeIntakeFacts(factsInput)
    setIntake(nextIntake)
  }

  const executeFullAgentResearch = () => {
    onStatusChange?.('researching')
    setIsPlayingTrace(true)
    setActiveStepIdx(0)

    const mergedRefinements = { ...refinements }
    if (customAddendum.trim()) {
      mergedRefinements.counsel_note = customAddendum.trim()
    }

    const result = runAutonomousResearch(factsInput, mergedRefinements, topK)
    setIntake(result.intake)
    setResearch(result)

    // Animate step player progression
    let step = 0
    const interval = setInterval(() => {
      step += 1
      if (step < result.steps.length) {
        setActiveStepIdx(step)
        if (step === 3) onStatusChange?.('synthesizing')
      } else {
        clearInterval(interval)
        setIsPlayingTrace(false)
        const totalMs = result.steps.reduce((a, b) => a + b.duration_ms, 0)
        onStatusChange?.('ready', totalMs)
      }
    }, 140)
  }

  const toggleAnswer = (questionId: string, option: string) => {
    setRefinements((prev) => {
      const next = { ...prev }
      if (next[questionId] === option) {
        delete next[questionId]
      } else {
        next[questionId] = option
      }
      return next
    })
  }

  const handleCopyMemo = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(research.memorandum.full_markdown)
      setCopiedMemo(true)
      setTimeout(() => setCopiedMemo(false), 1800)
    }
  }

  const handleDownloadMemo = () => {
    if (typeof window === 'undefined') return
    const blob = new Blob([research.memorandum.full_markdown], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ILDC_Legal_Memo_${intake.detected_domain}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const scrollToSection = (secId: string) => {
    setActiveMemoSectionId(secId)
    if (typeof document !== 'undefined') {
      const el = document.getElementById(`memo-sec-${secId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const totalOutcomes =
    Object.values(research.patterns.outcome_distribution).reduce(
      (a, b) => a + b,
      0,
    ) || 1

  return (
    <div className="space-y-6">
      {/* Preset Case Matters Strip */}
      <div className="border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#1D4ED8] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
              STAGE 01
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider">
              MATTER BRIEF INTAKE & INTERACTIVE FACT REFINEMENT
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Select a benchmark query from <code>retrieve.py</code> or enter
            custom client facts
          </span>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {SAMPLE_QUERIES.map((q) => {
            const active = selectedPresetId === q.id
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => selectPreset(q)}
                className={cn(
                  'flex flex-col justify-between border p-2.5 text-left transition-colors cursor-pointer',
                  active
                    ? 'border-[#1D4ED8] bg-[#1D4ED8]/10 text-foreground'
                    : 'border-border bg-background hover:bg-muted/40 text-muted-foreground',
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase text-foreground">
                    {q.name}
                  </span>
                  <span className="border border-border bg-muted/50 px-1 py-0.2 text-[9px] tabular-nums">
                    {q.statute_tag}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] leading-snug line-clamp-2">
                  {q.label}
                </div>
              </button>
            )
          })}
        </div>

        {/* Fact Editor & Intake Clarification Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3 border border-border bg-background p-3.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="lawyer-facts-input"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  CLIENT FACT NARRATIVE / APPELLATE GROUNDS
                </label>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {factsInput.length} chars
                </span>
              </div>
              <textarea
                id="lawyer-facts-input"
                rows={5}
                value={factsInput}
                onChange={(e) => {
                  setFactsInput(e.target.value)
                  setSelectedPresetId('custom')
                }}
                placeholder="Paste raw client facts, lower court findings, or statutory challenge..."
                className="w-full border border-border bg-muted/20 p-3 text-xs leading-relaxed text-foreground focus:border-[#1D4ED8] focus:outline-none"
              />

              <div className="pt-1">
                <label
                  htmlFor="lawyer-addendum-input"
                  className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  ADDITIONAL COUNSEL INSTRUCTIONS / PROCEDURAL NOTES (OPTIONAL)
                </label>
                <input
                  id="lawyer-addendum-input"
                  type="text"
                  value={customAddendum}
                  onChange={(e) => setCustomAddendum(e.target.value)}
                  placeholder="e.g., Emphasize hostile panch witnesses and delay in FIR registration..."
                  className="w-full border border-border bg-muted/20 px-2.5 py-1.5 text-xs text-foreground focus:border-[#1D4ED8] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  TOP-K:
                </span>
                {[5, 10, 15].map((kVal) => (
                  <button
                    key={kVal}
                    type="button"
                    onClick={() => setTopK(kVal)}
                    className={cn(
                      'border px-2 py-0.5 text-[11px] tabular-nums cursor-pointer',
                      topK === kVal
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                        : 'border-border bg-background text-muted-foreground',
                    )}
                  >
                    k={kVal}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeIntake}
                >
                  DETECT ISSUES
                </Button>
                <Button
                  variant="cobalt"
                  size="sm"
                  onClick={executeFullAgentResearch}
                >
                  RUN AGENTIC RESEARCH & DRAFT MEMO
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Agent Fact-Refinement Follow-Up Questions */}
          <div className="lg:col-span-7 border border-border bg-background p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  AGENT FACT-REFINEMENT INTERROGATOR ·{' '}
                </span>
                <span className="text-[11px] font-bold text-[#1D4ED8] dark:text-blue-400">
                  {intake.detected_domain_label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-border bg-muted/40 px-2 py-0.5 text-[10px] tabular-nums">
                  FACT COMPLETENESS:{' '}
                  <strong>
                    {Math.min(
                      100,
                      intake.completeness_score +
                        Object.keys(refinements).length * 12,
                    )}
                    %
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {intake.statutory_hooks.map((st) => (
                <span
                  key={st}
                  className="border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-foreground"
                >
                  § {st}
                </span>
              ))}
            </div>

            <div className="space-y-2.5">
              {intake.questions.map((q, qIdx) => {
                const selectedAns = refinements[q.id]
                return (
                  <div
                    key={q.id}
                    className="border border-border bg-muted/15 p-2.5 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        Q{qIdx + 1}. {q.question}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Why it matters: {q.why_it_matters}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {q.options.map((opt) => {
                        const isPicked = selectedAns === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleAnswer(q.id, opt)}
                            className={cn(
                              'border px-2 py-1 text-[10px] text-left transition-colors cursor-pointer',
                              isPicked
                                ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-medium'
                                : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50',
                            )}
                          >
                            {isPicked ? '✓ ' : '+ '}
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stage 2: Rare UI StepPlayer Autonomous Multi-Step Research Trace */}
      <StepPlayer
        steps={research.steps}
        activeStepIndex={activeStepIdx}
        onSelectStep={setActiveStepIdx}
        isPlaying={isPlayingTrace}
        onReplay={executeFullAgentResearch}
      />

      {/* Stage 3: Legal Memorandum + Precedent & Pattern Telemetry */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left/Center: Court-Ready Legal Memorandum + RailTOC */}
        <div className="xl:col-span-8 space-y-4">
          <div className="border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    STAGE 03
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    {research.memorandum.title}
                  </h3>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Synthesized from Top-{research.legal_hits.length} ILDC cases (
                  <code>law-ai/InLegalBERT</code>) &amp;{' '}
                  {research.patterns.co_cited_precedents.length} co-cited
                  Supreme Court authorities
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyMemo}>
                  {copiedMemo ? 'MEMO COPIED' : 'COPY MARKDOWN'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadMemo}
                >
                  EXPORT .MD
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-12 lg:divide-x lg:divide-y-0">
              {/* Rail TOC Navigation */}
              <div className="lg:col-span-4 p-3 bg-muted/10">
                <RailTOC
                  items={research.memorandum.sections.map((s) => ({
                    id: s.id,
                    heading: s.heading,
                    badge: `${s.cited_cases.length}`,
                  }))}
                  activeId={activeMemoSectionId}
                  onSelect={scrollToSection}
                  className="border-0 bg-transparent p-0"
                />

                {/* Key Outcome Metric Box inside Rail */}
                <div className="mt-4 border border-border bg-background p-3 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    EMPIRICAL RELIEF INDEX
                  </div>
                  <div className="flex items-baseline justify-between">
                    <AnimatedCounter
                      value={research.memorandum.winning_probability_pct}
                      suffix="%"
                      className="text-2xl font-bold text-[#1D4ED8] dark:text-blue-400"
                    />
                    <span className="border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                      MODAL: {research.memorandum.dominant_outcome}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Computed from disposition ratios across retrieved ILDC
                    precedents in this cluster.
                  </p>
                </div>
              </div>

              {/* Memo Content Body */}
              <div className="lg:col-span-8 p-5 space-y-6">
                {research.memorandum.sections.map((sec) => (
                  <article
                    key={sec.id}
                    id={`memo-sec-${sec.id}`}
                    className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {sec.heading}
                    </h4>
                    <div className="whitespace-pre-line text-xs leading-relaxed text-foreground/90 max-w-[70ch]">
                      {sec.content}
                    </div>
                    {sec.cited_cases.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Examine Precedent:
                        </span>
                        {sec.cited_cases.map((cid) => (
                          <button
                            key={cid}
                            type="button"
                            onClick={() => onInspectCase(cid)}
                            className="border border-[#1D4ED8]/50 bg-[#1D4ED8]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8] dark:text-blue-300 hover:bg-[#1D4ED8] hover:text-white transition-colors cursor-pointer tabular-nums"
                          >
                            {cid} ↗
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning Pattern Extraction (04_patterns.py) */}
        <div className="xl:col-span-4 space-y-4">
          {/* Outcome Distribution */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                OUTCOME DISTRIBUTION (TOP-{research.legal_hits.length})
              </span>
              <span className="text-[10px] text-muted-foreground">
                04_patterns.py
              </span>
            </div>
            <div className="space-y-2">
              {Object.entries(research.patterns.outcome_distribution).map(
                ([outcome, count]) => {
                  const pct = Math.round((count / totalOutcomes) * 100)
                  return (
                    <div key={outcome} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{outcome}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {count} cases ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-[#1D4ED8] dark:bg-blue-400 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          </div>

          {/* Co-Cited Precedents (appearing in 2+ retrieved cases) */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                CO-CITED ANCHOR PRECEDENTS (2+ CASES)
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {research.patterns.co_cited_precedents.length} AUTHORITIES
              </span>
            </div>
            <div className="divide-y divide-border border border-border">
              {research.patterns.co_cited_precedents
                .slice(0, 8)
                .map(([cit, count]) => {
                  const isInternal = cit.startsWith('ILDC_')
                  return (
                    <div
                      key={cit}
                      className="flex items-center justify-between px-3 py-2 text-xs bg-background"
                    >
                      {isInternal ? (
                        <button
                          type="button"
                          onClick={() => onInspectCase(cit)}
                          className="font-semibold text-[#1D4ED8] dark:text-blue-300 hover:underline cursor-pointer text-left truncate"
                        >
                          {cit} ↗
                        </button>
                      ) : (
                        <span className="font-medium text-foreground truncate">
                          {cit}
                        </span>
                      )}
                      <span className="shrink-0 border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                        {count}x cited
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Top Argument Motifs (TF-IDF Bigrams) */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                ARGUMENT MOTIFS (TF-IDF BIGRAMS)
              </span>
              <span className="text-[10px] text-muted-foreground">TOP 12</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {research.patterns.argument_motifs
                .slice(0, 12)
                .map(([motif, score]) => (
                  <div
                    key={motif}
                    className="flex items-center justify-between border border-border bg-background px-2.5 py-1.5 text-[11px]"
                  >
                    <span className="font-medium truncate">{motif}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums ml-1">
                      {score.toFixed(3)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Retrieved ILDC Cases List */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                RETRIEVED ILDC CASES (`legal` MODEL)
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                k={research.legal_hits.length}
              </span>
            </div>
            <div className="divide-y divide-border border border-border max-h-72 overflow-y-auto">
              {research.legal_hits.map((hit, idx) => (
                <button
                  key={hit.case_id}
                  type="button"
                  onClick={() => onInspectCase(hit.case_id)}
                  className="flex w-full items-center justify-between gap-2 bg-background px-3 py-2 text-left text-xs hover:bg-muted/50 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-[#1D4ED8] dark:text-blue-300 tabular-nums">
                        {hit.case_id}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        [{hit.outcome}]
                      </span>
                    </div>
                    <div className="truncate text-[11px] text-foreground/80">
                      {hit.title}
                    </div>
                  </div>
                  <span className="shrink-0 border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                    {hit.score.toFixed(3)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
