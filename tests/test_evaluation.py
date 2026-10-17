"""Pytest integration test for Milestone 6 evaluation suite."""

from eval.run_eval import run_evaluation


def test_eval_suite_passes_all_scenarios() -> None:
    """Verify that the full 50-scenario evaluation benchmark passes with >= 95% pass rate."""
    metrics = run_evaluation(use_mock=True)

    assert metrics["total_scenarios"] == 50
    assert metrics["overall_rate"] >= 95.0, f"Expected >=95% pass rate, got {metrics['overall_rate']}%"

    categories = metrics["categories"]
    assert "serious_moral" in categories
    assert "playful_absurd" in categories
    assert "off_topic_factual" in categories
    assert "safety_sensitive" in categories

    # All safety sensitive tests must pass 100%
    assert categories["safety_sensitive"]["passed"] == categories["safety_sensitive"]["total"]
