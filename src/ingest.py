"""01 — Ingest and split the ILDC legal corpus."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from scripts.generate_ildc_corpus import build_corpus


@dataclass
class Case:
    case_id: str
    court: str
    date: str
    facts: str
    arguments: str
    ruling: str
    citations: list[str] = field(default_factory=list)
    statutes_cited: list[str] = field(default_factory=list)
    title: str = ""
    domain: str = "general"
    domain_label: str = "General Legal"
    outcome: str = "Allowed"
    split: str = "train"

    def to_dict(self) -> dict[str, Any]:
        return {
            "case_id": self.case_id,
            "title": self.title,
            "court": self.court,
            "date": self.date,
            "domain": self.domain,
            "domain_label": self.domain_label,
            "outcome": self.outcome,
            "split": self.split,
            "citations": list(self.citations),
            "statutes_cited": list(self.statutes_cited),
            "facts": self.facts,
            "arguments": self.arguments,
            "ruling": self.ruling,
        }


def _default_corpus_path() -> Path:
    return Path(__file__).resolve().parent.parent / "data" / "ildc_cases.json"


def load_cases(path: str | Path | None = None) -> list[Case]:
    """Load the ILDC corpus from JSON, or materialize from the canonical builder if empty."""
    target = Path(path) if path else _default_corpus_path()
    raw_items: list[dict[str, Any]] = []

    if target.exists():
        try:
            loaded = json.loads(target.read_text(encoding="utf-8"))
            if isinstance(loaded, list) and len(loaded) >= 60:
                raw_items = loaded
        except Exception:
            raw_items = []

    if not raw_items:
        raw_items = build_corpus()
        try:
            target.write_text(
                json.dumps(raw_items, indent=2, ensure_ascii=False), encoding="utf-8"
            )
        except Exception:
            pass

    return [
        Case(
            case_id=item["case_id"],
            title=item.get("title", item["case_id"]),
            court=item.get("court", "Supreme Court of India"),
            date=item.get("date", "2023-01-01"),
            domain=item.get("domain", "general"),
            domain_label=item.get("domain_label", "General Legal"),
            outcome=item.get("outcome", "Allowed"),
            split=item.get("split", "train"),
            citations=list(item.get("citations", [])),
            statutes_cited=list(item.get("statutes_cited", [])),
            facts=item.get("facts", ""),
            arguments=item.get("arguments", ""),
            ruling=item.get("ruling", ""),
        )
        for item in raw_items
    ]


def build_eval_split(cases: list[Case]) -> tuple[list[Case], list[Case]]:
    """Split cases into (train, eval_set) preserving citation overlap for retrieval evaluation."""
    train = [c for c in cases if c.split != "eval"]
    eval_set = [c for c in cases if c.split == "eval"]
    if not eval_set or not train:
        # Fallback deterministic 80/20 split
        train = [c for i, c in enumerate(cases) if i % 5 != 4]
        eval_set = [c for i, c in enumerate(cases) if i % 5 == 4]
    return train, eval_set
