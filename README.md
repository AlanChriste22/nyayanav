# NyayaNav — Find the precedent that matters.

A full-stack **Agentic AI Legal Precedent Research Workbench** and **Dual-Model Vector Retrieval Pipeline** built on the **Indian Legal Documents Corpus (ILDC)**.

Designed for practicing litigators, appellate counsel, and legal-NLP researchers, LEX-ILDC combines a 5-stage Python retrieval & evaluation pipeline (`src/` + `injest.py`, `index.py`, `retrieve.py`, `patterns.py`, `evaluate.py`) with a **Rare UI** + **React Router v7** full-stack web application.

---

## Key Capabilities

1. **3-Stage Agentic Legal Research Studio (For Practicing Lawyers)**
   - **Stage 1 — Interactive Fact-Refinement Interrogator**: Analyzes raw client facts, identifies triggered Indian statutes (e.g., *IPC § 302*, *Evidence Act § 27*, *Contract Act § 73/74*, *Industrial Disputes Act § 25F*, *Income Tax Act § 68*, *RFCTLARR Act § 4/24(2)*), and asks 3 targeted follow-up questions to sharpen the query.
   - **Stage 2 — Autonomous Multi-Step Research Trace (`StepPlayer`)**: Executes a 5-stage inspectable pipeline (Statutory Decomposition → Dual-Index Vector Search → Co-Cited Precedent Graph Traversal → TF-IDF Argument Motif Mining → Outcome Distribution Analysis).
   - **Stage 3 — Court-Ready Legal Memorandum Drafter (`RailTOC`)**: Generates an exportable 6-section **Advocate's Precedent Research Memorandum** with inline clickable `[ILDC_YYYY_NNNN]` citations, empirical outcome probabilities, winning TF-IDF argument motifs, and adverse precedent distinctions.

2. **Dual-Model Retrieval Arena (`03_retrieve.py` & `04_patterns.py`)**
   - Compare **`legal` (`law-ai/InLegalBERT`, 768d)** against **`general` (`sentence-transformers/all-MiniLM-L6-v2`, 384d)** side-by-side at `k=3, 5, 10`.
   - Inspect co-cited Supreme Court anchor precedents, TF-IDF bigram argument motifs, and outcome distributions (`Allowed`, `Partly Allowed`, `Remanded`, `Dismissed`).

3. **ILDC Corpus & FAISS Telemetry Inspector (`01_injest.py` & `02_index.py`)**
   - Explore all 65 canonical Indian Supreme Court and High Court cases across 8 legal domains (`52 Train / 13 Held-Out Eval`), character length histograms (`facts_len`, `arguments_len`, `ruling_len`), and index memory footprints.

4. **Retrieval Evaluation & Divergence Benchmark (`05_evaluate.py`)**
   - Quantitative **Citation-Overlap Relevance** benchmark (`Recall@5`, `Recall@10`, `MRR@10`) and qualitative divergence examples (`legal_only`, `general_only`, `shared`), generating `eval/results.md`.

---

## Quick Start

### 1. Run the Full-Stack Web Application
```bash
npm install
npm run dev
```
Build and serve for production:
```bash
npm run build
npm run start
```

### 2. Run the 5 Python Pipeline Scripts (`01` – `05`)
```bash
python injest.py      # 01 — Explore the ILDC corpus & distributions
python index.py       # 02 — Build vector indices (general vs legal)
python retrieve.py    # 03 — Retrieve similar cases for sample queries
python patterns.py    # 04 — Extract co-citations, TF-IDF motifs & outcomes
python evaluate.py    # 05 — Evaluate Recall@5, Recall@10, MRR@10 -> eval/results.md
```

Run the automated test suites:
```bash
python -m unittest tests/test_pipeline.py -v
node tests/test_ts_engine.ts
```

### 3. Deploy to Production (Vercel / Render / Railway / Docker)
- **Docker**:
  ```bash
  docker build -t lex-ildc-navigator .
  docker run -p 3000:3000 lex-ildc-navigator
  ```
- **Vercel / Render / Base44**: Push this repository to GitHub and import directly—the isomorphic TypeScript ILDC engine runs with zero cold-start failures even without a dedicated GPU container.
