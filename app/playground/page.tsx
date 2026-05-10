"use client";

import { useState, useEffect, useRef } from "react";

interface BrandAnalysis {
  brandValues: string[];
  colorPalette: string[];
  targetAudience: string;
  brandPersonality: string;
  competitivePositioning: string;
  designStyle: string;
}

export default function PlaygroundPage() {
  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Company context
  const [companyName, setCompanyName] = useState("");
  const [companyContext, setCompanyContext] = useState("");
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysis | null>(null);
  const [analyzingCompany, setAnalyzingCompany] = useState(false);

  // Step 2: Product idea
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

  async function handleAnalyzeCompany() {
    if (!companyName.trim()) return;
    setAnalyzingCompany(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyContext }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyze company");
      } else {
        setBrandAnalysis(data.analysis);
        setStep(2);
      }
    } catch {
      setError("Failed to connect to API");
    } finally {
      setAnalyzingCompany(false);
    }
  }

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
        body: JSON.stringify({ idea, brandAnalysis, companyName }),
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
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: step === 2 ? "pointer" : "default",
          }}
          onClick={() => step === 2 && setStep(1)}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: step === 1 ? "#fff" : brandAnalysis ? "#22c55e" : "#333",
              color: step === 1 ? "#000" : brandAnalysis ? "#fff" : "#999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {brandAnalysis ? "\u2713" : "1"}
          </div>
          <span style={{ color: step === 1 ? "#fff" : "#666", fontSize: 14 }}>
            Company
          </span>
        </div>
        <div
          style={{
            width: 40,
            height: 1,
            background: "#333",
            alignSelf: "center",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: step === 2 ? "#fff" : "#333",
              color: step === 2 ? "#000" : "#999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            2
          </div>
          <span style={{ color: step === 2 ? "#fff" : "#666", fontSize: 14 }}>
            Product Concept
          </span>
        </div>
      </div>

      {/* Step 1: Company Context */}
      {step === 1 && (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Company Context</h1>
          <p style={{ color: "#999", marginBottom: 24 }}>
            Tell us about the company so we can align product concepts with the brand.
          </p>

          <label style={{ color: "#ccc", fontSize: 14, marginBottom: 6, display: "block" }}>
            Company Name *
          </label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Red Bull, Nike, Patagonia"
            style={{
              width: "100%",
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #333",
              backgroundColor: "#111",
              color: "#fff",
              fontFamily: "inherit",
              marginBottom: 20,
              boxSizing: "border-box",
            }}
          />

          <label style={{ color: "#ccc", fontSize: 14, marginBottom: 6, display: "block" }}>
            Supporting Context{" "}
            <span style={{ color: "#666" }}>(optional)</span>
          </label>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 8, marginTop: 0 }}>
            Paste excerpts from a corporate strategy, annual report, brand guidelines, or any
            other relevant documents.
          </p>
          <textarea
            value={companyContext}
            onChange={(e) => setCompanyContext(e.target.value)}
            placeholder="Paste company strategy, brand guidelines, annual report excerpts..."
            rows={6}
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
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleAnalyzeCompany}
            disabled={analyzingCompany || !companyName.trim()}
            style={{
              marginTop: 12,
              padding: "10px 24px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              background: analyzingCompany ? "#333" : "#fff",
              color: analyzingCompany ? "#999" : "#000",
              cursor: analyzingCompany ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {analyzingCompany ? "Analyzing Brand..." : "Analyze Brand"}
          </button>

          {analyzingCompany && (
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  border: "2px solid #222",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span style={{ color: "#666", fontSize: 14 }}>
                Researching brand attributes...
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </>
      )}

      {/* Step 2: Product Concept */}
      {step === 2 && (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Product Concept Generator</h1>
          <p style={{ color: "#999", marginBottom: 24 }}>
            Describe your product idea and get a brand-aligned concept visualization.
          </p>

          {/* Brand summary card */}
          {brandAnalysis && (
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid #222",
                backgroundColor: "#0a0a0a",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 14, color: "#999" }}>
                  Brand Profile: {companyName}
                </h3>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "1px solid #333",
                    color: "#666",
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {brandAnalysis.brandValues.map((value) => (
                  <span
                    key={value}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      backgroundColor: "#1a1a1a",
                      color: "#ccc",
                      fontSize: 12,
                      border: "1px solid #2a2a2a",
                    }}
                  >
                    {value}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {brandAnalysis.colorPalette.map((color) => (
                  <div
                    key={color}
                    title={color}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: color,
                      border: "1px solid #333",
                    }}
                  />
                ))}
              </div>

              <p style={{ color: "#888", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: "#aaa" }}>Audience:</strong>{" "}
                {brandAnalysis.targetAudience}
              </p>
              <p style={{ color: "#888", fontSize: 13, margin: "6px 0 0", lineHeight: 1.5 }}>
                <strong style={{ color: "#aaa" }}>Design Style:</strong>{" "}
                {brandAnalysis.designStyle}
              </p>
            </div>
          )}

          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={`e.g. A caffeinated chewing gum product line for ${companyName || "the brand"}`}
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
              boxSizing: "border-box",
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
        </>
      )}

      {error && (
        <p style={{ color: "#ef4444", marginTop: 16 }}>{error}</p>
      )}
    </div>
  );
}
