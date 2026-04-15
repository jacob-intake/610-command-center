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

const LOGO_B64 = "data:image/png;base64,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R2O8vLy2A0CSvumVhAzx8GKo8zJmx44d18uVK1dn586daYioLV68eCsAwJEjR8wAADNmzOgfGxuLbdu2bbJ79+5YRMQlS5bsAgAYOnRo+/T0dNy+fftlw+G94uPjsxITE/GVV155GsBdyBsRlT179iT369fvyUcffbTJlClT+j799NMBCxcunISI+O23326uU6dO8+XLlx9eu3Zt0pgxY/L6HI0dO7bflStXcNq0ad9VrFgxeMCAAf8AgODFixfvR0TcsmVL9nPPPVcXAGDkyJGT9de2Gcbk98svv1zIzMxU586d+xYAwIoVKw6qqqpu3rz56Guvvfao/j5zdHT0EUTUPv7445kAAN98881ORMRFixZtA7htqm3cuHEfIiobNmxYBQB31WIm7g3SYB5ARFFkLperXGZm5sXY2NiZTz755MedO3fuNmDAgBdatmy5rUaNGhWbNGmyIDEx8ev9+/fHybIcAABgsVhkAICgoKD9M2fOfPPUqVPnevToUb9jx47dEfFNHx8fX0mS0MvLyxcgr+i2eOLEiU2rVq06yBiDqVOnxgEAhIWFmQEAGjVq9MTKlStj0tLSTK+++mowANxCRAtjTGrVqtWQoKAgrWnTptZp06aFWSwWbNeuHZQrV045fvx4jsViEatVq1bZarVerlChQgX9nD42m80UHh6OjDGXt7e36ufnJ7hcLgAA8PLyQkEQhLi4uG0bNmw4jYjeoig6RVFMRMSWjLGKAABVq1YtDwCqIAgIAHD8+HG/J554IufixYt/AkCb8uXLN9B9RkiaS8khAfPgogCAOG3atC8bN248tHfv3iFdunSZxxjb+vXXX48URTEwOjp6EiKy7du331F/xm63KwAQEx0dPdnb23vYjRs3/rh48eJ5RVFUi8ViVhRFAnALMgAAi8Ui2Gw24aWXXhJv3LghdO/eXdLD0lC+fPlqlStXBqfT6fzggw8mz549exwfW506dSoxxoRjx479OzMzM8ZisWi+vr64bds2OS4uTkhKSsrKzs5OBQCYNGmSDOCuT2O325WPPvoIwN18zaNz19vb21v3/WiapjHGmJkxBrIsMwCACxcu7FZVtWWLFi2eqFmzZvUWLVokAYDpsccee1ySJHH//v2xnTp10vTIE9WOKSEkYB5Q9KeuCADZ27dvH9u2bdvozp07Pzp48OCJwcHBIxMSEr6Iioq6xhhj27dv1wAAVFUVAQC6dev2+Lhx42Lr1asXsHbt2knjx4//CAD8X3vttSRfX1+zoih3dKHTNA3sdrsWHh7OYmJiEABQURQNAODQoUPb4uPjz0yaNGnUyJEjx8qynM0Ys3fr1s1LVVVBEAQMCAioN3Xq1CW8RQxvWdKuXbuQpk2bBi5evPhPw3Xllc1ghWQRIiLqY+L/5VqICgAwYsSICaqqPjZ06NCuH3/88eH4+PgNFSpUeNbX17fRl19+uWTixIlTdb/L373j/X8aSrR7QNHXk4qIwjfffPPDzp07f6levTpOnDhxekZGhuPLL7+cwk0AcGfGgqqqAgBA3759h3bq1Clg69at0bpwAQDwMpvN/Li+AAB6zVyPC13vDwV+fn7SjBkzRi9ZsuS7SpUqwZgxY8LHjBkzbdu2ba64uLirgiCwtm3bDmjdunULXnAKEaFHjx7N33777d98fX2768fz0UtjKlFRUapeM0YCD9EdfYweX+dh6nfffbdOo0aNaq9cuXJfQkLCOFVVf09OTra3b9++6qhRo4YCQJZuPpF5VApIg3kAEQRBNSwOZIzhzp075zz99NOdQkJC4MSJEx/Fx8eng56gJooiMMa0gIAAFQDAYrEEAgA0a9bs8XfeeadL5cqVs4OCgqY+8sgjfg6HA/39/b34uRhjmpeX110CxmKxIGMMHQ7HI+huvDZYkqRHxo4d22P06NGTKlSocHH9+vVv1atX73SnTp2qfPrpp9v37NnztdPp3FOtWrXnq1evPjIxKWnPkSNHluljPC8IAqtcuXL1oUOHtg8KCmq+evXqHwVBEF0uFxqbwuljuuPhaTKZFMaYZrFYXAAAbdu2ndG5c+dH9+7dGw8ALSVJysrOzi4/derUx0RRvPbHH3/ERURE8JwbBiRoSgQJmAeImJgYAABISUmRdRMFdU1CZIz91KlTp3UHDx5sMWvWrK95bgoAQGpqqjM9PV3Iysq6DACwbdu2RdWqVevQpk2bOv7+/jtOnz6tJCQk7D58+LBavnx5c05OTiIAQE5ODqSkpAhpaWlS/rFkZGRIqampzOFwXOA9wBlj/SwWywar1dqxc+fOy+Li4p5duXLlS8nJyZ8/++yzjUeMGPGhw+GAhIQE2Lt379fjx48fwxhzAgBcvHjxl3379jmaNWv26FtvvfXrwYMHD7tcrl/Onz/vXa5cOXb9+nUAALh165Zw48YNITMz0wUAcPLkSQAAuHHjhpiWlibcvHlTYIzByZMnV8bFxfV89NFHG9WvX7+Rt7c3mM3mvJ7VGRkZ8NRTT60ZPXr0IESUabd2yaBZewCxWq3lFEWpGR0dHae/xBhjGBwc7JOVleWdmZmZwV8HABw4cGCdgICAx06fPn1i586dSQAAVapUCRoxYkSbRx55xPf8+fPH582bl2C1Wtt6eXmxVatW7QMA6N+/fy1/f/+mSUlJv2/atOkK3L6f8JVXXilfvXr1x9PT08+tXbv2itVqFdetW6ciorlXr15PNWnSxOvKlSvx33zzTRIAeA8cOPDRBg0atLRYLFp0dPSv+/btO6/7YvKO2alTp0bPP/98Mx8fn+RRo0bFAgC88sorLYKDg/3Pnj17fMeOHTnDhg0LQcRGFy5cOPrTTz8l22w2wW63a717925QoUKFuteuXTuycePG9Llz5y4KCgrqefDgwaF+fn4Of39/P4vF4ufl5eXtdDqrP/PMM68DQON27dpVBoB0yoMhiOJT6IPFU9mGMtoNfZe7xtDxMf/57th8WMD5SzSmyZMnv5uVlYVr167dWdB75s+f/0lERIRWrVo130LOTxQBmUgPJsxmszEPNXTztAHjizabTWjcuDGzWq0aYwztdruGiCwqKko4efIkAwCNMabxzX9RUVGqp8/lP5dexNv4N0REZrVaBavVCmFhYZp+LF5ylAs2LX/0hjGGuuATGjdunFdv12azCfHx8YwX9eZjyl+P12azCRUrVjSPGjVK8vHxaeHj4wMvvPBC582bN+8/derUr7du3cpQFEWrWbNm9eDg4G5ms7nh7t27hyYnJ+fqHSkpmlQCSCoTDxMMAKBZs2aV33777Y+bN2/eoUqVKrUZYyBJEuTk5MD1a9dU0WT6eefOnQsXLFjwHzKNSgcJGOJhxr9bt25BTZo0CQgMDHRkZ2cLc+bMuQYAGQBuM400F4Ig7hWmR9Y8/jF/3Rui5JAGQzzM3NUXilqfEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEMSDxP8D0JJCOgmp2t0AAAAASUVORK5CYII=";

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
  const fileInputRef = useRef(null);
  const colors = TYPE_COLORS[caption.type] || TYPE_COLORS["Educational tip"];
  const sourceImage = customImage || imageUrl;

  useEffect(() => {
    // Reset watermark whenever imageUrl changes (new image generated)
    if (imageUrl !== prevImageUrl) {
      setPrevImageUrl(imageUrl);
      setWatermarked(null);
      setCustomImage(null);
    }
  }, [imageUrl]);

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
