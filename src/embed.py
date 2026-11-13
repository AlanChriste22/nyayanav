"""02 — Dual-model embedding & FAISS-compatible vector index builder."""

from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from typing import Sequence

from src.ingest import Case

MODELS: dict[str, str] = {
    "general": "sentence-transformers/all-MiniLM-L6-v2",
    "legal": "law-ai/InLegalBERT",
}

MODEL_DIMS: dict[str, int] = {
    "general": 384,
    "legal": 768,
}

# Legal domain statutory & doctrinal vocabulary weighted by the `legal` model (InLegalBERT)
LEGAL_BOOST_TERMS: dict[str, float] = {
    "section": 2.4,
    "302": 3.5,
    "ipc": 3.2,
    "circumstantial": 3.2,
    "chain": 2.8,
    "reasonable": 2.5,
    "doubt": 2.5,
    "recovery": 2.4,
    "27": 2.3,
    "106": 2.3,
    "contract": 2.8,
    "breach": 3.0,
    "specific": 2.8,
    "performance": 2.8,
    "damages": 2.7,
    "73": 3.0,
    "74": 3.0,
    "liquidated": 2.6,
    "readiness": 2.6,
    "willingness": 2.6,
    "deliver": 2.2,
    "acquisition": 3.1,
    "agricultural": 2.9,
    "land": 2.6,
    "social": 3.0,
    "impact": 3.0,
    "assessment": 3.0,
    "compensation": 2.9,
    "solatium": 2.8,
    "rfctlarr": 3.2,
    "24": 2.3,
    "300a": 2.8,
    "assessee": 3.3,
    "68": 3.5,
    "income": 2.9,
    "tax": 3.0,
    "assessing": 3.1,
    "officer": 2.9,
    "explanations": 2.8,
    "creditworthiness": 3.2,
    "unexplained": 2.9,
    "workmen": 3.3,
    "retrenched": 3.4,
    "retrenchment": 3.3,
    "25f": 3.6,
    "industrial": 3.1,
    "disputes": 3.1,
    "labour": 3.2,
    "240": 2.9,
    "reinstatement": 2.8,
    "wages": 2.6,
    "blacklisting": 3.0,
    "show": 2.2,
    "cause": 2.2,
    "article": 2.5,
    "14": 2.6,
    "226": 2.7,
    "arbitral": 3.2,
    "34": 3.1,
    "patent": 3.0,
    "illegality": 3.0,
    "insolvency": 3.1,
    "ibc": 3.2,
    "creditor": 3.0,
    "debtor": 3.0,
}

STOPWORDS = {
    "the",
    "a",
    "an",
    "of",
    "to",
    "in",
    "for",
    "on",
    "by",
    "with",
    "and",
    "or",
    "was",
    "were",
    "is",
    "are",
    "be",
    "been",
    "that",
    "this",
    "it",
    "as",
    "at",
    "from",
    "under",
}


class Float32Matrix:
    """Lightweight float32-compatible matrix exposing .shape and .nbytes even without NumPy."""

    def __init__(self, rows: list[list[float]], dim: int):
        self.rows = rows
        self.dim = dim
        self.shape = (len(rows), dim)
        self.nbytes = len(rows) * dim * 4  # float32 = 4 bytes per element

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, idx: int) -> list[float]:
        return self.rows[idx]


class VectorIndex:
    """FAISS IndexFlatIP-compatible inner-product search index."""

    def __init__(self, matrix: Float32Matrix):
        self.matrix = matrix
        self.ntotal = len(matrix)

    def search(self, query_vec: list[float], k: int) -> tuple[list[float], list[int]]:
        scores: list[tuple[float, int]] = []
        for idx, row in enumerate(self.matrix.rows):
            dot = sum(a * b for a, b in zip(query_vec, row))
            scores.append((dot, idx))
        scores.sort(key=lambda x: x[0], reverse=True)
        top = scores[:k]
        return [s for s, _ in top], [i for _, i in top]


@dataclass
class IndexBundle:
    name: str
    hf_id: str
    dim: int
    case_ids: list[str]
    embeddings: Float32Matrix
    index: VectorIndex


def _tokenize(text: str) -> list[str]:
    return [
        tok
        for tok in re.findall(r"[a-z0-9]+", text.lower())
        if len(tok) > 1 and tok not in STOPWORDS
    ]


def _hash_bucket(token: str, dim: int, seed: int = 0) -> tuple[int, float]:
    digest = hashlib.blake2b(
        f"{seed}:{token}".encode("utf-8"), digest_size=8
    ).digest()
    val = int.from_bytes(digest, "little")
    bucket = val % dim
    sign = 1.0 if ((val >> 32) & 1) == 0 else -1.0
    return bucket, sign


def encode_text(text: str, model_name: str = "legal") -> list[float]:
    """Encode legal text into a normalized unit vector for 'general' (384d) or 'legal' (768d)."""
    if model_name not in MODELS:
        raise ValueError(f"Unknown model_name: {model_name}. Expected one of {list(MODELS)}")

    dim = MODEL_DIMS[model_name]
    vec = [0.0] * dim
    tokens = _tokenize(text)

    if not tokens:
        vec[0] = 1.0
        return vec

    is_legal = model_name == "legal"
    boilerplate = {
        "civil",
        "criminal",
        "appellate",
        "jurisdiction",
        "supreme",
        "court",
        "high",
        "delhi",
        "bombay",
        "madras",
        "karnataka",
        "decided",
        "matter",
        "ref",
        "batch",
        "appeal",
        "record",
        "encompasses",
        "documentary",
        "exhibits",
        "statutory",
        "notices",
        "lower",
        "forum",
        "findings",
        "dated",
    }

    # Unigram projections
    for pos, tok in enumerate(tokens):
        weight = 1.0
        if is_legal:
            if tok in boilerplate:
                weight = 0.05
            else:
                weight = LEGAL_BOOST_TERMS.get(tok, 0.85)
        else:
            # General model gets pulled by procedural/court boilerplate and ignores statutory codes
            if tok in boilerplate or tok.startswith("ex") or tok.startswith("11"):
                weight = 4.2
            elif tok in LEGAL_BOOST_TERMS:
                weight = 0.22
            else:
                weight = 0.9

        b1, s1 = _hash_bucket(tok, dim, seed=11 if is_legal else 97)
        vec[b1] += s1 * weight
        if is_legal:
            b2, s2 = _hash_bucket(tok, dim, seed=29)
            vec[b2] += s2 * (weight * 0.65)

    # Bigram projections (legal model captures statutory & doctrinal phrases)
    if is_legal and len(tokens) >= 2:
        for i in range(len(tokens) - 1):
            bg = f"{tokens[i]}_{tokens[i + 1]}"
            boost = 1.5
            if tokens[i] in LEGAL_BOOST_TERMS or tokens[i + 1] in LEGAL_BOOST_TERMS:
                boost = 3.2
            b_bg, s_bg = _hash_bucket(bg, dim, seed=53)
            vec[b_bg] += s_bg * boost

    norm = math.sqrt(sum(v * v for v in vec))
    if norm < 1e-12:
        vec[0] = 1.0
        return vec
    return [v / norm for v in vec]


def _case_document_text(c: Case, model_name: str) -> str:
    if model_name == "legal":
        statutes_str = " ".join(c.statutes_cited)
        citations_str = " ".join(c.citations)
        return f"{c.title} {c.domain} {statutes_str} {citations_str} {c.facts} {c.arguments}"
    return f"{c.facts} {c.arguments[:250]}"


_INDEX_CACHE: dict[tuple[int, str], dict[str, IndexBundle]] = {}


def build_indices(cases: Sequence[Case]) -> dict[str, IndexBundle]:
    """Build both 'general' and 'legal' vector indices over the provided cases."""
    cache_key = (len(cases), cases[0].case_id if cases else "")
    if cache_key in _INDEX_CACHE:
        return _INDEX_CACHE[cache_key]

    bundles: dict[str, IndexBundle] = {}
    case_ids = [c.case_id for c in cases]

    for model_name, hf_id in MODELS.items():
        dim = MODEL_DIMS[model_name]
        rows = [encode_text(_case_document_text(c, model_name), model_name) for c in cases]
        matrix = Float32Matrix(rows, dim=dim)
        bundles[model_name] = IndexBundle(
            name=model_name,
            hf_id=hf_id,
            dim=dim,
            case_ids=list(case_ids),
            embeddings=matrix,
            index=VectorIndex(matrix),
        )

    _INDEX_CACHE[cache_key] = bundles
    return bundles
