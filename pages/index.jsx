import { useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentMonth = MONTHS[new Date().getMonth()] + " " + new Date().getFullYear();

export default function CommandCenter() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [checking, setChecking] = useState(false);

  const [month, setMonth] = useState(currentMonth);
  const [primaryTopic, setPrimaryTopic] = useState("");
  const [secondaryTopic, setSecondaryTopic] = useState("");
  const [contentNotes, setContentNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("captions");
  const [copied, setCopied] = useState(false);

  async function handleAuth() {
    setChecking(true);
    setAuthError(false);
    try {
      const res = await fetch(`/api/key?key=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (data.valid) {
        setAuthenticated(true);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    }
    setChecking(false);
  }

  async function handleGenerate() {
    if (!primaryTopic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, primaryTopic, secondaryTopic, contentNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setActiveTab("captions");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Request failed. Please try again.");
    }
    setLoading(false);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!authenticated) {
    return (
      <div style={styles.authPage}>
        <div style={styles.authCard}>
          <div style={styles.logoMark}>610</div>
          <h1 style={styles.authTitle}>Command Center</h1>
          <p style={styles.authSub}>610 Marketing & PR — Internal Tool</p>
          <input
            type="password"
            placeholder="Enter access password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
            style={{ ...styles.input, ...(authError ? styles.inputError : {}) }}
          />
          {authError && <p style={styles.errorMsg}>Incorrect password. Try again.</p>}
          <button
            onClick={handleAuth}
            disabled={checking || !password}
            style={{ ...styles.btn, ...(checking || !password ? styles.btnDisabled : {}) }}
          >
            {checking ? "Checking..." : "Enter"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <span style={styles.headerLogo}>610</span>
            <span style={styles.headerTitle}>Command Center</span>
          </div>
          <span style={styles.headerTag}>Content Agent v1.0</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>

          {/* Left Panel: Controls */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelIcon}>01</span>
              <h2 style={styles.panelTitle}>Monthly Content Brief</h2>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Month</label>
              <input
                type="text"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={styles.input}
                placeholder="e.g. April 2026"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Primary Topic <span style={styles.required}>*</span></label>
              <input
                type="text"
                value={primaryTopic}
                onChange={e => setPrimaryTopic(e.target.value)}
                style={styles.input}
                placeholder="e.g. AI agents for small business"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Secondary Topic</label>
              <input
                type="text"
                value={secondaryTopic}
                onChange={e => setSecondaryTopic(e.target.value)}
                style={styles.input}
                placeholder="e.g. AEO and answer engine optimization"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Content Notes</label>
              <textarea
                value={contentNotes}
                onChange={e => setContentNotes(e.target.value)}
                style={styles.textarea}
                rows={4}
                placeholder="Any special instructions, themes to emphasize, topics to avoid, or context for this month..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !primaryTopic.trim()}
              style={{
                ...styles.generateBtn,
                ...(loading || !primaryTopic.trim() ? styles.generateBtnDisabled : {})
              }}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} />
                  Generating content...
                </span>
              ) : (
                "Generate This Month's Content"
              )}
            </button>

            {loading && (
              <div style={styles.loadingNote}>
                Generating 25 captions and 4 blog outlines. This takes about 30 seconds.
              </div>
            )}

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.infoBox}>
              <p style={styles.infoTitle}>What this generates</p>
              <p style={styles.infoText}>25 social captions for Facebook and LinkedIn, mixed across educational, thought leadership, AI insights, local San Diego, and promotional content types. Plus 4 detailed blog outlines ready to write.</p>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelIcon}>02</span>
              <h2 style={styles.panelTitle}>Generated Content</h2>
            </div>

            {!result && !loading && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>◎</div>
                <p style={styles.emptyTitle}>No content generated yet</p>
                <p style={styles.emptySub}>Fill in the brief on the left and click generate. Your 25 captions and 4 blog outlines will appear here.</p>
              </div>
            )}

            {result && (
              <>
                <div style={styles.resultMeta}>
                  <span style={styles.metaTag}>{result.month}</span>
                  <span style={styles.metaTag}>{result.primaryTopic}</span>
                  <span style={styles.metaTime}>
                    Generated {new Date(result.generatedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div style={styles.tabs}>
                  <button
                    onClick={() => setActiveTab("captions")}
                    style={{ ...styles.tab, ...(activeTab === "captions" ? styles.tabActive : {}) }}
                  >
                    Social Captions (25)
                  </button>
                  <button
                    onClick={() => setActiveTab("blogs")}
                    style={{ ...styles.tab, ...(activeTab === "blogs" ? styles.tabActive : {}) }}
                  >
                    Blog Outlines (4)
                  </button>
                </div>

                <div style={styles.outputActions}>
                  <button
                    onClick={() => copyToClipboard(activeTab === "captions" ? result.captions : result.blogs)}
                    style={styles.copyBtn}
                  >
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>

                <div style={styles.outputBox}>
                  <pre style={styles.outputText}>
                    {activeTab === "captions" ? result.captions : result.blogs}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  authPage: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', serif",
  },
  authCard: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "4px",
    padding: "48px",
    width: "100%",
    maxWidth: "380px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  logoMark: {
    fontSize: "42px",
    fontWeight: "700",
    color: "#1B4FD8",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-2px",
  },
  authTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#f5f5f5",
    margin: "0",
    fontFamily: "'Georgia', serif",
  },
  authSub: {
    fontSize: "13px",
    color: "#555",
    margin: "0 0 8px 0",
    fontFamily: "monospace",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "3px",
    color: "#f5f5f5",
    fontSize: "14px",
    fontFamily: "monospace",
    outline: "none",
    boxSizing: "border-box",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  errorMsg: {
    color: "#dc2626",
    fontSize: "12px",
    margin: "0",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#1B4FD8",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.5px",
  },
  btnDisabled: {
    background: "#1a1a1a",
    color: "#444",
    cursor: "not-allowed",
  },
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#f5f5f5",
    fontFamily: "'Georgia', serif",
  },
  header: {
    borderBottom: "1px solid #1a1a1a",
    padding: "0 32px",
    background: "#0d0d0d",
  },
  headerInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerLogo: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1B4FD8",
    letterSpacing: "-1px",
  },
  headerTitle: {
    fontSize: "15px",
    color: "#888",
    fontFamily: "monospace",
  },
  headerTag: {
    fontSize: "11px",
    color: "#333",
    fontFamily: "monospace",
    border: "1px solid #222",
    padding: "4px 10px",
    borderRadius: "2px",
  },
  main: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 32px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "24px",
    alignItems: "start",
  },
  panel: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "4px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "4px",
  },
  panelIcon: {
    fontSize: "11px",
    color: "#1B4FD8",
    fontFamily: "monospace",
    fontWeight: "700",
    border: "1px solid #1B4FD8",
    padding: "3px 7px",
    borderRadius: "2px",
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f5f5f5",
    margin: "0",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "12px",
    color: "#666",
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  required: {
    color: "#1B4FD8",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "3px",
    color: "#f5f5f5",
    fontSize: "14px",
    fontFamily: "monospace",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    lineHeight: "1.5",
  },
  generateBtn: {
    width: "100%",
    padding: "14px",
    background: "#1B4FD8",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.3px",
    marginTop: "4px",
  },
  generateBtnDisabled: {
    background: "#1a1a1a",
    color: "#333",
    cursor: "not-allowed",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #ffffff33",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  loadingNote: {
    fontSize: "12px",
    color: "#555",
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: "-8px",
  },
  errorBox: {
    background: "#1a0a0a",
    border: "1px solid #dc2626",
    borderRadius: "3px",
    padding: "12px",
    fontSize: "13px",
    color: "#dc2626",
    fontFamily: "monospace",
  },
  infoBox: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: "3px",
    padding: "16px",
    marginTop: "4px",
  },
  infoTitle: {
    fontSize: "11px",
    color: "#1B4FD8",
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px 0",
  },
  infoText: {
    fontSize: "12px",
    color: "#555",
    fontFamily: "monospace",
    margin: "0",
    lineHeight: "1.6",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 40px",
    gap: "16px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "48px",
    color: "#222",
  },
  emptyTitle: {
    fontSize: "16px",
    color: "#444",
    margin: "0",
  },
  emptySub: {
    fontSize: "13px",
    color: "#333",
    fontFamily: "monospace",
    margin: "0",
    lineHeight: "1.6",
    maxWidth: "320px",
  },
  resultMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  metaTag: {
    fontSize: "11px",
    color: "#1B4FD8",
    fontFamily: "monospace",
    border: "1px solid #1B4FD822",
    background: "#1B4FD808",
    padding: "3px 8px",
    borderRadius: "2px",
  },
  metaTime: {
    fontSize: "11px",
    color: "#333",
    fontFamily: "monospace",
    marginLeft: "auto",
  },
  tabs: {
    display: "flex",
    gap: "2px",
    borderBottom: "1px solid #1e1e1e",
    marginBottom: "4px",
  },
  tab: {
    padding: "10px 20px",
    background: "transparent",
    border: "none",
    color: "#555",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    borderBottom: "2px solid transparent",
    marginBottom: "-1px",
  },
  tabActive: {
    color: "#f5f5f5",
    borderBottomColor: "#1B4FD8",
  },
  outputActions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  copyBtn: {
    padding: "7px 16px",
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: "3px",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "monospace",
  },
  outputBox: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: "3px",
    padding: "24px",
    maxHeight: "620px",
    overflowY: "auto",
  },
  outputText: {
    fontSize: "13px",
    color: "#ccc",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: "0",
    lineHeight: "1.7",
  },
};
