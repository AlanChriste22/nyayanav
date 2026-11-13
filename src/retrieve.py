"""03 — Retrieve similar cases across general and legal-domain vector indices."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from src.embed import MODELS, build_indices, encode_text
from src.ingest import Case, load_cases


@dataclass
class RetrievalHit:
    case_id: str
    score: float
    facts_preview: str
    title: str = ""
    court: str = ""
    date: str = ""
    domain: str = ""
    outcome: str = ""


def cases_to_index(cases: Sequence[Case]) -> dict[str, Case]:
    """Map case_id -> Case instance for O(1) lookup."""
    return {c.case_id: c for c in cases}


def query(
    query_text: str,
    model_name: str = "legal",
    k: int = 10,
    cases_index: dict[str, Case] | None = None,
    corpus: Sequence[Case] | None = None,
) -> list[RetrievalHit]:
    """Retrieve top-K most similar cases for query_text using model_name ('legal' or 'general')."""
    if cases_index is None:
        all_cases = list(corpus) if corpus is not None else load_cases()
        cases_index = cases_to_index(all_cases)
    else:
        all_cases = list(corpus) if corpus is not None else list(cases_index.values())

    if not all_cases or k <= 0:
        return []

    bundles = build_indices(all_cases)
    bundle = bundles[model_name]
    q_vec = encode_text(query_text or "", model_name=model_name)

    top_k = min(k, len(all_cases))
    scores, indices = bundle.index.search(q_vec, top_k)

    hits: list[RetrievalHit] = []
    for score, row_idx in zip(scores, indices):
        cid = bundle.case_ids[row_idx]
        c = cases_index[cid]
        clean_preview = c.facts.replace("\n", " ").strip()[:240]
        hits.append(
            RetrievalHit(
                case_id=cid,
                score=float(max(0.0, min(0.999, score))),
                facts_preview=clean_preview,
                title=c.title,
                court=c.court,
                date=c.date,
                domain=c.domain,
                outcome=c.outcome,
            )
        )
    return hits


def compare_query(
    query_text: str,
    k: int = 3,
    cases_index: dict[str, Case] | None = None,
) -> dict[str, list[RetrievalHit]]:
    """Run query side-by-side across all configured models ('general' and 'legal')."""
    if cases_index is None:
        cases_index = cases_to_index(load_cases())
    return {
        model_name: query(
            query_text, model_name=model_name, k=k, cases_index=cases_index
        )
        for model_name in MODELS
    }
