"""04 — Reasoning pattern extraction: co-cited precedents, TF-IDF argument motifs, outcome distributions."""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Sequence

from src.ingest import Case
from src.retrieve import RetrievalHit

MOTIF_STOPWORDS = {
    "the",
    "and",
    "for",
    "that",
    "this",
    "with",
    "from",
    "was",
    "were",
    "are",
    "been",
    "have",
    "has",
    "had",
    "under",
    "upon",
    "into",
    "Before",
    "before",
    "learned",
    "counsel",
    "submitted",
    "argued",
    "contended",
    "urged",
    "placed",
    "reliance",
    "specifically",
    "binding",
    "ratio",
    "provisions",
    "key",
    "forensic",
    "motifs",
    "advanced",
    "included",
    "indian",
    "act",
    "appellant",
    "respondent",
    "also",
    "further",
    "their",
    "which",
    "where",
    "when",
    "while",
}


@dataclass
class PatternBundle:
    co_cited_precedents: list[tuple[str, int]]
    argument_motifs: list[tuple[str, float]]
    outcome_distribution: dict[str, int]
    top_statutes: list[tuple[str, int]]


def _extract_bigrams(text: str) -> list[str]:
    tokens = [
        t
        for t in re.findall(r"[a-z0-9]+", text.lower())
        if len(t) > 2 and t not in MOTIF_STOPWORDS and not t.isdigit()
    ]
    return [f"{tokens[i]} {tokens[i + 1]}" for i in range(len(tokens) - 1)]


def _infer_outcome(c: Case) -> str:
    if c.outcome:
        return c.outcome
    r_low = c.ruling.lower()
    if "partly allowed" in r_low:
        return "Partly Allowed"
    if "remanded" in r_low or "remand" in r_low:
        return "Remanded"
    if "dismissed" in r_low:
        return "Dismissed"
    if "allowed" in r_low:
        return "Allowed"
    return "Disposed"


def extract_patterns(
    hits: Sequence[RetrievalHit],
    cases_index: dict[str, Case],
) -> PatternBundle:
    """Extract co-cited precedents, TF-IDF bigram motifs, and outcome breakdown from retrieved hits."""
    retrieved_cases = [
        cases_index[h.case_id] for h in hits if h.case_id in cases_index
    ]
    if not retrieved_cases:
        return PatternBundle(
            co_cited_precedents=[],
            argument_motifs=[],
            outcome_distribution={},
            top_statutes=[],
        )

    # 1. Co-cited precedents (appearing in 2+ retrieved cases)
    citation_counts: Counter[str] = Counter()
    statute_counts: Counter[str] = Counter()
    for c in retrieved_cases:
        for cit in set(c.citations):
            citation_counts[cit] += 1
        for st in set(c.statutes_cited):
            statute_counts[st] += 1

    co_cited = [
        (cid, count)
        for cid, count in citation_counts.most_common()
        if count >= 2
    ]

    # 2. Argument motifs (TF-IDF bigrams across retrieved argument texts compared against background corpus)
    all_corpus_cases = list(cases_index.values())
    n_docs = max(len(all_corpus_cases), 1)
    df_counts: Counter[str] = Counter()
    for c in all_corpus_cases:
        for bg in set(_extract_bigrams(c.arguments)):
            df_counts[bg] += 1

    tfidf_sums: Counter[str] = Counter()
    n_ret = len(retrieved_cases)
    for c in retrieved_cases:
        bgs = _extract_bigrams(c.arguments)
        if not bgs:
            continue
        tf_counter = Counter(bgs)
        total_bgs = len(bgs)
        for bg, count in tf_counter.items():
            tf = count / total_bgs
            idf = math.log((1.0 + n_docs) / (1.0 + df_counts[bg])) + 1.0
            tfidf_sums[bg] += tf * idf

    motifs = [
        (bg, round(score / n_ret, 4))
        for bg, score in tfidf_sums.most_common(15)
    ]

    # 3. Outcome distribution
    outcomes: Counter[str] = Counter()
    for c in retrieved_cases:
        outcomes[_infer_outcome(c)] += 1

    return PatternBundle(
        co_cited_precedents=co_cited,
        argument_motifs=motifs,
        outcome_distribution=dict(outcomes),
        top_statutes=statute_counts.most_common(8),
    )
