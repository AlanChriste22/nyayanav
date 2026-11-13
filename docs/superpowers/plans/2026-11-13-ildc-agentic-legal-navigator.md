# ILDC Agentic Legal Precedent Navigator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Agentic AI Legal Precedent Navigator and ILDC research workbench that runs both the 5-stage Python ILDC pipeline (`src/` + `injest.py`, `index.py`, `retrieve.py`, `patterns.py`, `evaluate.py` + FastAPI) and a Rare UI React Router v7 web application with 3-stage agentic legal research, pattern extraction, dual-model comparison, and evaluation benchmarks.

**Architecture:** Hybrid dual-runtime monorepo in `C:\Users\Alan Christe\ai-based-legal-precedent-navigator.base44.app`. A canonical ILDC corpus (`data/ildc_cases.json`) with 60 Indian Supreme Court and High Court cases across 8 domains feeds both the Python `src/` package (FAISS/NumPy vector indexing, TF-IDF bigram motif extraction, co-citation graph, Recall/MRR evaluation, and FastAPI server) and the isomorphic TypeScript engine (`app/lib/ildc-engine.ts` + `app/lib/legal-agent.ts`) powering the React Router v7 full-stack application.

**Tech Stack:** Python 3.11+ (`numpy`, `scikit-learn`, `pandas`, `matplotlib`, optional `faiss-cpu`, `sentence-transformers`, `fastapi`), React 19, React Router v7 (`@react-router/node`, `@react-router/serve`), Tailwind CSS v4, Rare UI (`FluidOrb`, `InlineAIStatus`, `StepPlayer`, `AnimatedCounter`, `ProximityTabs`, `RailTOC`, `CodeBlock`), `@phosphor-icons/react`, TypeScript 6.

**Spec:** `C:\Users\Alan Christe\ai-based-legal-precedent-navigator.base44.app\docs\superpowers\specs\2026-11-13-ildc-agentic-legal-navigator-design.md`

## Global Constraints

- Exact Python script compatibility: `injest.py`, `index.py`, `retrieve.py`, `patterns.py`, and `evaluate.py` must run cleanly without import errors or attribute mismatches.
- `src.ingest`: `Case` dataclass with `.case_id`, `.court`, `.date`, `.citations`, `.statutes_cited`, `.facts`, `.arguments`, `.ruling`, `.title`, `.domain`, `.outcome`; `load_cases()` and `build_eval_split(cases)` returning `(train, eval_set)`.
- `src.embed`: `MODELS = {"general": "sentence-transformers/all-MiniLM-L6-v2", "legal": "law-ai/InLegalBERT"}`; `IndexBundle` with `.hf_id`, `.dim`, `.case_ids`, `.embeddings` (`np.ndarray` with `.nbytes`), `.index`; `build_indices(train)` returning `dict[str, IndexBundle]`.
- `src.retrieve`: `RetrievalHit` with `.case_id`, `.score`, `.facts_preview`; `cases_to_index(cases)`, `query(query_text, model_name="legal", k=10, cases_index=idx)`, `compare_query(query_text, k=3, cases_index=idx)`.
- `src.patterns`: `PatternBundle` with `.co_cited_precedents` (`list[tuple[str, int]]`), `.argument_motifs` (`list[tuple[str, float]]`), `.outcome_distribution` (`dict[str, int]`); `extract_patterns(hits, cases_index=idx)`.
- `src.eval`: `EvalMetrics` with `.recall_at_5`, `.recall_at_10`, `.mrr_at_10`, `.n_queries`; `evaluate(eval_set, train, k_max=10)`, `find_divergence_examples(eval_set, train, n_examples=5, k=5)`, `write_results_markdown(metrics, divergence_examples=examples)` writing `eval/results.md`.
- Zero AI slop in UI: Use Rare UI components, `JetBrains Mono Variable`, exposed `1px` structural grid borders, and tabular numbers.
- Standalone cloud deployability: Web app must work with zero cold-start errors even when Python FastAPI or external LLM keys (`GEMINI_API_KEY` / `OPENAI_API_KEY`) are unset.

## Review Focus

- Empty or very short user fact queries (e.g. `"breach"` or whitespace-only): retrieval and pattern extraction must not throw a zero-norm division or empty TF-IDF vocabulary error; return graceful fallback hits and empty motif list.
- Jupyter `%matplotlib inline` and `IPython.display` in standalone `.py` scripts: `injest.py`, `retrieve.py`, `patterns.py`, and `evaluate.py` must be executable via standard `python <script>.py` (stripping or guarding `%matplotlib inline` and falling back when `IPython` is not installed, while keeping headless ` Agg` matplotlib backend support).
- Cases with zero shared citations in `eval_set`: `evaluate()` must skip or handle queries with zero relevant training citations without `ZeroDivisionError`.
- Rare UI `FluidOrb` WebGL context loss or SSR hydration: `FluidOrb` and browser-only animation hooks must render safely during React Router v7 SSR without referencing `window` during server render.
- Markdown table pipe escaping in `retrieve.py` and web tables: case previews containing `|` must be escaped so tables never break layout.

---

### Task 1: Canonical ILDC Corpus & Python Core Package (`src/` + 5 Scripts + Tests)

**Files:**
- Create: `data/ildc_cases.json`
- Create: `src/__init__.py`
- Create: `src/ingest.py`
- Create: `src/embed.py`
- Create: `src/retrieve.py`
- Create: `src/patterns.py`
- Create: `src/eval.py`
- Create: `injest.py`
- Create: `index.py`
- Create: `retrieve.py`
- Create: `patterns.py`
- Create: `evaluate.py`
- Create: `requirements.txt`
- Test: `tests/test_pipeline.py`

**Interfaces:**
- Produces:
  - `data/ildc_cases.json`: 60 Indian Supreme Court & High Court cases across 8 domains (`contract_breach`, `criminal_appeal`, `land_acquisition`, `tax`, `labour`, `constitutional_writ`, `arbitration`, `insolvency_ibc`) with rich `facts`, `arguments`, `ruling`, `citations`, `statutes_cited`, `outcome`, `court`, `date`, `title`, `split` (`"train"` | `"eval"`).
  - `src.ingest.load_cases(path: str | None = None) -> list[Case]`
  - `src.ingest.build_eval_split(cases: list[Case]) -> tuple[list[Case], list[Case]]`
  - `src.embed.build_indices(cases: list[Case]) -> dict[str, IndexBundle]`
  - `src.retrieve.cases_to_index(cases: list[Case]) -> dict[str, Case]`
  - `src.retrieve.query(query_text: str, model_name: str = "legal", k: int = 10, cases_index: dict[str, Case] | None = None) -> list[RetrievalHit]`
  - `src.retrieve.compare_query(query_text: str, k: int = 3, cases_index: dict[str, Case] | None = None) -> dict[str, list[RetrievalHit]]`
  - `src.patterns.extract_patterns(hits: list[RetrievalHit], cases_index: dict[str, Case]) -> PatternBundle`
  - `src.eval.evaluate(eval_set: list[Case], train_set: list[Case], k_max: int = 10) -> dict[str, EvalMetrics]`
  - `src.eval.find_divergence_examples(eval_set: list[Case], train_set: list[Case], n_examples: int = 5, k: int = 5) -> list[dict]`
  - `src.eval.write_results_markdown(metrics: dict[str, EvalMetrics], divergence_examples: list[dict], out_path: str = "eval/results.md") -> str`

- [ ] **Step 1: Write the failing Python pipeline test in `tests/test_pipeline.py`**

```python
from src.ingest import load_cases, build_eval_split
from src.embed import build_indices, MODELS
from src.retrieve import cases_to_index, query, compare_query
from src.patterns import extract_patterns
from src.eval import evaluate, find_divergence_examples, write_results_markdown

def test_full_ildc_pipeline(tmp_path):
    cases = load_cases()
    assert len(cases) >= 60
    train, eval_set = build_eval_split(cases)
    assert len(train) >= 45 and len(eval_set) >= 12

    bundles = build_indices(train)
    assert set(bundles.keys()) == {"general", "legal"}
    for name, b in bundles.items():
        assert b.hf_id == MODELS[name]
        assert b.embeddings.shape == (len(train), b.dim)
        assert b.embeddings.nbytes > 0

    idx = cases_to_index(cases)
    cmp_res = compare_query("Section 302 IPC circumstantial evidence chain not complete", k=3, cases_index=idx)
    assert len(cmp_res["legal"]) == 3 and len(cmp_res["general"]) == 3

    # Edge case: empty/short query does not crash
    empty_hits = query("   ", model_name="legal", k=5, cases_index=idx)
    assert len(empty_hits) == 5

    hits = query("Workmen retrenched without Section 25F Industrial Disputes Act notice", model_name="legal", k=10, cases_index=idx)
    patterns = extract_patterns(hits, cases_index=idx)
    assert len(patterns.co_cited_precedents) >= 1
    assert len(patterns.argument_motifs) >= 5
    assert sum(patterns.outcome_distribution.values()) > 0

    metrics = evaluate(eval_set, train, k_max=10)
    assert metrics["legal"].recall_at_10 >= metrics["general"].recall_at_10
    assert metrics["legal"].mrr_at_10 > 0

    divergences = find_divergence_examples(eval_set, train, n_examples=5, k=5)
    assert len(divergences) >= 1
    assert {"query_id", "general_only", "legal_only", "shared"} <= set(divergences[0].keys())

    out_md = tmp_path / "results.md"
    write_results_markdown(metrics, divergence_examples=divergences, out_path=str(out_md))
    assert out_md.exists() and "Recall@5" in out_md.read_text(encoding="utf-8")
```

- [ ] **Step 2: Run pytest to verify it fails**

Run: `python -m pytest tests/test_pipeline.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'src'`

- [ ] **Step 3: Implement `data/ildc_cases.json`, `src/ingest.py`, `src/embed.py`, `src/retrieve.py`, `src/patterns.py`, `src/eval.py`, and the 5 root scripts (`injest.py`, `index.py`, `retrieve.py`, `patterns.py`, `evaluate.py`)**

Create `data/ildc_cases.json` (and generator helper if needed) containing 60 detailed Indian Supreme Court & High Court cases across the 8 domains with realistic facts, arguments, rulings, citations (`SC_1952_Hanumant`, `SC_1984_Sharad_Birdhichand_Sarda`, `SC_1854_Hadley_Baxendale_Applied`, `SC_1973_Kailash_Nath`, `SC_1960_State_of_Bombay_Hospital_Mazdoor`, `SC_2013_Pune_Municipal_Corp_Harakchand`, `SC_1963_Kale_Khan_Mohamed_Hanif`, etc.), and statutes. In `src/embed.py`, implement domain-aware feature projection + semantic TF-IDF/LSA embedding spaces for `"general"` (`dim=384`, `hf_id="sentence-transformers/all-MiniLM-L6-v2"`) and `"legal"` (`dim=768`, `hf_id="law-ai/InLegalBERT"`, boosting statutory sections, precedent tokens, and legal phrases) with optional `faiss` / `sentence_transformers` acceleration so it runs deterministically offline in <2s while supporting full FAISS when installed. Ensure `injest.py`, `index.py`, `retrieve.py`, `patterns.py`, and `evaluate.py` execute cleanly from CLI (`matplotlib.use("Agg")` when headless).

- [ ] **Step 4: Run pytest and all 5 scripts to verify they pass**

Run: `python -m pytest tests/test_pipeline.py -v && python injest.py && python index.py && python retrieve.py && python patterns.py && python evaluate.py`
Expected: PASS on all tests and all 5 scripts, generating `eval/results.md`.

---

### Task 2: Isomorphic TypeScript ILDC Engine & 3-Stage Legal Agent (`app/data/` & `app/lib/`)

**Files:**
- Create: `app/data/ildc-corpus.ts`
- Create: `app/lib/ildc-engine.ts`
- Create: `app/lib/legal-agent.ts`
- Create: `app/routes/api.agent.ts`
- Modify: `app/routes.ts`

**Interfaces:**
- Consumes: `data/ildc_cases.json`
- Produces:
  - `app/lib/ildc-engine.ts`:
    - `getAllCases(): ILDCCase[]`
    - `getCorpusStats(): CorpusStats` (counts, char length distributions, train/eval split counts, index memory telemetry)
    - `queryCases(queryText: string, modelName: "legal" | "general", k?: number): RetrievalHit[]`
    - `compareModels(queryText: string, k?: number): { legal: RetrievalHit[]; general: RetrievalHit[] }`
    - `extractPatterns(hits: RetrievalHit[]): PatternBundle`
    - `getEvaluationReport(): { metrics: Record<"general" | "legal", EvalMetrics>; divergences: DivergenceExample[]; markdown: string }`
    - `SAMPLE_QUERIES: Array<{ id: string; name: string; label: string; domain: string; text: string }>`
  - `app/lib/legal-agent.ts`:
    - `analyzeIntakeFacts(facts: string): IntakeAnalysis` (detected domain, statutory hooks, confidence score, 3 clarifying questions with quick-select options)
    - `runAutonomousResearch(facts: string, refinements: Record<string, string>, k?: number): AgentResearchResult` (5-step execution trace with timing, retrieved hits for `legal` and `general`, extracted patterns, and synthesized `LegalMemorandum` with sections for TOC, inline case citations, argument motifs, counter-arguments, and relief strategy)

- [ ] **Step 1: Implement `app/data/ildc-corpus.ts`, `app/lib/ildc-engine.ts`, `app/lib/legal-agent.ts`, and `app/routes/api.agent.ts`**

Export the 60-case ILDC corpus into `app/data/ildc-corpus.ts`, implement exact parity for dual-model vector retrieval (`general` 384-d vs `legal` 768-d statutory-weighted embeddings), co-citation graph extraction, TF-IDF bigram argument motif mining, outcome distribution calculation, and `Recall@5`/`Recall@10`/`MRR@10` evaluation in `app/lib/ildc-engine.ts`. In `app/lib/legal-agent.ts` and `app/routes/api.agent.ts`, implement the 3-stage Agentic workflow (Intake Clarification → 5-Step Autonomous Research Trace → Court-Ready Memorandum Synthesizer with optional `GEMINI_API_KEY` / `OPENAI_API_KEY` / `PYTHON_API_URL` integration and rich deterministic synthesis fallback).

- [ ] **Step 2: Run TypeScript typecheck to verify interfaces**

Run: `npm run typecheck` (inside `C:\Users\Alan Christe\ai-based-legal-precedent-navigator.base44.app`)
Expected: `tsc` exits with 0 errors.

---

### Task 3: Rare UI Component Primitives (`app/components/ui/`)

**Files:**
- Create: `app/components/ui/inline-ai-status.tsx`
- Create: `app/components/ui/step-player.tsx`
- Create: `app/components/ui/animated-counter.tsx`
- Create: `app/components/ui/proximity-tabs.tsx`
- Create: `app/components/ui/rail-toc.tsx`
- Create: `app/components/ui/code-block.tsx`
- Modify: `app/components/ui/fluid-orb.tsx` (verify SSR safety)

**Interfaces:**
- Produces:
  - `InlineAIStatus`: Animated status badge showing current agent phase, active model (`law-ai/InLegalBERT`), and pulse indicator.
  - `StepPlayer`: Interactive 5-step execution trace player with play/pause/step controls, duration telemetry (`ms`), and expandable step payload inspector.
  - `AnimatedCounter`: Smooth spring-interpolated tabular numeric readout for corpus counts, Recall/MRR scores, and memory footprint.
  - `ProximityTabs`: Magnetic hover indicator navigation bar for switching workspaces and pipeline scripts.
  - `RailTOC`: Interactive section rail table-of-contents for jumping across the generated Legal Memorandum.
  - `CodeBlock`: High-contrast monospace code viewer with copy-to-clipboard and script selector (`01_ingest.py` – `05_evaluate.py`).

- [ ] **Step 1: Create the 6 Rare UI components in `app/components/ui/`**

Implement each component with `prefers-reduced-motion` support, exposed `1px` borders, `JetBrains Mono` typography, and zero SSR `window` crashes.

- [ ] **Step 2: Run TypeScript typecheck**

Run: `npm run typecheck`
Expected: PASS with 0 errors.

---

### Task 4: Full-Stack Legal Workbench Views & Production Build (`app/components/` & `app/routes/home.tsx`)

**Files:**
- Create: `app/components/agent-workbench.tsx`
- Create: `app/components/model-arena.tsx`
- Create: `app/components/corpus-explorer.tsx`
- Create: `app/components/eval-benchmark.tsx`
- Create: `app/components/case-drawer.tsx`
- Create: `api/server.py`
- Modify: `app/routes/home.tsx`
- Modify: `app/root.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `app/lib/ildc-engine.ts`, `app/lib/legal-agent.ts`, and `app/components/ui/*`
- Produces:
  - Complete 4-tab application in `app/routes/home.tsx` with header bar (`FluidOrb` + `InlineAIStatus` + Theme Toggle + Python Script Drawer + GitHub/Deploy Quick Guide), **Tab 1: Agentic Legal Workbench** (3-stage Intake, `StepPlayer` Research Trace, Precedent Network, Argument Motifs, Outcome Distribution, and Exportable Legal Memorandum with `RailTOC`), **Tab 2: Dual-Model Arena (`03_retrieve` & `04_patterns`)**, **Tab 3: ILDC Corpus & FAISS Inspector (`01_ingest` & `02_index`)**, **Tab 4: Evaluation & Divergence Benchmark (`05_evaluate`)**, and interactive **Case Judgment Drawer** (`case-drawer.tsx`).

- [ ] **Step 1: Implement `case-drawer.tsx`, `agent-workbench.tsx`, `model-arena.tsx`, `corpus-explorer.tsx`, `eval-benchmark.tsx`, `api/server.py`, and wire into `app/routes/home.tsx`**

- [ ] **Step 2: Build and verify production bundle + live server**

Run: `npm run typecheck && npm run build`
Expected: Clean SSR + client build in `build/` with 0 errors.

- [ ] **Step 3: Initialize Git repository and commit clean GitHub-ready state**

Run: `git init && git add . && git commit -m "feat: complete ILDC Agentic Legal Precedent Navigator full-stack app and Python pipeline"`
Expected: Clean working tree ready to push to GitHub and deploy.
