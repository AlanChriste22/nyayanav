# NyayaNav — Find the precedent that matters.


# ⚖️ AI-Based Legal Precedent Navigator for Case Strategy

**An AI-powered semantic legal research system for discovering similar Indian court judgments and extracting recurring legal reasoning patterns.**

<p align="center">

  ![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)
  ![NLP](https://img.shields.io/badge/Domain-NLP-purple)
  ![AI](https://img.shields.io/badge/AI-Semantic%20Search-orange)
  ![FAISS](https://img.shields.io/badge/Vector%20Search-FAISS-green)
  ![Status](https://img.shields.io/badge/Project-Academic%20Research-informational)

</p>

## 📌 Overview

The **Legal Precedent Navigator(aka nyayanav)** is an AI-driven legal research project designed to improve how legal professionals, researchers, and students discover relevant judicial precedents.

Traditional legal research tools primarily depend on keyword-based searches. However, two judgments addressing similar legal circumstances may use entirely different terminology, making keyword-based retrieval less effective.

This project addresses that limitation through **semantic information retrieval**, using sentence embeddings and FAISS vector similarity search to identify judgments based on the meaning of their facts rather than exact keyword matches.

The system compares two embedding models:

- **all-MiniLM-L6-v2** – General-purpose sentence embedding model.
- **InLegalBERT** – Legal-domain language model pretrained on Indian legal text.

Beyond retrieving similar judgments, the system extracts:
- Frequently co-cited legal precedents.
- Recurring argument patterns using TF-IDF.
- Case outcome distributions.

The objective is to transform conventional legal document searching into a more structured, meaning-based research workflow.

## 🎯 Project Objectives

1. Develop a reproducible data ingestion pipeline using the Indian Legal Documents Corpus (ILDC).
2. Generate sentence embeddings using general-purpose and legal-domain models.
3. Build separate FAISS vector indices for semantic similarity search.
4. Retrieve the top-k most relevant historical judgments for a given case description.
5. Extract recurring legal reasoning patterns, co-cited precedents, and outcome distributions.
6. Evaluate and compare both embedding models using Recall@k and Mean Reciprocal Rank (MRR).

## 🏗️ System Architecture

The project follows a modular architecture consisting of five major stages.

```text
             INDIAN LEGAL DOCUMENTS CORPUS
                         |
                         v
               DATA INGESTION
                         |
                         v
             DATA PREPROCESSING
                         |
                         v
              CASE REPRESENTATION
                         |
                         v
                TEXT EMBEDDING
                         |
              +----------+----------+
              |                     |
              v                     v
       all-MiniLM-L6-v2          InLegalBERT
        (384 Dimensions)        (768 Dimensions)
              |                     |
              v                     v
         FAISS INDEX             FAISS INDEX
          (General)               (Legal)
              |                     |
              +----------+----------+
                         |
                         v
               SEMANTIC RETRIEVAL
                         |
                         v
                TOP-K JUDGMENTS
                         |
                         v
             REASONING PATTERN ANALYSIS
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
       Co-cited       Argument       Outcome
      Precedents       Motifs      Distribution
          |              |              |
          +--------------+--------------+
                         |
                         v
                MODEL EVALUATION
                   Recall@K
                     MRR
```

## 🧠 Core Technologies

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| HuggingFace Datasets | Loading the ILDC dataset |
| Sentence Transformers | Generating sentence embeddings |
| all-MiniLM-L6-v2 | General-purpose semantic embeddings |
| InLegalBERT | Legal-domain language representations |
| FAISS | Vector indexing and similarity search |
| Scikit-learn | TF-IDF argument motif extraction |
| NumPy | Numerical operations |
| Pandas | Data processing and analysis |
| SciPy | Scientific computing |
| Matplotlib | Data visualization |
| Jupyter Notebook | Experimentation and implementation |

## 📚 Dataset

**Indian Legal Documents Corpus (ILDC)**

The project uses the publicly available Indian Legal Documents Corpus hosted on HuggingFace.

- Dataset identifier: `legalil/ildc`
- Source: [HuggingFace – ILDC Dataset](https://huggingface.co/datasets/legalil/ildc)
- Includes Supreme Court and High Court judgments.
- Contains structured information such as facts, arguments, rulings, citations, and statutes.
- The full public corpus contains approximately 35,000–40,000 documents.
- This project uses a curated subset of approximately 3,000–5,000 cases.

The dataset is used to build a structured representation of legal cases for semantic retrieval and reasoning-pattern extraction.

## ⚙️ How It Works

### 1. Data Ingestion and Preprocessing

The system loads the ILDC dataset using the HuggingFace Datasets library.

Each judgment is converted into a structured Case object containing:

- Case ID
- Court
- Date
- Facts
- Arguments
- Ruling
- Citations
- Statutes cited

The processed records are cached in JSONL format to avoid repeated dataset downloads and preprocessing.

### 2. Dual-Model Embedding

The project compares two embedding approaches.

| Model | Type | Embedding Dimensions |
|---|---|---:|
| all-MiniLM-L6-v2 | General-purpose | 384 |
| InLegalBERT | Legal-domain | 768 |

The embeddings are L2-normalized before indexing.

This enables inner-product similarity search to operate equivalently to cosine similarity.

### 3. FAISS Vector Indexing

FAISS (Facebook AI Similarity Search) is used to create two independent vector indices:

- General-purpose embedding index.
- Legal-domain embedding index.

The implementation uses `IndexFlatIP` for exact inner-product nearest-neighbour search.

Both indices and their corresponding embedding mappings are persisted for reuse.

### 4. Semantic Case Retrieval

Given a new case description, the retrieval module:

1. Encodes the query using the selected embedding model.
2. Searches the corresponding FAISS index.
3. Retrieves the top-k nearest judgments.
4. Returns similarity scores, case details, citation information, and ruling previews.

A comparison function allows both models to process the same query and display their results side by side.

### 5. Reasoning Pattern Extraction

The system extracts three major types of information.

**A. Co-cited Precedents**

Identifies frequently shared precedent citations across retrieved judgments and returns the top 10.

**B. Argument Motifs**

Uses TF-IDF to identify distinctive legal argument phrases.

Configuration:
- Maximum features: 500
- English stop-word removal
- Unigrams and bigrams
- Top 15 phrases by mean TF-IDF weight

**C. Outcome Distribution**

Uses rule-based keyword counting over ruling text to identify terms such as:
- Allowed
- Dismissed
- Remanded

These signals provide a summarized view of the retrieved judgments.

## 📊 Model Evaluation

The system compares both embedding models using a held-out evaluation split.

**Evaluation methodology:**

- 80% of cases are used for indexing.
- 20% are reserved for evaluation queries.
- Random seed: 42.
- Relevance is determined using citation overlap.
- Two models are evaluated using identical query cases.

**Evaluation Metrics**

| Metric | Description |
|---|---|
| Recall@5 | Measures relevant cases retrieved within the top 5 results |
| Recall@10 | Measures relevant cases retrieved within the top 10 results |
| MRR@10 | Measures how highly the first relevant result is ranked |

Since ILDC does not provide explicit human relevance labels for this retrieval task, the project uses shared cited precedents as a proxy for relevance.

**Evaluation Results**

The report defines the evaluation methodology, but the final numerical evaluation table has not yet been populated.

| Embedding Model | Recall@5 | Recall@10 | MRR@10 |
|---|---|---|---|
| all-MiniLM-L6-v2 | Pending | Pending | Pending |
| InLegalBERT | Pending | Pending | Pending |

*Run the evaluation notebook to generate the actual results. No performance figures are assumed or fabricated.*

## 📂 Repository Structure

```text
legal-precedent-navigator/
│
├── README.md
├── requirements.txt
│
├── data/
│   ├── raw/
│   ├── cases.jsonl
│   ├── eval_split.jsonl
│   └── indices/
│       ├── general/
│       └── legal/
│
├── src/
│   ├── __init__.py
│   ├── ingest.py
│   ├── embed.py
│   ├── retrieve.py
│   ├── patterns.py
│   └── eval.py
│
├── notebooks/
│   ├── 01_explore.ipynb
│   ├── 02_index.ipynb
│   ├── 03_retrieve.ipynb
│   ├── 04_patterns.ipynb
│   └── 05_evaluate.ipynb
│
└── eval/
    └── results.md
```

*Note: This is the repository structure specified in the project report. Generated datasets, embeddings, and FAISS indices should be created during execution rather than committed to GitHub.*

## 🚀 Installation and Setup

### Prerequisites

- Python 3.x
- pip
- Jupyter Notebook
- Internet connection for initial dataset and model downloads

The pipeline is designed to run on a CPU-only machine without requiring a dedicated GPU.

### Step 1: Clone the Repository

```bash
git clone https://github.com/alanchriste22/legal-precedent-navigator.git

cd legal-precedent-navigator
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

Activate the environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Launch Jupyter Notebook

```bash
jupyter notebook
```

Open the notebooks directory and execute the notebooks in the specified order.

## 📦 Dependencies

The project uses the following Python dependencies:

```text
datasets>=2.14
sentence-transformers>=2.2
faiss-cpu>=1.7
numpy
pandas
scikit-learn
scipy
jupyter
matplotlib
tqdm
```

## 🔬 Execution Workflow

Execute the five notebooks sequentially.

| Notebook | Functionality |
|---|---|
| `01_explore.ipynb` | Explore ILDC, inspect cases, analyze dataset statistics and create train/evaluation splits |
| `02_index.ipynb` | Generate embeddings and build both FAISS indices |
| `03_retrieve.ipynb` | Retrieve similar judgments using both models |
| `04_patterns.ipynb` | Extract co-cited precedents, argument motifs and outcome distributions |
| `05_evaluate.ipynb` | Evaluate both models using Recall@5, Recall@10 and MRR@10 |

Each notebook uses artifacts generated by the previous stage.

## 🌍 Real-World Applications

The proposed system can support several legal research scenarios.

1. **Bail Hearing Research:** Retrieve historical bail judgments with similar factual circumstances.
2. **Property and Eviction Disputes:** Identify judgments addressing comparable tenant and property disputes.
3. **Legal Case Analysis:** Discover frequently cited precedents and recurring arguments.
4. **Academic Legal Research:** Help law students and researchers explore judicial reasoning patterns.
5. **Comparative Legal NLP Research:** Study how general-purpose and legal-domain embedding models perform on Indian case law.

These are potential applications of the retrieval and analysis capabilities, not claims of deployment in legal practice.

## 🔮 Future Enhancements

The project identifies several possible improvements:

- **Human-in-the-Loop Feedback:** Allow legal practitioners to annotate and correct retrieved judgments.
- **Improved Ranking:** Introduce BM25-based re-ranking using human relevance judgments.
- **Model Fine-Tuning:** Fine-tune InLegalBERT using positive and negative case pairs.
- **Semantic Argument Analysis:** Use embedding clustering or language models to identify deeper legal reasoning patterns.
- **Statute Extraction:** Extract references to Indian statutes to improve legal context discovery.
- **Advanced Evaluation:** Replace citation-overlap proxy judgments with expert-annotated relevance labels.

## ⚠️ Limitations and Responsible Use

This project is intended strictly as an AI-assisted legal research tool.

- It does not provide legal advice.
- It does not predict the outcome of new cases.
- It does not automate judicial or legal decisions.
- Retrieved judgments and extracted patterns require independent verification.
- TF-IDF and citation-overlap methods do not constitute deep semantic legal reasoning.
- The evaluation uses citation overlap as a proxy rather than human relevance judgments.
- The current implementation is a mini-project prototype and does not include a production web interface or practitioner-feedback mechanism.

**Always consult a qualified legal professional before relying on legal research findings.**

## 🌱 Sustainable Development Goals

This project aligns with:

**SDG 16 – Peace, Justice and Strong Institutions**

Promotes more accessible legal research by reducing the effort required to locate relevant judicial precedents.

**SDG 9 – Industry, Innovation and Infrastructure**

Demonstrates the use of open-source NLP, embedding models and vector-search technologies to build practical AI research tools using modest computing resources.

## 👥 Project Contributors

Developed as an academic project at:

**Presidency University, Bengaluru**  
Presidency School of Artificial Intelligence & Advanced Computing  
B.Tech – Computer Science and Engineering (Cyber Security)

| Contributor | Role |
|---|---|
| Alan Christe | Project Contributor |
| Nivedhitha H E | Project Contributor |
| Lekhana C S | Project Contributor |
| Greeshma K | Project Contributor |

**Project Guide:** Dr. Vijay Kumar A V, Professor

## 📚 References

1. Malik, P., Bhatia, P., Sekhon, K., and Modi, A. (2021). *ILDC for CJPE: Indian Legal Documents Corpus for Court Judgment Prediction and Explanation.* ACL-IJCNLP.
2. Reimers, N. and Gurevych, I. (2019). *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks.* EMNLP.
3. Paul, S., Mandal, A., Goyal, P., and Ghosh, S. (2022). *Pre-training Transformers on Indian Legal Text.* InLegalBERT.
4. Johnson, J., Douze, M., and Jégou, H. (2019). *Billion-scale Similarity Search with GPUs.* FAISS.
5. [Indian Kanoon](https://indiankanoon.org/)
6. [HuggingFace – ILDC Dataset](https://huggingface.co/datasets/legalil/ildc)
7. Pedregosa, F. et al. (2011). *Scikit-learn: Machine Learning in Python.*
8. [United Nations – SDG 16](https://sdgs.un.org/goals/goal16)

---

⭐ **If you find this project useful for legal NLP, semantic search, or AI-assisted research, consider starring the repository!**


