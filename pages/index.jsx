import { useState, useRef, useEffect } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentMonth = MONTHS[new Date().getMonth()] + " " + new Date().getFullYear();

const CLIENTS = [
  { id: "610-marketing", name: "610 Marketing & PR", location: "San Diego, CA" },
];

const TYPE_COLORS = {
  "Educational tip":    { bg: "#0a1628", border: "#1a3a6b", label: "#4a90d9" },
  "Thought leadership": { bg: "#0f0a1a", border: "#3a1a6b", label: "#9b6bd9" },
  "AI and automation":  { bg: "#0a1a14", border: "#1a5a3a", label: "#4ad9a0" },
  "San Diego local":    { bg: "#1a1200", border: "#5a4200", label: "#d9a84a" },
  "610 services":       { bg: "#1a0a0a", border: "#5a1a1a", label: "#d94a4a" },
};

const BATCH_LABELS = [
  "Writing educational tips...",
  "Writing thought leadership...",
  "Writing AI and automation posts...",
  "Writing local and promo posts...",
  "Writing final captions...",
  "Writing blog outlines...",
];

function Logo610({ size = "md" }) {
  const s = { sm:{n:"28px",t:"9px"}, md:{n:"48px",t:"12px"}, lg:{n:"72px",t:"16px"} }[size];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px", lineHeight:1 }}>
      <span style={{ fontSize:s.n, fontWeight:"800", color:"#fff", fontFamily:"'Arial Black','Helvetica Neue',sans-serif", letterSpacing:"-3px", lineHeight:1 }}>610</span>
      <span style={{ fontSize:s.t, fontWeight:"400", color:"#fff", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"3px", textTransform:"uppercase", lineHeight:1 }}>Marketing</span>
    </div>
  );
}

function LogoHeader() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
      <div style={{ background:"#000", padding:"8px 14px", borderRadius:"3px", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
        <span style={{ fontSize:"22px", fontWeight:"800", color:"#fff", fontFamily:"'Arial Black','Helvetica Neue',sans-serif", letterSpacing:"-2px", lineHeight:1 }}>610</span>
        <span style={{ fontSize:"7px", color:"#fff", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"2.5px", textTransform:"uppercase", lineHeight:1 }}>Marketing</span>
      </div>
      <div style={{ width:"1px", height:"32px", background:"#222" }} />
      <span style={{ fontSize:"13px", color:"#666", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"1px", textTransform:"uppercase", fontWeight:"500" }}>Command Center</span>
    </div>
  );
}

function btnStyle(bg, border, color, extra = {}) {
  return { padding:"6px 12px", background:bg, border:`1px solid ${border}`, borderRadius:"3px", color, fontSize:"11px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"0.5px", textTransform:"uppercase", whiteSpace:"nowrap", ...extra };
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type:"text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function applyWatermark(imageSource) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 1024);
      const logo = new Image();
      logo.onload = () => {
        const logoW = 150;
        const logoH = Math.round((logo.height / logo.width) * logoW);
        const x = Math.round((1024 - logoW) / 2);
        const y = 1024 - logoH - 20;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - 14, y - 10, logoW + 28, logoH + 20, 6);
        else ctx.rect(x - 14, y - 10, logoW + 28, logoH + 20);
        ctx.fill();
        ctx.drawImage(logo, x, y, logoW, logoH);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      logo.onerror = () => resolve(canvas.toDataURL("image/jpeg", 0.92));
      logo.src = "/logo-watermark.png?" + Date.now();
    };
    img.onerror = () => resolve(null);
    img.src = imageSource;
  });
}

async function fetchImage(caption, primaryTopic, clientId) {
  const res = await fetch("/api/images", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ caption, primaryTopic, clientId }),
  });
  const data = await res.json();
  if (data.success && data.imageUrl) return data.imageUrl;
  throw new Error(data.error || "Image generation failed");
}

function TrendingTopicsPanel({ onUseTopic }) {
  const [researching, setResearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthName = nextMonth.toLocaleString("default", { month: "long", year: "numeric" });

  async function handleResearch() {
    setResearching(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/trending", { method: "POST" });
      const data = await res.json();
      if (data.success) setResult(data);
      else setError(data.error || "Research failed.");
    } catch (err) { setError(err.message); }
    setResearching(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"4px", padding:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", paddingBottom:"16px", borderBottom:"1px solid #161616", marginBottom:"20px" }}>
          <span style={{ fontSize:"10px", color:"#333", fontFamily:"monospace", border:"1px solid #222", padding:"3px 7px", borderRadius:"2px" }}>03</span>
          <h2 style={{ fontSize:"15px", fontWeight:"600", color:"#e0e0e0" }}>Trending Topics Research</h2>
        </div>

        <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"16px", marginBottom:"20px" }}>
          <p style={{ fontSize:"11px", color:"#4a90d9", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 8px 0", fontWeight:"600" }}>Automated Schedule</p>
          <p style={{ fontSize:"12px", color:"#555", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.6", margin:"0 0 8px 0" }}>
            This runs automatically on the 28th of every month and writes the next month's content brief directly to your Google Sheet.
          </p>
          <p style={{ fontSize:"12px", color:"#444", fontFamily:"monospace" }}>
            Next auto-run: 28th of this month for {nextMonthName}
          </p>
        </div>

        <div style={{ marginBottom:"20px" }}>
          <p style={{ fontSize:"11px", color:"#444", fontFamily:"'Helvetica Neue',Arial,sans-serif", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"10px", fontWeight:"600" }}>Researches These Verticals</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
            {["AI agents", "Digital marketing", "SEO and AEO", "GEO", "Content creation", "AI automation", "Web development", "Podcast production"].map(v => (
              <span key={v} style={{ fontSize:"11px", color:"#555", fontFamily:"monospace", border:"1px solid #1e1e1e", padding:"3px 8px", borderRadius:"2px" }}>{v}</span>
            ))}
          </div>
        </div>

        <button
          onClick={handleResearch}
          disabled={researching}
          style={{ width:"100%", padding:"13px", background:researching?"#161616":"#fff", color:researching?"#2a2a2a":"#000", border:"none", borderRadius:"3px", fontSize:"13px", fontWeight:"700", cursor:researching?"not-allowed":"pointer", letterSpacing:"1px", textTransform:"uppercase" }}
        >
          {researching ? (
            <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
              <span style={{ width:"13px", height:"13px", border:"2px solid #33333388", borderTop:"2px solid #333", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} />
              Researching trending topics...
            </span>
          ) : "Run Research Now"}
        </button>

        {researching && (
          <p style={{ fontSize:"12px", color:"#444", textAlign:"center", marginTop:"8px", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
            Searching the web for trending topics across all verticals. About 30 seconds.
          </p>
        )}

        {error && (
          <div style={{ background:"#110808", border:"1px solid #c0392b", borderRadius:"3px", padding:"12px", fontSize:"12px", color:"#c0392b", marginTop:"16px", lineHeight:"1.5" }}>{error}</div>
        )}
      </div>

      {result && (
        <div style={{ background:"#0d0d0d", border:"1px solid #1a5a3a", borderRadius:"4px", padding:"28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
            <div>
              <p style={{ fontSize:"10px", color:"#4ad9a0", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px 0", fontWeight:"600" }}>Research Complete</p>
              <h3 style={{ fontSize:"16px", fontWeight:"700", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:0 }}>{result.month}</h3>
            </div>
            <div style={{ background:"#0a1a0a", border:"1px solid #1a5a1a", borderRadius:"3px", padding:"6px 12px" }}>
              <span style={{ fontSize:"11px", color:"#4ad9a0", fontFamily:"monospace" }}>Written to Google Sheet</span>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
            <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"14px" }}>
              <p style={{ fontSize:"10px", color:"#444", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 6px 0" }}>Primary Topic</p>
              <p style={{ fontSize:"14px", fontWeight:"600", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:0, lineHeight:"1.4" }}>{result.primaryTopic}</p>
            </div>
            <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"14px" }}>
              <p style={{ fontSize:"10px", color:"#444", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 6px 0" }}>Secondary Topic</p>
              <p style={{ fontSize:"14px", fontWeight:"600", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:0, lineHeight:"1.4" }}>{result.secondaryTopic}</p>
            </div>
          </div>

          <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"14px", marginBottom:"16px" }}>
            <p style={{ fontSize:"10px", color:"#444", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 8px 0" }}>Content Notes</p>
            <p style={{ fontSize:"13px", color:"#888", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.7", margin:0 }}>{result.contentNotes}</p>
          </div>

          {result.trendingTopics && result.trendingTopics.length > 0 && (
            <div style={{ marginBottom:"20px" }}>
              <p style={{ fontSize:"10px", color:"#444", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 10px 0" }}>All Trending Topics Found</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {result.trendingTopics.map((topic, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 12px", background:"#080808", border:"1px solid #141414", borderRadius:"3px" }}>
                    <span style={{ fontSize:"10px", color:"#333", fontFamily:"monospace", minWidth:"16px" }}>{i + 1}.</span>
                    <span style={{ fontSize:"13px", color:"#888", fontFamily:"'Helvetica Neue',Arial,sans-serif", flex:1 }}>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onUseTopic(result)}
            style={{ width:"100%", padding:"12px", background:"#0a1628", border:"1px solid #1a3a6b", borderRadius:"3px", color:"#4a90d9", fontSize:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"1px", textTransform:"uppercase" }}
          >
            Use These Topics in Content Brief
          </button>
        </div>
      )}
    </div>
  );
}

function CaptionCard({ caption, imageUrl, imageLoading, imageFailed, onSchedule, onRetryImage, onRenderNew, month, primaryTopic }) {
  const [copied, setCopied] = useState(false);
  const [watermarked, setWatermarked] = useState(null);
  const [watermarking, setWatermarking] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const fileInputRef = useRef(null);
  const colors = TYPE_COLORS[caption.type] || TYPE_COLORS["Educational tip"];
  const sourceImage = customImage || imageUrl;

  useEffect(() => {
    if (sourceImage && !watermarking) {
      setWatermarking(true);
      setWatermarked(null);
      applyWatermark(sourceImage).then(result => {
        if (result) setWatermarked(result);
        setWatermarking(false);
      });
    }
  }, [sourceImage]);

  function handleReplaceImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCustomImage(ev.target.result); setWatermarked(null); };
    reader.readAsDataURL(file);
  }

  function handleDownloadImage() {
    const finalImage = watermarked || sourceImage;
    if (!finalImage) return;
    const a = document.createElement("a");
    a.href = finalImage; a.download = `610-post-${caption.number}.jpg`; a.click();
  }

  const displayImage = watermarked || sourceImage;

  return (
    <div style={{ background:colors.bg, border:`1px solid ${colors.border}`, borderRadius:"6px", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"10px", color:colors.label, fontFamily:"'Helvetica Neue',Arial,sans-serif", textTransform:"uppercase", letterSpacing:"1.2px", fontWeight:"600" }}>{caption.type}</span>
        <span style={{ fontSize:"10px", color:"#333", fontFamily:"monospace" }}>#{caption.number}</span>
      </div>

      <div style={{ position:"relative", width:"100%", paddingBottom:"100%", background:"#0a0a0a", overflow:"hidden" }}>
        {(imageLoading || watermarking) && !displayImage && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"12px" }}>
            <div style={{ opacity:0.2 }}><Logo610 size="sm" /></div>
            <span style={{ fontSize:"11px", color:"#333", fontFamily:"monospace" }}>{imageLoading?"Generating...":"Applying watermark..."}</span>
          </div>
        )}
        {imageFailed && !displayImage && !imageLoading && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"12px", padding:"20px" }}>
            <span style={{ fontSize:"11px", color:"#5a2a2a", fontFamily:"monospace", textAlign:"center" }}>Image failed</span>
            <button onClick={() => onRetryImage(caption)} style={{ padding:"7px 16px", background:"#1a0a0a", border:"1px solid #5a1a1a", borderRadius:"3px", color:"#d94a4a", fontSize:"11px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              Retry Image
            </button>
          </div>
        )}
        {displayImage && <img src={displayImage} alt={caption.type} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
        {!displayImage && !imageLoading && !watermarking && !imageFailed && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", opacity:0.1 }}>
            <Logo610 size="sm" />
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleReplaceImage} style={{ display:"none" }} />
        <div style={{ position:"absolute", top:"8px", right:"8px", display:"flex", gap:"4px" }}>
          <button onClick={() => onRenderNew && onRenderNew(caption)} style={{ background:"rgba(0,0,0,0.75)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"3px", color:"#4a90d9", fontSize:"10px", padding:"4px 8px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"0.5px", textTransform:"uppercase" }}>
            New Image
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ background:"rgba(0,0,0,0.75)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"3px", color:"#ccc", fontSize:"10px", padding:"4px 8px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"0.5px", textTransform:"uppercase" }}>
            Replace
          </button>
        </div>
      </div>

      <div style={{ padding:"14px", flex:1 }}>
        <p style={{ fontSize:"13px", color:"#ccc", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.7", margin:0 }}>{caption.text}</p>
      </div>

      <div style={{ padding:"10px 14px", borderTop:`1px solid ${colors.border}`, display:"flex", gap:"6px", flexWrap:"wrap" }}>
        <button onClick={() => { navigator.clipboard.writeText(caption.text); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={btnStyle("#161616","#2a2a2a","#888")}>{copied?"Copied":"Copy"}</button>
        <button onClick={() => downloadText(`610-caption-${caption.number}.txt`, `610 Marketing & PR\n${month} - ${primaryTopic}\nType: ${caption.type}\n\n${caption.text}`)} style={btnStyle("#161616","#2a2a2a","#888")}>Download Text</button>
        {displayImage && <button onClick={handleDownloadImage} style={btnStyle("#161616","#2a2a2a","#888")}>Save Image</button>}
        <button onClick={() => onSchedule(caption, watermarked || sourceImage, imageUrl)} style={{ ...btnStyle("#fff","#fff","#000"), marginLeft:"auto", fontWeight:"700" }}>Schedule</button>
      </div>
    </div>
  );
}

function BlogCard({ blog, month, primaryTopic, clientId, onWriteBlog }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fullText = `${blog.title}\n\n${blog.summary}\n\n${(blog.sections||[]).map((s,i)=>`${i+1}. ${s.header}\n${s.description}`).join("\n\n")}`;

  return (
    <div style={{ background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:"6px", overflow:"hidden" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #1a1a1a", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }} onClick={()=>setExpanded(!expanded)}>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:"10px", color:"#444", fontFamily:"monospace", border:"1px solid #222", padding:"2px 7px", borderRadius:"2px", display:"inline-block", marginBottom:"8px" }}>Blog {blog.number}</span>
          <h3 style={{ fontSize:"15px", fontWeight:"700", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:0, lineHeight:"1.4" }}>{blog.title}</h3>
        </div>
        <span style={{ fontSize:"20px", color:"#444", marginLeft:"16px", lineHeight:1 }}>{expanded?"−":"+"}</span>
      </div>
      {expanded && (
        <div style={{ padding:"20px" }}>
          <p style={{ fontSize:"13px", color:"#888", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.7", margin:"0 0 20px 0", paddingBottom:"16px", borderBottom:"1px solid #161616" }}>{blog.summary}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {(blog.sections||[]).map((s,i) => (
              <div key={i} style={{ display:"flex", gap:"14px" }}>
                <span style={{ fontSize:"12px", color:"#333", fontFamily:"monospace", minWidth:"22px", paddingTop:"2px" }}>{i+1}.</span>
                <div>
                  <p style={{ fontSize:"13px", fontWeight:"600", color:"#ccc", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:"0 0 4px 0" }}>{s.header}</p>
                  <p style={{ fontSize:"12px", color:"#555", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.6", margin:0 }}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ padding:"10px 16px", borderTop:"1px solid #161616", display:"flex", gap:"6px" }}>
        <button onClick={()=>{navigator.clipboard.writeText(fullText);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={btnStyle("#161616","#2a2a2a","#888")}>{copied?"Copied":"Copy Outline"}</button>
        <button onClick={()=>downloadText(`610-blog-outline-${blog.number}.txt`,`610 Marketing & PR\n${month}\n\n${fullText}`)} style={btnStyle("#161616","#2a2a2a","#888")}>Download Outline</button>
        <button onClick={()=>onWriteBlog(blog)} style={{ ...btnStyle("#fff","#fff","#000"), marginLeft:"auto", fontWeight:"700" }}>Write Full Blog</button>
      </div>
    </div>
  );
}

function BlogWriter({ blog, clientId, onClose }) {
  const [writing, setWriting] = useState(false);
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { writeBlog(); }, []);

  async function writeBlog() {
    setWriting(true); setError(null);
    try {
      const res = await fetch("/api/blog", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ blog, primaryTopic: blog.title, clientId }),
      });
      const data = await res.json();
      if (data.success) setContent(data.content);
      else setError(data.error || "Blog generation failed.");
    } catch (err) { setError(err.message); }
    setWriting(false);
  }

  async function publishToWordPress() {
    setPublishing(true); setError(null);
    try {
      const res = await fetch("/api/wordpress", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ title: blog.title, content, clientId }),
      });
      const data = await res.json();
      if (data.success) setPublished(data);
      else setError(data.error || "WordPress publish failed.");
    } catch (err) { setError(err.message); }
    setPublishing(false);
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ position:"fixed", inset:0, background:"#000000ee", display:"flex", alignItems:"stretch", justifyContent:"flex-end", zIndex:1000 }}>
      <div style={{ width:"100%", maxWidth:"800px", background:"#0d0d0d", borderLeft:"1px solid #1e1e1e", display:"flex", flexDirection:"column", height:"100vh" }}>
        <div style={{ padding:"20px 28px", borderBottom:"1px solid #1a1a1a", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <p style={{ fontSize:"10px", color:"#444", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px" }}>Blog Writer — GPT-4o</p>
            <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:0, lineHeight:"1.3" }}>{blog.title}</h2>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:"22px", cursor:"pointer", lineHeight:1, padding:"4px" }}>x</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"28px" }}>
          {writing && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 40px", gap:"20px", textAlign:"center" }}>
              <div style={{ background:"#000", padding:"20px 28px", borderRadius:"4px", opacity:0.3 }}><Logo610 size="md" /></div>
              <p style={{ fontSize:"15px", color:"#555", fontWeight:"600" }}>GPT-4o is writing your blog...</p>
              <p style={{ fontSize:"12px", color:"#333" }}>Writing a full 2,000 word SEO-optimized post. About 30 seconds.</p>
            </div>
          )}
          {error && <div style={{ background:"#110808", border:"1px solid #c0392b", borderRadius:"3px", padding:"16px", color:"#c0392b", fontSize:"13px", lineHeight:"1.5" }}>{error}</div>}
          {published && (
            <div style={{ background:"#0a1a0a", border:"1px solid #1a5a1a", borderRadius:"4px", padding:"16px", marginBottom:"20px" }}>
              <p style={{ fontSize:"12px", color:"#4ad9a0", fontFamily:"'Helvetica Neue',Arial,sans-serif", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 8px 0" }}>Published to WordPress as Draft</p>
              <a href={published.editUrl} target="_blank" rel="noreferrer" style={{ fontSize:"13px", color:"#4a90d9", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>Open in WordPress Editor</a>
            </div>
          )}
          {content && !writing && (
            <div style={{ fontFamily:"'Helvetica Neue',Arial,sans-serif", fontSize:"14px", color:"#ccc", lineHeight:"1.9", whiteSpace:"pre-wrap" }}>{content}</div>
          )}
        </div>
        {content && !writing && (
          <div style={{ padding:"16px 28px", borderTop:"1px solid #1a1a1a", display:"flex", gap:"8px", alignItems:"center", flexShrink:0 }}>
            <span style={{ fontSize:"11px", color:"#333", fontFamily:"monospace" }}>{wordCount} words</span>
            <div style={{ marginLeft:"auto", display:"flex", gap:"8px" }}>
              <button onClick={() => navigator.clipboard.writeText(content)} style={btnStyle("#161616","#2a2a2a","#888")}>Copy</button>
              <button onClick={() => downloadText(`610-blog-${blog.number}.txt`, `${blog.title}\n\n${content}`)} style={btnStyle("#161616","#2a2a2a","#888")}>Download</button>
              <button onClick={publishToWordPress} disabled={publishing||!!published} style={{ ...btnStyle(published?"#0a1a0a":publishing?"#161616":"#fff", published?"#1a5a1a":publishing?"#2a2a2a":"#fff", published?"#4ad9a0":publishing?"#333":"#000"), fontWeight:"700", padding:"8px 20px" }}>
                {published?"Published":publishing?"Publishing...":"Push to WordPress"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleModal({ caption, watermarkedImage, rawImageUrl, onClose }) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const defaultDate = now.toISOString().slice(0, 16);
  const [scheduledAt, setScheduledAt] = useState(defaultDate);
  const [platforms, setPlatforms] = useState({ facebook: true, linkedin: true });
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(null);
  const [error, setError] = useState(null);
  const selectedPlatforms = Object.entries(platforms).filter(([,v]) => v).map(([k]) => k);

  async function handleSchedule() {
    if (selectedPlatforms.length === 0) { setError("Select at least one platform."); return; }
    setScheduling(true); setError(null);
    try {
      const res = await fetch("/api/buffer", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ text: caption.text, imageUrl: rawImageUrl || null, scheduledAt: new Date(scheduledAt).toISOString(), platforms: selectedPlatforms }),
      });
      const data = await res.json();
      if (data.success) setScheduled(data);
      else setError(data.error || "Scheduling failed.");
    } catch (err) { setError(err.message); }
    setScheduling(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"#000000cc", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#111", border:"1px solid #2a2a2a", borderRadius:"6px", padding:"32px", maxWidth:"520px", width:"90%", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
          <h3 style={{ fontSize:"16px", fontWeight:"600", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:0 }}>Buffer Scheduler</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:"22px", cursor:"pointer", lineHeight:1 }}>x</button>
        </div>
        {scheduled ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:"40px", marginBottom:"16px", color:"#4ad9a0" }}>✓</div>
            <p style={{ fontSize:"16px", fontWeight:"600", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:"0 0 8px 0" }}>Post Scheduled</p>
            <p style={{ fontSize:"13px", color:"#888", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:"0 0 24px 0" }}>{scheduled.message}</p>
            <button onClick={onClose} style={{ ...btnStyle("#fff","#fff","#000"), padding:"10px 32px", fontWeight:"700" }}>Done</button>
          </div>
        ) : (
          <>
            {watermarkedImage && (
              <div style={{ marginBottom:"20px", borderRadius:"4px", overflow:"hidden", position:"relative", paddingBottom:"56.25%", background:"#0a0a0a" }}>
                <img src={watermarkedImage} alt="Post preview" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            )}
            <div style={{ background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:"4px", padding:"14px", marginBottom:"20px" }}>
              <p style={{ fontSize:"13px", color:"#bbb", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.7", margin:0 }}>{caption.text}</p>
            </div>
            <div style={{ marginBottom:"20px" }}>
              <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"8px" }}>Schedule Date and Time</label>
              <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} min={new Date().toISOString().slice(0,16)} style={{ width:"100%", padding:"11px 14px", background:"#161616", border:"1px solid #272727", borderRadius:"3px", color:"#f0f0f0", fontSize:"13px", fontFamily:"'Helvetica Neue',Arial,sans-serif", boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:"24px" }}>
              <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"10px" }}>Post To</label>
              <div style={{ display:"flex", gap:"10px" }}>
                {[["facebook","Facebook"],["linkedin","LinkedIn"]].map(([key,label]) => (
                  <button key={key} onClick={() => setPlatforms(p => ({...p,[key]:!p[key]}))} style={{ flex:1, padding:"10px", border:`1px solid ${platforms[key]?"#4a90d9":"#222"}`, background:platforms[key]?"#0a1628":"#161616", borderRadius:"3px", color:platforms[key]?"#4a90d9":"#444", fontSize:"12px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", fontWeight:platforms[key]?"700":"400", textTransform:"uppercase" }}>
                    {platforms[key]?"✓ ":""}{label}
                  </button>
                ))}
              </div>
            </div>
            {error && <div style={{ background:"#110808", border:"1px solid #c0392b", borderRadius:"3px", padding:"12px", fontSize:"12px", color:"#c0392b", marginBottom:"16px" }}>{error}</div>}
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={handleSchedule} disabled={scheduling||selectedPlatforms.length===0} style={{ ...btnStyle(scheduling?"#161616":"#fff", scheduling?"#2a2a2a":"#fff", scheduling?"#333":"#000"), flex:1, padding:"13px", fontWeight:"700", fontSize:"13px", cursor:scheduling?"not-allowed":"pointer" }}>
                {scheduling?"Scheduling...":"Schedule Post"}
              </button>
              <button onClick={onClose} style={{ ...btnStyle("#161616","#222","#666"), padding:"13px 20px" }}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [checking, setChecking] = useState(false);

  const [selectedClient, setSelectedClient] = useState(CLIENTS[0]);
  const [mainTab, setMainTab] = useState("content");
  const [month, setMonth] = useState(currentMonth);
  const [primaryTopic, setPrimaryTopic] = useState("");
  const [secondaryTopic, setSecondaryTopic] = useState("");
  const [contentNotes, setContentNotes] = useState("");

  const [generating, setGenerating] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(-1);
  const [batchesComplete, setBatchesComplete] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imagesProgress, setImagesProgress] = useState(0);

  const [captions, setCaptions] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [images, setImages] = useState({});
  const [failedImages, setFailedImages] = useState(new Set());
  const [retryingImages, setRetryingImages] = useState(new Set());
  const [resultMeta, setResultMeta] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("captions");
  const [scheduleData, setScheduleData] = useState(null);
  const [writingBlog, setWritingBlog] = useState(null);

  async function handleAuth() {
    setChecking(true); setAuthError(false);
    try {
      const res = await fetch(`/api/key?key=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (data.valid) setAuthenticated(true); else setAuthError(true);
    } catch { setAuthError(true); }
    setChecking(false);
  }

  async function generateSingleImage(caption, isRetry = false, forceNew = false) {
    setRetryingImages(prev => new Set([...prev, caption.number]));
    setFailedImages(prev => { const n = new Set(prev); n.delete(caption.number); return n; });
    try {
      const res = await fetch("/api/images", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ caption, primaryTopic, clientId: selectedClient.id, forceNew }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImages(prev => ({ ...prev, [caption.number]: data.imageUrl }));
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch {
      try {
        await new Promise(r => setTimeout(r, 2000));
        const res = await fetch("/api/images", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ caption, primaryTopic, clientId: selectedClient.id, forceNew }),
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setImages(prev => ({ ...prev, [caption.number]: data.imageUrl }));
        } else {
          setFailedImages(prev => new Set([...prev, caption.number]));
        }
      } catch {
        setFailedImages(prev => new Set([...prev, caption.number]));
      }
    }
    setRetryingImages(prev => { const n = new Set(prev); n.delete(caption.number); return n; });
  }

  async function generateImagesSequentially(captionList) {
    setLoadingImages(true); setImagesProgress(0); setFailedImages(new Set());
    for (let i = 0; i < captionList.length; i++) {
      await generateSingleImage(captionList[i]);
      setImagesProgress(i + 1);
    }
    setLoadingImages(false);
  }

  async function handleGenerate() {
    if (!primaryTopic.trim()) return;
    setGenerating(true); setError(null);
    setCaptions([]); setBlogs([]); setImages({}); setFailedImages(new Set());
    setImagesProgress(0); setBatchesComplete(0); setResultMeta(null);
    setActiveTab("captions");

    const params = { primaryTopic, secondaryTopic, contentNotes, month, clientId: selectedClient.id };
    let allCaptions = [];
    let allBlogs = [];

    for (let batch = 0; batch <= 5; batch++) {
      setCurrentBatch(batch);
      try {
        const res = await fetch("/api/generate", {
          method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ ...params, batch }),
        });
        const data = await res.json();
        if (!data.success) { setError(`Batch ${batch + 1} failed: ${data.error}`); setGenerating(false); return; }
        if (data.type === "captions") { allCaptions = [...allCaptions, ...data.captions]; setCaptions([...allCaptions]); }
        else if (data.type === "blogs") { allBlogs = [...allBlogs, ...data.blogs]; setBlogs([...allBlogs]); }
        setBatchesComplete(batch + 1);
      } catch (err) { setError(`Batch ${batch + 1} failed: ${err.message}`); setGenerating(false); return; }
    }

    setResultMeta({ month, primaryTopic, secondaryTopic, generatedAt: new Date().toISOString() });
    setGenerating(false); setCurrentBatch(-1);
    generateImagesSequentially(allCaptions);
  }

  function handleUseTopic(result) {
    setPrimaryTopic(result.primaryTopic);
    setSecondaryTopic(result.secondaryTopic);
    setContentNotes(result.contentNotes);
    setMonth(result.month);
    setMainTab("content");
  }

  const hasContent = captions.length > 0 || blogs.length > 0;
  const failedCount = failedImages.size;

  if (!authenticated) {
    return (
      <>
        <style>{`* {box-sizing:border-box;margin:0;padding:0} body{background:#000} @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .ac{animation:fadeIn 0.4s ease forwards} input::placeholder{color:#444} input:focus{border-color:#555!important;outline:none}`}</style>
        <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
          <div className="ac" style={{ background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:"6px", padding:"52px 44px", width:"100%", maxWidth:"360px", display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" }}>
            <div style={{ background:"#000", padding:"20px 28px", borderRadius:"4px", marginBottom:"4px" }}><Logo610 size="lg" /></div>
            <div style={{ width:"40px", height:"1px", background:"#222", margin:"4px 0" }} />
            <h1 style={{ fontSize:"18px", fontWeight:"600", color:"#f0f0f0", letterSpacing:"0.5px" }}>Command Center</h1>
            <p style={{ fontSize:"12px", color:"#444", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"8px" }}>Internal access only</p>
            <input type="password" placeholder="Access password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()} style={{ width:"100%", padding:"11px 14px", background:"#161616", border:`1px solid ${authError?"#c0392b":"#272727"}`, borderRadius:"3px", color:"#f0f0f0", fontSize:"14px", fontFamily:"'Helvetica Neue',Arial,sans-serif" }} />
            {authError && <p style={{ color:"#c0392b", fontSize:"12px" }}>Incorrect password. Try again.</p>}
            <button onClick={handleAuth} disabled={checking||!password} style={{ width:"100%", padding:"12px", background:(!password||checking)?"#1a1a1a":"#fff", color:(!password||checking)?"#333":"#000", border:"none", borderRadius:"3px", fontSize:"13px", fontWeight:"700", cursor:(!password||checking)?"not-allowed":"pointer", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:"4px" }}>
              {checking?"Verifying...":"Enter"}
            </button>
            <p style={{ fontSize:"11px", color:"#2a2a2a", marginTop:"8px" }}>610 Marketing & PR, San Diego</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        * {box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0a}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        input::placeholder,textarea::placeholder{color:#3a3a3a}
        input:focus,textarea:focus,select:focus{border-color:#444!important;outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
        .gen-btn:hover:not(:disabled){background:#e0e0e0!important}
        .tab-btn:hover{color:#aaa!important}
        .nav-btn:hover{color:#f0f0f0!important;border-color:#333!important}
      `}</style>

      {scheduleData && <ScheduleModal caption={scheduleData.caption} watermarkedImage={scheduleData.image} rawImageUrl={scheduleData.rawImageUrl} onClose={()=>setScheduleData(null)} />}
      {writingBlog && <BlogWriter blog={writingBlog} clientId={selectedClient.id} onClose={()=>setWritingBlog(null)} />}

      <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", display:"flex", flexDirection:"column" }}>
        <header style={{ borderBottom:"1px solid #161616", padding:"0 40px", background:"#000" }}>
          <div style={{ maxWidth:"1600px", margin:"0 auto", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <LogoHeader />
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ display:"flex", gap:"4px" }}>
                {[["content","Content Generator"],["trending","Trending Topics"]].map(([id,label]) => (
                  <button key={id} className="nav-btn" onClick={()=>setMainTab(id)} style={{ padding:"6px 14px", background:mainTab===id?"#1a1a1a":"transparent", border:`1px solid ${mainTab===id?"#333":"transparent"}`, borderRadius:"3px", color:mainTab===id?"#f0f0f0":"#555", fontSize:"12px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", letterSpacing:"0.3px", transition:"all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ width:"1px", height:"20px", background:"#222" }} />
              <select value={selectedClient.id} onChange={e=>setSelectedClient(CLIENTS.find(c=>c.id===e.target.value))} style={{ padding:"7px 12px", background:"#111", border:"1px solid #222", borderRadius:"3px", color:"#f0f0f0", fontSize:"12px", fontFamily:"'Helvetica Neue',Arial,sans-serif", cursor:"pointer" }}>
                {CLIENTS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span style={{ fontSize:"10px", color:"#2a2a2a", fontFamily:"monospace", border:"1px solid #1e1e1e", padding:"3px 8px", borderRadius:"2px" }}>v1.4</span>
            </div>
          </div>
        </header>

        <main style={{ maxWidth:"1600px", margin:"0 auto", padding:"40px 40px 60px", flex:1, width:"100%" }}>

          {mainTab === "trending" && (
            <>
              <div style={{ marginBottom:"32px" }}>
                <h1 style={{ fontSize:"24px", fontWeight:"700", letterSpacing:"-0.5px", marginBottom:"6px" }}>Trending Topics Research</h1>
                <p style={{ fontSize:"13px", color:"#444" }}>Automated monthly research across 8 verticals. Runs on the 28th and writes directly to your Google Sheet.</p>
              </div>
              <div style={{ maxWidth:"800px" }}>
                <TrendingTopicsPanel onUseTopic={handleUseTopic} />
              </div>
            </>
          )}

          {mainTab === "content" && (
            <>
              <div style={{ marginBottom:"32px" }}>
                <h1 style={{ fontSize:"24px", fontWeight:"700", letterSpacing:"-0.5px", marginBottom:"6px" }}>Monthly Content Generator</h1>
                <p style={{ fontSize:"13px", color:"#444" }}>{selectedClient.name} — 25 social captions with HD watermarked images, 4 SEO-optimized blog posts, Buffer scheduling</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:"20px", alignItems:"start" }}>
                <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"4px", padding:"28px", display:"flex", flexDirection:"column", gap:"18px", position:"sticky", top:"24px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", paddingBottom:"16px", borderBottom:"1px solid #161616" }}>
                    <span style={{ fontSize:"10px", color:"#333", fontFamily:"monospace", border:"1px solid #222", padding:"3px 7px", borderRadius:"2px" }}>01</span>
                    <h2 style={{ fontSize:"15px", fontWeight:"600", color:"#e0e0e0" }}>Content Brief</h2>
                  </div>

                  {[
                    { label:"Month", value:month, setter:setMonth, placeholder:"e.g. April 2026" },
                    { label:"Primary Topic *", value:primaryTopic, setter:setPrimaryTopic, placeholder:"e.g. AI agents for small business" },
                    { label:"Secondary Topic", value:secondaryTopic, setter:setSecondaryTopic, placeholder:"e.g. AEO and answer engine optimization" },
                  ].map(f => (
                    <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                      <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", fontWeight:"500" }}>{f.label}</label>
                      <input value={f.value} onChange={e=>f.setter(e.target.value)} placeholder={f.placeholder} style={{ width:"100%", padding:"11px 14px", background:"#161616", border:"1px solid #272727", borderRadius:"3px", color:"#f0f0f0", fontSize:"13px", fontFamily:"'Helvetica Neue',Arial,sans-serif" }} />
                    </div>
                  ))}

                  <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                    <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", fontWeight:"500" }}>Content Notes</label>
                    <textarea value={contentNotes} onChange={e=>setContentNotes(e.target.value)} rows={4} placeholder="Special instructions, themes, topics to avoid..." style={{ width:"100%", padding:"11px 14px", background:"#161616", border:"1px solid #272727", borderRadius:"3px", color:"#f0f0f0", fontSize:"13px", fontFamily:"'Helvetica Neue',Arial,sans-serif", resize:"vertical", lineHeight:"1.6" }} />
                  </div>

                  <button className="gen-btn" onClick={handleGenerate} disabled={generating||!primaryTopic.trim()} style={{ width:"100%", padding:"13px", background:(generating||!primaryTopic.trim())?"#161616":"#fff", color:(generating||!primaryTopic.trim())?"#2a2a2a":"#000", border:"none", borderRadius:"3px", fontSize:"13px", fontWeight:"700", cursor:(generating||!primaryTopic.trim())?"not-allowed":"pointer", letterSpacing:"1px", textTransform:"uppercase", transition:"background 0.15s" }}>
                    {generating ? (
                      <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
                        <span style={{ width:"13px", height:"13px", border:"2px solid #33333388", borderTop:"2px solid #333", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} />
                        {currentBatch >= 0 ? BATCH_LABELS[currentBatch] : "Starting..."}
                      </span>
                    ) : "Generate This Month's Content"}
                  </button>

                  {generating && (
                    <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"14px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                        <span style={{ fontSize:"11px", color:"#555", fontFamily:"monospace" }}>Content batches</span>
                        <span style={{ fontSize:"11px", color:"#333", fontFamily:"monospace" }}>{batchesComplete}/6</span>
                      </div>
                      <div style={{ background:"#161616", borderRadius:"2px", height:"3px", overflow:"hidden", marginBottom:"12px" }}>
                        <div style={{ background:"#fff", height:"100%", width:`${(batchesComplete/6)*100}%`, transition:"width 0.3s ease", borderRadius:"2px" }} />
                      </div>
                      {[0,1,2,3,4,5].map(i => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                          <span style={{ fontSize:"10px", color:i<batchesComplete?"#4ad9a0":i===currentBatch?"#fff":"#222", fontFamily:"monospace" }}>
                            {i<batchesComplete?"✓":i===currentBatch?"→":"○"}
                          </span>
                          <span style={{ fontSize:"11px", color:i<batchesComplete?"#4ad9a0":i===currentBatch?"#ccc":"#2a2a2a", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
                            {BATCH_LABELS[i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {loadingImages && (
                    <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"14px" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                        <span style={{ fontSize:"11px", color:"#4a90d9", fontFamily:"monospace" }}>Generating HD images...</span>
                        <span style={{ fontSize:"11px", color:"#333", fontFamily:"monospace" }}>{imagesProgress}/25</span>
                      </div>
                      <div style={{ background:"#161616", borderRadius:"2px", height:"3px", overflow:"hidden" }}>
                        <div style={{ background:"#4a90d9", height:"100%", width:`${(imagesProgress/25)*100}%`, transition:"width 0.3s ease", borderRadius:"2px" }} />
                      </div>
                    </div>
                  )}

                  {failedCount > 0 && !loadingImages && (
                    <div style={{ background:"#110808", border:"1px solid #5a1a1a", borderRadius:"3px", padding:"12px 14px" }}>
                      <p style={{ fontSize:"11px", color:"#d94a4a", fontFamily:"monospace", margin:"0 0 8px 0" }}>{failedCount} image{failedCount > 1?"s":""} failed</p>
                      <p style={{ fontSize:"11px", color:"#555", fontFamily:"'Helvetica Neue',Arial,sans-serif", margin:0, lineHeight:"1.5" }}>Click Retry Image on each failed card or use Replace to upload your own.</p>
                    </div>
                  )}

                  {error && <div style={{ background:"#110808", border:"1px solid #c0392b", borderRadius:"3px", padding:"12px 14px", fontSize:"12px", color:"#c0392b", lineHeight:"1.5" }}>{error}</div>}

                  <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"16px" }}>
                    <p style={{ fontSize:"10px", color:"#333", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"14px", fontWeight:"600" }}>Output includes</p>
                    {[["25","HD social captions with watermarked images"],["4","Full SEO/AEO/GEO blog posts via GPT-4o"],["1","WordPress draft push per approved blog"]].map(([n,l]) => (
                      <div key={n} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" }}>
                        <span style={{ fontSize:"20px", fontWeight:"700", color:"#fff", minWidth:"28px", lineHeight:1 }}>{n}</span>
                        <span style={{ fontSize:"12px", color:"#3a3a3a", lineHeight:"1.4" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"4px", padding:"28px", display:"flex", flexDirection:"column", gap:"20px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:"16px", borderBottom:"1px solid #161616" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <span style={{ fontSize:"10px", color:"#333", fontFamily:"monospace", border:"1px solid #222", padding:"3px 7px", borderRadius:"2px" }}>02</span>
                      <h2 style={{ fontSize:"15px", fontWeight:"600", color:"#e0e0e0" }}>Generated Content</h2>
                    </div>
                    {resultMeta && (
                      <div style={{ display:"flex", gap:"8px" }}>
                        <span style={{ fontSize:"11px", color:"#555", border:"1px solid #1e1e1e", padding:"3px 9px", borderRadius:"2px" }}>{resultMeta.month}</span>
                        <span style={{ fontSize:"11px", color:"#555", border:"1px solid #1e1e1e", padding:"3px 9px", borderRadius:"2px" }}>{resultMeta.primaryTopic}</span>
                      </div>
                    )}
                  </div>

                  {!hasContent && !generating && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 40px", gap:"20px", textAlign:"center" }}>
                      <div style={{ background:"#000", padding:"20px 28px", borderRadius:"4px", opacity:0.2 }}><Logo610 size="md" /></div>
                      <p style={{ fontSize:"15px", color:"#333", fontWeight:"600" }}>Ready to generate</p>
                      <p style={{ fontSize:"12px", color:"#2a2a2a", lineHeight:"1.7", maxWidth:"300px" }}>Fill in the brief and click generate. Content populates as each batch completes.</p>
                    </div>
                  )}

                  {hasContent && (
                    <>
                      <div style={{ display:"flex", borderBottom:"1px solid #1a1a1a" }}>
                        {[["captions",`Social Captions (${captions.length})`],["blogs",`Blog Posts (${blogs.length})`]].map(([id,label]) => (
                          <button key={id} className="tab-btn" onClick={()=>setActiveTab(id)} style={{ padding:"10px 22px", background:"transparent", border:"none", borderBottom:`2px solid ${activeTab===id?"#fff":"transparent"}`, color:activeTab===id?"#f0f0f0":"#444", fontSize:"13px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", fontWeight:"500", marginBottom:"-1px", transition:"color 0.15s" }}>
                            {label}
                          </button>
                        ))}
                      </div>

                      {activeTab === "captions" && (
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"16px" }}>
                          {captions.map(caption => (
                            <CaptionCard
                              key={caption.number}
                              caption={caption}
                              imageUrl={images[caption.number]}
                              imageLoading={(loadingImages && !images[caption.number] && !failedImages.has(caption.number)) || retryingImages.has(caption.number)}
                              imageFailed={failedImages.has(caption.number)}
                              onSchedule={(cap, img, rawImg) => setScheduleData({ caption: cap, image: img, rawImageUrl: rawImg })}
                              onRetryImage={(cap) => generateSingleImage(cap, true)}
                          onRenderNew={(cap) => generateSingleImage(cap, true, true)}
                              month={resultMeta?.month || month}
                              primaryTopic={resultMeta?.primaryTopic || primaryTopic}
                            />
                          ))}
                        </div>
                      )}

                      {activeTab === "blogs" && (
                        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                          {blogs.map(blog => (
                            <BlogCard key={blog.number} blog={blog} month={resultMeta?.month || month} primaryTopic={resultMeta?.primaryTopic || primaryTopic} clientId={selectedClient.id} onWriteBlog={setWritingBlog} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        <footer style={{ borderTop:"1px solid #111", padding:"20px 40px", display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", fontSize:"11px", color:"#2a2a2a", background:"#000" }}>
          <span>610 Marketing & PR</span>
          <span style={{ color:"#1a1a1a" }}>|</span>
          <span>Command Center v1.4</span>
          <span style={{ color:"#1a1a1a" }}>|</span>
          <span>San Diego, CA</span>
        </footer>
      </div>
    </>
  );
}
