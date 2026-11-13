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
import { AnimatedCounter } from '~/components/ui/animated-counter'
import { cn } from '~/lib/utils'

export interface AgentWorkbenchProps {
  onInspectCase: (caseId: string) => void
  onStatusChange?: (
    state: 'idle' | 'intake' | 'researching' | 'synthesizing' | 'ready',
    latencyMs?: number,
  ) => void
}

const FRIENDLY_LABELS: Record<string, string> = {
  contract_breach: 'Contract Dispute',
  criminal_appeal: 'Criminal Appeal (Sec 302)',
  land_acquisition: 'Land Acquisition',
  tax: 'Income Tax Notice',
  labour: 'Labour & Firing (Sec 25F)',
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
  const [customNote, setCustomNote] = React.useState<string>('')
  const [showAiSteps, setShowAiSteps] = React.useState<boolean>(false)

  const [intake, setIntake] = React.useState<IntakeAnalysis>(() =>
    analyzeIntakeFacts(SAMPLE_QUERIES[0].text),
  )
  const [research, setResearch] = React.useState<AgentResearchResult>(() =>
    runAutonomousResearch(SAMPLE_QUERIES[0].text, {}, 10),
  )

  const [activeStepIdx, setActiveStepIdx] = React.useState<number>(4)
  const [isPlayingTrace, setIsPlayingTrace] = React.useState<boolean>(false)
  const [copiedMemo, setCopiedMemo] = React.useState<boolean>(false)

  const selectPreset = (preset: (typeof SAMPLE_QUERIES)[number]) => {
    setSelectedPresetId(preset.id)
    setFactsInput(preset.text)
    setRefinements({})
    setCustomNote('')
    onStatusChange?.('intake', 18)
    const nextIntake = analyzeIntakeFacts(preset.text)
    setIntake(nextIntake)
    const nextRes = runAutonomousResearch(preset.text, {}, 10)
    setResearch(nextRes)
    setActiveStepIdx(4)
    setTimeout(() => onStatusChange?.('ready', 129), 180)
  }

  const runResearch = () => {
    onStatusChange?.('researching')
    setIsPlayingTrace(true)
    setActiveStepIdx(0)

    const mergedRefinements = { ...refinements }
    if (customNote.trim()) {
      mergedRefinements.counsel_note = customNote.trim()
    }

    const result = runAutonomousResearch(factsInput, mergedRefinements, 10)
    setIntake(result.intake)
    setResearch(result)

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
    }, 120)
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
    a.download = `Legal_Memo_${intake.detected_domain}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalOutcomes =
    Object.values(research.patterns.outcome_distribution).reduce(
      (a, b) => a + b,
      0,
    ) || 1

  return (
    <div className="space-y-8">
      {/* Step 1 & 2: Clean Case Input + 3 Simple Questions */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              1. Describe Your Case
            </h2>
            <p className="text-sm text-muted-foreground">
              Pick an example below or write your client&apos;s facts in plain
              language.
            </p>
          </div>
          <span className="inline-flex items-center self-start rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
            Area of Law: {intake.detected_domain_label}
          </span>
        </div>

        {/* Example Matter Pills */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((q) => {
            const active = selectedPresetId === q.id
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => selectPreset(q)}
                className={cn(
                  'rounded-lg border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer',
                  active
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {FRIENDLY_LABELS[q.id] ?? q.label}
              </button>
            )
          })}
        </div>

        {/* Two-column clean input */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Case Facts */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <label
                htmlFor="simple-facts-input"
                className="block text-xs font-semibold text-foreground"
              >
                Case Facts
              </label>
              <textarea
                id="simple-facts-input"
                rows={6}
                value={factsInput}
                onChange={(e) => {
                  setFactsInput(e.target.value)
                  setSelectedPresetId('custom')
                  setIntake(analyzeIntakeFacts(e.target.value))
                }}
                placeholder="Describe what happened, what court order is challenged, and what relief your client wants..."
                className="w-full rounded-lg border border-border bg-background p-3.5 text-sm leading-relaxed text-foreground focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
              />

              <div>
                <label
                  htmlFor="simple-custom-note"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  Any extra detail? (Optional)
                </label>
                <input
                  id="simple-custom-note"
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g., Emphasize delay in notice or missing evidence..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-[#1D4ED8] focus:outline-none"
                />
              </div>
            </div>

            <Button
              variant="cobalt"
              size="lg"
              className="w-full rounded-lg text-sm font-semibold py-5"
              onClick={runResearch}
            >
              Find Similar Cases &amp; Draft Legal Memo
            </Button>
          </div>

          {/* Right: 3 Simple Follow-up Questions */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                2. Quick Follow-up Questions (Optional)
              </h3>
              <p className="text-xs text-muted-foreground">
                Click any option that applies to sharpen your legal memo.
              </p>
            </div>

            <div className="space-y-3">
              {intake.questions.map((q, idx) => {
                const selectedAns = refinements[q.id]
                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-border bg-background p-3.5 space-y-2"
                  >
                    <p className="text-xs font-semibold text-foreground">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((opt) => {
                        const isPicked = selectedAns === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleAnswer(q.id, opt)}
                            className={cn(
                              'rounded-md border px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer',
                              isPicked
                                ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-medium'
                                : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted',
                            )}
                          >
                            {isPicked ? '✓ ' : ''}
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
      </section>

      {/* Optional collapsible AI Trace */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          3. Your Legal Research &amp; Drafted Memo
        </h2>
        <button
          type="button"
          onClick={() => setShowAiSteps((v) => !v)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {showAiSteps ? 'Hide AI Thinking Steps' : 'Show AI Thinking Steps'}
        </button>
      </div>

      {showAiSteps && (
        <StepPlayer
          steps={research.steps}
          activeStepIndex={activeStepIdx}
          onSelectStep={setActiveStepIdx}
          isPlaying={isPlayingTrace}
          onReplay={runResearch}
          className="rounded-xl overflow-hidden"
        />
      )}

      {/* Results: Left = Clean Readable Memo, Right = Similar Past Cases + Odds */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Drafted Legal Memo */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {research.memorandum.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Based on {research.legal_hits.length} similar Indian court
                judgments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={handleCopyMemo}
              >
                {copiedMemo ? 'Copied!' : 'Copy Memo'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-lg"
                onClick={handleDownloadMemo}
              >
                Download (.md)
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {research.memorandum.sections.map((sec) => (
              <article
                key={sec.id}
                className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0"
              >
                <h4 className="text-sm font-semibold text-foreground">
                  {sec.heading}
                </h4>
                <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {sec.content}
                </div>
                {sec.cited_cases.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    <span className="text-xs text-muted-foreground">
                      Read full case:
                    </span>
                    {sec.cited_cases.map((cid) => (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => onInspectCase(cid)}
                        className="rounded-md border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 px-2.5 py-0.5 font-mono text-xs font-medium text-[#1D4ED8] dark:text-blue-300 hover:bg-[#1D4ED8] hover:text-white transition-colors cursor-pointer"
                      >
                        {cid}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Win Odds + Similar Past Cases */}
        <div className="lg:col-span-4 space-y-6">
          {/* Win / Outcome Likelihood Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">
                Past Case Outcomes
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <AnimatedCounter
                  value={research.memorandum.winning_probability_pct}
                  suffix="% Favorable"
                  className="text-2xl font-bold text-[#1D4ED8] dark:text-blue-400"
                />
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                  Most common: {research.memorandum.dominant_outcome}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border">
              {Object.entries(research.patterns.outcome_distribution).map(
                ([outcome, count]) => {
                  const pct = Math.round((count / totalOutcomes) * 100)
                  return (
                    <div key={outcome} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {outcome}
                        </span>
                        <span className="text-muted-foreground">
                          {count} of {totalOutcomes} cases ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1D4ED8] dark:bg-blue-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          </div>

          {/* Similar Past Cases List */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Most Similar Past Cases
              </h3>
              <p className="text-xs text-muted-foreground">
                Click any case to read its full facts and ruling.
              </p>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {research.legal_hits.slice(0, 8).map((hit, idx) => (
                <button
                  key={hit.case_id}
                  type="button"
                  onClick={() => onInspectCase(hit.case_id)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-left hover:border-[#1D4ED8]/50 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-[#1D4ED8] dark:text-blue-300">
                      #{idx + 1} · {hit.case_id}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                      {hit.outcome}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-foreground line-clamp-2">
                    {hit.title}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {hit.court} · {hit.date}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Key Authorities Cited */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Key Supreme Court Authorities
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {research.patterns.co_cited_precedents
                .slice(0, 6)
                .map(([cit, count]) => (
                  <span
                    key={cit}
                    className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground"
                  >
                    {cit.replace(/_/g, ' ')} ({count}x)
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
