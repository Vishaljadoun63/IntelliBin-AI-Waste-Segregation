import { useState, useEffect, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const WASTE_CATEGORIES = {
  Plastic: { color: "#00ff88", icon: "🧴", co2: 0.8, tip: "Place in the blue recycling bin. Remove caps & labels first.", bg: "rgba(0,255,136,0.15)" },
  Paper: { color: "#00d4ff", icon: "📄", co2: 0.5, tip: "Flatten before recycling. Keep dry. Remove plastic windows.", bg: "rgba(0,212,255,0.15)" },
  Cardboard: { color: "#ffaa00", icon: "📦", co2: 0.6, tip: "Break down boxes flat. Remove tape & staples before recycling.", bg: "rgba(255,170,0,0.15)" },
  Metal: { color: "#ff6b35", icon: "🥫", co2: 1.5, tip: "Rinse cans. Aluminium & steel both recyclable. High value!", bg: "rgba(255,107,53,0.15)" },
  Glass: { color: "#a855f7", icon: "🍶", co2: 0.3, tip: "Sort by color. Remove lids. Drop at glass bank or kerbside.", bg: "rgba(168,85,247,0.15)" },
  Organic: { color: "#84cc16", icon: "🌿", co2: 0.2, tip: "Compost kitchen scraps. Green bin or home composter.", bg: "rgba(132,204,22,0.15)" },
};

const SUSTAINABILITY_TIPS = [
  "Carry a reusable bag – saves ~700 plastic bags per year!",
  "Composting food waste reduces methane emissions by up to 50%.",
  "Recycling one aluminium can saves enough energy to run a TV for 3 hours.",
  "Glass is 100% recyclable and can be recycled endlessly without quality loss.",
  "Recycling paper saves 17 trees and 7,000 gallons of water per ton.",
];

const MOCK_HISTORY = [
  { id: 1, category: "Plastic", confidence: 94.2, timestamp: "2025-05-23 09:14:32", recommendation: "Blue recycling bin" },
  { id: 2, category: "Paper", confidence: 88.7, timestamp: "2025-05-23 09:45:11", recommendation: "Paper recycling" },
  { id: 3, category: "Metal", confidence: 97.1, timestamp: "2025-05-23 10:02:55", recommendation: "Metal recycling bin" },
  { id: 4, category: "Glass", confidence: 91.4, timestamp: "2025-05-23 10:30:00", recommendation: "Glass bank" },
  { id: 5, category: "Cardboard", confidence: 85.9, timestamp: "2025-05-23 11:05:22", recommendation: "Flatten & recycle" },
  { id: 6, category: "Plastic", confidence: 89.3, timestamp: "2025-05-23 11:40:47", recommendation: "Blue recycling bin" },
  { id: 7, category: "Organic", confidence: 92.6, timestamp: "2025-05-23 12:15:30", recommendation: "Compost" },
];

const PIE_DATA = Object.entries(WASTE_CATEGORIES).map(([name, v]) => ({ name, value: Math.floor(Math.random() * 40) + 10, color: v.color }));
const BAR_DATA = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day: d, detections: Math.floor(Math.random() * 30) + 10 }));
const TREND_DATA = ["Jan","Feb","Mar","Apr","May"].map(d => ({ month: d, co2: Math.floor(Math.random() * 20) + 5, items: Math.floor(Math.random() * 80) + 20 }));

// ── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{

  --navy:#1E104E;
  --navy2:#2a1763;
  --navy3:#452E5A;

  --green:#FFC85C;
  --green2:#ffb938;
  --green3:rgba(255,200,92,0.12);

  --blue:#FF653F;

  --text:#ffffff;
  --muted:#c9c2d9;

  --card:rgba(255,255,255,0.05);

  --border:rgba(255,255,255,0.08);

  --font-head:'Inter',sans-serif;
  --font-body:'DM Sans',sans-serif;

}
  body{

  background:
  linear-gradient(
    135deg,
    #1E104E 0%,
    #2a1763 45%,
    #452E5A 100%
  );

}
 color:var(--text);font-family:var(--font-body);overflow-x:hidden}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:var(--navy2)} ::-webkit-scrollbar-thumb{background:var(--green2);border-radius:2px}

  .glass{

  background:rgba(255,255,255,0.05);

  backdrop-filter:blur(16px);

  border:1px solid rgba(255,255,255,0.08);

  border-radius:24px;

  box-shadow:
    0 10px 30px rgba(0,0,0,0.25);

}

.glass-hover{
  transition:all .3s ease;
}

.glass-hover:hover{
  border-color:rgba(45,106,79,0.18);
  box-shadow:0 12px 25px rgba(45,106,79,0.08);
  transform:translateY(-4px);
}
  .glow{
  text-shadow:none;
}

.glow-box{
  box-shadow:0 10px 30px rgba(0,0,0,0.05);
}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(2,11,24,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
  .nav-inner{max-width:1280px;margin:0 auto;padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between}
  .logo{font-family:var(--font-head);font-size:1.4rem;font-weight:900;color:var(--green);letter-spacing:2px}
  .logo span{color:var(--text);font-weight:400}
  .nav-links{display:flex;gap:.5rem;flex-wrap:wrap}
  .nav-btn{background:none;border:none;color:var(--muted);font-family:var(--font-body);font-size:.85rem;padding:.5rem .8rem;border-radius:8px;cursor:pointer;transition:all .2s;letter-spacing:.5px}
  .nav-btn:hover,.nav-btn.active{color:var(--green);background:var(--green3)}
  .page{min-height:100vh;padding:40px 2rem 4rem;max-width:1280px;margin:0 auto}
  
  .hero{
  display:grid;

  grid-template-columns:1.1fr .9fr;

  align-items:start;

  gap:60px;

  padding-top:0px;

  margin-bottom:60px;

  min-height:85vh;

  text-align:left;
}

  .hero-left{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  padding-top:70px;
}

.hero-right{

  display:flex;

  justify-content:center;
  padding-top:40px;  // Adjusted padding for better vertical alignment
}
  .hero-buttons{
  display:flex;
  gap:1rem;
  margin-top:2rem;
  flex-wrap:wrap;
}

.hero-slogan{
  font-size:2rem;
  color:white;
  margin-bottom:1rem;
  font-weight:500;
}

.dashboard-card{
  width:100%;
  max-width:400px;
  padding:28px;
  border-radius:28px;
  background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.08);
  backdrop-filter:blur(20px);
  box-shadow:0 20px 50px rgba(0,0,0,0.35);
}

.dashboard-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:24px;
}

.dashboard-top h3{
  font-size:1.8rem;
  color:white;
  margin-bottom:4px;
}

.dashboard-top p{
  color:var(--muted);
  font-size:.95rem;
}

.live-dot{
  width:14px;
  height:14px;
  border-radius:50%;
  background:#00ff88;
  box-shadow:0 0 18px #00ff88;
  animation:pulse 2s infinite;
}

.dashboard-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
  margin:24px 0;
}

.mini-stat{
  padding:22px;
  border-radius:18px;
  text-align:center;
  background:rgba(255,255,255,0.04);
}

.mini-stat h2{
  color:#FFC85C;
  font-size:32px;
  margin-bottom:6px;
}

.mini-stat span{
  color:var(--muted);
  font-size:.9rem;
}

.prediction-box{
  margin-top:24px;
  padding:20px;
  border-radius:20px;
  background:rgba(255,255,255,0.04);
}

.prediction-header{
  display:flex;
  justify-content:space-between;
  margin-bottom:14px;
  color:white;
  font-size:.95rem;
}

.progress-track{
  width:100%;
  height:10px;
  border-radius:20px;
  background:rgba(255,255,255,0.08);
  overflow:hidden;
}

.progress-fill{
  width:92%;
  height:100%;
  border-radius:20px;
  background:linear-gradient(90deg,#FF653F,#FFC85C);
}

.chart-card{
  margin-top:18px;
  padding:20px;
  border-radius:20px;
  background:rgba(255,255,255,0.04);
}

.chart-title{
  margin-bottom:18px;
  color:white;
  font-size:1rem;
}

.fake-chart{
  display:flex;
  align-items:flex-end;
  gap:14px;
  height:110px;
}

.chart-bar{
  flex:1;
  border-radius:12px 12px 0 0;
  background:linear-gradient(180deg,#FF653F,#FFC85C);
  animation:grow 1.5s ease forwards;
}

.chart-bar:nth-child(1){height:60%}
.chart-bar:nth-child(2){height:85%}
.chart-bar:nth-child(3){height:45%}
.chart-bar:nth-child(4){height:95%}

@keyframes grow{
  from{
    height:0;
  }
}

@media(max-width:950px){

  .hero{
    grid-template-columns:1fr;
    text-align:center;
    gap:50px;
  }

  .hero-left{
    align-items:center;
  }

  .hero-buttons{
    justify-content:center;
  }

}
  .hero-tag{display:inline-block;border:1px solid var(--border);padding:.3rem 1rem;border-radius:20px;font-size:.75rem;letter-spacing:2px;color:var(--green);margin-bottom:1.5rem;text-transform:uppercase}
  .hero-title{font-family:var(--font-head);font-size:clamp(2.5rem,6vw,5rem);font-weight:900;line-height:1.1;margin-bottom:1rem}
  .hero-title .accent{color:var(--green)}
  .hero-sub{font-size:1.1rem;color:var(--muted);max-width:600px;margin:0 auto 2.5rem;line-height:1.7}
  .btn{
  display:inline-flex;
  align-items:center;
  gap:.5rem;
  padding:.85rem 1.8rem;

  border-radius:14px;

  font-family:var(--font-body);
  font-size:.95rem;
  font-weight:600;

  cursor:pointer;

  transition:all .3s ease;

  letter-spacing:.3px;

  border:none;
}

.btn-primary{

  background:#FF653F;

  color:white;

}

.btn-primary:hover{

  background:#ff7b5c;

  box-shadow:
    0 12px 25px rgba(255,101,63,0.35);

  transform:translateY(-3px);

}

.btn-outline{

  background:rgba(255,255,255,0.04);

  color:#FFC85C;

  border:1px solid rgba(255,255,255,0.08);

  backdrop-filter:blur(10px);

}

.btn-outline:hover{

  background:rgba(255,255,255,0.08);

  border-color:#FFC85C;

  box-shadow:
    0 10px 25px rgba(255,200,92,0.18);

  transform:translateY(-2px);

}
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
  .stat-card{padding:1.25rem 1.5rem}
  .stat-label{font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem}
  .stat-value{font-family:var(--font-head);font-size:2rem;font-weight:700;color:var(--green)}
  .stat-unit{font-size:.75rem;color:var(--muted);margin-top:.2rem}
  .section-title{font-family:var(--font-head);font-size:1.5rem;font-weight:700;color:var(--text);margin-bottom:1.5rem;display:flex;align-items:center;gap:.75rem}
  .section-title::after{content:'';flex:1;height:1px;background:var(--border)}
  .upload-zone{border:2px dashed var(--border);border-radius:16px;padding:3rem;text-align:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden}
  .upload-zone:hover,.upload-zone.drag{border-color:var(--green);background:var(--green3)}
  .upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
  .confidence-bar{height:8px;border-radius:4px;background:rgba(255,255,255,0.08);overflow:hidden;margin:.5rem 0}
  .confidence-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--green2),var(--green));transition:width 1s cubic-bezier(.4,0,.2,1)}
  .result-card{animation:slideUp .5s ease}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .category-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem 1rem;border-radius:20px;font-weight:600;font-size:.85rem}
  .table-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse;font-size:.85rem}
  th{text-align:left;padding:.75rem 1rem;font-size:.7rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border)}
  td{padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,0.04);color:var(--text)}
  tr:hover td{background:var(--green3)}
  .toast{position:fixed;bottom:2rem;right:2rem;z-index:999;padding:.9rem 1.5rem;border-radius:10px;background:rgba(0,255,136,0.15);border:1px solid var(--green);color:var(--green);font-size:.85rem;animation:toastIn .3s ease;max-width:320px}
  @keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
  .pulse{animation:pulse 2s infinite} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .scan-line{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,255,136,0.04) 50%,transparent 60%);animation:scan 3s linear infinite;pointer-events:none}
  @keyframes scan{from{transform:translateY(-100%)}to{transform:translateY(100%)}};
  .webcam-frame{position:relative;border-radius:12px;overflow:hidden;background:#000;min-height:360px;display:flex;align-items:center;justify-content:center}
  .live-badge{position:absolute;top:.75rem;left:.75rem;display:flex;align-items:center;gap:.4rem;background:rgba(255,50,50,0.85);padding:.3rem .7rem;border-radius:20px;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;z-index:10}
  .env-bar{height:10px;border-radius:5px;background:rgba(255,255,255,0.08);overflow:hidden;margin:.4rem 0}
  .env-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,#00cc6a,#00ff88);animation:growBar 1.5s ease forwards}
  @keyframes growBar{from{width:0}}
  .impact-icon{font-size:2.5rem;margin-bottom:.75rem}
  .tips-scroll{display:flex;gap:1rem;overflow-x:auto;padding-bottom:.5rem}
  .tips-scroll::-webkit-scrollbar{height:3px}
  .tip-card{min-width:240px;padding:1rem 1.25rem;flex-shrink:0}
  .floating{animation:float 6s ease-in-out infinite} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
  .about-hero{background:radial-gradient(ellipse at 50% 0%,rgba(0,255,136,0.08) 0%,transparent 70%);text-align:center;padding:3rem 1rem}
  .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0}
  .feature-item{padding:1.25rem;text-align:center}
  .spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto} @keyframes spin{to{transform:rotate(360deg)}}
  .counter{font-family:var(--font-head)}
`;

// ── API call ─────────────────────────────────────────────────────────────────
async function analyzeWasteImage(base64) {

  const res = await fetch("https://intellibin-ai-waste-segregation-production.up.railway.app/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      image: base64
    })
  });

  const text = await res.text();

console.log("RAW RESPONSE:", text);

if (!res.ok) {
  console.error("Backend Error:", text);
  throw new Error(text);
}

const data = JSON.parse(text);

console.log("Backend response:", data);

return {
  category: data.category || "Organic",
  confidence: data.confidence || 95,
  reason: data.reason || "Detected successfully",
  disposal: data.disposal || "Dispose properly",
  recyclable: data.recyclable || false,
  co2_saved: data.co2_saved || 0.5
};
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">✦ {msg}</div>;
}

// ── AnimCounter ───────────────────────────────────────────────────────────────
function AnimCounter({ target, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let cur = 0; const step = target / 60;
    const id = setInterval(() => { cur = Math.min(cur + step, target); setV(Math.round(cur)); if (cur >= target) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [target]);
  return <span className="counter">{v.toLocaleString()}{suffix}</span>;
}

// ── Pages ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div className="page">
      <div className="hero">

  {/* LEFT SIDE */}

  <div className="hero-left">

    <div className="hero-tag">
      🌍 AI-Powered Waste Intelligence
    </div>

    <h1 className="hero-title">
      <span className="accent">Intelli</span>Bin
    </h1>

    <div className="hero-slogan">
      Think Smart. Dispose Smart.
    </div>

    <p className="hero-sub">
      Revolutionary AI waste classification using computer vision.
      Detect, categorize, and responsibly dispose of waste in
      real-time for a greener planet.
    </p>

    <div className="hero-buttons">

      <button
        className="btn btn-primary"
        onClick={() => setPage("detect")}
      >
        🔬 Start AI Detection
      </button>

      <button
        className="btn btn-outline"
        onClick={() => setPage("webcam")}
      >
        📹 Live Webcam
      </button>

    </div>

  </div>

  {/* RIGHT SIDE */}

  <div className="hero-right">

    <div className="glass dashboard-card">

      <div className="dashboard-top">

        <div>
          <h3>Live AI Analytics</h3>
          <p>Real-Time Waste Monitoring</p>
        </div>

        <div className="live-dot"></div>

      </div>

      <div className="dashboard-grid">

        <div className="glass mini-stat">
          <h2>98.2%</h2>
          <span>AI Accuracy</span>
        </div>

        <div className="glass mini-stat">
          <h2>247K+</h2>
          <span>Items Processed</span>
        </div>

      </div>

      <div className="prediction-box">

        <div className="prediction-header">

          <span>♻ Plastic Waste</span>

          <span>92%</span>

        </div>

        <div className="progress-track">

          <div className="progress-fill"></div>

        </div>

      </div>

      <div className="glass chart-card">

        <div className="chart-title">
          Environmental Impact
        </div>

        <div className="fake-chart">

          <div className="chart-bar"></div>
          <div className="chart-bar"></div>
          <div className="chart-bar"></div>
          <div className="chart-bar"></div>

        </div>

      </div>

    </div>

  </div>

</div>

      <div className="stat-grid" style={{ marginBottom: "3rem" }}>
        {[["247K+","Waste Items Detected"],["98.2%","AI Accuracy"],["1.2T","CO₂ Saved (kg)"],["12","Cities Deployed"]].map(([v,l]) => (
          <div key={l} className="glass glass-hover stat-card" style={{ textAlign: "center" }}>
            <div className="stat-value glow">{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="section-title">How It Works</div>
      <div className="feature-grid">
        {[
          ["📸", "Upload or Scan", "Upload an image or use your webcam to capture waste in real-time."],
          ["🧠", "AI Analysis", "Our TensorFlow/YOLOv8 model classifies waste with 98%+ accuracy."],
          ["♻️", "Smart Disposal", "Get personalized recycling instructions & environmental impact."],
          ["📊", "Track Impact", "Monitor your CO₂ savings and recycling contribution over time."],
        ].map(([icon, title, desc]) => (
          <div key={title} className="glass glass-hover feature-item">
            <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: ".9rem", marginBottom: ".5rem", color: "var(--green)" }}>{title}</div>
            <div style={{ fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.6 }}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "3rem" }}>
        <div className="section-title">Sustainability Tips</div>
        <div className="tips-scroll">
          {SUSTAINABILITY_TIPS.map((tip, i) => (
            <div key={i} className="glass tip-card">
              <div style={{ color: "var(--green)", fontSize: "1.2rem", marginBottom: ".5rem" }}>💡</div>
              <div style={{ fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.6 }}>{tip}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass glow-box floating" style={{ marginTop: "3rem", padding: "2rem", textAlign: "center", background: "radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.06) 0%, transparent 70%)" }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "clamp(1rem,3vw,1.5rem)", marginBottom: ".5rem" }}>Ready to make a difference?</div>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Join thousands of eco-conscious users using IntelliBin to build a cleaner future.</p>
        <button className="btn btn-primary" onClick={() => setPage("detect")}>Get Started Free →</button>
      </div>
    </div>
  );
}

function DetectPage({ history, setHistory, showToast }) {
  const [preview, setPreview] = useState(null);
  const [b64, setB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setB64(e.target.result.split(",")[1]);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!b64) return;
    setLoading(true);
    try {
      const res = await analyzeWasteImage(b64);
      setResult(res);
      setShowPopup(true);

      const entry = { id: Date.now(), category: res.category, confidence: res.confidence, timestamp: new Date().toLocaleString(), recommendation: res.disposal };
      setHistory(h => [entry, ...h]);
    } catch {
      showToast("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const cat = result ? WASTE_CATEGORIES[result.category] : null;

  return (
    <div className="page" style={{ paddingTop: "85px" }}>
      <div className="section-title">🔬 AI Waste Detection</div>
      <div className="grid-2">
        <div>
          <div
            className={`upload-zone ${drag ? "drag" : ""}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 280, borderRadius: 8, objectFit: "contain" }} />
            ) : (
              <>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
                <div style={{ color: "var(--green)", fontWeight: 600, marginBottom: ".5rem" }}>Drop image here or click to upload</div>
                <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>Supports JPG, PNG, WEBP</div>
              </>
            )}
          </div>
          {preview && (
            <button className="btn btn-primary" style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }} onClick={analyze} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</> : "🧠 Analyze Waste"}
            </button>
          )}
        </div>

        <div>
          {loading && (
            <div className="glass" style={{ padding: "3rem", textAlign: "center" }}>
              <div className="spinner" style={{ marginBottom: "1rem" }} />
              <div style={{ color: "var(--green)", fontFamily: "var(--font-head)", fontSize: ".9rem", marginBottom: ".5rem" }}>SCANNING...</div>
              <div className="pulse" style={{ color: "var(--muted)", fontSize: ".8rem" }}>AI model processing image</div>
            </div>
          )}
          {result && showPopup && (
  <div
    style={{
      position: "fixed",
      right: "30px",
      bottom: "30px",
      width: "320px",
      zIndex: 9999,
      background: "rgba(32, 24, 64, 0.95)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "20px",
      padding: "1.2rem",
      backdropFilter: "blur(18px)",
      boxShadow: "0 0 25px rgba(0,255,140,0.35), 0 10px 40px rgba(0,0,0,0.35)",
      animation: "popupSlide 0.4s ease"
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <button
        onClick={() => setShowPopup(false)}
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        ✕
      </button>
    <div
        style={{
          width: "75px",
          height: "75px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.4rem"
        }}
      >
        {cat?.icon || "♻️"}
      </div>

      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#fff",
            marginBottom: ".3rem",
            textTransform: "capitalize"
          }}
        >
          {result.category} detected
        </div>

        <div style={{ color: "#bdbdd7", fontSize: ".9rem" }}>
          Confidence: {result.confidence}%
        </div>
      </div>
    </div>
  </div>
)}
          {!result && !loading && (
            <div className="glass" style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: .4 }}>🤖</div>
              <div style={{ color: "var(--muted)", fontSize: ".9rem" }}>Upload an image to begin AI analysis</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WebcamPage({ showToast }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setActive(true);
      showToast("Webcam started! Position waste item in view.");
    } catch {
      showToast("Camera access denied. Please enable webcam permissions.");
    }
  };

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setActive(false); setStreaming(false); setPrediction(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const captureAndAnalyze = useCallback(async () => {
  if (!videoRef.current || !canvasRef.current) return;

  const ctx = canvasRef.current.getContext("2d");

  canvasRef.current.width = 224;
  canvasRef.current.height = 224;

  ctx.drawImage(
    videoRef.current,
    0,
    0,
    224,
    224
  );

  const b64 = canvasRef.current
    .toDataURL("image/jpeg", 0.2)
    .split(",")[1];

  try {
    const res = await analyzeWasteImage(b64);
    setPrediction(res);
  } catch (err) {
    console.error(err);
  }
}, []);

  const toggleStreaming = () => {
    if (streaming) {
      clearInterval(intervalRef.current);
      setStreaming(false);
    } else {
      captureAndAnalyze();
      intervalRef.current = setInterval(async () => {
      if (!window.isPredicting) {
        window.isPredicting = true;

        try {
          await captureAndAnalyze();
        } catch (e) {
          console.log(e);
        }

        window.isPredicting = false;
      }
    }, 10000);
            setStreaming(true);
          }
        };

  useEffect(() => () => { stopCam(); }, []);

 const cat = prediction
  ? WASTE_CATEGORIES[
      prediction.category.charAt(0).toUpperCase() +
      prediction.category.slice(1).toLowerCase()
    ]
  : null;
  return (
    <div className="page" style={{ paddingTop: "85px" }}>
      <div className="section-title">📹 Live Webcam Detection</div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div>
          <div className="webcam-frame glass">
            {active && streaming && <div className="scan-line" />}
            {active && <div className="live-badge"><span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff4444", display: "inline-block" }} />LIVE</div>}
            <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", display: active ? "block" : "none" }} muted playsInline />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {!active && (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📸</div>
                <div style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Camera not started</div>
                <button className="btn btn-primary" onClick={startCam}>Enable Webcam</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
            {active && <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={toggleStreaming}>
              {streaming ? "⏸ Pause Detection" : "▶ Start Detection"}
            </button>}
            {active && <button className="btn btn-outline" onClick={stopCam}>■ Stop Camera</button>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {prediction && cat ? (
            <div className="glass result-card" style={{ padding: "1.5rem" }}>
              <div style={{ fontSize: ".7rem", letterSpacing: "2px", color: "var(--green)", marginBottom: "1rem", textTransform: "uppercase" }}>⚡ Real-time Detection</div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "2.5rem" }}>{cat.icon}</div>
                <div>
                  <div className="category-badge" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}40` }}>{prediction.category}</div>
                  <div style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: ".3rem" }}>{prediction.recyclable ? "Recyclable ✓" : "Non-recyclable ✗"}</div>
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", color: "var(--muted)", marginBottom: ".3rem" }}>
                  <span>Confidence</span><span style={{ color: cat.color }}>{prediction.confidence}%</span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${prediction.confidence}%`, background: `linear-gradient(90deg, ${cat.color}99, ${cat.color})` }} />
                </div>
              </div>
              <div style={{ fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.6 }}>{prediction.disposal}</div>
            </div>
          ) : (
            <div className="glass" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: ".75rem" }}>🔍</div>
              <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                {active ? "Start detection to analyze waste in view" : "Enable webcam to begin live analysis"}
              </div>
            </div>
          )}

          <div className="glass" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: ".7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Detectable Categories</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
              {Object.entries(WASTE_CATEGORIES).map(([name, v]) => (
                <span key={name} className="category-badge" style={{ background: v.bg, color: v.color, border: `1px solid ${v.color}30`, fontSize: ".75rem" }}>
                  {v.icon} {name}
                </span>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: "1.25rem", background: "rgba(255,100,0,0.06)", borderColor: "rgba(255,100,0,0.2)" }}>
            <div style={{ fontSize: ".8rem", color: "#ffaa00", marginBottom: ".5rem", fontWeight: 600 }}>📋 Tips for Best Results</div>
            {["Hold item 30–60 cm from camera","Ensure good lighting conditions","Center the waste item in frame"].map(t => (
              <div key={t} style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: ".3rem" }}>• {t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage({ history }) {
  const [analytics, setAnalytics] = useState(null);
  const totalDetections = analytics?.total || 0;
  const mostDetected = analytics?.most_detected || "None";
  const co2Saved = analytics?.co2_saved || 0;
  const recyclingScore = analytics?.recycling_score || 0;
  const pieData = analytics?.categories
    ? Object.entries(analytics.categories).map(([name, value]) => ({
        name,
        value,
        color: WASTE_CATEGORIES[name]?.color || "#8884d8"
      }))
    : [];

  const weekly = analytics?.weekly || [0, 0, 0, 0, 0, 0, 0];

  const barData = [
    { day: "Mon", detections: weekly[0] },
    { day: "Tue", detections: weekly[1] },
    { day: "Wed", detections: weekly[2] },
    { day: "Thu", detections: weekly[3] },
    { day: "Fri", detections: weekly[4] },
    { day: "Sat", detections: weekly[5] },
    { day: "Sun", detections: weekly[6] }
  ];
  const lineData = [
  { month: "Jan", co2: co2Saved * 0.2, items: totalDetections * 0.2 },
  { month: "Feb", co2: co2Saved * 0.4, items: totalDetections * 0.4 },
  { month: "Mar", co2: co2Saved * 0.6, items: totalDetections * 0.6 },
  { month: "Apr", co2: co2Saved * 0.8, items: totalDetections * 0.8 },
  { month: "May", co2: co2Saved, items: totalDetections }
];
const impactStats = [
  {
    icon: "🌳",
    label: "Trees Saved",
    value: Math.round(totalDetections * 0.8),
    unit: "",
    desc: "Equivalent paper recycled"
  },
  {
    icon: "💧",
    label: "Water Saved",
    value: Math.round(co2Saved * 60),
    unit: "L",
    desc: "Estimated recycling impact"
  },
  {
    icon: "⚡",
    label: "Energy Saved",
    value: Math.round(totalDetections * 20),
    unit: "kWh",
    desc: "Estimated energy recovery"
  },
  {
    icon: "🌡️",
    label: "CO₂ Prevented",
    value: co2Saved,
    unit: "kg",
    desc: "Total estimated"
  }
];
  
  useEffect(() => {
  fetch("https://intellibin-ai-waste-segregation-production.up.railway.app/analytics")
    .then(res => res.json())
    .then(data => {
      console.log("Analytics:", data);
      setAnalytics(data);
      })
    .catch(err => {
      console.error("Analytics Error:", err);
    });
}, []);

  return (
    <div className="page" style={{ paddingTop: "85px" }}>
      <div className="section-title">📊 Analytics Dashboard</div>
      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        {[
          ["Total Detections", totalDetections, "items"],
          ["Most Detected", mostDetected, "waste type"],
          ["CO₂ Saved", `${co2Saved} kg`, "estimated"],
          ["Recycling Score", `${recyclingScore}/100`, "efficiency"],
        ].map(([label, value, unit]) => (
          <div key={label} className="glass glass-hover stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value glow" style={{ fontSize: "1.5rem" }}>{typeof value === "number" ? <AnimCounter target={value} /> : value}</div>
            <div className="stat-unit">{unit}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        <div className="glass" style={{ padding: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: ".9rem", marginBottom: "1rem", color: "var(--text)" }}>Waste Distribution</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--navy2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ padding: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: ".9rem", marginBottom: "1rem", color: "var(--text)" }}>Weekly Detection Count</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--navy2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 12 }} />
              <Bar dataKey="detections" fill="#00ff88" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: ".9rem", marginBottom: "1rem", color: "var(--text)" }}>Monthly Trend — CO₂ Saved & Items Recycled</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--navy2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="co2" stroke="#00ff88" strokeWidth={2} dot={{ fill: "#00ff88", r: 4 }} name="CO₂ (kg)" />
            <Line type="monotone" dataKey="items" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 4 }} name="Items" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="section-title">🌱 Environmental Impact</div>
        <div className="feature-grid">
          {impactStats.map((item) => (
            <div key={item.label} className="glass glass-hover" style={{ padding: "1.25rem", textAlign: "center" }}>
              <div className="impact-icon">{item.icon}</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: ".75rem", color: "var(--muted)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: ".4rem" }}>{item.label}</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "1.4rem", color: "var(--green)", marginBottom: ".3rem" }}>{item.value}{item.unit}</div>
              <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryPage({ history }) {
  const [historyData, setHistoryData] = useState([]);
  useEffect(() => {
  fetch("https://intellibin-ai-waste-segregation-production.up.railway.app/history")
    .then(res => res.json())
    .then(data => {
      console.log("History:", data);
      setHistoryData(data);
      })
    .catch(err => {
      console.error("Analytics Error:", err);
    });
}, []);
  return (
    <div className="page" style={{ paddingTop: "85px" }}>
      <div className="section-title">🕐 Detection History</div>
      <div className="glass" style={{ padding: "1.5rem" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Category</th><th>Confidence</th><th>Timestamp</th><th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
  {historyData.map((row, i) => {
    const cat = WASTE_CATEGORIES[row.category];

    return (
      <tr key={i}>
        <td
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-head)",
            fontSize: ".75rem"
          }}
        >
          {String(i + 1).padStart(3, "0")}
        </td>

        <td>
          <span
            className="category-badge"
            style={{
              background: cat?.bg,
              color: cat?.color,
              border: `1px solid ${cat?.color}30`,
              fontSize: ".75rem"
            }}
          >
            {cat?.icon} {row.category}
          </span>
        </td>

        <td>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem"
            }}
          >
            <div
              style={{
                width: 60,
                height: 5,
                borderRadius: 3,
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${row.confidence}%`,
                  height: "100%",
                  background: cat?.color,
                  borderRadius: 3
                }}
              />
            </div>

            <span
              style={{
                fontFamily: "var(--font-head)",
                fontSize: ".8rem",
                color: cat?.color
              }}
            >
              {Number(row.confidence).toFixed(1)}%
            </span>
          </div>
        </td>

        <td
          style={{
            color: "var(--muted)",
            fontSize: ".8rem"
          }}
        >
          {row.timestamp || "Just now"}
        </td>

        <td
          style={{
            color: "var(--text)",
            fontSize: ".85rem"
          }}
        >
          {row.recommendation || "Recycle properly"}
        </td>
      </tr>
    );
  })}
</tbody>
          </table>
        </div>
           
        {historyData.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>No detections yet. Start scanning!</div>
        )}
      </div>
    </div>
  );
}

function CO2Page({ history }) {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
  fetch("https://intellibin-ai-waste-segregation-production.up.railway.app/analytics")
    .then(res => res.json())
    .then(data => {
      console.log("CO2 Analytics:", data);
      setAnalytics(data);
      })
    .catch(err => {
      console.error("Analytics Error:", err);
    });
}, []);
const totalCO2 = analytics?.co2_saved || 0;

const totalItems = analytics?.total || 0;

const trees = Math.round(totalCO2 / 20);

const thisMonth = Math.round(totalCO2 * 0.25);
const plasticItems = analytics?.categories?.plastic || 0;
const environmentalScore = analytics?.recycling_score || 0;

  const bars = analytics ? [
  {
    label: "Plastic Recycled",
    count: analytics.categories?.plastic || 0,
    color: "#00ff88",
    max: analytics.total || 1
  },
  {
    label: "Paper Recycled",
    count: analytics.categories?.paper || 0,
    color: "#00d4ff",
    max: analytics.total || 1
  },
  {
    label: "Metal Recycled",
    count: analytics.categories?.metal || 0,
    color: "#ff6b35",
    max: analytics.total || 1
  },
  {
    label: "Glass Recycled",
    count: analytics.categories?.glass || 0,
    color: "#a855f7",
    max: analytics.total || 1
  }
] : [];

  return (
    <div className="page" style={{ paddingTop: "85px" }}>
      <div className="section-title">🌿 CO₂ Savings Tracker</div>
      <div className="glass glow-box" style={{ padding: "2rem", textAlign: "center", marginBottom: "2rem", background: "radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.08) 0%, transparent 70%)" }}>
        <div style={{ fontSize: ".75rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: ".75rem" }}>Total Estimated CO₂ Prevented</div>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "clamp(2.5rem,6vw,4.5rem)", color: "var(--green)", fontWeight: 900 }}>{totalCO2} <span style={{ fontSize: "1.5rem" }}>kg CO₂</span></div>
        <div style={{ color: "var(--muted)", marginTop: ".5rem" }}>Equivalent to planting {(totalCO2 / 21).toFixed(1)} trees 🌳</div>
      </div>

      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="glass glass-hover stat-card" style={{ textAlign: "center" }}>
          <div className="stat-label">Environmental Score</div>
          <div className="stat-value glow">{analytics?.recycling_score || 0}<span style={{ fontSize: "1rem" }}>/100</span></div>
          <div className="env-bar"><div className="env-fill" style={{ width: `${environmentalScore}%` }} /></div>
        </div>
        <div className="glass glass-hover stat-card" style={{ textAlign: "center" }}>
          <div className="stat-label">Total Items Recycled</div>
          <div className="stat-value glow"><AnimCounter target={analytics?.total || 0} /></div>
          <div className="stat-unit">items tracked</div>
        </div>
        <div className="glass glass-hover stat-card" style={{ textAlign: "center" }}>
          <div className="stat-label">Equivalent Trees</div>
          <div className="stat-value glow">{Math.round(totalCO2 / 21)}</div>
          <div className="stat-unit">trees worth of CO₂</div>
        </div>
        <div className="glass glass-hover stat-card" style={{ textAlign: "center" }}>
          <div className="stat-label">This Month</div>
          <div className="stat-value glow">{analytics?.monthly_co2 || 0}</div>
          <div className="stat-unit">kg CO₂ prevented</div>
        </div>
      </div>

      <div className="section-title">Recycling Breakdown</div>
      <div className="glass" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        {bars.map(({ label, count, color, max }) => (
          <div key={label} style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".4rem" }}>
              <span style={{ fontSize: ".85rem", color: "var(--text)" }}>{label}</span>
              <span style={{ fontFamily: "var(--font-head)", fontSize: ".85rem", color }}>{count} items</span>
            </div>
            <div className="env-bar">
              <div className="env-fill" style={{ width: `${(count / max) * 100}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">🏆 Impact Milestones</div>
      <div className="feature-grid">
        {[
  [
    "🥉",
    "First Recycler",
    "Made your first 10 detections",
    totalItems >= 10
  ],

  [
    "🥈",
    "Eco Warrior",
    "Prevented 50kg of CO₂",
    totalCO2 >= 50
  ],

  [
    "🥇",
    "Green Champion",
    "Recycled 100 plastic items",
    plasticItems >= 100
  ],

  [
    "🌟",
    "Planet Guardian",
    "Score 95+ environmental rating",
    environmentalScore >= 95
  ]
].map(([icon, title, desc, earned]) => (
          <div key={title} className="glass glass-hover" style={{ padding: "1.25rem", textAlign: "center", opacity: earned ? 1 : 0.4 }}>
            <div style={{ fontSize: "2rem", marginBottom: ".5rem", filter: earned ? "none" : "grayscale(1)" }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: ".8rem", color: earned ? "var(--green)" : "var(--muted)", marginBottom: ".3rem" }}>{title}</div>
            <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{desc}</div>
            {earned && <div style={{ fontSize: ".7rem", color: "var(--green)", marginTop: ".4rem", letterSpacing: "1px" }}>✓ EARNED</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page" style={{ paddingTop: "50px" }}>
      <div className="about-hero">
        <div style={{ fontFamily: "var(--font-head)", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, marginBottom: "1rem" }}>
          About <span style={{ color: "var(--green)" }}>IntelliBin</span>
        </div>
        <p style={{ color: "var(--muted)", maxWidth: 600, margin: "0 auto 2rem", lineHeight: 1.8 }}>
          IntelliBin is an AI-powered smart waste management platform designed to revolutionize how we think about recycling and environmental sustainability.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        {[
          { icon: "🎯", title: "Our Mission", desc: "To make proper waste disposal effortless through cutting-edge AI, empowering individuals and communities to contribute to a sustainable future." },
          { icon: "🔬", title: "Our Technology", desc: "Powered by TensorFlow and YOLOv8, our models achieve 98%+ accuracy across 6+ waste categories, trained on millions of images from global datasets." },
          { icon: "🌍", title: "Global Impact", desc: "Deployed in 12+ cities, IntelliBin has helped prevent thousands of tonnes of misclassified waste from reaching landfills." },
          { icon: "🚀", title: "The Future", desc: "We're building smart IoT-connected bins, municipal dashboards, and AR-powered mobile apps to bring AI waste management to everyone." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass glass-hover" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: ".95rem", marginBottom: ".5rem", color: "var(--green)" }}>{title}</div>
            <div style={{ fontSize: ".875rem", color: "var(--muted)", lineHeight: 1.7 }}>{desc}</div>
          </div>
        ))}
      </div>

      <div className="section-title">Tech Stack</div>
      <div className="feature-grid" style={{ marginBottom: "2rem" }}>
        {[
          ["⚛️", "React.js", "Frontend UI"],
          ["🐍", "Flask", "Backend API"],
          ["🧠", "TensorFlow", "AI Model"],
          ["🎯", "YOLOv8", "Object Detection"],
          ["🗄️", "SQLite", "Database"],
          ["🎨", "Tailwind CSS", "Styling"],
        ].map(([icon, name, role]) => (
          <div key={name} className="glass" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: ".5rem" }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: ".85rem", color: "var(--green)" }}>{name}</div>
            <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".2rem" }}>{role}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: "2rem", textAlign: "center", background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.06) 0%, transparent 70%)" }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem", marginBottom: ".5rem" }}>Built for the Future 🌱</div>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
          IntelliBin is ideal for hackathons, college major projects, startup prototypes, and portfolio showcases. Open source and community-driven.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <span className="category-badge" style={{ background: "rgba(0,255,136,0.1)", color: "var(--green)", border: "1px solid rgba(0,255,136,0.3)" }}>🏆 Hackathon Ready</span>
          <span className="category-badge" style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.3)" }}>🎓 College Project</span>
          <span className="category-badge" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>🚀 Startup Prototype</span>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => { setToast(msg); }, []);
  const hideToast = useCallback(() => setToast(null), []);

  const PAGES = [
    { id: "home", label: "Home" },
    { id: "detect", label: "AI Detection" },
    { id: "webcam", label: "Live Webcam" },
    { id: "analytics", label: "Analytics" },
    { id: "history", label: "History" },
    { id: "co2", label: "CO₂ Tracker" },
    { id: "about", label: "About" },
  ];

  return (
    <>
      <style>{css}</style>

      {/* BG grid pattern */}
      <nav className="nav" style={{ zIndex: 100 }}>
        <div className="nav-inner">
          <div className="logo" onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
            INTELLI<span>BIN</span>
          </div>
          <div className="nav-links">
            {PAGES.map(p => (
              <button key={p.id} className={`nav-btn ${page === p.id ? "active" : ""}`} onClick={() => setPage(p.id)}>{p.label}</button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "detect" && <DetectPage history={history} setHistory={setHistory} showToast={showToast} />}
        {page === "webcam" && <WebcamPage showToast={showToast} />}
        {page === "analytics" && <AnalyticsPage history={history} />}
        {page === "history" && <HistoryPage history={history} />}
        {page === "co2" && <CO2Page history={history} />}
        {page === "about" && <AboutPage />}
      </div>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid var(--border)", padding: "1.5rem 2rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-head)", color: "var(--green)", fontSize: ".9rem", marginBottom: ".25rem" }}>INTELLIBIN</div>
        <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>Think Smart. Dispose Smart. © 2025 IntelliBin — AI-Powered Waste Intelligence</div>
      </footer>

      {toast && <Toast msg={toast} onClose={hideToast} />}
    </>
  );
}
