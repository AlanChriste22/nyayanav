"""FastAPI Microservice exposing the Python ILDC Pipeline (`src/`) over REST."""

from __future__ import annotations

from typing import Any

from src.embed import MODELS, build_indices
from src.eval import evaluate, find_divergence_examples, write_results_markdown
from src.ingest import build_eval_split, load_cases
from src.patterns import extract_patterns
from src.retrieve import cases_to_index, compare_query, query

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel

    app = FastAPI(
        title="LEX-ILDC Legal Precedent Navigator Python API",
        version="2.4.0",
        description="REST interface over src.ingest, src.embed, src.retrieve, src.patterns, and src.eval",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class QueryRequest(BaseModel):
        query_text: str
        model_name: str = "legal"
        k: int = 10

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        cases = load_cases()
        train, eval_set = build_eval_split(cases)
        return {
            "status": "ok",
            "total_cases": len(cases),
            "train_cases": len(train),
            "eval_cases": len(eval_set),
            "models": MODELS,
        }

    @app.post("/api/retrieve")
    def retrieve_endpoint(req: QueryRequest) -> dict[str, Any]:
        cases = load_cases()
        idx = cases_to_index(cases)
        hits = query(req.query_text, model_name=req.model_name, k=req.k, cases_index=idx)
        patterns = extract_patterns(hits, cases_index=idx)
        return {
            "hits": [h.__dict__ for h in hits],
            "patterns": {
                "co_cited_precedents": patterns.co_cited_precedents,
                "argument_motifs": patterns.argument_motifs,
                "outcome_distribution": patterns.outcome_distribution,
                "top_statutes": patterns.top_statutes,
            },
        }

    @app.post("/api/compare")
    def compare_endpoint(req: QueryRequest) -> dict[str, Any]:
        cases = load_cases()
        idx = cases_to_index(cases)
        res = compare_query(req.query_text, k=req.k, cases_index=idx)
        return {
            model: [h.__dict__ for h in hits] for model, hits in res.items()
        }

    @app.get("/api/evaluate")
    def evaluate_endpoint() -> dict[str, Any]:
        cases = load_cases()
        train, eval_set = build_eval_split(cases)
        metrics = evaluate(eval_set, train, k_max=10)
        examples = find_divergence_examples(eval_set, train, n_examples=5, k=5)
        md = write_results_markdown(metrics, divergence_examples=examples)
        return {
            "metrics": {k: v.__dict__ for k, v in metrics.items()},
            "divergence_examples": examples,
            "markdown": md,
        }

except ImportError:
    # Allows importing api.server even if fastapi is not yet installed in the environment
    app = None
