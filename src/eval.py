"""05 — Evaluate general vs. legal embedding models using citation-overlap relevance."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

from src.embed import MODELS
from src.ingest import Case
from src.retrieve import cases_to_index, query


@dataclass
class EvalMetrics:
    model_name: str
    recall_at_5: float
    recall_at_10: float
    mrr_at_10: float
    n_queries: int


def _is_relevant(query_case: Case, candidate_case: Case) -> bool:
    """Two cases are citation-relevant if they share at least one precedent citation or cite each other."""
    q_cits = set(query_case.citations)
    c_cits = set(candidate_case.citations)
    if query_case.case_id in c_cits or candidate_case.case_id in q_cits:
        return True
    return bool(q_cits & c_cits)


def evaluate(
    eval_set: Sequence[Case],
    train_set: Sequence[Case],
    k_max: int = 10,
) -> dict[str, EvalMetrics]:
    """Compute Recall@5, Recall@10, and MRR@10 on eval_set against train_set."""
    train_list = list(train_set)
    train_idx = cases_to_index(train_list)

    # Filter eval queries that have at least 1 relevant case in train_set
    valid_eval: list[tuple[Case, set[str]]] = []
    for eq in eval_set:
        rel_ids = {
            tc.case_id for tc in train_list if _is_relevant(eq, tc)
        }
        if rel_ids:
            valid_eval.append((eq, rel_ids))

    metrics: dict[str, EvalMetrics] = {}
    n_q = len(valid_eval)
    if n_q == 0:
        for name in MODELS:
            metrics[name] = EvalMetrics(
                model_name=name,
                recall_at_5=0.0,
                recall_at_10=0.0,
                mrr_at_10=0.0,
                n_queries=0,
            )
        return metrics

    for model_name in MODELS:
        r5_total = 0.0
        r10_total = 0.0
        mrr_total = 0.0

        for eq, rel_ids in valid_eval:
            hits = query(
                eq.facts,
                model_name=model_name,
                k=k_max,
                cases_index=train_idx,
                corpus=train_list,
            )
            hit_ids = [h.case_id for h in hits]

            top5_rel = sum(1 for cid in hit_ids[:5] if cid in rel_ids)
            top10_rel = sum(1 for cid in hit_ids[:10] if cid in rel_ids)

            # Standard Recall@K normalized by min(|Rel|, K) for bounded [0,1] legal precedent recall
            r5_total += top5_rel / min(len(rel_ids), 5)
            r10_total += top10_rel / min(len(rel_ids), 10)

            rr = 0.0
            for rank, cid in enumerate(hit_ids[:10], 1):
                if cid in rel_ids:
                    rr = 1.0 / rank
                    break
            mrr_total += rr

        metrics[model_name] = EvalMetrics(
            model_name=model_name,
            recall_at_5=round(r5_total / n_q, 4),
            recall_at_10=round(r10_total / n_q, 4),
            mrr_at_10=round(mrr_total / n_q, 4),
            n_queries=n_q,
        )

    return metrics


def find_divergence_examples(
    eval_set: Sequence[Case],
    train_set: Sequence[Case],
    n_examples: int = 5,
    k: int = 5,
) -> list[dict[str, Any]]:
    """Find qualitative queries where 'legal' and 'general' models retrieve different top-K precedents."""
    train_list = list(train_set)
    train_idx = cases_to_index(train_list)
    examples: list[dict[str, Any]] = []

    for eq in eval_set:
        gen_hits = query(
            eq.facts,
            model_name="general",
            k=k,
            cases_index=train_idx,
            corpus=train_list,
        )
        leg_hits = query(
            eq.facts,
            model_name="legal",
            k=k,
            cases_index=train_idx,
            corpus=train_list,
        )
        gen_ids = [h.case_id for h in gen_hits]
        leg_ids = [h.case_id for h in leg_hits]

        gen_set = set(gen_ids)
        leg_set = set(leg_ids)

        general_only = [cid for cid in gen_ids if cid not in leg_set]
        legal_only = [cid for cid in leg_ids if cid not in gen_set]
        shared = [cid for cid in leg_ids if cid in gen_set]

        if general_only or legal_only:
            rel_ids = {tc.case_id for tc in train_list if _is_relevant(eq, tc)}
            examples.append(
                {
                    "query_id": eq.case_id,
                    "query_title": eq.title,
                    "domain": eq.domain,
                    "general_only": general_only,
                    "legal_only": legal_only,
                    "shared": shared,
                    "legal_precision_hits": sum(1 for c in leg_ids if c in rel_ids),
                    "general_precision_hits": sum(1 for c in gen_ids if c in rel_ids),
                }
            )
        if len(examples) >= n_examples:
            break

    return examples


def write_results_markdown(
    metrics: dict[str, EvalMetrics],
    divergence_examples: Sequence[dict[str, Any]] | None = None,
    out_path: str | Path = "eval/results.md",
) -> str:
    """Write a comprehensive Markdown evaluation report to eval/results.md."""
    lines = [
        "# ILDC Precedent Retrieval Evaluation Report",
        "",
        "Relevance criterion: **Citation-Overlap Relevance** (a retrieved training case is relevant if it shares at least one binding Supreme Court / High Court citation with the held-out query case).",
        "",
        "## 1. Quantitative Retrieval Metrics",
        "",
        "| Embedding Model | HuggingFace ID | Recall@5 | Recall@10 | MRR@10 | Eval Queries |",
        "|---|---|---:|---:|---:|---:|",
    ]
    for name, m in metrics.items():
        hf_id = MODELS.get(name, name)
        lines.append(
            f"| `{name}` | `{hf_id}` | **{m.recall_at_5:.3f}** | **{m.recall_at_10:.3f}** | **{m.mrr_at_10:.3f}** | {m.n_queries} |"
        )

    if divergence_examples:
        lines.extend(
            [
                "",
                "## 2. Qualitative Divergence Analysis (`legal` vs `general` Top-5)",
                "",
                "| Query Case ID | Domain | Legal-Only Hits | General-Only Hits | Shared Hits |",
                "|---|---|---|---|---|",
            ]
        )
        for ex in divergence_examples:
            leg_str = ", ".join(f"`{c}`" for c in ex["legal_only"]) or "_None_"
            gen_str = ", ".join(f"`{c}`" for c in ex["general_only"]) or "_None_"
            sh_str = ", ".join(f"`{c}`" for c in ex["shared"]) or "_None_"
            lines.append(
                f"| `{ex['query_id']}` | `{ex.get('domain', '')}` | {leg_str} | {gen_str} | {sh_str} |"
            )

    content = "\n".join(lines) + "\n"
    target = Path(out_path)
    try:
        target.write_text(content, encoding="utf-8")
    except Exception:
        pass
    return content
