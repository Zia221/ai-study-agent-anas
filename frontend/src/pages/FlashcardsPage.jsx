import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { apiFetch } from "../services/api";
function FlashcardsPage() {
  const [topic, setTopic] = useState("");
  const [numberOfCards, setNumberOfCards] = useState(5);

  const [flashcards, setFlashcards] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateFlashcards() {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setLoading(true);
    setError("");
    setFlashcards(null);
    setCurrentIndex(0);
    setShowAnswer(false);

    try {
      const response = await apiFetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          number_of_cards: numberOfCards,
        }),
      });

      // Safely read the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "I couldn't find relevant information about this topic in your study material.",
        );
      }

      // Make sure the backend actually returned flashcards
      if (
        !data ||
        !Array.isArray(data.flashcards) ||
        data.flashcards.length === 0
      ) {
        throw new Error(
          "I couldn't find relevant information about this topic in your study material.",
        );
      }

      setFlashcards(data);
    } catch (error) {
      setFlashcards(null);
      setCurrentIndex(0);
      setShowAnswer(false);

      setError(
        error.message ||
          "I couldn't find relevant information about this topic in your study material.",
      );
    } finally {
      setLoading(false);
    }
  }

  function nextCard() {
    if (!flashcards) return;

    setCurrentIndex((previous) =>
      Math.min(previous + 1, flashcards.flashcards.length - 1),
    );

    setShowAnswer(false);
  }

  function previousCard() {
    setCurrentIndex((previous) => Math.max(previous - 1, 0));

    setShowAnswer(false);
  }

  function resetFlashcards() {
    setFlashcards(null);
    setCurrentIndex(0);
    setShowAnswer(false);
    setError("");
  }

  const currentCard = flashcards?.flashcards[currentIndex];

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Flashcards"
          description="Review important concepts with active recall."
        />

        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {!flashcards && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">Create flashcards</h2>

              <p className="mt-2 text-sm text-zinc-400">
                Generate flashcards from your uploaded study material.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Topic
                  </label>

                  <input
                    value={topic}
                    onChange={(event) => {
                      setTopic(event.target.value);
                      setError("");
                    }}
                    placeholder="Example: RAG"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Number of cards
                  </label>

                  <select
                    value={numberOfCards}
                    onChange={(event) =>
                      setNumberOfCards(Number(event.target.value))
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <button
                  onClick={generateFlashcards}
                  disabled={loading}
                  className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Flashcards"}
                </button>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {flashcards && currentCard && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{flashcards.title}</h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Card {currentIndex + 1} of {flashcards.flashcards.length}
                </p>
              </div>

              <button
                onClick={() => setShowAnswer((previous) => !previous)}
                className="min-h-[360px] w-full rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-left transition hover:border-zinc-600"
              >
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {showAnswer ? "Answer" : "Question"}
                  </p>

                  <p className="mt-6 max-w-2xl text-2xl font-semibold leading-relaxed">
                    {showAnswer ? currentCard.answer : currentCard.question}
                  </p>

                  <p className="mt-8 text-sm text-zinc-500">
                    Click to {showAnswer ? "see question" : "reveal answer"}
                  </p>
                </div>
              </button>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={previousCard}
                  disabled={currentIndex === 0}
                  className="rounded-lg border border-zinc-700 px-5 py-3 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  onClick={nextCard}
                  disabled={currentIndex === flashcards.flashcards.length - 1}
                  className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>

              <button
                onClick={resetFlashcards}
                className="w-full rounded-lg border border-zinc-700 px-4 py-3 hover:bg-zinc-900"
              >
                Create another set
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default FlashcardsPage;
