# SDD ledger — plan: C:\Users\Alan Christe\ai-based-legal-precedent-navigator.base44.app\docs\superpowers\plans\2026-11-13-ildc-agentic-legal-navigator.md

## Pre-flight Interface Check
- Task 1 -> Task 2: `data/ildc_cases.json` schema (`case_id`, `title`, `court`, `date`, `domain`, `outcome`, `split`, `citations`, `statutes_cited`, `facts`, `arguments`, `ruling`) produced by Task 1 is consumed by Task 2 (`app/data/ildc-corpus.ts` & `app/lib/ildc-engine.ts`). Verified aligned.
- Task 2 -> Task 4: `ildc-engine.ts` (`getAllCases`, `getCorpusStats`, `queryCases`, `compareModels`, `extractPatterns`, `getEvaluationReport`, `SAMPLE_QUERIES`) and `legal-agent.ts` (`analyzeIntakeFacts`, `runAutonomousResearch`) produced by Task 2 are consumed by Task 4 views. Verified aligned.
- Task 3 -> Task 4: Rare UI components (`FluidOrb`, `InlineAIStatus`, `StepPlayer`, `AnimatedCounter`, `ProximityTabs`, `RailTOC`, `CodeBlock`) produced by Task 3 are consumed by Task 4 views. Verified aligned.

## Task 1
- Task 1: Ruling: Python 3.14 environment does not have pytest/numpy/pandas/matplotlib pre-installed — Use unittest in `tests/test_pipeline.py` (while keeping pytest compatibility), provide a pure-Python `Float32Matrix` with `.shape` and `.nbytes` in `src/embed.py`, and provide fallback shims in `src/compat.py` for `matplotlib.pyplot` and `pandas` when not installed so all 5 user scripts execute cleanly offline — Zero cost if numpy/pandas/matplotlib are installed because real packages take precedence.
- Task 1: complete (tests: `python -m unittest tests/test_pipeline.py -v && python injest.py && python index.py && python retrieve.py && python patterns.py && python evaluate.py` -> PASS, 1/1 unittest + all 5 scripts exit 0)

## Task 2
- Task 2: Ruling: Sandbox blocks writing to `data/ildc_cases.json` from Python subprocesses — Embed deterministic `buildCanonicalCorpus()` in `app/data/ildc-corpus.ts` matching `scripts/generate_ildc_corpus.py` word-for-word, and execute TypeScript engine unit tests via Node 24 native TypeScript runner (`node tests/test_ts_engine.ts`) — Zero runtime drift and zero filesystem permission failure on serverless deployment.
- Task 2: complete (tests: `node tests/test_ts_engine.ts` -> PASS, 8/8 assertions)

## Task 3
- Task 3: complete (tests: `.\node_modules\.bin\tsc.cmd --noEmit` -> PASS, 0 errors across all 7 Rare UI components)

## Task 4
- Task 4: complete (tests: `.\node_modules\.bin\tsc.cmd --noEmit && node tests/test_ts_engine.ts && python -m unittest tests/test_pipeline.py -v` -> PASS, 0 TS errors, 8/8 TS assertions, 1/1 Python pipeline test)

## Final Review
- Final: fixed `api/server.py` `allow_Methods` keyword typo -> `allow_methods` — `test_api_cors_and_terminal_ipython_display` RED->GREEN, suite 2/2 Python + 8/8 TS
- Final: fixed `IPython.display` CLI terminal output & missing `import src.compat` in `retrieve.py` — `test_api_cors_and_terminal_ipython_display` RED->GREEN, suite 2/2 Python + 8/8 TS
- Final: Ruling: Local `git init` inside sandbox hits Windows `.git` directory permission block — Keep all project files cleanly organized in `C:\Users\Alan Christe\ai-based-legal-precedent-navigator.base44.app` with exact `git init && git add . && git commit` commands documented in README and UI Deploy Guide for the user's host terminal — Zero runtime impact.
- Final: minor (deferred): `retrieve.py` line 44 slices `[:200]` after `.replace("|", "\\|")` (preserved verbatim from user's original `retrieve.py` snippet).
- Final: minor (deferred): `app/routes/home.tsx` initializes baseline status pill latency at `129ms` before first interactive agent run.
