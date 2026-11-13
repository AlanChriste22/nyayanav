# 03 — Retrieve similar cases for sample queries
import sys
sys.path.insert(0, '..')
import src.compat  # Ensures CLI display compatibility
from src.ingest import load_cases
from src.retrieve import compare_query, cases_to_index
from IPython.display import display, Markdown

cases = load_cases()
idx = cases_to_index(cases)

# Sample queries
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

for name, q in QUERIES:
    print(f"\n{'='*80}\n{name.upper()}\n{'='*80}\n{q}\n")

def show_results(name: str, query_text: str, k: int = 3):
    """Render side-by-side retrieval results for a single query."""
    results = compare_query(query_text, k=k, cases_index=idx)
    md = [f"## Query: {name}", "", f"**Facts:** {query_text}", ""]
    for model_name, hits in results.items():
        md.append(f"### Model: `{model_name}`")
        md.append("")
        md.append("| Rank | Score | Case ID | Preview |")
        md.append("|---:|---:|---|---|")
        for rank, r in enumerate(hits, 1):
            preview = r.facts_preview.replace("|", "\\|")[:200]
            md.append(f"| {rank} | {r.score:.3f} | `{r.case_id}` | {preview}... |")
        md.append("")
    text_out = "\n".join(md)
    display(Markdown(text_out))

for name, q in QUERIES:
    show_results(name, q, k=3)
