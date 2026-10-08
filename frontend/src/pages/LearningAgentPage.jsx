import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { apiFetch } from "../services/api.js";

function LearningAgentPage() {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("Understand this topic");

  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function startLearning() {
    setLoading(true);
    setResult(null);

    try {
      const response = await apiFetch("/api/learning-agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          goal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start learning session");
      }

      const data = await response.json();

      setSession(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswers() {
    if (!session) {
      return;
    }

    const answerList = session.questions.map(
      (_, index) => answers[index] ?? null,
    );

    try {
      setLoading(true);

      const response = await apiFetch("/api/learning-agent/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: session.questions,
          answers: answerList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate learning session");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function resetSession() {
    setSession(null);
    setAnswers({});
    setResult(null);
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = session?.questions?.length ?? 0;

  return (
    <main className="min-w-0 flex-1 bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <PageHeader
          title="AI Learning Agent"
          description="Learn any topic with personalized teaching, practice, evaluation, and guidance."
        />

        {/* START LEARNING */}
        {!session && (
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">

              <div className="border-b border-zinc-800 px-6 py-5">
                <h2 className="text-lg font-semibold text-white">
                  Start learning
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Tell your AI what you want to learn and your learning goal.
                </p>
              </div>

              <div className="space-y-5 p-6">

                {/* Topic */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Topic
                  </label>

                  <input
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        topic.trim() &&
                        !loading
                      ) {
                        startLearning();
                      }
                    }}
                    placeholder="Example: RAG, Python, Photosynthesis"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                {/* Goal */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Learning goal
                  </label>

                  <input
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    placeholder="Understand this topic"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                {/* Info */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm font-medium text-white">
                      Learn
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Personalized explanation
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm font-medium text-white">
                      Practice
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      AI-generated questions
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm font-medium text-white">
                      Evaluate
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Discover your next step
                    </p>
                  </div>
                </div>

                <button
                  onClick={startLearning}
                  disabled={loading || !topic.trim()}
                  className="w-full rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Starting..." : "Start Learning"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LEARNING SESSION */}
        {session && (
          <div className="mx-auto max-w-4xl space-y-6">

            {/* Session header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Learning topic
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white">
                  {topic}
                </h2>
              </div>

              <button
                onClick={resetSession}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                New Session
              </button>
            </div>

            {/* Lesson */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">

              <div className="border-b border-zinc-800 px-6 py-5">
                <h2 className="text-lg font-semibold text-white">
                  Your lesson
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Personalized explanation based on your study material.
                </p>
              </div>

              <div className="whitespace-pre-wrap px-6 py-6 text-sm leading-7 text-zinc-300">
                {session.explanation}
              </div>
            </div>

            {/* Practice */}
            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Practice
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Answer the questions below.
                  </p>
                </div>

                <span className="text-sm text-zinc-500">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>

              <div className="space-y-4">
                {session.questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
                  >
                    <h3 className="font-medium leading-6 text-white">
                      {questionIndex + 1}. {question.question}
                    </h3>

                    <div className="mt-5 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const selected =
                          answers[questionIndex] === optionIndex;

                        return (
                          <button
                            key={optionIndex}
                            onClick={() =>
                              setAnswers((previous) => ({
                                ...previous,
                                [questionIndex]: optionIndex,
                              }))
                            }
                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                              selected
                                ? "border-zinc-500 bg-zinc-800 text-white"
                                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluate button */}
            <button
              onClick={submitAnswers}
              disabled={loading}
              className="w-full rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Evaluating..." : "Evaluate My Learning"}
            </button>

            {/* Result */}
            {result && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">

                <div className="border-b border-zinc-800 px-6 py-5">
                  <h2 className="text-lg font-semibold text-white">
                    Learning result
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Your AI Learning Agent evaluated your performance.
                  </p>
                </div>

                <div className="p-6">

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                    <p className="text-sm text-zinc-500">
                      Score
                    </p>

                    <p className="mt-1 text-4xl font-semibold text-white">
                      {result.score}%
                    </p>
                  </div>

                  <div className="mt-5">
                    <h3 className="font-medium text-white">
                      AI Recommendation
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {result.recommendation}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-zinc-800 pt-5">
                    <p className="text-sm text-zinc-500">
                      Next action
                    </p>

                    <p className="mt-1 text-sm font-medium capitalize text-white">
                      {result.next_action}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default LearningAgentPage;