import * as React from 'react'
import { cn } from '~/lib/utils'

export interface CodeScriptItem {
  id: string
  filename: string
  title: string
  code: string
}

export const PIPELINE_SCRIPTS: CodeScriptItem[] = [
  {
    id: '01_injest',
    filename: 'injest.py',
    title: '01 — Explore the ILDC Corpus',
    code: `# 01 — Explore the ILDC corpus
import sys
sys.path.insert(0, '..')
import matplotlib.pyplot as plt
import pandas as pd
from src.ingest import load_cases, build_eval_split

cases = load_cases()
print(f"Loaded {len(cases)} cases")

df = pd.DataFrame([{
    'case_id': c.case_id,
    'facts_len': len(c.facts),
    'arguments_len': len(c.arguments),
    'ruling_len': len(c.ruling),
    'n_citations': len(c.citations),
    'n_statutes': len(c.statutes_cited),
} for c in cases])
df.describe()

train, eval_set = build_eval_split(cases)
print(f"Train: {len(train)}    Eval: {len(eval_set)}")`,
  },
  {
    id: '02_index',
    filename: 'index.py',
    title: '02 — Build FAISS Indices (General vs Legal)',
    code: `# 02 — Build FAISS indices with two embedding models
import sys
sys.path.insert(0, '..')
from src.ingest import load_cases, build_eval_split
from src.embed import build_indices, MODELS

cases = load_cases()
train, eval_set = build_eval_split(cases)
print(f"Indexing {len(train)} training cases against {len(eval_set)} held out.")

bundles = build_indices(train)
for name, b in bundles.items():
    mem_mb = b.embeddings.nbytes / (1024 * 1024)
    print(f"{name:8s}  hf_id={b.hf_id}  dim={b.dim}  N={len(b.case_ids)}  mem={mem_mb:.1f} MB")`,
  },
  {
    id: '03_retrieve',
    filename: 'retrieve.py',
    title: '03 — Retrieve Similar Cases Across Models',
    code: `# 03 — Retrieve similar cases for sample queries
import sys
sys.path.insert(0, '..')
from src.ingest import load_cases
from src.retrieve import compare_query, cases_to_index

cases = load_cases()
idx = cases_to_index(cases)

def show_results(name: str, query_text: str, k: int = 3):
    results = compare_query(query_text, k=k, cases_index=idx)
    for model_name, hits in results.items():
        for rank, r in enumerate(hits, 1):
            print(f"{model_name} | #{rank} | {r.score:.3f} | {r.case_id}")`,
  },
  {
    id: '04_patterns',
    filename: 'patterns.py',
    title: '04 — Reasoning Pattern & Motif Extraction',
    code: `# 04 — Reasoning pattern extraction
import sys
sys.path.insert(0, '..')
from src.ingest import load_cases
from src.retrieve import query as do_query, cases_to_index
from src.patterns import extract_patterns

cases = load_cases()
idx = cases_to_index(cases)

hits = do_query(query_text, model_name="legal", k=10, cases_index=idx)
patterns = extract_patterns(hits, cases_index=idx)
# patterns.co_cited_precedents -> [(precedent_id, count), ...]
# patterns.argument_motifs     -> [(bigram_motif, mean_tfidf), ...]
# patterns.outcome_distribution -> {'Allowed': 6, 'Partly Allowed': 2, ...}`,
  },
  {
    id: '05_evaluate',
    filename: 'evaluate.py',
    title: '05 — Evaluate Recall@K, MRR@10 & Divergences',
    code: `# 05 — Evaluate both models and write results
import sys
sys.path.insert(0, '..')
from src.ingest import load_cases, build_eval_split
from src.eval import evaluate, write_results_markdown, find_divergence_examples

cases = load_cases()
train, eval_set = build_eval_split(cases)
metrics = evaluate(eval_set, train, k_max=10)
for name, m in metrics.items():
    print(f"{name:8s}  R@5={m.recall_at_5:.3f}  R@10={m.recall_at_10:.3f}  MRR@10={m.mrr_at_10:.3f}")

examples = find_divergence_examples(eval_set, train, n_examples=5, k=5)
write_results_markdown(metrics, divergence_examples=examples)`,
  },
]

export interface CodeBlockProps {
  initialScriptId?: string
  className?: string
}

export function CodeBlock({
  initialScriptId = '01_injest',
  className,
}: CodeBlockProps) {
  const [activeId, setActiveId] = React.useState(initialScriptId)
  const [copied, setCopied] = React.useState(false)

  const current =
    PIPELINE_SCRIPTS.find((s) => s.id === activeId) ?? PIPELINE_SCRIPTS[0]

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(current.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div
      data-slot="code-block"
      className={cn('border border-border bg-card text-xs', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {PIPELINE_SCRIPTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer border',
                s.id === activeId
                  ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )}
            >
              {s.filename}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {current.title}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="border border-border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider hover:bg-accent cursor-pointer"
          >
            {copied ? 'COPIED' : 'COPY PYTHON'}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-foreground/90 bg-muted/15">
        <code>{current.code}</code>
      </pre>
    </div>
  )
}
