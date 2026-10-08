from types import SimpleNamespace

from app.services.progress_intelligence import analyze_progress


def make_result(score: int, topic: str = "Math"):
    return SimpleNamespace(
        score=score,
        topic=topic,
    )


def test_no_tests():
    result = analyze_progress([])

    assert result["trend"] == "no_data"
    assert result["improvement"] == 0
    assert result["strongest_topic"] is None
    assert result["weakest_topic"] is None


def test_one_test():
    results = [
        make_result(70),
    ]

    result = analyze_progress(results)

    assert result["trend"] == "starting"
    assert result["improvement"] == 0


def test_scores_improving():
    results = [
        make_result(90),
        make_result(80),
        make_result(70),
        make_result(60),
    ]

    result = analyze_progress(results)

    assert result["trend"] == "improving"
    assert result["improvement"] == 20


def test_scores_declining():
    results = [
        make_result(50),
        make_result(60),
        make_result(70),
        make_result(80),
    ]

    result = analyze_progress(results)

    assert result["trend"] == "declining"
    assert result["improvement"] == -20