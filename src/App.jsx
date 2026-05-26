import { useState, useRef, useCallback } from "react";
import "./App.css";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const SYSTEM_PROMPT = `You are Aetheris Research, an auditor-grade AI intelligence platform for deep document analysis. You analyze PDFs, financial reports, research papers, and technical documents with expert precision.

Structure your responses clearly with:
- Key insights and findings
- Extracted data points and metrics
- Identified risks or anomalies
- Synthesized conclusions

Use concise professional language suitable for researchers, analysts, and auditors.`;

const DEMO_SESSIONS = [
  { id: 1, icon: "📊", name: "Annual Report Q4 2024", time: "2 days ago" },
  { id: 2, icon: "🔬", name: "Drug Trial Meta-Analysis", time: "5 days ago" },
  { id: 3, icon: "🏦", name: "SEC 10-K Filing Review", time: "1 week ago" },
];

const DEMO_REPO = [
  { name: "fy2024_annual.pdf", color: "#4f7cff" },
  { name: "meta_analysis_v3.pdf", color: "#7c5cfc" },
  { name: "10k_filing_2024.pdf", color: "#2dd4a8" },
];

function formatResponse(text) {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((line, i) => {
      if (line.startsWith("## ") || line.startsWith("### "))
        return <h3 key={i} className="result-heading">{line.replace(/^#{2,3} /, "")}</h3>;
      if (line.startsWith("- ") || line.startsWith("• "))
        return <p key={i} className="result-bullet">{line.replace(/^[-•] /, "")}</p>;
      return <p key={i}>{line}</p>;
    });
}

function ResultCard({ title, badge, children }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <span className="result-title">✦ {title}</span>
        <span className={`result-badge ${badge.cls}`}>{badge.text}</span>
      </div>
      <div className="result-body">{children}</div>
    </div>
  );
}

function DocChip({ doc, onRemove }) {
  const size =
    doc.size < 1024 * 1024
      ? (doc.size / 1024).toFixed(1) + " KB"
      : (doc.size / 1024 / 1024).toFixed(1) + " MB";
  return (
    <div className="doc-chip">
      <span className="doc-icon">{doc.type === "application/pdf" ? "📄" : "🖼️"}</span>
      <span className="doc-name">{doc.name}</span>
      <span className="doc-size">{size}</span>
      <button className="doc-remove" onClick={() => onRemove(doc.id)}>✕</button>
    </div>
  );
}

export default function App() {
  const [docs, setDocs] = useState([]);
  const [results, setResults] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("New Analysis");
  const [savedSessions, setSavedSessions] = useState(DEMO_SESSIONS);
  const [repoFiles, setRepoFiles] = useState(DEMO_REPO);
  const [history, setHistory] = useState([]);
  const fileRef = useRef();
  const bottomRef = useRef();
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  const hasContent = docs.length > 0;

  const addFiles = useCallback((files) => {
    const valid = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    Array.from(files).forEach((f) => {
      if (!valid.includes(f.type)) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const b64 = e.target.result.split(",")[1];
        const doc = { id: Date.now() + Math.random(), name: f.name, size: f.size, type: f.type, b64 };
        setDocs((prev) => [...prev, doc]);
        setRepoFiles((prev) => [{ name: f.name, color: "#4f7cff" }, ...prev.slice(0, 5)]);
      };
      reader.readAsDataURL(f);
    });
  }, []);

  const removeDoc = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const runAnalysis = async () => {
    if (loading || !prompt.trim() || !docs.length) return;
    setLoading(true);
    const q = prompt.trim();
    setPrompt("");

    const contentBlocks = [
      ...docs.map((d) =>
        d.type === "application/pdf"
          ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: d.b64 } }
          : { type: "image", source: { type: "base64", media_type: d.type, data: d.b64 } }
      ),
      { type: "text", text: q },
    ];

    const newHistory = [...history, { role: "user", content: contentBlocks }];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          ...(apiKey && { "x-api-key": apiKey }),
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();
      setHistory([...newHistory, { role: "assistant", content: text }]);

      const title = q.length > 56 ? q.slice(0, 56) + "…" : q;
      setResults((prev) => [
        ...prev,
        { id: Date.now(), title, badge: { text: "Analysis", cls: "teal" }, content: formatResponse(text) },
      ]);
      setSessionTitle(q.length > 38 ? q.slice(0, 38) + "…" : q);
      setSavedSessions((prev) => [
        { id: Date.now(), icon: "📑", name: q.length > 28 ? q.slice(0, 28) + "…" : q, time: "Just now" },
        ...prev.slice(0, 6),
      ]);
    } catch (err) {
      setResults((prev) => [
        ...prev,
        { id: Date.now(), title: "Error", badge: { text: "Error", cls: "red" }, content: <p style={{ color: "#e05252" }}>{err.message}</p> },
      ]);
    }

    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const clearWorkspace = () => {
    setDocs([]);
    setResults([]);
    setPrompt("");
    setHistory([]);
    setSessionTitle("New Analysis");
  };

  return (
    <div className="ae-root">
      <header className="ae-topbar">
        <div className="ae-logo">
          <span className="ae-logo-dot" />
          Aetheris Research
          <span className="ae-badge">v1.5</span>
        </div>
        <span className="ae-status">
          <span className="ae-status-dot" />
          Multimodal Intelligence
        </span>
      </header>

      <div className="ae-body">
        {/* Sidebar */}
        <aside className="ae-sidebar">
          <section>
            <div className="ae-section-label">Saved Sessions</div>
            {savedSessions.map((s) => (
              <div key={s.id} className="ae-session-item" onClick={() => setSessionTitle(s.name)}>
                <span>{s.icon}</span>
                <div className="ae-session-meta">
                  <span className="ae-session-name">{s.name}</span>
                  <span className="ae-session-time">{s.time}</span>
                </div>
              </div>
            ))}
          </section>

          <section>
            <div className="ae-section-label">Document Repository</div>
            {repoFiles.map((f, i) => (
              <div key={i} className="ae-repo-item">
                <span className="ae-repo-dot" style={{ background: f.color }} />
                <span className="ae-repo-name">{f.name}</span>
              </div>
            ))}
            <button className="ae-btn" style={{ width: "100%", marginTop: 8 }} onClick={() => fileRef.current.click()}>
              + Upload Document
            </button>
          </section>
        </aside>

        {/* Main workspace */}
        <main className="ae-main">
          <div className="ae-toolbar">
            <span className="ae-toolbar-title">{sessionTitle}</span>
            {hasContent && (
              <button className="ae-btn" onClick={clearWorkspace}>🗑 Clear</button>
            )}
          </div>

          <div className="ae-content">
            {!hasContent ? (
              <div className="ae-empty">
                <div className="ae-empty-icon">⬡</div>
                <div className="ae-empty-title">Upload a document to begin</div>
                <p className="ae-empty-sub">
                  Drop a PDF or image below. Aetheris extracts insights, synthesizes key findings,
                  and answers your questions across research, finance, and technical domains.
                </p>
              </div>
            ) : null}

            {/* Upload zone */}
            <div
              className={`ae-upload-zone ${!hasContent ? "ae-upload-zone--prominent" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
            >
              <span className="ae-upload-icon">☁</span>
              <div className="ae-upload-title">Drag & drop or click to upload</div>
              <div className="ae-upload-sub">PDF, PNG, JPG — up to 50 pages</div>
            </div>

            {/* Doc chips */}
            {docs.map((d) => (
              <DocChip key={d.id} doc={d} onRemove={removeDoc} />
            ))}

            {/* Prompt */}
            {hasContent && (
              <div className="ae-prompt-row">
                <textarea
                  className="ae-prompt-input"
                  placeholder="Ask anything about this document — key findings, risks, data extraction, summaries..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runAnalysis(); } }}
                  rows={2}
                />
                <button className="ae-btn ae-btn-primary" onClick={runAnalysis} disabled={loading}>
                  {loading ? "…" : "⚡ Analyze"}
                </button>
              </div>
            )}

            {/* Thinking indicator */}
            {loading && (
              <div className="ae-thinking">
                <span className="ae-dots"><span /><span /><span /></span>
                Analyzing document with Aetheris Intelligence…
              </div>
            )}

            {/* Results */}
            {results.map((r) => (
              <ResultCard key={r.id} title={r.title} badge={r.badge}>
                {r.content}
              </ResultCard>
            ))}

            <div ref={bottomRef} />
          </div>
        </main>
      </div>

      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        accept=".pdf,.png,.jpg,.jpeg"
        multiple
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
