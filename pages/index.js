import { useState } from "react";

const PLATFORMS = [
  { id: "YouTube", icon: "▶", duration: "5–15 min" },
  { id: "Reels", icon: "◈", duration: "15–90 sec" },
  { id: "TikTok", icon: "♪", duration: "15–60 sec" },
];
const TONES = ["Energetic", "Educational", "Funny", "Motivational", "Casual", "Professional"];
const FREE_LIMIT = 3;
const TODAY = new Date().toDateString();

function getUsed() {
  try { return parseInt(localStorage.getItem("sc_" + TODAY) || "0"); } catch { return 0; }
}
function incUsed() {
  try { localStorage.setItem("sc_" + TODAY, getUsed() + 1); } catch {}
}

export default function Home() {
  const [platform, setPlatform] = useState("YouTube");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Energetic");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [used, setUsed] = useState(0);

  const remaining = FREE_LIMIT - used;

  async function generate() {
    if (!topic.trim()) return;
    if (remaining <= 0) {
      setError("Daily limit reached. Upgrade to Pro for unlimited scripts!");
      return;
    }
    setLoading(true);
    setError("");
    setScript(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, tone, audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      const text = data.script;
      const hookMatch = text.match(/HOOK:\s*([\s\S]*?)(?=MAIN CONTENT:|$)/i);
      const mainMatch = text.match(/MAIN CONTENT:\s*([\s\S]*?)(?=CALL TO ACTION:|$)/i);
      const ctaMatch = text.match(/CALL TO ACTION:\s*([\s\S]*?)$/i);

      setScript({
        hook: hookMatch ? hookMatch[1].trim() : "",
        main: mainMatch ? mainMatch[1].trim() : text,
        cta: ctaMatch ? ctaMatch[1].trim() : "",
      });
      incUsed();
      setUsed(getUsed());
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function copyAll() {
    const txt = script ? `HOOK:\n${script.hook}\n\nMAIN CONTENT:\n${script.main}\n\nCALL TO ACTION:\n${script.cta}` : "";
    navigator.clipboard.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const dotColor = remaining <= 0 ? "#A32D2D" : remaining === 1 ? "#BA7517" : "#3B6D11";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: "#111" }}>AI Video Script Writer</h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 10px" }}>Platform-optimized scripts in seconds</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555", background: "#fff", border: "0.5px solid #ddd", borderRadius: 8, padding: "4px 10px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor }} />
            {remaining <= 0 ? "Daily limit reached — upgrade for unlimited" : `${remaining} free script${remaining !== 1 ? "s" : ""} remaining today`}
          </div>
        </div>

        <div style={{ background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, padding: "1.5rem" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Platform</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)} style={{
                  background: platform === p.id ? "#EBF4FD" : "#fafafa",
                  border: platform === p.id ? "2px solid #378ADD" : "0.5px solid #e0e0e0",
                  borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center",
                }}>
                  <div style={{ fontSize: 18 }}>{p.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginTop: 3 }}>{p.id}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{p.duration}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Video topic</div>
            <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="e.g. 5 morning habits that changed my life"
              style={{ width: "100%", fontSize: 14, padding: "10px 12px", border: "0.5px solid #ddd", borderRadius: 8, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Tone</div>
              <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: "100%", fontSize: 14, padding: "10px 12px", border: "0.5px solid #ddd", borderRadius: 8, fontFamily: "inherit", background: "#fff", outline: "none" }}>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Target audience</div>
              <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. entrepreneurs 25-35"
                style={{ width: "100%", fontSize: 14, padding: "10px 12px", border: "0.5px solid #ddd", borderRadius: 8, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>

          <button onClick={generate} disabled={loading || !topic.trim()} style={{
            width: "100%", padding: "13px", fontSize: 15, fontWeight: 600,
            background: loading || !topic.trim() ? "#ccc" : "#111",
            color: "#fff", border: "none", borderRadius: 10,
            cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
          }}>
            {loading ? "Writing your script..." : "Generate Script"}
          </button>
        </div>

        {error && (
          <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#791F1F", marginTop: 12 }}>
            {error}
          </div>
        )}

        {script && (
          <div style={{ background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, padding: "1.5rem", marginTop: 14 }}>
            {[["Hook", script.hook], ["Main Content", script.main], ["Call to Action", script.cta]].map(([label, content], i) => content ? (
              <div key={label}>
                {i > 0 && <hr style={{ border: "none", borderTop: "0.5px solid #eee", margin: "1rem 0" }} />}
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", borderLeft: "2px solid #378ADD", paddingLeft: 8, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 14, color: "#222", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{content}</div>
              </div>
            ) : null)}
            <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "0.5px solid #eee" }}>
              <button onClick={copyAll} style={{ flex: 1, padding: "9px 12px", fontSize: 13, borderRadius: 8, border: "0.5px solid #ddd", background: "transparent", cursor: "pointer", color: copied ? "#3B6D11" : "#333", fontWeight: copied ? 600 : 400 }}>
                {copied ? "Copied!" : "Copy script"}
              </button>
              <button onClick={generate} style={{ flex: 1, padding: "9px 12px", fontSize: 13, borderRadius: 8, border: "0.5px solid #ddd", background: "transparent", cursor: "pointer", color: "#333" }}>
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
