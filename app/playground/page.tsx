"use client";

import { useState } from "react";

export default function PlaygroundPage() {
  const [idea, setIdea] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setImageUrl(data.image);
      }
    } catch {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Product Concept Generator</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Describe your product idea and get a concept visualization.
      </p>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="e.g. A minimalist smart water bottle that tracks hydration and glows when you need to drink"
        rows={4}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !idea.trim()}
        style={{
          marginTop: 12,
          padding: "10px 24px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          background: loading ? "#999" : "#000",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Concept"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 16 }}>{error}</p>
      )}

      {imageUrl && (
        <div style={{ marginTop: 24 }}>
          <img
            src={imageUrl}
            alt="Generated product concept"
            style={{ width: "100%", borderRadius: 12 }}
          />
        </div>
      )}
    </div>
  );
}
