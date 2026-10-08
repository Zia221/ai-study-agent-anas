import { useRef, useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import PageHeader from "../components/PageHeader";

export default function DocumentsPage() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [fileFilter, setFileFilter] = useState("all");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/documents");

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();

      setDocuments(data.documents || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setError("");
    setSuccess("");
  }

  async function handleDelete(documentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(documentId);
      setError("");
      setSuccess("");

      const response = await apiFetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.detail || "Failed to delete document");
      }

      setDocuments((previousDocuments) =>
        previousDocuments.filter((document) => document.id !== documentId),
      );

      setSuccess("Document deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await apiFetch("/api/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      setSuccess(`${selectedFile.name} uploaded successfully.`);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDocuments();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
  }

  function formatDate(date) {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.filename
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const contentType = document.file_type?.toLowerCase() || "";

    let matchesFilter = true;

    if (fileFilter === "pdf") {
      matchesFilter = contentType.includes("pdf");
    }

    if (fileFilter === "docx") {
      matchesFilter =
        contentType.includes("word") || contentType.includes("document");
    }

    if (fileFilter === "txt") {
      matchesFilter = contentType.includes("text");
    }

    if (fileFilter === "image") {
      matchesFilter = contentType.startsWith("image/");
    }

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-full w-full p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-zinc-400">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && documents.length === 0) {
    return (
      <div className="min-h-full w-full p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            Page Header
            ===================================================== */}
        <PageHeader
  title="Documents"
  description="Manage your study materials in one place."
/>

        {/* =====================================================
            Upload Card
            ===================================================== */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Upload study material
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Upload a PDF, image, DOCX, or TXT file. Maximum size: 10 MB.
            </p>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-xl border border-dashed border-white/15 bg-black/10 p-8 text-center transition hover:border-white/25 hover:bg-white/[0.03] sm:p-10"
          >
            <div className="mb-3 text-4xl">📄</div>

            <p className="font-medium text-white">Click to choose a document</p>

            <p className="mt-2 text-sm text-zinc-500">
              PDF, PNG, JPG, DOCX, TXT
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="mt-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {selectedFile.name}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* =====================================================
            Documents Section
            ===================================================== */}
        <div className="mt-10">
          {/* Section Header */}
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">
              Recently uploaded
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Search and manage your study documents.
            </p>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:bg-white/[0.06]"
            />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["pdf", "PDF"],
              ["docx", "DOCX"],
              ["txt", "TXT"],
              ["image", "Images"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setFileFilter(value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  fileFilter === value
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mb-3 text-4xl">📄</div>

              <h3 className="text-lg font-semibold text-white">
                {documents.length === 0
                  ? "No documents yet"
                  : "No matching documents"}
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                {documents.length === 0
                  ? "Upload your first study document to get started."
                  : "Try a different search or filter."}
              </p>

              {documents.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  Upload your first document
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  {/* Document Info */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                      📄
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white">
                        {document.filename}
                      </h3>

                      <p className="mt-1 truncate text-sm text-zinc-400">
                        {document.file_type} ·{" "}
                        {formatFileSize(document.file_size)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Uploaded {formatDate(document.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  {/* Status + Delete */}
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        document.status === "ready"
                          ? "bg-green-500/10 text-green-400"
                          : document.status === "error"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {document.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(document.id)}
                      disabled={deletingId === document.id}
                      className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === document.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
