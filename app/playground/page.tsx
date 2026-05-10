"use client";

import { useState, useEffect, useRef } from "react";

export default function PlaygroundPage() {
  const [idea, setIdea] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  async function handleGenerate() {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setTotalTime(null);

    const start = Date.now();
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
        setTotalTime((Date.now() - start) / 1000);
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
      <p style={{ color: "#999", marginBottom: 24 }}>
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
          border: "1px solid #333",
          backgroundColor: "#111",
          color: "#fff",
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
          background: loading ? "#333" : "#fff",
          color: loading ? "#999" : "#000",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Generating..." : "Generate Concept"}
      </button>

      {loading && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: 12,
              backgroundColor: "#111",
              border: "1px solid #222",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div style={{ position: "relative", width: 48, height: 48 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: "3px solid #222",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
            <p style={{ color: "#666", fontSize: 14, margin: 0 }}>
              Generating your concept...
            </p>
            <p
              style={{
                color: "#444",
                fontSize: 32,
                fontVariantNumeric: "tabular-nums",
                margin: 0,
                fontWeight: 600,
              }}
            >
              {elapsed.toFixed(1)}s
            </p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <p style={{ color: "#ef4444", marginTop: 16 }}>{error}</p>
      )}

      {imageUrl && (
        <div style={{ marginTop: 24 }}>
          {totalTime !== null && (
            <p style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>
              Generated in {totalTime.toFixed(1)}s
            </p>
          )}
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
