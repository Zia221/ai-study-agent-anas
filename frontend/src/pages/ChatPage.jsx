import { useRef, useState } from "react";
import { apiFetch } from "../services/api.js";

function ChatPage() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setUploadStatus("");
  }

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploadStatus("Uploading...");

      const response = await apiFetch("/api/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      setUploadStatus(`Uploaded ${data.file.filename}`);
      setSelectedFile(null);
    } catch (error) {
      setUploadStatus(error.message);
    }
  }

  async function handleSendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");

    try {
      const response = await apiFetch("/api/tutor/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Tutor request failed.");
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
        },
      ]);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h2 className="text-lg font-semibold">AI Tutor</h2>
        <p className="text-sm text-zinc-400">Learn from your study material</p>
      </header>

      <section className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-2xl text-center">
              <div className="mb-5 text-5xl">🧠</div>

              <h1 className="text-3xl font-bold">What do you want to learn?</h1>

              <p className="mt-3 text-zinc-400">
                Ask your AI tutor anything about your study material.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((item, index) => (
              <div
                key={index}
                className={
                  item.role === "user"
                    ? "ml-auto max-w-xl rounded-2xl bg-white px-4 py-3 text-black"
                    : "mr-auto max-w-xl rounded-2xl bg-zinc-900 px-4 py-3 text-zinc-100"
                }
              >
                {item.content}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-zinc-800 p-4">
        <div className="mx-auto max-w-3xl">
          {selectedFile && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
              <span className="truncate text-sm">📄 {selectedFile.name}</span>

              <button
                onClick={handleUpload}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
              >
                Upload
              </button>
            </div>
          )}

          {uploadStatus && (
            <p className="mb-2 text-center text-sm text-zinc-400">
              {uploadStatus}
            </p>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 p-3">
            <button
              onClick={() => fileInputRef.current.click()}
              className="rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-800"
            >
              📎
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI tutor..."
              className="flex-1 bg-transparent outline-none placeholder:text-zinc-500"
            />

            <button
              onClick={handleSendMessage}
              className="rounded-lg bg-white px-4 py-2 font-medium text-black hover:bg-zinc-200"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ChatPage;
