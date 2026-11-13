# 05 — Evaluate both models and write results
import sys
sys.path.insert(0, '..')
import src.compat  # Ensures headless/CLI compatibility when matplotlib is optional
import matplotlib.pyplot as plt

from src.ingest import load_cases, build_eval_split
from src.eval import evaluate, write_results_markdown, find_divergence_examples

cases = load_cases()
train, eval_set = build_eval_split(cases)
print(f"Train={len(train)}    Eval={len(eval_set)}")

# Run evaluation.
metrics = evaluate(eval_set, train, k_max=10)
for name, m in metrics.items():
    print(f"{name:8s}  R@5={m.recall_at_5:.3f}  R@10={m.recall_at_10:.3f}  MRR@10={m.mrr_at_10:.3f}  (n={m.n_queries})")

# Side-by-side comparison chart
fig, ax = plt.subplots(figsize=(8, 4))
labels = list(metrics.keys())
r5 = [metrics[n].recall_at_5 for n in labels]
r10 = [metrics[n].recall_at_10 for n in labels]
mrr = [metrics[n].mrr_at_10 for n in labels]
x = range(len(labels))
width = 0.25
ax.bar([i - width for i in x], r5, width, label='Recall@5', color='steelblue')
ax.bar(list(x), r10, width, label='Recall@10', color='seagreen')
ax.bar([i + width for i in x], mrr, width, label='MRR@10', color='indianred')
ax.set_xticks(list(x))
ax.set_xticklabels(labels)
ax.set_ylabel('score')
ax.set_title('Retrieval metrics — citation-overlap relevance')
ax.legend()
ax.set_ylim(0, 1)
plt.tight_layout()
plt.show()

# Find qualitative divergence examples
examples = find_divergence_examples(eval_set, train, n_examples=5, k=5)
for ex in examples:
    print(f"\nQuery {ex['query_id']}")
    print(f"  general only: {ex['general_only']}")
    print(f"  legal only:   {ex['legal_only']}")
    print(f"  shared:       {ex['shared']}")

write_results_markdown(metrics, divergence_examples=examples)
print("Wrote eval/results.md")
