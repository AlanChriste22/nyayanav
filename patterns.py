# 04 — Reasoning pattern extraction
import sys
sys.path.insert(0, '..')
import src.compat  # Ensures headless/CLI compatibility when matplotlib is optional
import matplotlib.pyplot as plt

from src.ingest import load_cases
from src.retrieve import compare_query, cases_to_index
from src.patterns import extract_patterns
from IPython.display import display, Markdown

cases = load_cases()
idx = cases_to_index(cases)

QUERIES = [
    ("contract_breach",
     "The appellant entered into a contract for the supply of goods. The respondent failed to deliver on time, "
     "causing loss. The appellant seeks damages for breach of contract and specific performance."),
    ("criminal_appeal",
     "The accused was convicted under Section 302 IPC based on circumstantial evidence. The appeal contends "
     "that the chain of circumstances was not complete and that recovery was not proved beyond reasonable doubt."),
    ("land_acquisition",
     "The state acquired agricultural land for a public project without conducting a proper social impact "
     "assessment. The landowners challenge the acquisition as violating the Right to Fair Compensation Act."),
    ("tax",
     "The assessee challenged the addition made under Section 68 of the Income Tax Act on the ground that "
     "the explanations offered were not properly considered by the assessing officer."),
    ("labour",
     "Workmen were retrenched by a manufacturing unit without following the procedure under Section 25F of "
     "the Industrial Disputes Act. The Labour Court's award in their favour is challenged in this appeal."),
]

# Use the legal-domain model for pattern extraction — it's the one we'd ship to a practitioner.
MODEL_FOR_PATTERNS = "legal"
TOP_K = 10

def render_patterns(name: str, query_text: str):
    """Retrieve with the chosen model, then show pattern views."""
    from src.retrieve import query as do_query
    hits = do_query(query_text, model_name=MODEL_FOR_PATTERNS, k=TOP_K, cases_index=idx)
    patterns = extract_patterns(hits, cases_index=idx)

    md = [f"## Query: {name}", "", f"**Facts:** {query_text}", "",
          f"_Retrieved {len(hits)} cases via `{MODEL_FOR_PATTERNS}` model._", ""]

    md.append("### Top retrieved cases")
    md.append("")
    md.append("| Rank | Score | Case ID |")
    md.append("|---:|---:|---|")
    for rank, r in enumerate(hits, 1):
        md.append(f"| {rank} | {r.score:.3f} | `{r.case_id}` |")
    md.append("")

    md.append("### Co-cited precedents (appearing in 2+ retrieved cases)")
    md.append("")
    if patterns.co_cited_precedents:
        md.append("| Precedent | Times cited |")
        md.append("|---|---:|")
        for cid, count in patterns.co_cited_precedents[:10]:
            md.append(f"| `{cid}` | {count} |")
    else:
        md.append("_No repeated citations._")
    md.append("")

    md.append("### Top argument motifs (TF-IDF bigrams)")
    md.append("")
    if patterns.argument_motifs:
        md.append("| Motif | Mean TF-IDF |")
        md.append("|---|---:|")
        for motif, score in patterns.argument_motifs[:15]:
            md.append(f"| `{motif}` | {score:.4f} |")
    else:
        md.append("_Not enough argument text to extract motifs._")
    md.append("")

    md.append("### Outcome distribution")
    md.append("")
    if patterns.outcome_distribution:
        md.append("| Outcome | Count |")
        md.append("|---|---:|")
        for outcome, count in patterns.outcome_distribution.items():
            md.append(f"| {outcome} | {count} |")
        # Bar chart
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.barh(list(patterns.outcome_distribution.keys()), list(patterns.outcome_distribution.values()), color='slateblue')
        ax.set_xlabel('count')
        ax.set_title(f'Outcome distribution — {name}')
        plt.tight_layout()
        plt.show()
    else:
        md.append("_No ruling keywords matched._")
    md.append("")
    display(Markdown("\n".join(md)))

for name, q in QUERIES:
    render_patterns(name, q)
