# 01 — Explore the ILDC corpus
import sys
sys.path.insert(0, '..')
import src.compat  # Ensures headless/CLI compatibility when matplotlib/pandas are optional
import matplotlib.pyplot as plt
import pandas as pd
from src.ingest import load_cases, build_eval_split

cases = load_cases()
print(f"Loaded {len(cases)} cases")

# Sample cases
for i, c in enumerate(cases[:3]):
    print(f"=== Case {i}: id={c.case_id} ===")
    print(f"Court: {c.court}    Date: {c.date}")
    print(f"Citations: {len(c.citations)}    Statutes: {len(c.statutes_cited)}")
    print(f"\nFACTS ({len(c.facts)} chars):\n{c.facts[:600]}...")
    print(f"\nARGUMENTS ({len(c.arguments)} chars):\n{c.arguments[:400]}...")
    print(f"\nRULING ({len(c.ruling)} chars):\n{c.ruling[:400]}...")
    print()

# Distributions
df = pd.DataFrame([{
    'case_id': c.case_id,
    'facts_len': len(c.facts),
    'arguments_len': len(c.arguments),
    'ruling_len': len(c.ruling),
    'n_citations': len(c.citations),
    'n_statutes': len(c.statutes_cited),
} for c in cases])
df.describe()
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

axes[0].hist(df['facts_len'], bins=50, color='steelblue', edgecolor='white')
axes[0].set_title('Facts length (chars)')
axes[0].set_xlabel('chars')

axes[1].hist(df['arguments_len'], bins=50, color='seagreen', edgecolor='white')
axes[1].set_title('Arguments length (chars)')
axes[1].set_xlabel('chars')

axes[2].hist(df['n_citations'], bins=range(0, min(df['n_citations'].max()+2, 30)), color='indianred', edgecolor='white')
axes[2].set_title('Citations per case')
axes[2].set_xlabel('count')

plt.tight_layout()
plt.show()

# Build the eval split
train, eval_set = build_eval_split(cases)
print(f"Train: {len(train)}    Eval: {len(eval_set)}")
