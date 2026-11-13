# 02 — Build FAISS indices with two embedding models
import sys
sys.path.insert(0, '..')

from src.ingest import load_cases, build_eval_split
from src.embed import build_indices, MODELS

cases = load_cases()
train, eval_set = build_eval_split(cases)
print(f"Indexing {len(train)} training cases against {len(eval_set)} held out.")
# This will build both general and legal-domain vector indices.
bundles = build_indices(train)
for name, b in bundles.items():
    mem_mb = b.embeddings.nbytes / (1024 * 1024)
    print(f"{name:8s}  hf_id={b.hf_id}  dim={b.dim}  N={len(b.case_ids)}  mem={mem_mb:.1f} MB")
