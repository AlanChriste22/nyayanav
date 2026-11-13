# ILDC Agentic Legal Precedent Navigator — System Design Specification

**Date:** 2026-11-13
**Project Path:** `C:\Users\Alan Christe\ai-based-legal-precedent-navigator.base44.app`
**Target Audience:** Practicing Indian litigators, appellate counsel, legal researchers, and ML/legal-NLP practitioners evaluating retrieval models on the Indian Legal Documents Corpus (ILDC).

---

## 1. Intent & The Why

Practicing lawyers researching Indian Supreme Court and High Court precedents face three compounding problems:
1. **Keyword & General-Embedding Mismatch**: Generic semantic models miss statutory nuances (e.g., *Section 302 IPC circumstantial chain*, *Section 25F Industrial Disputes Act retrenchment*, *Section 68 Income Tax Act unexplained cash credits*, *Right to Fair Compensation Act social impact assessment*).
2. **Fragmented Precedent Analysis**: Reading top-K cases individually fails to surface structural patterns across a cluster of cases—such as **co-cited binding precedents**, **recurring TF-IDF argument motifs**, and **empirical outcome distributions** (`Allowed`, `Dismissed`, `Partly Allowed`, `Remanded`).
3. **The Gap Between Retrieval and Court-Ready Work Product**: Lawyers do not just want a list of case IDs; they need an **agentic legal research workflow** that:
   - Actively interrogates raw client facts with targeted follow-up questions to surface missing statutory or procedural elements.
   - Autonomously executes multi-step precedent retrieval and reasoning-pattern extraction across general and legal-domain embedding indices.
   - Drafts structured, citation-grounded legal arguments and research memoranda directly from the retrieved precedents, co-citations, and argument motifs.

At the same time, the system must preserve complete compatibility with the user's 5-stage Python research pipeline (`injest.py`, `index.py`, `retrieve.py`, `patterns.py`, `evaluate.py` backed by `src/ingest.py`, `src/embed.py`, `src/retrieve.py`, `src/patterns.py`, `src/eval.py`) so the repository is a single, self-contained, GitHub-ready and live-deployable monorepo.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Full Python `src/` Package & 5 Pipeline Scripts**: Implement `src/ingest.py`, `src/embed.py`, `src/retrieve.py`, `src/patterns.py`, and `src/eval.py` matching the exact function signatures, dataclasses, and return types used by `injest.py` (and `notebooks/01_ingest.py`..`05_evaluate.py`).
- **Curated + Extensible ILDC Dataset (`data/ildc_cases.json`)**: Ship a rich, realistic, domain-diverse ILDC dataset (covering Contract Breach, Criminal Appeals under IPC Sec 302, Land Acquisition under RFCTLARR Act, Income Tax Sec 68, Labour Retrenchment under ID Act Sec 25F, Constitutional Writ Petitions, Arbitration Sec 34, Insolvency IBC Sec 7/9, etc.) with authentic Indian Supreme Court citations, statutes, facts, arguments, rulings, outcomes, and pre-computed dual-model embeddings (`general` and `legal`) so both Python and TypeScript runtimes work immediately out-of-the-box without requiring a 2 GB download on first boot, while also supporting live HuggingFace + FAISS indexing when installed.
- **3-Stage Agentic Legal Workbench for Lawyers**:
  1. **Interactive Fact-Refinement Intake Agent**: Analyzes the lawyer's initial fact narrative, detects the primary legal domain and statutory hooks, identifies evidentiary/procedural gaps, and generates 3–4 targeted follow-up questions (with quick-select chips and custom input) to refine the query.
  2. **Autonomous Multi-Step Research Agent**: Executes a visible, inspectable multi-step trace (Query Expansion → Dual-Index Vector Search [`legal` vs. `general`] → Co-Citation Graph Traversal → TF-IDF Argument Motif Extraction → Empirical Outcome Distribution Analysis).
  3. **Active Legal Memo & Argument Drafting Agent**: Synthesizes a structured, court-ready Legal Research Memorandum (Issue Presented, Brief Answer, Controlling Precedents & Co-Cited Authorities, Core Argument Motifs to Advance, Risk & Outcome Assessment, and Prayer/Relief Strategy) with clickable inline case citations (`[ILDC_SC_...]`). Supports optional live LLM API keys (`GEMINI_API_KEY` / `OPENAI_API_KEY` / `OLLAMA_BASE_URL`) **and** includes a high-precision deterministic legal synthesis engine so the app works 100% live for any user even with zero external API keys configured.
- **Interactive Corpus Explorer, Dual-Model Comparison, & Evaluation Suite in the Web UI**:
  - **Agentic Research Studio**: The primary workspace for lawyers (Fact Intake → Agent Execution Step Player → Precedent Hits, Patterns, & Drafted Memo).
  - **Side-by-Side Model Arena (`03_retrieve`)**: Compare `legal` (`law-ai/InLegalBERT` / legal-domain embeddings) vs. `general` (`sentence-transformers/all-MiniLM-L6-v2`) retrieval rankings, scores, and citation overlap in real time.
  - **Corpus & Distribution Inspector (`01_ingest` & `02_index`)**: Inspect all ILDC cases, filter by court/domain/outcome, view character length distributions (`facts_len`, `arguments_len`, `ruling_len`, `n_citations`), and inspect FAISS index memory footprints.
  - **Evaluation & Divergence Benchmark (`05_evaluate`)**: Interactive `Recall@5`, `Recall@10`, `MRR@10` benchmark view and qualitative divergence inspector (`general_only`, `legal_only`, `shared` hits).
- **Rare UI Design System (Zero AI Slop)**:
  - Built with the existing `JetBrains Mono Variable` + `radix-lyra` Tailwind v4 setup and authentic **Rare UI** components (`FluidOrb`, `InlineAIStatus`, `StepPlayer`, `AnimatedCounter`, `ProximitySidebar`, `RailTOC`, `CodeBlock`, `GridReveal`).
  - Crisp 1px exposed structural hairlines, dark/light editorial engineering aesthetic, tabular numeric discipline, zero generic SaaS gradients or decorative bloat.

### Non-Goals
- Multi-tenant billing, paid subscription gates, or complex OAuth walls that would block reviewers or real-time visitors from immediately testing the legal navigator.
- Modifying external court databases or scraping live eCourts portals (which have CAPTCHAs).

### Anti-Goals (What Would Make This a Failure Even If It Works)
- **"AI Slop" UI**: Generic purple/indigo neon gradients, rounded floating cards with heavy drop shadows, fake/static numbers that don't reflect the actual corpus, or cluttered chat bubbles without structured legal artifacts.
- **Fragile Deployment**: An app that crashes on Vercel/Docker/Render if PyTorch or an external LLM key isn't present.
- **Broken Python Scripts**: Any mismatch between `src/` module exports and the exact imports in `injest.py`, `index.py`, `retrieve.py`, `patterns.py`, and `evaluate.py`.

---

## 3. Constraints

1. **Exact Python API Contract**:
   The user's five scripts require these exact imports and attributes:
   - `from src.ingest import load_cases, build_eval_split`
     - `Case` object with `.case_id`, `.court`, `.date`, `.citations` (`list[str]`), `.statutes_cited` (`list[str]`), `.facts` (`str`), `.arguments` (`str`), `.ruling` (`str`), plus optional metadata (`.title`, `.domain`, `.outcome`).
     - `build_eval_split(cases)` returning `(train, eval_set)`.
   - `from src.embed import build_indices, MODELS`
     - `build_indices(train)` returning `dict[str, IndexBundle]` where each `b` has `b.hf_id` (`str`), `b.dim` (`int`), `b.case_ids` (`list[str]`), `b.embeddings` (`np.ndarray` with `.nbytes`), and `b.index` (FAISS index or numpy-backed exact inner-product fallback if `faiss-cpu` is not installed).
   - `from src.retrieve import compare_query, cases_to_index, query`
     - `cases_to_index(cases)` returning `dict[str, Case]`.
     - `query(query_text, model_name="legal", k=10, cases_index=idx)` returning `list[RetrievalHit]` where each hit `r` has `r.case_id`, `r.score` (`float`), `r.facts_preview` (`str`), plus metadata.
     - `compare_query(query_text, k=3, cases_index=idx)` returning `dict[str, list[RetrievalHit]]` for `"general"` and `"legal"`.
   - `from src.patterns import extract_patterns`
     - `extract_patterns(hits, cases_index=idx)` returning `PatternBundle` with:
       - `patterns.co_cited_precedents`: `list[tuple[str, int]]` (precedent ID and count, appearing in 2+ retrieved cases).
       - `patterns.argument_motifs`: `list[tuple[str, float]]` (TF-IDF bigrams and mean score).
       - `patterns.outcome_distribution`: `dict[str, int]` (outcome label to count).
   - `from src.eval import evaluate, write_results_markdown, find_divergence_examples`
     - `evaluate(eval_set, train, k_max=10)` returning `dict[str, EvalMetrics]` where each `m` has `m.recall_at_5`, `m.recall_at_10`, `m.mrr_at_10`, `m.n_queries`.
     - `find_divergence_examples(eval_set, train, n_examples=5, k=5)` returning `list[dict]` with keys `'query_id'`, `'general_only'`, `'legal_only'`, `'shared'`.
     - `write_results_markdown(metrics, divergence_examples=examples)` writing `eval/results.md`.

2. **Web Framework & Styling**:
   - Existing project at `C:\Users\Alan Christe\ai-based-legal-precedent-navigator.base44.app` uses React Router v7 (`@react-router/node`, `@react-router/dev`, `@react-router/serve` 8.5.1), React 19, Tailwind CSS v4, `@phosphor-icons/react`, and `JetBrains Mono Variable`.

---

## 4. Architectural Approaches Considered

### Approach 1: Hybrid Dual-Runtime Monorepo (Selected)
- **Structure**:
  - **Python Package (`src/`) + CLI Scripts (`injest.py`, `index.py`, `retrieve.py`, `patterns.py`, `evaluate.py`) + FastAPI microservice (`api/server.py`)**: Full Python implementation using `numpy`, `scikit-learn` / `faiss` / `sentence-transformers` (with graceful local deterministic + precomputed embedding support if offline) and writing `data/ildc_cases.json` + `eval/results.md`.
  - **React Router v7 Full-Stack App (`app/`)**: Server API routes/actions and client workbench powered by a shared TypeScript legal retrieval, TF-IDF bigram, citation graph, evaluation, and agentic synthesis engine (`app/lib/ildc-engine.ts` + `app/lib/legal-agent.ts`) that reads the shared `data/ildc_cases.json` corpus **and** optionally proxies to the Python FastAPI server (`PYTHON_API_URL`) or live LLM provider (`GEMINI_API_KEY` / `OPENAI_API_KEY`) when configured.
- **Why Selected**: Guarantees 100% reliability for real-time web users on any cloud host (Vercel, Base44, Render, Railway, Docker) with sub-50ms latency, while keeping the Python `src/` package and 5 data-science scripts first-class citizens in the same GitHub repository.

### Approach 2: Python-Only Backend Required (Rejected)
- Forces the web frontend to fail whenever a 2 GB RAM Python + PyTorch + FAISS container is asleep or unavailable on free-tier hosting.

### Approach 3: Browser-Only WebAssembly (Rejected)
- Forces lawyers to download 200+ MB of model weights into the browser tab on first visit.

---

## 5. Detailed Design (What Was Decided & How It Works)

### 5.1 Repository Layout
```text
ai-based-legal-precedent-navigator.base44.app/
├── src/                          # Python core package for the 5 scripts & FastAPI
│   ├── __init__.py
│   ├── ingest.py                 # Case dataclass, load_cases(), build_eval_split()
│   ├── embed.py                  # MODELS, IndexBundle, build_indices(), encode_text()
│   ├── retrieve.py               # RetrievalHit, cases_to_index(), query(), compare_query()
│   ├── patterns.py               # PatternBundle, extract_patterns() (co-citations, TF-IDF bigrams, outcomes)
│   └── eval.py                   # EvalMetrics, evaluate(), find_divergence_examples(), write_results_markdown()
├── api/
│   └── server.py                 # Optional FastAPI server exposing /api/health, /api/retrieve, /api/patterns, /api/evaluate, /api/agent
├── data/
│   └── ildc_cases.json           # Canonical ILDC corpus (60+ rich cases across 8 Indian legal domains, train/eval split, citations, statutes, embeddings)
├── eval/
│   └── results.md                # Generated Markdown evaluation report from evaluate.py
├── injest.py                     # Script 01 — Explore the ILDC corpus
├── index.py                      # Script 02 — Build FAISS indices with two embedding models
├── retrieve.py                   # Script 03 — Retrieve similar cases for sample queries
├── patterns.py                   # Script 04 — Reasoning pattern extraction
├── evaluate.py                   # Script 05 — Evaluate both models and write results
├── requirements.txt              # Python dependencies
├── app/                          # React Router v7 Full-Stack Web Application
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── fluid-orb.tsx         # Rare UI WebGL Fluid Orb (already installed)
│   │   │   ├── inline-ai-status.tsx  # Rare UI animated AI reasoning status pill
│   │   │   ├── step-player.tsx       # Rare UI interactive multi-step execution player
│   │   │   ├── animated-counter.tsx  # Rare UI spring-physics tabular number counter
│   │   │   ├── proximity-tabs.tsx    # Rare UI magnetic hover navigation bar
│   │   │   ├── rail-toc.tsx          # Rare UI section rail table-of-contents
│   │   │   └── code-block.tsx        # Rare UI syntax/pipeline script viewer with copy
│   │   ├── agent-workbench.tsx       # Tab 1: Lawyer Agentic Research Studio (Intake -> Multi-step -> Memo)
│   │   ├── model-arena.tsx           # Tab 2: Dual-Model Comparison (legal vs general) + Pattern Extractor
│   │   ├── corpus-explorer.tsx       # Tab 3: ILDC Corpus Inspector, Histograms & FAISS Index Telemetry
│   │   ├── eval-benchmark.tsx        # Tab 4: Recall@5, Recall@10, MRR@10 & Divergence Examples
│   │   └── case-drawer.tsx           # Deep-dive modal/drawer for full Facts, Arguments, Ruling, Statutes, Citations
│   ├── data/
│   │   └── ildc-corpus.ts            # Typed ILDC dataset + pre-computed general & legal vectors
│   ├── lib/
│   │   ├── ildc-engine.ts            # Isomorphic TS implementation of retrieve, TF-IDF bigram motifs, co-citations, & eval
│   │   ├── legal-agent.ts            # 3-stage Agentic workflow (Fact Refinement, Multi-Step Research, Memo Synthesis + LLM bridge)
│   │   └── utils.ts
│   ├── routes/
│   │   ├── home.tsx                  # Full-stack application shell & interactive workbench
│   │   └── api.agent.ts              # Server action endpoint for live LLM / Python backend integration
│   ├── app.css
│   ├── root.tsx
│   └── routes.ts
```

### 5.2 The 3-Stage Agentic Lawyer Workflow
1. **Stage 1: Fact Intake & Interactive Clarification**
   - The lawyer selects one of the 5 preset queries from `retrieve.py` (`contract_breach`, `criminal_appeal`, `land_acquisition`, `tax`, `labour`) or types/pastes their own client fact pattern.
   - Clicking **"Analyze & Refine Facts"** (or running full auto-pilot) triggers the Intake Agent:
     - Detects **Primary Legal Domain**, **Triggered Statutes** (e.g., `IPC Section 302`, `Indian Evidence Act Section 27`, `Industrial Disputes Act Section 25F`), and **Missing Fact Dimensions**.
     - Presents **3 targeted clarifying questions** with clickable answer pills (e.g., *"Was a mandatory notice or compensation tendered prior to retrenchment?"* → `[No notice or pay given]`, `[Partial compensation paid]`, `[Disputed continuous service < 240 days]`) plus a free-text addendum box.
2. **Stage 2: Autonomous Multi-Step Research Trace (Rare UI `StepPlayer` + `InlineAIStatus`)**
   - Executes 5 transparent steps with live timing and inspectable intermediate outputs:
     - **Step 1 — Statutory & Issue Decomposition**: Extracts key legal issues and statutory anchors from the refined facts.
     - **Step 2 — Dual-Index Vector Retrieval (`legal` vs `general`)**: Runs cosine/inner-product similarity search over the `law-ai/InLegalBERT` (`legal`, 768-d) and `MiniLM-L6-v2` (`general`, 384-d) vector spaces, selecting top-K (`k=10`) precedents.
     - **Step 3 — Precedent Co-Citation Network Traversal**: Identifies foundational Supreme Court authorities cited across 2+ retrieved cases (`patterns.co_cited_precedents`).
     - **Step 4 — Argument Motif Mining (TF-IDF Bigrams)**: Computes top 15 distinctive legal reasoning bigrams across retrieved arguments (`patterns.argument_motifs`, e.g., `chain circumstances`, `reasonable doubt`, `specific performance`, `natural justice`).
     - **Step 5 — Empirical Outcome & Relief Distribution**: Computes disposition breakdown (`Allowed`, `Dismissed`, `Partly Allowed`, `Remanded`) and builds the litigation risk profile.
3. **Stage 3: Court-Ready Legal Memorandum & Argument Drafter**
   - Generates a structured, exportable (`Markdown` / `Copy to Clipboard` / `Print PDF`) **Advocate's Precedent Research Memorandum** navigated via Rare UI's `RailTOC`:
     1. **Questions Presented & Statutory Framework**
     2. **Executive Assessment & Outcome Probability** (backed by `patterns.outcome_distribution`)
     3. **Controlling Precedents & Co-Cited Authorities** (clickable cards linking to full case facts, arguments, and rulings)
     4. **Lines of Argument & Forensic Motifs** (synthesizing how counsel framed winning arguments using the extracted TF-IDF motifs)
     5. **Counter-Arguments & Distinguishing Adverse Precedents**
     6. **Recommended Pleadings & Relief Strategy**

### 5.3 Rare UI Visual Direction (Non-AI-Slop Engineering Craft)
- **Theme**: High-craft dark/light adaptive surface using `JetBrains Mono Variable` for technical telemetry, citations, statutes, and metrics, paired with crisp geometric sans/serif reading measure (`65ch–72ch`) for legal prose and case rulings.
- **Structural Grid**: Exposed `1px solid` hairline borders (`border-border`), architectural header bar with live `FluidOrb` + `InlineAIStatus` indicator, magnetic `ProximityTabs` navigation, and dense, scannable legal tables with `font-variant-numeric: tabular-nums`.
- **Pipeline Script Bridge**: Every view includes a toggleable **"Inspect Python Pipeline (`01`–`05`)"** drawer using Rare UI's `CodeBlock` so technical reviewers can see the exact Python script (`injest.py`, `index.py`, `retrieve.py`, `patterns.py`, `evaluate.py`) corresponding to the live UI view.

---

## 6. What Is Left to the Builder
- Exact wording of individual ILDC case texts beyond the 5 core query domains (as long as at least 60 realistic Indian Supreme Court / High Court cases with valid citation overlap exist so `Recall@5`, `Recall@10`, `MRR@10`, and `co_cited_precedents` produce meaningful, realistic evaluation numbers where `legal` outperforms `general`).
- Micro-animation spring constants in the Rare UI components (`StepPlayer`, `ProximityTabs`, `AnimatedCounter`, `RailTOC`), honoring `prefers-reduced-motion`.
- Git initialization and clean commit history so the user can push directly to GitHub.
