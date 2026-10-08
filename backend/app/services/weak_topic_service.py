from collections import defaultdict


def analyze_weak_topics(results: list) -> list[dict]:
    topic_stats = defaultdict(
        lambda: {
            "total": 0,
            "correct": 0,
        }
    )

    for result in results:
        topic = result.topic

        topic_stats[topic]["total"] += 1

        if result.is_correct:
            topic_stats[topic]["correct"] += 1

    analysis = []

    for topic, stats in topic_stats.items():
        total = stats["total"]
        correct = stats["correct"]

        score = round((correct / total) * 100)

        if score < 60:
            status = "weak"
        elif score < 80:
            status = "needs_practice"
        else:
            status = "strong"

        analysis.append(
            {
                "topic": topic,
                "total_questions": total,
                "correct_answers": correct,
                "score": score,
                "status": status,
            }
        )

    analysis.sort(key=lambda item: item["score"])

    return analysis