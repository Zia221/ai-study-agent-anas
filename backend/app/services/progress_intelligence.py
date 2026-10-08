def analyze_progress(results: list):
    if not results:
        return {
            "improvement": 0,
            "trend": "no_data",
            "strongest_topic": None,
            "weakest_topic": None,
            "topic_insights": [],
            "recommendation": "Take your first test to start tracking progress.",
        }

    scores = [
        result.score
        for result in results
    ]

    if len(scores) == 1:
        improvement = 0
        trend = "starting"
    else:
        recent_scores = scores[:3]
        older_scores = scores[3:]

        recent_average = round(
            sum(recent_scores) / len(recent_scores)
        )

        if older_scores:
            older_average = round(
                sum(older_scores) / len(older_scores)
            )
        else:
            older_average = scores[-1]

        improvement = recent_average - older_average

        if improvement >= 5:
            trend = "improving"
        elif improvement <= -5:
            trend = "declining"
        else:
            trend = "stable"

    topic_scores = {}

    for result in results:
        topic = result.topic

        if topic not in topic_scores:
            topic_scores[topic] = []

        topic_scores[topic].append(
            result.score
        )

    topic_insights = []

    for topic, topic_results in topic_scores.items():
        average_score = round(
            sum(topic_results)
            / len(topic_results)
        )

        if average_score < 60:
            status = "weak"
        elif average_score < 80:
            status = "needs_practice"
        else:
            status = "strong"

        topic_insights.append(
            {
                "topic": topic,
                "average_score": average_score,
                "tests_taken": len(topic_results),
                "status": status,
            }
        )

    topic_insights.sort(
        key=lambda item: item["average_score"]
    )

    weakest_topic = (
        topic_insights[0]["topic"]
        if topic_insights
        else None
    )

    strongest_topic = (
        topic_insights[-1]["topic"]
        if topic_insights
        else None
    )

    if weakest_topic:
        weakest_score = topic_insights[0]["average_score"]

        if trend == "improving":
            recommendation = (
                f"Keep your momentum going. "
                f"Focus your next practice session on "
                f"{weakest_topic}, currently at "
                f"{weakest_score}%."
            )
        elif trend == "declining":
            recommendation = (
                f"Your recent scores are declining. "
                f"Review {weakest_topic} before taking "
                f"another test."
            )
        else:
            recommendation = (
                f"Focus your next study session on "
                f"{weakest_topic}, currently at "
                f"{weakest_score}%."
            )
    else:
        recommendation = (
            "Complete more tests to build a stronger "
            "learning profile."
        )

    return {
        "improvement": improvement,
        "trend": trend,
        "strongest_topic": strongest_topic,
        "weakest_topic": weakest_topic,
        "topic_insights": topic_insights,
        "recommendation": recommendation,
    }