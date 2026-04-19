import { useState, useRef, useEffect } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentMonth = MONTHS[new Date().getMonth()] + " " + new Date().getFullYear();

const CLIENTS = [
  { id: "610-marketing", name: "610 Marketing & PR", location: "San Diego, CA" },
];

const GMB_LOCATIONS_610 = [
  { id: "san-diego", city: "San Diego", state: "CA", locationName: null },
  { id: "houston", city: "Houston", state: "TX", locationName: null },
  { id: "mcallen", city: "McAllen", state: "TX", locationName: null },
  { id: "austin", city: "Austin", state: "TX", locationName: null },
  { id: "stafford", city: "Stafford", state: "VA", locationName: null },
];

const TYPE_COLORS = {
  "Educational tip":    { bg: "#0a1628", border: "#1a3a6b", label: "#4a90d9" },
  "Thought leadership": { bg: "#0f0a1a", border: "#3a1a6b", label: "#9b6bd9" },
  "AI and automation":  { bg: "#0a1a14", border: "#1a5a3a", label: "#4ad9a0" },
  "San Diego local":    { bg: "#1a1200", border: "#5a4200", label: "#d9a84a" },
  "610 services":       { bg: "#1a0a0a", border: "#5a1a1a", label: "#d94a4a" },
  "Explanatory":        { bg: "#0a1420", border: "#1a4a6a", label: "#4ab8d9" },
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

const LOGO_B64 = "data:image/png;base64,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";

async function applyWatermark(imageSource) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 1024);

      const logo = new Image();
      logo.onload = () => {
        const logoW = 220;
        const logoH = Math.round((logo.height / logo.width) * logoW);
        const logoX = Math.round((1024 - logoW) / 2);
        const logoY = 1024 - logoH - 20;

        const padX = 24, padY = 12, rx = 10;
        const bx = logoX - padX, by = logoY - padY;
        const bw = logoW + padX * 2, bh = logoH + padY * 2;

        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.beginPath();
        ctx.moveTo(bx + rx, by);
        ctx.lineTo(bx + bw - rx, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + rx);
        ctx.lineTo(bx + bw, by + bh - rx);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - rx, by + bh);
        ctx.lineTo(bx + rx, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - rx);
        ctx.lineTo(bx, by + rx);
        ctx.quadraticCurveTo(bx, by, bx + rx, by);
        ctx.closePath();
        ctx.fill();

        ctx.drawImage(logo, logoX, logoY, logoW, logoH);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };

      logo.onerror = () => resolve(canvas.toDataURL("image/jpeg", 0.92));
      logo.src = LOGO_B64;
    };

    img.onerror = () => resolve(null);

    if (imageSource && imageSource.startsWith("http")) {
      img.src = "/api/proxy-image?url=" + encodeURIComponent(imageSource);
    } else {
      img.src = imageSource;
    }
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
  const [prevImageUrl, setPrevImageUrl] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const fileInputRef = useRef(null);
  const colors = TYPE_COLORS[caption.type] || TYPE_COLORS["Educational tip"];
  const sourceImage = customImage || imageUrl;

  // Generate additional carousel images when first image loads
  useEffect(() => {
    if (!caption.isCarousel || !imageUrl || carouselImages.length > 0) return;
    setCarouselImages([imageUrl]);
    // Generate 3 more images for the remaining slides
    const slideTexts = [caption.slide_2, caption.slide_3, caption.slide_4].filter(Boolean);
    slideTexts.forEach(async (slideText, i) => {
      try {
        const res = await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption: { ...caption, text: slideText, number: caption.number + (i + 1) * 0.1 },
            primaryTopic,
            clientId: "610-marketing",
            forceNew: true,
          }),
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setCarouselImages(prev => {
            const updated = [...prev];
            updated[i + 1] = data.imageUrl;
            return updated;
          });
        }
      } catch { /* ignore individual slide failures */ }
    });
  }, [imageUrl, caption.isCarousel]);

  useEffect(() => {
    // When imageUrl changes (new image or first load), reset and re-watermark
    if (!imageUrl) return;
    if (imageUrl === prevImageUrl && watermarked && !customImage) return;
    setPrevImageUrl(imageUrl);
    setWatermarked(null);
    setCustomImage(null);
    setWatermarking(true);
    applyWatermark(imageUrl).then(result => {
      if (result) {
        setWatermarked(result);
      }
      setWatermarking(false);
    });
  }, [imageUrl]);

  useEffect(() => {
    // Handle custom uploaded images
    if (!customImage) return;
    setWatermarked(null);
    setWatermarking(true);
    applyWatermark(customImage).then(result => {
      if (result) setWatermarked(result);
      setWatermarking(false);
    });
  }, [customImage]);

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
    const topicSlug = (primaryTopic || "content")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
    const seoFilename = `${topicSlug}_610-marketing_digital-marketing-and-AI-consulting-agency-near-me_${caption.number}.jpg`;
    const a = document.createElement("a");
    a.href = finalImage; a.download = seoFilename; a.click();
  }

  const displayImage = watermarked || sourceImage;

  return (
    <div style={{ background:colors.bg, border:`1px solid ${colors.border}`, borderRadius:"6px", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"10px", color:colors.label, fontFamily:"'Helvetica Neue',Arial,sans-serif", textTransform:"uppercase", letterSpacing:"1.2px", fontWeight:"600" }}>{caption.type}</span>
          {caption.isCarousel && <span style={{ fontSize:"9px", color:"#d9a84a", fontFamily:"monospace", border:"1px solid #5a4200", padding:"1px 6px", borderRadius:"2px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Carousel 4 slides</span>}
        </div>
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
        {caption.isCarousel && carouselImages.length > 1 && (
          <div style={{ position:"absolute", bottom:"44px", left:0, right:0, display:"flex", justifyContent:"center", gap:"5px", zIndex:2 }}>
            {[0,1,2,3].map(i => (
              <button key={i} onClick={() => setActiveSlide(i)} style={{ width:"8px", height:"8px", borderRadius:"50%", background:activeSlide===i?"#fff":"rgba(255,255,255,0.35)", border:"none", cursor:"pointer", padding:0 }} />
            ))}
          </div>
        )}
        {caption.isCarousel && carouselImages.length > 1
          ? <img src={carouselImages[activeSlide] || displayImage} alt={`Slide ${activeSlide+1}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
          : displayImage && <img src={displayImage} alt={caption.type} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
        }
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
        <p style={{ fontSize:"13px", color:"#ccc", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.7", margin:0, whiteSpace:"pre-line" }}>{caption.text}</p>
        {caption.isCarousel && caption.slide_1 && (
          <div style={{ marginTop:"14px", borderTop:"1px solid #1a1a1a", paddingTop:"12px", display:"flex", flexDirection:"column", gap:"8px" }}>
            <p style={{ fontSize:"9px", color:"#444", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:0 }}>Slide content</p>
            {[caption.slide_1, caption.slide_2, caption.slide_3, caption.slide_4].map((slide, i) => (
              <div key={i} style={{ display:"flex", gap:"8px", alignItems:"flex-start" }}>
                <span style={{ fontSize:"9px", color:"#555", fontFamily:"monospace", background:"#161616", border:"1px solid #222", borderRadius:"2px", padding:"2px 5px", minWidth:"20px", textAlign:"center", marginTop:"2px" }}>{i+1}</span>
                <p style={{ fontSize:"11px", color:"#777", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.5", margin:0 }}>{slide}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:"10px 14px", borderTop:`1px solid ${colors.border}`, display:"flex", gap:"6px", flexWrap:"wrap" }}>
        <button onClick={() => { navigator.clipboard.writeText(caption.text); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={btnStyle("#161616","#2a2a2a","#888")}>{copied?"Copied":"Copy"}</button>
        <button onClick={() => downloadText(`610-caption-${caption.number}.txt`, `610 Marketing & PR\n${month} - ${primaryTopic}\nType: ${caption.type}\n\n${caption.text}`)} style={btnStyle("#161616","#2a2a2a","#888")}>Download Text</button>
        {displayImage && <button onClick={handleDownloadImage} style={btnStyle("#161616","#2a2a2a","#888")}>Save Image</button>}
        <button onClick={() => onSchedule(caption, watermarked || sourceImage, imageUrl, caption.isCarousel ? carouselImages : null)} style={{ ...btnStyle("#fff","#fff","#000"), marginLeft:"auto", fontWeight:"700" }}>Schedule</button>
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
  const [featuredImage, setFeaturedImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);

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

  async function generateBlogImage() {
    setGeneratingImage(true); setError(null);
    try {
      const res = await fetch("/api/blog-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogTitle: blog.title, primaryTopic: blog.title, clientId, blogNumber: blog.number }),
      });
      const data = await res.json();
      if (data.success) setFeaturedImage(data);
      else setError(data.error || "Image generation failed.");
    } catch (err) { setError(err.message); }
    setGeneratingImage(false);
  }

  async function publishToWordPress() {
    setPublishing(true); setError(null);
    try {
      const res = await fetch("/api/wordpress", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ title: blog.title, content, clientId, featuredMediaId: featuredImage?.mediaId || null }),
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

          {featuredImage && (
            <div style={{ marginBottom:"20px", borderRadius:"4px", overflow:"hidden", position:"relative", background:"#0a0a0a" }}>
              <img src={featuredImage.permanentUrl || featuredImage.imageUrl} alt="Featured" style={{ width:"100%", height:"auto", display:"block", borderRadius:"4px" }} />
              <div style={{ position:"absolute", bottom:"10px", left:"10px", background:"rgba(0,0,0,0.7)", padding:"4px 10px", borderRadius:"3px" }}>
                <span style={{ fontSize:"10px", color:"#4ad9a0", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px" }}>Featured Image Ready</span>
              </div>
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
              {!featuredImage && (
                <button onClick={generateBlogImage} disabled={generatingImage} style={{ ...btnStyle(generatingImage?"#161616":"#0a1628", generatingImage?"#2a2a2a":"#1a3a6b", generatingImage?"#333":"#4a90d9"), padding:"8px 16px" }}>
                  {generatingImage ? "Generating..." : "Generate Featured Image"}
                </button>
              )}
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

function ScheduleModal({ caption, watermarkedImage, rawImageUrl, carouselImageUrls, onClose }) {
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
        body: JSON.stringify({ text: caption.text, imageUrl: rawImageUrl || null, imageUrls: carouselImageUrls || null, scheduledAt: new Date(scheduledAt).toISOString(), platforms: selectedPlatforms }),
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

function GmbPanel() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [postText, setPostText] = useState("");
  const [ctaType, setCtaType] = useState("LEARN_MORE");
  const [ctaUrl, setCtaUrl] = useState("https://610marketing.com");
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [processingReviews, setProcessingReviews] = useState(false);
  const [processResult, setProcessResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("posts");
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const needsSetup = GMB_LOCATIONS_610.every(l => !l.locationName);

  async function handleCreatePost() {
    if (!selectedLocation || !postText.trim()) return;
    setPosting(true); setError(null); setPostResult(null);
    try {
      const res = await fetch("/api/gmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createPost",
          locationName: selectedLocation.locationName,
          post: { text: postText, ctaType, ctaUrl },
        }),
      });
      const data = await res.json();
      if (data.success) { setPostResult(data); setPostText(""); }
      else setError(data.error || "Post failed.");
    } catch (err) { setError(err.message); }
    setPosting(false);
  }

  async function handleLoadReviews() {
    if (!selectedLocation) return;
    setLoadingReviews(true); setError(null);
    try {
      const res = await fetch("/api/gmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getReviews", locationName: selectedLocation.locationName }),
      });
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
      else setError(data.error || "Failed to load reviews.");
    } catch (err) { setError(err.message); }
    setLoadingReviews(false);
  }

  async function handleProcessReviews() {
    if (!selectedLocation) return;
    setProcessingReviews(true); setError(null); setProcessResult(null);
    try {
      const res = await fetch("/api/gmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "processReviews",
          locationName: selectedLocation.locationName,
          locationCity: `${selectedLocation.city}, ${selectedLocation.state}`,
          autoReply: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProcessResult(data);
        setPendingApprovals(data.processed.filter(p => p.needsApproval));
      } else setError(data.error || "Processing failed.");
    } catch (err) { setError(err.message); }
    setProcessingReviews(false);
  }

  async function handleApproveReply(item) {
    try {
      await fetch("/api/gmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "replyToReview", reviewName: item.reviewName, comment: item.response }),
      });
      setPendingApprovals(prev => prev.filter(p => p.reviewName !== item.reviewName));
    } catch (err) { setError(err.message); }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"4px", padding:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", paddingBottom:"16px", borderBottom:"1px solid #161616", marginBottom:"20px" }}>
          <span style={{ fontSize:"10px", color:"#333", fontFamily:"monospace", border:"1px solid #222", padding:"3px 7px", borderRadius:"2px" }}>04</span>
          <h2 style={{ fontSize:"15px", fontWeight:"600", color:"#e0e0e0" }}>Google Business Profile</h2>
        </div>

        {needsSetup ? (
          <div style={{ background:"#0a1628", border:"1px solid #1a3a6b", borderRadius:"4px", padding:"20px" }}>
            <p style={{ fontSize:"12px", color:"#4a90d9", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 10px 0", fontWeight:"600" }}>Setup Required</p>
            <p style={{ fontSize:"13px", color:"#888", fontFamily:"'Helvetica Neue',Arial,sans-serif", lineHeight:"1.7", margin:"0 0 16px 0" }}>
              To connect your Google Business Profile locations, visit this URL to discover your location IDs, then add them to the system.
            </p>
            <a href="/api/gmb-locations" target="_blank" rel="noreferrer" style={{ fontSize:"12px", color:"#4a90d9", fontFamily:"monospace", textDecoration:"none", border:"1px solid #1a3a6b", padding:"6px 14px", borderRadius:"3px", display:"inline-block" }}>
              View My GMB Location IDs
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:"20px" }}>
              <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"10px" }}>Select Location</label>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {GMB_LOCATIONS_610.filter(l => l.locationName).map(loc => (
                  <button key={loc.id} onClick={() => setSelectedLocation(loc)} style={{ padding:"8px 16px", background:selectedLocation?.id===loc.id?"#1a3a6b":"#161616", border:`1px solid ${selectedLocation?.id===loc.id?"#4a90d9":"#222"}`, borderRadius:"3px", color:selectedLocation?.id===loc.id?"#4a90d9":"#555", fontSize:"12px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
                    {loc.city}, {loc.state}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", borderBottom:"1px solid #1a1a1a", marginBottom:"20px" }}>
              {[["posts","GMB Posts"],["reviews","Review Management"]].map(([id,label]) => (
                <button key={id} onClick={() => setActiveSection(id)} style={{ padding:"10px 22px", background:"transparent", border:"none", borderBottom:`2px solid ${activeSection===id?"#fff":"transparent"}`, color:activeSection===id?"#f0f0f0":"#444", fontSize:"13px", cursor:"pointer", fontFamily:"'Helvetica Neue',Arial,sans-serif", marginBottom:"-1px" }}>
                  {label}
                </button>
              ))}
            </div>

            {activeSection === "posts" && selectedLocation && (
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                <div>
                  <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"8px" }}>Post Text</label>
                  <textarea value={postText} onChange={e => setPostText(e.target.value)} rows={5} placeholder={`Write a Google Business post for ${selectedLocation.city}...`} style={{ width:"100%", padding:"12px 14px", background:"#161616", border:"1px solid #272727", borderRadius:"3px", color:"#f0f0f0", fontSize:"13px", fontFamily:"'Helvetica Neue',Arial,sans-serif", resize:"vertical", lineHeight:"1.6", boxSizing:"border-box" }} />
                  <p style={{ fontSize:"11px", color:"#333", margin:"4px 0 0 0", fontFamily:"monospace" }}>{postText.length}/1500 characters</p>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div>
                    <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"8px" }}>Call to Action</label>
                    <select value={ctaType} onChange={e => setCtaType(e.target.value)} style={{ width:"100%", padding:"10px 12px", background:"#161616", border:"1px solid #272727", borderRadius:"3px", color:"#f0f0f0", fontSize:"13px", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="CALL">Call Now</option>
                      <option value="BOOK">Book</option>
                      <option value="ORDER">Order Online</option>
                      <option value="SHOP">Shop</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:"11px", color:"#444", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"8px" }}>CTA URL</label>
                    <input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} style={{ width:"100%", padding:"10px 12px", background:"#161616", border:"1px solid #272727", borderRadius:"3px", color:"#f0f0f0", fontSize:"13px", fontFamily:"'Helvetica Neue',Arial,sans-serif" }} />
                  </div>
                </div>

                {error && <div style={{ background:"#110808", border:"1px solid #c0392b", borderRadius:"3px", padding:"12px", fontSize:"12px", color:"#c0392b" }}>{error}</div>}
                {postResult && <div style={{ background:"#0a1a0a", border:"1px solid #1a5a1a", borderRadius:"3px", padding:"12px", fontSize:"12px", color:"#4ad9a0" }}>Post published to {selectedLocation.city} Google Business Profile.</div>}

                <button onClick={handleCreatePost} disabled={posting || !postText.trim()} style={{ padding:"13px", background:(!postText.trim()||posting)?"#161616":"#fff", color:(!postText.trim()||posting)?"#2a2a2a":"#000", border:"none", borderRadius:"3px", fontSize:"13px", fontWeight:"700", cursor:(!postText.trim()||posting)?"not-allowed":"pointer", textTransform:"uppercase", letterSpacing:"1px" }}>
                  {posting ? "Publishing..." : `Publish to ${selectedLocation.city} GMB`}
                </button>
              </div>
            )}

            {activeSection === "reviews" && selectedLocation && (
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"16px" }}>
                  <p style={{ fontSize:"11px", color:"#4a90d9", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 8px 0", fontWeight:"600" }}>Automated Review Management</p>
                  <p style={{ fontSize:"12px", color:"#555", lineHeight:"1.6", margin:"0 0 12px 0" }}>
                    Automatically generates and posts AI responses to 3-5 star reviews. Queues 1-2 star reviews for your approval before posting.
                  </p>
                  <button onClick={handleProcessReviews} disabled={processingReviews} style={{ padding:"10px 20px", background:processingReviews?"#161616":"#0a1628", border:`1px solid ${processingReviews?"#222":"#1a3a6b"}`, borderRadius:"3px", color:processingReviews?"#333":"#4a90d9", fontSize:"12px", fontWeight:"700", cursor:processingReviews?"not-allowed":"pointer", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                    {processingReviews ? "Processing..." : `Process Unanswered Reviews - ${selectedLocation.city}`}
                  </button>
                </div>

                {processResult && (
                  <div style={{ background:"#0a1a0a", border:"1px solid #1a5a1a", borderRadius:"3px", padding:"14px" }}>
                    <p style={{ fontSize:"12px", color:"#4ad9a0", fontFamily:"monospace", margin:"0 0 8px 0" }}>Processed {processResult.total} unanswered review{processResult.total !== 1 ? "s" : ""}.</p>
                    <p style={{ fontSize:"12px", color:"#555", margin:0 }}>{processResult.processed?.filter(p => p.autoPosted).length || 0} auto-replied. {pendingApprovals.length} need your approval below.</p>
                  </div>
                )}

                {pendingApprovals.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                    <p style={{ fontSize:"11px", color:"#d9a84a", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"1px", margin:0, fontWeight:"600" }}>Pending Approval ({pendingApprovals.length})</p>
                    {pendingApprovals.map((item, i) => (
                      <div key={i} style={{ background:"#1a0a0a", border:"1px solid #5a2a2a", borderRadius:"4px", padding:"16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                          <span style={{ fontSize:"11px", color:"#d94a4a", fontFamily:"monospace" }}>{"★".repeat(item.stars)}{"☆".repeat(5-item.stars)}</span>
                          <span style={{ fontSize:"10px", color:"#555", fontFamily:"monospace" }}>Low rating - requires approval</span>
                        </div>
                        <p style={{ fontSize:"13px", color:"#ccc", lineHeight:"1.6", margin:"0 0 12px 0", background:"#0a0a0a", padding:"10px", borderRadius:"3px" }}>{item.response}</p>
                        <div style={{ display:"flex", gap:"8px" }}>
                          <button onClick={() => handleApproveReply(item)} style={{ padding:"8px 16px", background:"#0a1628", border:"1px solid #1a3a6b", borderRadius:"3px", color:"#4a90d9", fontSize:"12px", cursor:"pointer", fontWeight:"700" }}>Approve and Post</button>
                          <button onClick={() => setPendingApprovals(prev => prev.filter(p => p.reviewName !== item.reviewName))} style={{ padding:"8px 16px", background:"#161616", border:"1px solid #222", borderRadius:"3px", color:"#555", fontSize:"12px", cursor:"pointer" }}>Dismiss</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ borderTop:"1px solid #161616", paddingTop:"16px" }}>
                  <button onClick={handleLoadReviews} disabled={loadingReviews} style={{ padding:"8px 16px", background:"#161616", border:"1px solid #222", borderRadius:"3px", color:"#555", fontSize:"12px", cursor:loadingReviews?"not-allowed":"pointer" }}>
                    {loadingReviews ? "Loading..." : "View Recent Reviews"}
                  </button>

                  {reviews.length > 0 && (
                    <div style={{ marginTop:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
                      {reviews.slice(0, 5).map((review, i) => {
                        const stars = { ONE:1, TWO:2, THREE:3, FOUR:4, FIVE:5 }[review.starRating] || 0;
                        return (
                          <div key={i} style={{ background:"#080808", border:"1px solid #141414", borderRadius:"3px", padding:"14px" }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                              <span style={{ fontSize:"13px", color:"#ccc", fontWeight:"600" }}>{review.reviewer?.displayName || "Anonymous"}</span>
                              <span style={{ fontSize:"12px", color: stars >= 4 ? "#4ad9a0" : stars >= 3 ? "#d9a84a" : "#d94a4a" }}>{"★".repeat(stars)}{"☆".repeat(5-stars)}</span>
                            </div>
                            {review.comment && <p style={{ fontSize:"12px", color:"#666", lineHeight:"1.6", margin:"0 0 8px 0" }}>{review.comment}</p>}
                            {review.reviewReply ? (
                              <div style={{ background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:"2px", padding:"8px 10px" }}>
                                <p style={{ fontSize:"10px", color:"#333", fontFamily:"monospace", margin:"0 0 4px 0" }}>YOUR REPLY</p>
                                <p style={{ fontSize:"12px", color:"#555", margin:0 }}>{review.reviewReply.comment}</p>
                              </div>
                            ) : (
                              <span style={{ fontSize:"10px", color:"#d9a84a", fontFamily:"monospace" }}>Unanswered</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedLocation && (
              <p style={{ fontSize:"13px", color:"#333", textAlign:"center", padding:"40px" }}>Select a location above to manage GMB posts and reviews.</p>
            )}
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

    const tryGenerate = async () => {
      const res = await fetch("/api/images", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ caption, primaryTopic, clientId: selectedClient.id, forceNew }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) return data.imageUrl;
      throw new Error(data.error || "Failed");
    };

    try {
      let dalleUrl;
      try {
        dalleUrl = await tryGenerate();
      } catch {
        await new Promise(r => setTimeout(r, 2000));
        dalleUrl = await tryGenerate();
      }

      // Immediately upload to WordPress for a permanent SEO-named URL
      let permanentUrl = dalleUrl;
      try {
        const wpRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: dalleUrl, primaryTopic, clientId: selectedClient.id, number: caption.number }),
        });
        const wpData = await wpRes.json();
        if (wpData.success && wpData.permanentUrl) {
          permanentUrl = wpData.permanentUrl;
        }
      } catch {
        // Fall back to DALL-E URL if upload fails
      }

      setImages(prev => ({ ...prev, [caption.number]: permanentUrl }));
    } catch {
      setFailedImages(prev => new Set([...prev, caption.number]));
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

      {scheduleData && <ScheduleModal caption={scheduleData.caption} watermarkedImage={scheduleData.image} rawImageUrl={scheduleData.rawImageUrl} carouselImageUrls={scheduleData.carouselImageUrls} onClose={()=>setScheduleData(null)} />}
      {writingBlog && <BlogWriter blog={writingBlog} clientId={selectedClient.id} onClose={()=>setWritingBlog(null)} />}

      <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#f0f0f0", fontFamily:"'Helvetica Neue',Arial,sans-serif", display:"flex", flexDirection:"column" }}>
        <header style={{ borderBottom:"1px solid #161616", padding:"0 40px", background:"#000" }}>
          <div style={{ maxWidth:"1600px", margin:"0 auto", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <LogoHeader />
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ display:"flex", gap:"4px" }}>
                {[["content","Content Generator"],["trending","Trending Topics"],["gmb","Google Business"]].map(([id,label]) => (
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

          {mainTab === "gmb" && (
            <>
              <div style={{ marginBottom:"32px" }}>
                <h1 style={{ fontSize:"24px", fontWeight:"700", letterSpacing:"-0.5px", marginBottom:"6px" }}>Google Business Profile</h1>
                <p style={{ fontSize:"13px", color:"#444" }}>Manage GMB posts and automated review responses across all 610 Marketing locations.</p>
              </div>
              <div style={{ maxWidth:"800px" }}>
                <GmbPanel />
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
                              onSchedule={(cap, img, rawImg, carouselImgs) => setScheduleData({ caption: cap, image: img, rawImageUrl: rawImg, carouselImageUrls: carouselImgs })}
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
