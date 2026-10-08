import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { apiFetch } from "../services/api";

function TestsPage() {
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");

  const [evaluation, setEvaluation] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [userSettings, setUserSettings] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topicFromProgress = params.get("topic");

    if (topicFromProgress) {
      setTopic(topicFromProgress);
    }
  }, []);

  // Load student's preferences
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await apiFetch("/api/settings");

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const data = await response.json();

      setUserSettings(data);

      setNumberOfQuestions(data.test_question_count);
      setDifficulty(data.difficulty);
    } catch (error) {
      console.error(error);
    }
  }

  function selectAnswer(questionIndex, optionIndex) {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: optionIndex,
    }));
  }

  async function generateTest() {
    setLoading(true);
    setError("");
    setTest(null);
    setEvaluation(null);
    setAnswers({});

    try {
      const response = await apiFetch("/api/tests/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          number_of_questions: numberOfQuestions,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate test");
      }

      setTest(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitTest() {
    if (!test) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/tests/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: test.questions,
          answers: test.questions.map((_, index) => answers[index] ?? null),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to evaluate test");
      }

      setEvaluation(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Tests"
          description="Practice your knowledge and discover what you need to improve."
        />

        <div className="mx-auto max-w-4xl space-y-6">
          {/* Create Test */}
          <section className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white">Create Test</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Your test preferences are loaded from Settings.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Topic
                </label>

                <input
                  type="text"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. Newton's Laws"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Number of Questions
                  </label>

                  <select
                    value={numberOfQuestions}
                    onChange={(event) =>
                      setNumberOfQuestions(Number(event.target.value))
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Difficulty
                  </label>

                  <select
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {userSettings && (
                <p className="text-xs text-zinc-600">
                  Loaded from your study preferences.
                </p>
              )}

              {error && (
                <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={generateTest}
                disabled={loading || !topic.trim()}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Test"}
              </button>
            </div>
          </section>

          {/* Generated Test */}
          {test && (
            <section className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {test.title || "Generated Test"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Answer all questions and submit your test.
                </p>
              </div>

              <div className="space-y-6">
                {test.questions?.map((question, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
                  >
                    <p className="font-medium text-white">
                      {index + 1}. {question.question}
                    </p>

                    <div className="mt-4 space-y-2">
                      {question.options?.map((option, optionIndex) => {
                        const selected = answers[index] === optionIndex;
                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() => selectAnswer(index, optionIndex)}
                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                              selected
                                ? "border-white bg-white/10 text-white"
                                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
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

              <button
                type="button"
                onClick={submitTest}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Evaluating..." : "Submit Test"}
              </button>
            </section>
          )}

          {/* Evaluation */}
          {evaluation && (
            <section className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">Test Result</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500">Score</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {evaluation.score}%
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500">Correct</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {evaluation.correct_answers}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500">Questions</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {evaluation.total_questions}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default TestsPage;
