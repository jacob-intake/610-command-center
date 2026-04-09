import { useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentMonth = MONTHS[new Date().getMonth()] + " " + new Date().getFullYear();

function Logo610({ size = "md" }) {
  const scales = {
    sm: { numSize: "28px", subSize: "9px", gap: "2px" },
    md: { numSize: "48px", subSize: "12px", gap: "4px" },
    lg: { numSize: "72px", subSize: "16px", gap: "6px" },
  };
  const s = scales[size];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s.gap, lineHeight: 1 }}>
      <span style={{
        fontSize: s.numSize,
        fontWeight: "800",
        color: "#ffffff",
        fontFamily: "'Arial Rounded MT Bold', 'Arial Black', 'Helvetica Neue', sans-serif",
        letterSpacing: "-3px",
        lineHeight: 1,
      }}>
        610
      </span>
      <span style={{
        fontSize: s.subSize,
        fontWeight: "400",
        color: "#ffffff",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        letterSpacing: "3px",
        textTransform: "uppercase",
        lineHeight: 1,
      }}>
        Marketing
      </span>
    </div>
  );
}

function LogoHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{
        background: "#000",
        padding: "8px 14px",
        borderRadius: "3px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        lineHeight: 1,
      }}>
        <span style={{
          fontSize: "22px",
          fontWeight: "800",
          color: "#ffffff",
          fontFamily: "'Arial Rounded MT Bold', 'Arial Black', 'Helvetica Neue', sans-serif",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}>610</span>
        <span style={{
          fontSize: "7px",
          fontWeight: "400",
          color: "#ffffff",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          lineHeight: 1,
        }}>Marketing</span>
      </div>
      <div style={{ width: "1px", height: "32px", background: "#222" }} />
      <span style={{
        fontSize: "13px",
        color: "#666",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        letterSpacing: "1px",
        textTransform: "uppercase",
        fontWeight: "500",
      }}>Command Center</span>
    </div>
  );
}

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
    } catch {
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
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #000; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          .auth-card { animation: fadeIn 0.4s ease forwards; }
          input::placeholder { color: #444; }
          input:focus { border-color: #555 !important; outline: none; }
        `}</style>
        <div style={styles.authPage}>
          <div style={styles.authCard} className="auth-card">
            <div style={styles.authLogoWrap}>
              <Logo610 size="lg" />
            </div>
            <div style={styles.authDivider} />
            <h1 style={styles.authTitle}>Command Center</h1>
            <p style={styles.authSub}>Internal access only</p>
            <input
              type="password"
              placeholder="Access password"
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
              {checking ? "Verifying..." : "Enter"}
            </button>
            <p style={styles.authFooter}>610 Marketing & PR, San Diego</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .result-panel { animation: fadeIn 0.3s ease forwards; }
        input::placeholder { color: #3a3a3a; }
        textarea::placeholder { color: #3a3a3a; }
        input:focus, textarea:focus { border-color: #444 !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .copy-btn:hover { border-color: #555 !important; color: #ccc !important; }
        .gen-btn:hover:not(:disabled) { background: #e0e0e0 !important; }
      `}</style>

      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <LogoHeader />
            <div style={styles.headerRight}>
              <span style={styles.headerTag}>Content Agent</span>
              <span style={styles.headerVersion}>v1.0</span>
            </div>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.pageTitle}>
            <h1 style={styles.pageTitleText}>Monthly Content Generator</h1>
            <p style={styles.pageTitleSub}>Generate 25 social captions and 4 blog outlines in 610 voice</p>
          </div>

          <div style={styles.grid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <span style={styles.panelNum}>01</span>
                <h2 style={styles.panelTitle}>Content Brief</h2>
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
                <label style={styles.label}>Primary Topic <span style={{ color: "#fff" }}>*</span></label>
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
                  rows={5}
                  placeholder="Special instructions, themes to hit, topics to avoid, context for this month..."
                />
              </div>

              <button
                className="gen-btn"
                onClick={handleGenerate}
                disabled={loading || !primaryTopic.trim()}
                style={{
                  ...styles.generateBtn,
                  ...(loading || !primaryTopic.trim() ? styles.generateBtnDisabled : {})
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <span style={styles.spinner} />
                    Generating content...
                  </span>
                ) : (
                  "Generate This Month's Content"
                )}
              </button>

              {loading && (
                <p style={styles.loadingNote}>
                  Writing 25 captions and 4 blog outlines. Takes about 30 seconds.
                </p>
              )}

              {error && <div style={styles.errorBox}>{error}</div>}

              <div style={styles.infoBox}>
                <p style={styles.infoTitle}>Output includes</p>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoNum}>25</span>
                    <span style={styles.infoLabel}>Social captions for Facebook and LinkedIn</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoNum}>4</span>
                    <span style={styles.infoLabel}>Blog outlines ready to write</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoNum}>5</span>
                    <span style={styles.infoLabel}>Content types mixed across posts</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <span style={styles.panelNum}>02</span>
                <h2 style={styles.panelTitle}>Generated Content</h2>
              </div>

              {!result && !loading && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyLogoWrap}>
                    <Logo610 size="md" />
                  </div>
                  <p style={styles.emptyTitle}>Ready to generate</p>
                  <p style={styles.emptySub}>Fill in the content brief and click generate. Your captions and blog outlines will appear here.</p>
                </div>
              )}

              {loading && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyLogoWrap}>
                    <Logo610 size="md" />
                  </div>
                  <p style={styles.emptyTitle}>Working on it...</p>
                  <p style={styles.emptySub}>Claude is writing in 610 voice. This takes about 30 seconds.</p>
                </div>
              )}

              {result && (
                <div className="result-panel">
                  <div style={styles.resultMeta}>
                    <span style={styles.metaTag}>{result.month}</span>
                    <span style={styles.metaTag}>{result.primaryTopic}</span>
                    {result.secondaryTopic && <span style={styles.metaTag}>{result.secondaryTopic}</span>}
                    <span style={styles.metaTime}>
                      {new Date(result.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                      className="copy-btn"
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
                </div>
              )}
            </div>
          </div>
        </main>

        <footer style={styles.footer}>
          <span>610 Marketing & PR</span>
          <span style={{ color: "#1a1a1a" }}>|</span>
          <span>Command Center v1.0</span>
          <span style={{ color: "#1a1a1a" }}>|</span>
          <span>San Diego, CA</span>
        </footer>
      </div>
    </>
  );
}

const styles = {
  authPage: {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  authCard: {
    background: "#0d0d0d",
    border: "1px solid #1e1e1e",
    borderRadius: "6px",
    padding: "52px 44px",
    width: "100%",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },
  authLogoWrap: {
    background: "#000",
    padding: "20px 28px",
    borderRadius: "4px",
    marginBottom: "4px",
  },
  authDivider: {
    width: "40px",
    height: "1px",
    background: "#222",
    margin: "4px 0",
  },
  authTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#f0f0f0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.5px",
  },
  authSub: {
    fontSize: "12px",
    color: "#444",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    background: "#161616",
    border: "1px solid #272727",
    borderRadius: "3px",
    color: "#f0f0f0",
    fontSize: "14px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    transition: "border-color 0.15s",
  },
  inputError: {
    borderColor: "#c0392b",
  },
  errorMsg: {
    color: "#c0392b",
    fontSize: "12px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "3px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginTop: "4px",
  },
  btnDisabled: {
    background: "#1a1a1a",
    color: "#333",
    cursor: "not-allowed",
  },
  authFooter: {
    fontSize: "11px",
    color: "#2a2a2a",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.5px",
    marginTop: "8px",
  },
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#f0f0f0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottom: "1px solid #161616",
    padding: "0 40px",
    background: "#000",
  },
  headerInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerTag: {
    fontSize: "11px",
    color: "#555",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },
  headerVersion: {
    fontSize: "10px",
    color: "#2a2a2a",
    fontFamily: "monospace",
    border: "1px solid #1e1e1e",
    padding: "3px 8px",
    borderRadius: "2px",
  },
  main: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "40px 40px 60px",
    flex: 1,
    width: "100%",
  },
  pageTitle: {
    marginBottom: "32px",
  },
  pageTitleText: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f0f0f0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  pageTitleSub: {
    fontSize: "13px",
    color: "#444",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "400px 1fr",
    gap: "20px",
    alignItems: "start",
  },
  panel: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: "4px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "16px",
    borderBottom: "1px solid #161616",
  },
  panelNum: {
    fontSize: "10px",
    color: "#333",
    fontFamily: "monospace",
    fontWeight: "700",
    border: "1px solid #222",
    padding: "3px 7px",
    borderRadius: "2px",
    letterSpacing: "1px",
  },
  panelTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#e0e0e0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.2px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "11px",
    color: "#444",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "500",
  },
  textarea: {
    width: "100%",
    padding: "11px 14px",
    background: "#161616",
    border: "1px solid #272727",
    borderRadius: "3px",
    color: "#f0f0f0",
    fontSize: "13px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    resize: "vertical",
    lineHeight: "1.6",
    transition: "border-color 0.15s",
  },
  generateBtn: {
    width: "100%",
    padding: "13px",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "3px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginTop: "4px",
    transition: "background 0.15s",
  },
  generateBtnDisabled: {
    background: "#161616",
    color: "#2a2a2a",
    cursor: "not-allowed",
  },
  spinner: {
    width: "13px",
    height: "13px",
    border: "2px solid #33333388",
    borderTop: "2px solid #333",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
    flexShrink: 0,
  },
  loadingNote: {
    fontSize: "12px",
    color: "#333",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    textAlign: "center",
    marginTop: "-6px",
  },
  errorBox: {
    background: "#110808",
    border: "1px solid #c0392b",
    borderRadius: "3px",
    padding: "12px 14px",
    fontSize: "12px",
    color: "#c0392b",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    lineHeight: "1.5",
  },
  infoBox: {
    background: "#080808",
    border: "1px solid #141414",
    borderRadius: "3px",
    padding: "16px",
    marginTop: "2px",
  },
  infoTitle: {
    fontSize: "10px",
    color: "#333",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "14px",
    fontWeight: "600",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  infoNum: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    minWidth: "28px",
    lineHeight: 1,
  },
  infoLabel: {
    fontSize: "12px",
    color: "#3a3a3a",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    lineHeight: "1.4",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 40px",
    gap: "20px",
    textAlign: "center",
  },
  emptyLogoWrap: {
    background: "#000",
    padding: "20px 28px",
    borderRadius: "4px",
    opacity: 0.25,
  },
  emptyTitle: {
    fontSize: "15px",
    color: "#333",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: "600",
  },
  emptySub: {
    fontSize: "12px",
    color: "#2a2a2a",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    lineHeight: "1.7",
    maxWidth: "300px",
  },
  resultMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "4px",
  },
  metaTag: {
    fontSize: "11px",
    color: "#555",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    border: "1px solid #1e1e1e",
    padding: "3px 9px",
    borderRadius: "2px",
  },
  metaTime: {
    fontSize: "11px",
    color: "#2a2a2a",
    fontFamily: "monospace",
    marginLeft: "auto",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #1a1a1a",
    marginBottom: "4px",
  },
  tab: {
    padding: "10px 22px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#333",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: "500",
    marginBottom: "-1px",
    letterSpacing: "0.2px",
    transition: "color 0.15s",
  },
  tabActive: {
    color: "#f0f0f0",
    borderBottomColor: "#fff",
  },
  outputActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "8px",
  },
  copyBtn: {
    padding: "7px 16px",
    background: "transparent",
    border: "1px solid #222",
    borderRadius: "3px",
    color: "#444",
    fontSize: "11px",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    transition: "border-color 0.15s, color 0.15s",
  },
  outputBox: {
    background: "#080808",
    border: "1px solid #141414",
    borderRadius: "3px",
    padding: "24px",
    maxHeight: "600px",
    overflowY: "auto",
  },
  outputText: {
    fontSize: "13px",
    color: "#bbb",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.8",
  },
  footer: {
    borderTop: "1px solid #111",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    fontSize: "11px",
    color: "#2a2a2a",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.5px",
    background: "#000",
  },
};
