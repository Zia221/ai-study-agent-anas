import { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";
import PageHeader from "../components/PageHeader";

function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProgress() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/progress");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load progress.");
      }

      setProgress(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return (
      <main className="min-w-0 flex-1 bg-zinc-950 p-6 text-white">
        <p className="text-zinc-400">Loading progress...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-w-0 flex-1 bg-zinc-950 p-6 text-white">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (!progress) {
    return (
      <main className="min-w-0 flex-1 bg-zinc-950 p-6 text-white">
        <p className="text-zinc-400">No progress data available.</p>
      </main>
    );
  }

  const insights = progress.insights || {
    improvement: 0,
    trend: "Not enough data",
    strongest_topic: "",
    weakest_topic: "",
    recommendation: "Take a few tests to generate learning insights.",
    topic_insights: [],
  };

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-zinc-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}

      <PageHeader
        title="Progress"
        description="Track your learning performance and improvement."
      />

      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Summary */}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Tests Taken</p>

            <p className="mt-2 text-3xl font-bold">{progress.tests_taken}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Average Score</p>

            <p className="mt-2 text-3xl font-bold">{progress.average_score}%</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Best Score</p>

            <p className="mt-2 text-3xl font-bold">{progress.best_score}%</p>
          </div>
        </section>

        {/* Learning Insights */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Learning Insights</h2>

          <p className="mt-1 text-sm text-zinc-400">
            What your recent performance tells us.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {/* Improvement */}

            <div className="rounded-xl bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Improvement</p>

              <p className="mt-2 text-2xl font-bold">
                {insights.improvement > 0
                  ? `+${insights.improvement}%`
                  : `${insights.improvement}%`}
              </p>

              <p className="mt-1 text-xs text-zinc-500">{insights.trend}</p>
            </div>

            {/* Strongest */}

            <div className="rounded-xl bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Strongest Topic</p>

              <p className="mt-2 text-lg font-semibold">
                {insights.strongest_topic || "Not enough data"}
              </p>
            </div>

            {/* Weakest */}

            <div className="rounded-xl bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Weakest Topic</p>

              <p className="mt-2 text-lg font-semibold">
                {insights.weakest_topic || "Not enough data"}
              </p>
            </div>
          </div>

          {/* Recommendation */}

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm font-medium">🎯 Recommended Next Step</p>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {insights.recommendation}
            </p>
            {insights.weakest_topic && (
              <button
                onClick={() => {
                  window.location.href = `/tests?topic=${encodeURIComponent(
                    insights.weakest_topic,
                  )}`;
                }}
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
              >
                Practice Weak Topic
              </button>
            )}
          </div>
        </section>

        {/* Topic Performance */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Topic Performance</h2>

          <p className="mt-1 text-sm text-zinc-400">
            See how you're performing across different topics.
          </p>

          <div className="mt-6 space-y-4">
            {progress.topic_progress?.length === 0 ? (
              <p className="text-sm text-zinc-500">No topic data yet.</p>
            ) : (
              progress.topic_progress?.map((topic) => (
                <div key={topic.topic} className="rounded-xl bg-zinc-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{topic.topic}</p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {topic.tests_taken} test
                        {topic.tests_taken !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <p className="text-lg font-semibold">
                      {topic.average_score}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(topic.average_score, 0),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Topic Insights */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Topic Insights</h2>

          <div className="mt-6 space-y-3">
            {insights.topic_insights?.length === 0 ? (
              <p className="text-sm text-zinc-500">No topic insights yet.</p>
            ) : (
              insights.topic_insights?.map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between rounded-xl bg-zinc-950 p-4"
                >
                  <div>
                    <p className="font-medium">{topic.topic}</p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {topic.tests_taken} test
                      {topic.tests_taken !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{topic.average_score}%</p>

                    <p
                      className={`text-xs ${
                        topic.status === "weak"
                          ? "text-red-400"
                          : topic.status === "needs_practice"
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      {topic.status === "weak"
                        ? "Weak"
                        : topic.status === "needs_practice"
                          ? "Needs Practice"
                          : "Strong"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Tests */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Recent Tests</h2>

          <div className="mt-6 space-y-3">
            {progress.recent_tests?.length === 0 ? (
              <p className="text-sm text-zinc-500">No tests completed yet.</p>
            ) : (
              progress.recent_tests?.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-950 p-4"
                >
                  <div>
                    <p className="font-medium">{test.topic}</p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {test.correct_answers} / {test.total_questions} correct
                    </p>
                  </div>

                  <p className="font-semibold">{test.score}%</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      </div>
    </main>
  );
}

export default ProgressPage;
