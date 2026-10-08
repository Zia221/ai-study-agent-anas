import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { apiFetch } from "../services/api";
function NotesPage() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateNotes() {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setLoading(true);
    setError("");
    setNotes(null);

    try {
      const response = await apiFetch("/api/notes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
        }),
      }); 

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not generate notes.");
      }

      setNotes(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function createAnother() {
    setNotes(null);
    setTopic("");
    setError("");
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Notes"
          description="Create structured study notes from your learning material."
        />

        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {!notes && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">Create study notes</h2>

              <p className="mt-2 text-sm text-zinc-400">
                Generate notes from your uploaded study material.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Topic
                  </label>

                  <input
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Example: RAG"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-400"
                  />
                </div>

                <button
                  onClick={generateNotes}
                  disabled={loading}
                  className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Notes"}
                </button>

                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>
            </section>
          )}

          {notes && (
            <section className="space-y-6">
              <div>
                <p className="text-sm text-zinc-500">{notes.topic}</p>

                <h2 className="mt-1 text-3xl font-bold">{notes.title}</h2>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="text-lg font-semibold">Summary</h3>

                <p className="mt-3 leading-7 text-zinc-300">{notes.summary}</p>
              </div>

              <div className="space-y-4">
                {notes.sections.map((section, index) => (
                  <article
                    key={index}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                  >
                    <h3 className="text-xl font-semibold">{section.heading}</h3>

                    <p className="mt-3 leading-7 text-zinc-300">
                      {section.content}
                    </p>

                    {section.key_points.length > 0 && (
                      <div className="mt-5">
                        <h4 className="text-sm font-medium text-zinc-400">
                          Key points
                        </h4>

                        <ul className="mt-3 space-y-2">
                          {section.key_points.map((point, pointIndex) => (
                            <li
                              key={pointIndex}
                              className="flex gap-3 text-sm text-zinc-300"
                            >
                              <span className="text-zinc-500">•</span>

                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              <button
                onClick={createAnother}
                className="w-full rounded-lg border border-zinc-700 px-4 py-3 hover:bg-zinc-900"
              >
                Create another set of notes
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default NotesPage;
