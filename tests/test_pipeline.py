import tempfile
import unittest
from pathlib import Path

from src.ingest import load_cases, build_eval_split
from src.embed import build_indices, MODELS
from src.retrieve import cases_to_index, query, compare_query
from src.patterns import extract_patterns
from src.eval import evaluate, find_divergence_examples, write_results_markdown


class TestILDCPipeline(unittest.TestCase):
    def test_full_ildc_pipeline(self):
        cases = load_cases()
        self.assertGreaterEqual(len(cases), 60)
        train, eval_set = build_eval_split(cases)
        self.assertGreaterEqual(len(train), 45)
        self.assertGreaterEqual(len(eval_set), 12)

        bundles = build_indices(train)
        self.assertEqual(set(bundles.keys()), {"general", "legal"})
        for name, b in bundles.items():
            self.assertEqual(b.hf_id, MODELS[name])
            self.assertEqual(b.embeddings.shape, (len(train), b.dim))
            self.assertGreater(b.embeddings.nbytes, 0)

        idx = cases_to_index(cases)
        cmp_res = compare_query(
            "Section 302 IPC circumstantial evidence chain not complete",
            k=3,
            cases_index=idx,
        )
        self.assertEqual(len(cmp_res["legal"]), 3)
        self.assertEqual(len(cmp_res["general"]), 3)

        # Edge case: empty/short query does not crash
        empty_hits = query("   ", model_name="legal", k=5, cases_index=idx)
        self.assertEqual(len(empty_hits), 5)

        hits = query(
            "Workmen retrenched without Section 25F Industrial Disputes Act notice",
            model_name="legal",
            k=10,
            cases_index=idx,
        )
        patterns = extract_patterns(hits, cases_index=idx)
        self.assertGreaterEqual(len(patterns.co_cited_precedents), 1)
        self.assertGreaterEqual(len(patterns.argument_motifs), 5)
        self.assertGreater(sum(patterns.outcome_distribution.values()), 0)

        metrics = evaluate(eval_set, train, k_max=10)
        self.assertGreaterEqual(
            metrics["legal"].recall_at_10, metrics["general"].recall_at_10
        )
        self.assertGreater(metrics["legal"].mrr_at_10, 0)

        divergences = find_divergence_examples(eval_set, train, n_examples=5, k=5)
        self.assertGreaterEqual(len(divergences), 1)
        self.assertTrue(
            {"query_id", "general_only", "legal_only", "shared"}
            <= set(divergences[0].keys())
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            out_md = Path(tmpdir) / "results.md"
            write_results_markdown(
                metrics, divergence_examples=divergences, out_path=str(out_md)
            )
            self.assertTrue(out_md.exists())
            self.assertIn("Recall@5", out_md.read_text(encoding="utf-8"))

    def test_api_cors_and_terminal_ipython_display(self):
        import io
        from contextlib import redirect_stdout

        server_src = (
            Path(__file__).resolve().parent.parent / "api" / "server.py"
        ).read_text(encoding="utf-8")
        self.assertNotIn("allow_Methods", server_src)
        self.assertIn('allow_methods=["*"]', server_src)

        import src.compat  # noqa: F401
        from IPython.display import Markdown, display

        buf = io.StringIO()
        with redirect_stdout(buf):
            display(Markdown("| Rank | Score |"))
        self.assertIn("| Rank | Score |", buf.getvalue())



if __name__ == "__main__":
    unittest.main()
