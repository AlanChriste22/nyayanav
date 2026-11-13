# ILDC Precedent Retrieval Evaluation Report

Relevance criterion: **Citation-Overlap Relevance** (a retrieved training case is relevant if it shares at least one binding Supreme Court / High Court citation with the held-out query case).

## 1. Quantitative Retrieval Metrics

| Embedding Model | HuggingFace ID | Recall@5 | Recall@10 | MRR@10 | Eval Queries |
|---|---|---:|---:|---:|---:|
| `general` | `sentence-transformers/all-MiniLM-L6-v2` | **0.477** | **0.481** | **0.684** | 13 |
| `legal` | `law-ai/InLegalBERT` | **1.000** | **1.000** | **1.000** | 13 |

## 2. Qualitative Divergence Analysis (`legal` vs `general` Top-5)

| Query Case ID | Domain | Legal-Only Hits | General-Only Hits | Shared Hits |
|---|---|---|---|---|
| `ILDC_2017_0004` | `contract_breach` | `ILDC_2017_0010`, `ILDC_2021_0002`, `ILDC_2025_0006`, `ILDC_2021_0005` | `ILDC_2023_0040`, `ILDC_2025_0049`, `ILDC_2015_0032`, `ILDC_2019_0036` | `ILDC_2017_0001` |
| `ILDC_2021_0008` | `contract_breach` | `ILDC_2021_0002`, `ILDC_2017_0010`, `ILDC_2025_0006`, `ILDC_2017_0001` | `ILDC_2023_0040`, `ILDC_2021_0025`, `ILDC_2021_0062`, `ILDC_2023_0031` | `ILDC_2021_0005` |
| `ILDC_2023_0014` | `criminal_appeal` | `ILDC_2019_0019`, `ILDC_2019_0013`, `ILDC_2023_0017` | `ILDC_2021_0002`, `ILDC_2023_0031`, `ILDC_2015_0055` | `ILDC_2015_0015`, `ILDC_2023_0011` |
| `ILDC_2015_0018` | `criminal_appeal` | `ILDC_2019_0019`, `ILDC_2019_0013`, `ILDC_2023_0017` | `ILDC_2017_0047`, `ILDC_2025_0006`, `ILDC_2015_0012` | `ILDC_2015_0015`, `ILDC_2023_0011` |
| `ILDC_2017_0024` | `land_acquisition` | `ILDC_2017_0027`, `ILDC_2017_0021`, `ILDC_2021_0025`, `ILDC_2025_0023`, `ILDC_2025_0029` | `ILDC_2017_0047`, `ILDC_2017_0041`, `ILDC_2017_0050`, `ILDC_2017_0007`, `ILDC_2019_0036` | _None_ |
