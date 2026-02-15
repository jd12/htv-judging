import { useState, useEffect, useCallback, useRef } from "react";

// ─── API HELPERS ──────────────────────────────────────────────────────────────
const API = ""; // same-origin: server serves both API and frontend

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
function useRoute() {
  const [route, setRoute] = useState(() => window.location.pathname);
  useEffect(() => {
    const h = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);
  function navigate(path) { window.history.pushState({}, "", path); setRoute(path); }
  return { route, navigate };
}

// ─── RUBRIC ───────────────────────────────────────────────────────────────────
const RUBRIC = [
  { id:"technical",   label:"Technical Execution",       emoji:"💻", max:8, color:"#3B82F6",
    levels:[
      {range:[0,0], label:"Not attempted", desc:"Game doesn't run, crashes immediately, or has no functional choice system. Code is absent or completely broken."},
      {range:[1,2], label:"Minimal",       desc:"Game launches but has significant bugs that break gameplay. Branching barely works or is hardcoded incorrectly. Code is hard to follow."},
      {range:[3,4], label:"Developing",    desc:"Game is playable with some bugs. Some branches work but others may dead-end. Code shows effort but needs organization."},
      {range:[5,6], label:"Proficient",    desc:"Game runs smoothly with minor non-breaking bugs. Most choice branches lead to distinct outcomes. Code is organized and readable."},
      {range:[7,8], label:"Excellent",     desc:"Game runs smoothly with no crashes. Choices cleanly branch into meaningful outcomes. Code is well-organized and shows clear understanding of microStudio."},
    ]},
  { id:"creativity",  label:"Creativity & Originality",  emoji:"🎨", max:7, color:"#8B5CF6",
    levels:[
      {range:[0,0], label:"Not attempted", desc:"No creative effort beyond the default microStudio template. No original concept, visuals, or story."},
      {range:[1,2], label:"Minimal",       desc:"Limited creative effort. Default or minimal visual design with no original concept. Feels like an unstarted project."},
      {range:[3,4], label:"Developing",    desc:"Some creative elements present. Visuals are basic but intentional. Concept is familiar but shows the team tried to make it their own."},
      {range:[5,5], label:"Proficient",    desc:"Clear creative vision: original world-building, characters, or story. Visuals feel cohesive and purposeful. Game stands out from a default project."},
      {range:[6,7], label:"Excellent",     desc:"Unique, memorable concept with strong creative identity. Visuals and audio are intentional and polished. This game would stand out at any beginner showcase."},
    ]},
  { id:"theme",       label:"Theme Adherence",            emoji:"🌌", max:6, color:"#14B8A6",
    levels:[
      {range:[0,0], label:"Not attempted", desc:"No meaningful player choices exist. The game is fully linear with no branching. The 'Multiverse of Decisions' theme is absent."},
      {range:[1,2], label:"Minimal",       desc:"Choices exist in name only — they feel cosmetic and don't change what happens. Only one effective path through the game."},
      {range:[3,4], label:"Developing",    desc:"Choices have some impact, but paths lead to very similar outcomes. Theme of decisions shaping the story is present but underdeveloped."},
      {range:[5,5], label:"Proficient",    desc:"Player choices meaningfully change the story or outcome. At least 2 distinct paths or endings exist. The 'Multiverse of Decisions' theme is clearly evident."},
      {range:[6,6], label:"Excellent",     desc:"Decisions feel genuinely consequential. Multiple branching paths and outcomes reinforce the multiverse theme in a creative and memorable way."},
    ]},
  { id:"presentation",label:"Presentation",               emoji:"🎤", max:4, color:"#F59E0B",
    levels:[
      {range:[0,0], label:"Not attempted", desc:"Team did not present or attempt to explain their game."},
      {range:[1,1], label:"Minimal",       desc:"Only one member presented. No live demo was attempted. Explanation was unclear or very incomplete."},
      {range:[2,2], label:"Developing",    desc:"Most members participated. The concept was explained but key details were missing. Demo was partial or struggled."},
      {range:[3,3], label:"Proficient",    desc:"All team members contributed. The game concept and choices were clearly explained. A live demo was shown with reasonable confidence."},
      {range:[4,4], label:"Excellent",     desc:"Confident, engaging presentation with all members contributing. Clearly explained game, choices, and multiverse theme. Live demo ran smoothly."},
    ]},
];
const MAX_TOTAL = 25;

function getLevel(r, v) { return r.levels.find(l => v >= l.range[0] && v <= l.range[1]) || r.levels[0]; }
function calcTotal(s) { return RUBRIC.reduce((a,r) => a + (s?.[r.id] ?? 0), 0); }
function calcOutlier(vals) { return vals.length >= 2 && Math.max(...vals) - Math.min(...vals) >= 4; }
function medal(i) { return ["🥇","🥈","🥉"][i] || `#${i+1}`; }

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = { bg:"#0A0A0F",panel:"#111118",card:"#16161F",border:"#1E1E2E",accent:"#7C3AED",accentGlow:"#7C3AED44",gold:"#F59E0B",teal:"#14B8A6",red:"#EF4444",green:"#22C55E",text:"#E4E4F0",muted:"#6B6B8A" };

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:'Space Grotesk',sans-serif;min-height:100vh}
  .app{min-height:100vh;display:flex;flex-direction:column}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:60px;background:${C.panel};border-bottom:1px solid ${C.border};position:sticky;top:0;z-index:100}
  .nav-brand{display:flex;align-items:center;gap:10px;cursor:pointer}
  .nav-logo{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,${C.accent},${C.teal});display:flex;align-items:center;justify-content:center;font-size:16px}
  .nav-title{font-size:15px;font-weight:700;letter-spacing:-0.3px}
  .nav-sub{font-size:11px;color:${C.muted};font-family:'JetBrains Mono',monospace}
  .nav-right{display:flex;gap:4px;align-items:center}
  .main{flex:1;padding:32px;max-width:1400px;margin:0 auto;width:100%}
  .page-title{font-size:24px;font-weight:700;letter-spacing:-0.5px;margin-bottom:4px}
  .page-sub{font-size:13px;color:${C.muted};margin-bottom:28px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
  .card{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:20px}
  .card-title{font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:${C.muted};margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .dot{width:6px;height:6px;border-radius:50%;background:${C.accent}}
  .input-row{display:flex;gap:8px;margin-bottom:12px}
  .input{flex:1;background:${C.panel};border:1px solid ${C.border};border-radius:8px;padding:9px 14px;color:${C.text};font-family:'Space Grotesk',sans-serif;font-size:14px;outline:none;transition:border-color 0.15s}
  .input:focus{border-color:${C.accent}}
  .input::placeholder{color:${C.muted}}
  .btn{padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;white-space:nowrap;font-family:'Space Grotesk',sans-serif}
  .btn-primary{background:${C.accent};color:#fff}.btn-primary:hover{background:#6D28D9;transform:translateY(-1px)}
  .btn-ghost{background:${C.panel};color:${C.muted};border:1px solid ${C.border}}.btn-ghost:hover{color:${C.text};border-color:${C.muted}}
  .btn-danger{background:${C.red}22;color:${C.red};border:1px solid ${C.red}33}.btn-danger:hover{background:${C.red}33}
  .btn-teal{background:${C.teal}22;color:${C.teal};border:1px solid ${C.teal}33}.btn-teal:hover{background:${C.teal}33}
  .btn-sm{padding:5px 12px;font-size:12px}
  .btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important}
  .nav-tab{padding:6px 16px;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:${C.muted};transition:all 0.15s;font-family:'Space Grotesk',sans-serif}
  .nav-tab:hover{background:${C.card};color:${C.text}}
  .nav-tab.active{background:${C.accent}22;color:${C.accent}}
  .nav-badge{font-size:10px;padding:2px 6px;border-radius:20px;background:${C.accent}22;color:${C.accent};margin-left:6px;font-family:'JetBrains Mono',monospace}
  .list-item{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:8px;background:${C.panel};border:1px solid ${C.border};margin-bottom:8px;font-size:14px}
  .list-left{display:flex;align-items:center;gap:10px}
  .list-num{width:24px;height:24px;border-radius:6px;background:${C.accent}22;color:${C.accent};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace}
  .alert{padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .alert-ok{background:${C.green}22;border:1px solid ${C.green}33;color:${C.green}}
  .alert-warn{background:${C.gold}22;border:1px solid ${C.gold}33;color:${C.gold}}
  .alert-info{background:${C.accent}22;border:1px solid ${C.accent}33;color:${C.accent}}
  .mono{font-family:'JetBrains Mono',monospace}
  .sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .score-block{margin-bottom:18px}
  .score-row{display:flex;align-items:center;gap:12px}
  .score-label{display:flex;align-items:center;gap:8px;width:200px;flex-shrink:0}
  .score-emoji{font-size:18px}
  .score-name{font-weight:500;font-size:13px}
  .score-max{font-size:11px;color:${C.muted};font-family:'JetBrains Mono'}
  .slider-wrap{flex:1}
  input[type=range]{width:100%;height:4px;cursor:pointer;background:${C.border};border-radius:2px;appearance:none;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${C.accent};cursor:pointer;border:2px solid ${C.bg};box-shadow:0 0 8px ${C.accentGlow}}
  .score-val{width:48px;text-align:center;font-family:'JetBrains Mono';font-weight:600;font-size:16px;flex-shrink:0}
  .score-desc{margin-top:8px;margin-left:212px;padding:8px 12px;border-radius:7px;border-left:3px solid transparent;font-size:12px;line-height:1.55;color:${C.muted};background:${C.panel};transition:border-color 0.2s,color 0.2s}
  .score-desc-label{font-weight:700;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;margin-bottom:3px}
  .total-row{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:10px;background:linear-gradient(135deg,${C.accent}22,${C.teal}11);border:1px solid ${C.accent}44;margin-top:16px}
  .total-label{font-weight:600;font-size:15px}
  .total-score{font-family:'JetBrains Mono';font-size:24px;font-weight:700;color:${C.accent}}
  .rank-list{display:flex;flex-direction:column;gap:8px}
  .rank-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;background:${C.panel};border:1px solid ${C.border};cursor:grab;user-select:none;transition:all 0.15s}
  .rank-item:active{cursor:grabbing}
  .rank-item.dragging{opacity:0.5;border-color:${C.accent};box-shadow:0 0 0 2px ${C.accentGlow}}
  .rank-item.drag-over{border-color:${C.teal};background:${C.teal}11}
  .rank-pos{width:32px;height:32px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;font-family:'JetBrains Mono'}
  .p1{background:#F59E0B22;color:#F59E0B}.p2{background:#9CA3AF22;color:#9CA3AF}.p3{background:#92400E22;color:#B45309}.pn{background:${C.accent}11;color:${C.muted}}
  .rank-handle{color:${C.muted};font-size:18px}
  .team-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}
  .team-tab{padding:6px 14px;border-radius:20px;font-size:13px;cursor:pointer;border:1px solid ${C.border};background:transparent;color:${C.muted};transition:all 0.15s;font-family:'Space Grotesk',sans-serif}
  .team-tab:hover{border-color:${C.muted};color:${C.text}}
  .team-tab.active{background:${C.accent};border-color:${C.accent};color:#fff}
  .team-tab.scored{border-color:${C.green}44;color:${C.green}}
  .team-tab.active.scored{background:${C.green};border-color:${C.green};color:#fff}
  .progress-bar{height:3px;background:${C.border};border-radius:2px;margin-bottom:28px}
  .progress-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,${C.accent},${C.teal});transition:width 0.4s}
  .submit-btn{width:100%;padding:14px;border-radius:10px;margin-top:20px;background:linear-gradient(135deg,${C.accent},#6D28D9);color:#fff;font-size:15px;font-weight:700;cursor:pointer;border:none;font-family:'Space Grotesk',sans-serif;box-shadow:0 4px 20px ${C.accentGlow};transition:all 0.2s}
  .submit-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px ${C.accentGlow}}
  .submit-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
  .judge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
  .judge-card{padding:20px;border-radius:10px;background:${C.card};border:2px solid ${C.border};cursor:pointer;transition:all 0.15s;text-align:center}
  .judge-card:hover{border-color:${C.accent}55;transform:translateY(-2px)}
  .judge-card-name{font-weight:600;font-size:16px;margin-bottom:4px}
  .judge-card-status{font-size:11px;color:${C.muted};font-family:'JetBrains Mono'}
  .stat-box{padding:16px;border-radius:10px;background:${C.card};border:1px solid ${C.border}}
  .stat-val{font-size:28px;font-weight:700;font-family:'JetBrains Mono';color:${C.accent}}
  .stat-label{font-size:11px;color:${C.muted};margin-top:4px;letter-spacing:0.5px;text-transform:uppercase}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600}
  .badge-ok{background:${C.green}22;color:${C.green}}
  .badge-out{background:${C.red}22;color:${C.red}}
  .combined-rank{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:10px;background:${C.panel};border:1px solid ${C.border};margin-bottom:10px;transition:border-color 0.15s}
  .combined-rank:hover{border-color:${C.accent}44}
  .rank-medal{font-size:24px;width:36px;text-align:center}
  .rank-info{flex:1}
  .rank-team{font-weight:600;font-size:16px}
  .rank-meta{font-size:12px;color:${C.muted};margin-top:2px;font-family:'JetBrains Mono'}
  .rank-score-big{font-family:'JetBrains Mono';font-size:22px;font-weight:700;color:${C.accent}}
  .award-chips{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
  .ac{font-size:10px;padding:2px 8px;border-radius:3px;font-weight:600;letter-spacing:0.3px}
  .ac-i{background:#3B82F622;color:#3B82F6}.ac-c{background:#8B5CF622;color:#8B5CF6}.ac-s{background:#F59E0B22;color:#F59E0B}
  .bw{overflow-x:auto}
  .bt{width:100%;border-collapse:collapse;font-size:12px}
  .bt th{padding:8px 12px;background:${C.panel};color:${C.muted};font-family:'JetBrains Mono';font-size:10px;letter-spacing:0.5px;text-transform:uppercase;border-bottom:1px solid ${C.border};text-align:center;white-space:nowrap}
  .bt th.L{text-align:left}
  .bt td{padding:9px 12px;border-bottom:1px solid ${C.border}11;text-align:center;font-family:'JetBrains Mono'}
  .bt td.L{text-align:left;font-family:'Space Grotesk';font-weight:500}
  .bt tr:hover td{background:${C.panel}55}
  .cs{display:inline-flex;padding:2px 8px;border-radius:4px;background:${C.accent}22;color:${C.accent};font-weight:600}
  .cr{display:inline-flex;padding:2px 8px;border-radius:4px;background:${C.teal}22;color:${C.teal};font-weight:600}
  .modal-backdrop{position:fixed;inset:0;background:#00000088;backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease}
  .modal{background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:28px;width:420px;max-width:90vw;box-shadow:0 24px 64px #00000088;animation:slideUp 0.2s ease}
  .modal-icon{font-size:36px;margin-bottom:14px}
  .modal-title{font-size:18px;font-weight:700;margin-bottom:8px}
  .modal-body{font-size:13px;color:${C.muted};margin-bottom:24px;line-height:1.6}
  .modal-body strong{color:${C.text}}
  .modal-actions{display:flex;gap:10px;justify-content:flex-end}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
  .danger-zone{border:1px solid ${C.red}33;border-radius:12px;padding:20px;background:${C.red}08;margin-top:24px}
  .danger-title{font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:${C.red};margin-bottom:12px}
  .btn-nuke{background:transparent;color:${C.red};border:1px dashed ${C.red}55;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:'Space Grotesk',sans-serif}
  .btn-nuke:hover{background:${C.red}15;border-color:${C.red}}
  .live-dot{width:7px;height:7px;border-radius:50%;background:${C.green};display:inline-block;margin-right:6px;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center}
  .landing-logo{font-size:64px;margin-bottom:24px;filter:drop-shadow(0 0 40px ${C.accent}88)}
  .landing-title{font-size:42px;font-weight:700;letter-spacing:-1px;margin-bottom:8px;background:linear-gradient(135deg,${C.text},${C.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .landing-sub{font-size:16px;color:${C.muted};margin-bottom:48px}
  .landing-btns{display:flex;gap:16px}
  .landing-btn{padding:16px 32px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;border:none;transition:all 0.2s;font-family:'Space Grotesk',sans-serif}
  .lba{background:${C.accent};color:#fff;box-shadow:0 4px 20px ${C.accentGlow}}.lba:hover{transform:translateY(-3px);box-shadow:0 8px 28px ${C.accentGlow}}
  .lbj{background:${C.teal}22;color:${C.teal};border:1px solid ${C.teal}44}.lbj:hover{background:${C.teal}33;transform:translateY(-3px)}
  .empty{text-align:center;padding:60px 20px;color:${C.muted}}
  .empty-icon{font-size:48px;margin-bottom:12px}
  .empty-title{font-size:18px;font-weight:600;color:${C.text};margin-bottom:6px}
  .empty-sub{font-size:13px}
  .err{color:${C.red};font-size:13px;padding:8px 0}
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function ConfirmModal({ icon, title, body, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">{icon}</div>
        <div className="modal-title">{title}</div>
        <div className="modal-body" dangerouslySetInnerHTML={{ __html: body }} />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Nav({ navigate, route, state }) {
  const { teams=[], judges=[], scores={}, rankings={} } = state;
  const completed = judges.filter(j => teams.length > 0 && teams.every(t => RUBRIC.every(r => scores[j]?.[t]?.[r.id] !== undefined))).length;
  return (
    <nav className="nav">
      <div className="nav-brand" onClick={() => navigate("/")}>
        <div className="nav-logo">🌌</div>
        <div><div className="nav-title">Hack the Valley 2026</div><div className="nav-sub">Judging System</div></div>
      </div>
      <div className="nav-right">
        <span style={{fontSize:11,color:C.green,marginRight:8}}><span className="live-dot"/>LIVE</span>
        <button className={`nav-tab${route==="/admin"?" active":""}`} onClick={() => navigate("/admin")}>
          ⚙️ Admin {teams.length > 0 && <span className="nav-badge">{teams.length}T·{judges.length}J</span>}
        </button>
        <button className={`nav-tab${route==="/judge"?" active":""}`} onClick={() => navigate("/judge")}>
          🧑‍⚖️ Judge {completed > 0 && <span className="nav-badge">{completed}/{judges.length}</span>}
        </button>
        <button className={`nav-tab${route==="/results"?" active":""}`} onClick={() => navigate("/results")}>
          📊 Results
        </button>
      </div>
    </nav>
  );
}

// ─── ADMIN PAGE ────────────────────────────────────────────────────────────────
function AdminPage({ state, reload, navigate }) {
  const { teams=[], judges=[], scores={}, rankings={} } = state;
  const [adminTab, setAdminTab] = useState("setup");
  const [newTeam, setNewTeam] = useState(""); const [newJudge, setNewJudge] = useState("");
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState(null);

  async function call(fn) { try { await fn(); await reload(); setErr(null); } catch(e) { setErr(e.message); } }

  async function addTeam() {
    const t = newTeam.trim(); if (!t || teams.includes(t)) return;
    await call(() => apiFetch("/api/teams", { method:"POST", body: JSON.stringify({ teams: [...teams, t] }) }));
    setNewTeam("");
  }
  async function removeTeam(t) { await call(() => apiFetch("/api/teams", { method:"POST", body: JSON.stringify({ teams: teams.filter(x=>x!==t) }) })); }
  async function addJudge() {
    const j = newJudge.trim(); if (!j || judges.includes(j)) return;
    await call(() => apiFetch("/api/judges", { method:"POST", body: JSON.stringify({ judges: [...judges, j] }) }));
    setNewJudge("");
  }
  async function removeJudge(j) { await call(() => apiFetch("/api/judges", { method:"POST", body: JSON.stringify({ judges: judges.filter(x=>x!==j) }) })); }

  async function resetJudge(j) { await call(() => apiFetch(`/api/scores/${encodeURIComponent(j)}`, { method:"DELETE" })); setModal(null); }
  async function resetTeam(t)  { await call(() => apiFetch(`/api/teams/${encodeURIComponent(t)}/scores`, { method:"DELETE" })); setModal(null); }
  async function resetAll()    { await call(() => apiFetch("/api/scores", { method:"DELETE" })); setModal(null); }
  async function nukeAll()     { await call(() => apiFetch("/api/state",  { method:"DELETE" })); setModal(null); }

  function judgeProgress(j) { return teams.filter(t => RUBRIC.every(r => scores[j]?.[t]?.[r.id] !== undefined)).length; }
  function teamProgress(t)  { return judges.filter(j => RUBRIC.every(r => scores[j]?.[t]?.[r.id] !== undefined)).length; }

  return (
    <div className="app">
      <Nav navigate={navigate} route="/admin" state={state} />
      <main className="main">
        {modal?.type==="rj" && <ConfirmModal icon="🗑️" title={`Reset ${modal.p}'s scores?`} body={`Permanently deletes all scores and ranking from <strong>${modal.p}</strong>.`} confirmLabel="Reset Judge" onConfirm={()=>resetJudge(modal.p)} onCancel={()=>setModal(null)}/>}
        {modal?.type==="rt" && <ConfirmModal icon="🗑️" title={`Reset scores for "${modal.p}"?`} body={`Deletes all judges' scores for <strong>${modal.p}</strong>.`} confirmLabel="Reset Team" onConfirm={()=>resetTeam(modal.p)} onCancel={()=>setModal(null)}/>}
        {modal?.type==="ra" && <ConfirmModal icon="⚠️" title="Reset all scores?" body="Wipes <strong>all scores and rankings</strong> but keeps teams and judges." confirmLabel="Reset All" onConfirm={resetAll} onCancel={()=>setModal(null)}/>}
        {modal?.type==="nuke" && <ConfirmModal icon="💥" title="Delete everything?" body="Permanently deletes <strong>all teams, judges, scores, and rankings</strong>. Cannot be undone." confirmLabel="Delete Everything" onConfirm={nukeAll} onCancel={()=>setModal(null)}/>}

        <div style={{display:"flex",gap:2,marginBottom:24}}>
          <button className={`nav-tab${adminTab==="setup"?" active":""}`} onClick={()=>setAdminTab("setup")}>⚙️ Setup</button>
          <button className={`nav-tab${adminTab==="results"?" active":""}`} onClick={()=>setAdminTab("results")}>📊 Results</button>
        </div>

        {err && <div className="err">⚠ {err}</div>}

        {adminTab==="setup" && (
          <>
            <div className="page-title">Setup</div>
            <div className="page-sub">Add teams and judges before scoring begins</div>
            <div className="grid2">
              <div className="card">
                <div className="card-title"><div className="dot"/>Teams <span className="mono" style={{color:C.accent,marginLeft:4}}>{teams.length}</span></div>
                <div className="input-row">
                  <input className="input" placeholder="Team name…" value={newTeam} onChange={e=>setNewTeam(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTeam()} />
                  <button className="btn btn-primary" onClick={addTeam}>Add</button>
                </div>
                {teams.length===0 && <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No teams yet.</div>}
                {teams.map((t,i)=>(
                  <div className="list-item" key={t}>
                    <div className="list-left">
                      <div className="list-num">{i+1}</div>
                      <div><div style={{fontWeight:500}}>{t}</div><div style={{fontSize:11,color:C.muted,fontFamily:"JetBrains Mono"}}>{teamProgress(t)}/{judges.length} judges scored</div></div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {teamProgress(t)>0 && <button className="btn btn-danger btn-sm" onClick={()=>setModal({type:"rt",p:t})}>Reset</button>}
                      <button className="btn btn-ghost btn-sm" onClick={()=>removeTeam(t)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title"><div className="dot" style={{background:C.teal}}/>Judges <span className="mono" style={{color:C.teal,marginLeft:4}}>{judges.length}</span></div>
                <div className="input-row">
                  <input className="input" placeholder="Judge name…" value={newJudge} onChange={e=>setNewJudge(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addJudge()} />
                  <button className="btn btn-primary" onClick={addJudge}>Add</button>
                </div>
                {judges.length===0 && <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No judges yet.</div>}
                {judges.map((j,i)=>{
                  const done=judgeProgress(j); const hasRank=!!rankings[j];
                  return (
                    <div className="list-item" key={j}>
                      <div className="list-left">
                        <div className="list-num" style={{background:C.teal+"22",color:C.teal}}>{i+1}</div>
                        <div><div style={{fontWeight:500}}>{j}</div><div style={{fontSize:11,color:C.muted,fontFamily:"JetBrains Mono"}}>{done}/{teams.length} scored{hasRank?" · ranked":""}</div></div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        {(done>0||hasRank) && <button className="btn btn-danger btn-sm" onClick={()=>setModal({type:"rj",p:j})}>Reset</button>}
                        <button className="btn btn-ghost btn-sm" onClick={()=>removeJudge(j)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {teams.length>0&&judges.length>0 && <div className="alert alert-ok" style={{marginTop:20}}>✅ Ready! Share judge URL: <strong className="mono">{window.location.origin}/judge</strong></div>}
            {(teams.length===0||judges.length===0) && <div className="alert alert-warn" style={{marginTop:20}}>⚠️ Add at least one team and one judge to begin.</div>}
            <div className="danger-zone">
              <div className="danger-title">⚠ Danger Zone</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Use to reset during testing.</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="btn btn-danger" disabled={Object.keys(scores).length===0} onClick={()=>setModal({type:"ra"})}>🔄 Reset All Scores</button>
                <button className="btn-nuke" onClick={()=>setModal({type:"nuke"})}>💥 Delete Everything</button>
              </div>
            </div>
          </>
        )}
        {adminTab==="results" && <ResultsView state={state} />}
      </main>
    </div>
  );
}

// ─── JUDGE PAGE ────────────────────────────────────────────────────────────────
function JudgePage({ state, navigate }) {
  const { teams=[], judges=[], scores={}, rankings={} } = state;
  const [activeJudge, setActiveJudge] = useState(null);
  const [teamIdx, setTeamIdx] = useState(0);
  const [local, setLocal] = useState({});        // local scores being built
  const [localRank, setLocalRank] = useState([]); // local ranking
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!activeJudge) return;
    setLocal(scores[activeJudge] || {});
    const er = rankings[activeJudge] || [...teams];
    setLocalRank(er.filter(t=>teams.includes(t)).concat(teams.filter(t=>!er.includes(t))));
    setSaved(false);
  }, [activeJudge, teams.join(",")]);

  function setScore(team, catId, val) {
    setLocal(p => ({...p, [team]: {...(p[team]||{}), [catId]: val}}));
    setSaved(false);
  }

  async function saveAll() {
    setSaving(true); setErr(null);
    try {
      await apiFetch("/api/scores", {
        method: "POST",
        body: JSON.stringify({ judge: activeJudge, scores: local, ranking: localRank }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch(e) { setErr(e.message); }
    setSaving(false);
  }

  const scoredTeams = teams.filter(t => RUBRIC.every(r => local?.[t]?.[r.id] !== undefined));
  const allScored = teams.length > 0 && scoredTeams.length === teams.length;
  const pct = teams.length === 0 ? 0 : (scoredTeams.length / teams.length) * 100;

  function onDragStart(i) { setDragIdx(i); }
  function onDragOver(e,i) { e.preventDefault(); setDragOverIdx(i); }
  function onDrop(e,i) {
    e.preventDefault();
    if (dragIdx===null||dragIdx===i) { setDragIdx(null);setDragOverIdx(null);return; }
    const nl=[...localRank]; const[m]=nl.splice(dragIdx,1); nl.splice(i,0,m);
    setLocalRank(nl); setDragIdx(null); setDragOverIdx(null); setSaved(false);
  }
  function onDragEnd() { setDragIdx(null); setDragOverIdx(null); }

  if (!activeJudge) {
    return (
      <div className="app">
        <Nav navigate={navigate} route="/judge" state={state} />
        <main className="main">
          <div className="page-title">Judge Scoring</div>
          <div className="page-sub">Select your name to begin</div>
          {judges.length===0
            ? <div className="empty"><div className="empty-icon">👤</div><div className="empty-title">No judges configured yet</div><div className="empty-sub">Ask the admin to add judges in the Admin tab first.</div></div>
            : <div className="judge-grid">
                {judges.map(j => {
                  const done = teams.filter(t=>RUBRIC.every(r=>scores[j]?.[t]?.[r.id]!==undefined)).length;
                  const hasRank = !!rankings[j];
                  const complete = done===teams.length && teams.length>0 && hasRank;
                  return (
                    <div key={j} className="judge-card" onClick={()=>{setActiveJudge(j);setTeamIdx(0);}}>
                      <div style={{fontSize:32,marginBottom:8}}>🧑‍⚖️</div>
                      <div className="judge-card-name">{j}</div>
                      <div className="judge-card-status">{done}/{teams.length} scored{hasRank?" · ranked":""}</div>
                      {complete && <div style={{marginTop:8}}><span className="badge badge-ok">✓ Complete</span></div>}
                    </div>
                  );
                })}
              </div>
          }
        </main>
      </div>
    );
  }

  const activeTeam = teams[teamIdx];

  return (
    <div className="app">
      <Nav navigate={navigate} route="/judge" state={state} />
      <main className="main">
        <div className="sh">
          <div>
            <div className="page-title">Scoring as: <span style={{color:C.accent}}>{activeJudge}</span></div>
            <div className="page-sub">{scoredTeams.length}/{teams.length} teams scored</div>
          </div>
          <button className="btn btn-ghost" onClick={()=>setActiveJudge(null)}>← Switch Judge</button>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
        <div className="team-tabs">
          {teams.map((t,i) => {
            const isScored = RUBRIC.every(r => local?.[t]?.[r.id] !== undefined);
            return (
              <button key={t} className={`team-tab${i===teamIdx?" active":""}${isScored?" scored":""}`} onClick={()=>setTeamIdx(i)}>
                {isScored?"✓ ":""}{t}
              </button>
            );
          })}
        </div>
        <div className="grid2">
          <div className="card">
            <div className="card-title"><div className="dot"/>Scores — {activeTeam}</div>
            {RUBRIC.map(r => {
              const val = local?.[activeTeam]?.[r.id] ?? 0;
              const level = getLevel(r, val);
              const pct2 = val / r.max;
              return (
                <div className="score-block" key={r.id}>
                  <div className="score-row">
                    <div className="score-label">
                      <span className="score-emoji">{r.emoji}</span>
                      <div><div className="score-name">{r.label}</div><div className="score-max">max {r.max}</div></div>
                    </div>
                    <div className="slider-wrap">
                      <input type="range" min={0} max={r.max} step={1} value={val}
                        onChange={e=>setScore(activeTeam,r.id,Number(e.target.value))}
                        style={{accentColor:r.color}}/>
                    </div>
                    <div className="score-val" style={{color:r.color}}>{val}</div>
                  </div>
                  <div className="score-desc" style={{borderLeftColor:pct2===0?C.border:r.color,color:pct2===0?C.muted:C.text}}>
                    <div className="score-desc-label" style={{color:pct2===0?C.muted:r.color}}>{level.label}</div>
                    {level.desc}
                  </div>
                </div>
              );
            })}
            <div className="total-row">
              <div className="total-label">Total Score</div>
              <div className="total-score">{calcTotal(local?.[activeTeam])} / {MAX_TOTAL}</div>
            </div>
            {teamIdx < teams.length-1 && (
              <button className="btn btn-teal btn-sm" style={{marginTop:12}} onClick={()=>setTeamIdx(i=>i+1)}>Next Team →</button>
            )}
          </div>
          <div className="card">
            <div className="card-title"><div className="dot" style={{background:C.gold}}/>Force Rank All Teams</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Drag teams to set your ranking (#1 = best)</div>
            <div className="rank-list">
              {localRank.map((team,i) => {
                const pc = i===0?"p1":i===1?"p2":i===2?"p3":"pn";
                return (
                  <div key={team}
                    className={`rank-item${dragIdx===i?" dragging":""}${dragOverIdx===i&&dragIdx!==i?" drag-over":""}`}
                    draggable onDragStart={()=>onDragStart(i)} onDragOver={e=>onDragOver(e,i)}
                    onDrop={e=>onDrop(e,i)} onDragEnd={onDragEnd}>
                    <div className={`rank-pos ${pc}`}>{medal(i)}</div>
                    <span className="rank-handle">⠿</span>
                    <span style={{fontWeight:500,fontSize:15}}>{team}</span>
                    {local?.[team] && <span style={{marginLeft:"auto",fontSize:12,color:C.muted,fontFamily:"JetBrains Mono"}}>{calcTotal(local[team])}pts</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {err && <div className="err">⚠ {err}</div>}
        {saved && <div className="alert alert-ok" style={{marginTop:12}}>✅ Saved!</div>}
        <button className="submit-btn" onClick={saveAll} disabled={!allScored||saving}>
          {saving ? "Saving…" : allScored ? "💾 Save All Scores & Ranking" : `Score all ${teams.length} teams to save (${scoredTeams.length}/${teams.length} done)`}
        </button>
      </main>
    </div>
  );
}

// ─── RESULTS VIEW ─────────────────────────────────────────────────────────────
function ResultsView({ state }) {
  const { teams=[], judges=[], scores={}, rankings={} } = state;
  const [tab, setTab] = useState("combined");

  const teamStats = teams.map(team => {
    const jScores = judges.map(j=>scores[j]?.[team]).filter(Boolean);
    const totals = jScores.map(s=>calcTotal(s));
    const avg = totals.length ? totals.reduce((a,b)=>a+b,0)/totals.length : 0;
    const isOutlier = calcOutlier(totals);
    const catAvgs = RUBRIC.map(r => {
      const vals = jScores.map(s=>s?.[r.id]??0);
      return {...r, avg:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0, vals};
    });
    const rankPos = judges.map(j=>{const r=rankings[j];if(!r)return null;const p=r.indexOf(team);return p===-1?null:p+1;}).filter(x=>x!==null);
    const avgRank = rankPos.length ? rankPos.reduce((a,b)=>a+b,0)/rankPos.length : null;
    return {team,avg,totals,jScores,catAvgs,isOutlier,avgRank,ranked:totals.length};
  });

  const combined = [...teamStats].sort((a,b) => {
    if (a.avg!==b.avg) return b.avg-a.avg;
    if (a.avgRank!==null&&b.avgRank!==null) return a.avgRank-b.avgRank;
    return 0;
  });

  const submitted = judges.filter(j=>teams.length>0&&teams.every(t=>RUBRIC.every(r=>scores[j]?.[t]?.[r.id]!==undefined))).length;
  const outlierCount = teamStats.filter(t=>t.isOutlier).length;
  const best = catId => [...teamStats].sort((a,b)=>(b.catAvgs.find(c=>c.id===catId)?.avg??0)-(a.catAvgs.find(c=>c.id===catId)?.avg??0))[0]?.team;
  const innovWinner=best("technical"), creativeWinner=best("creativity");
  const inspWinner=combined.find((_,i)=>i>=2)?.team||combined[combined.length-1]?.team;

  if (teams.length===0) return <div className="empty"><div className="empty-icon">📊</div><div className="empty-title">No teams yet</div><div className="empty-sub">Add teams in Setup first.</div></div>;

  return (
    <div>
      <div className="grid3" style={{marginBottom:24}}>
        <div className="stat-box"><div className="stat-val">{submitted}<span style={{fontSize:16,color:C.muted}}>/{judges.length}</span></div><div className="stat-label">Judges Submitted</div></div>
        <div className="stat-box"><div className="stat-val" style={{color:outlierCount>0?C.red:C.green}}>{outlierCount}</div><div className="stat-label">Disagreements</div></div>
        <div className="stat-box"><div className="stat-val" style={{color:C.gold,fontSize:20}}>{combined[0]?.team||"—"}</div><div className="stat-label">Current Leader</div></div>
      </div>
      {submitted===0 && <div className="alert alert-warn" style={{marginBottom:20}}>⚠️ No judges have submitted yet.</div>}
      <div style={{display:"flex",gap:2,marginBottom:20}}>
        {["combined","breakdown","rankings","awards"].map(t=>(
          <button key={t} className={`nav-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {{combined:"🏆 Final Rankings",breakdown:"📋 Breakdown",rankings:"📊 Judge Rankings",awards:"🏅 Awards"}[t]}
          </button>
        ))}
      </div>

      {tab==="combined" && (
        <div className="card">
          <div className="card-title"><div className="dot" style={{background:C.gold}}/>Combined Final Rankings</div>
          {combined.map((ts,i)=>(
            <div className="combined-rank" key={ts.team}>
              <div className="rank-medal">{medal(i)}</div>
              <div className="rank-info">
                <div className="rank-team">{ts.team}</div>
                <div className="rank-meta">Avg: {ts.avg.toFixed(1)}pts · {ts.ranked}/{judges.length} judges{ts.avgRank?` · Avg rank: #${ts.avgRank.toFixed(1)}`:""}</div>
                <div className="award-chips">
                  {ts.team===innovWinner&&<span className="ac ac-i">💻 Most Innovative</span>}
                  {ts.team===creativeWinner&&<span className="ac ac-c">🎨 Most Creative</span>}
                  {ts.team===inspWinner&&<span className="ac ac-s">💫 Most Inspirational</span>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                {ts.isOutlier&&<span className="badge badge-out" style={{display:"block",marginBottom:4}}>⚠ Split</span>}
                <div className="rank-score-big">{ts.avg.toFixed(1)}</div>
                <div style={{fontSize:11,color:C.muted,fontFamily:"JetBrains Mono"}}>/ {MAX_TOTAL}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="breakdown" && (
        <div className="card"><div className="card-title"><div className="dot"/>Score Breakdown</div>
          <div className="bw"><table className="bt">
            <thead><tr><th className="L">Team / Category</th>{judges.map(j=><th key={j}>{j}</th>)}<th>Avg</th><th>Status</th></tr></thead>
            <tbody>{combined.map(ts=>(
              <>
                <tr key={ts.team+"h"}><td className="L" colSpan={judges.length+3} style={{fontWeight:700,color:C.accent,fontSize:12,padding:"8px 12px",background:C.panel+"AA"}}>{ts.team}</td></tr>
                {ts.catAvgs.map(cat=>(
                  <tr key={ts.team+cat.id}>
                    <td className="L" style={{paddingLeft:24,color:C.muted,fontSize:11}}>{cat.emoji} {cat.label} <span style={{fontSize:10}}>/{cat.max}</span></td>
                    {judges.map(j=>{const v=scores[j]?.[ts.team]?.[cat.id];return <td key={j}>{v!==undefined?<span className="cs">{v}</span>:<span style={{color:C.muted}}>—</span>}</td>;})}
                    <td><span style={{fontWeight:600,color:cat.color}}>{cat.avg.toFixed(1)}</span></td>
                    <td>{calcOutlier(cat.vals)?<span className="badge badge-out">⚠</span>:<span className="badge badge-ok">✓</span>}</td>
                  </tr>
                ))}
                <tr key={ts.team+"t"} style={{borderTop:`1px solid ${C.border}`}}>
                  <td className="L" style={{paddingLeft:24,fontWeight:700}}>TOTAL</td>
                  {judges.map(j=>{const v=calcTotal(scores[j]?.[ts.team]);return <td key={j}>{scores[j]?.[ts.team]?<span style={{fontWeight:700}}>{v}</span>:<span style={{color:C.muted}}>—</span>}</td>;})}
                  <td><span style={{fontWeight:700,color:C.accent}}>{ts.avg.toFixed(1)}</span></td>
                  <td>{ts.isOutlier?<span className="badge badge-out">⚠</span>:<span className="badge badge-ok">✓</span>}</td>
                </tr>
                <tr><td colSpan={judges.length+3} style={{height:8}}/></tr>
              </>
            ))}</tbody>
          </table></div>
        </div>
      )}

      {tab==="rankings" && (
        <div className="card"><div className="card-title"><div className="dot" style={{background:C.teal}}/>Rankings by Judge</div>
          <div className="bw"><table className="bt">
            <thead><tr><th className="L">Team</th>{judges.map(j=><th key={j}>{j}</th>)}<th>Avg Position</th></tr></thead>
            <tbody>{combined.map(ts=>(
              <tr key={ts.team}>
                <td className="L">{ts.team}</td>
                {judges.map(j=>{const r=rankings[j];const p=r?r.indexOf(ts.team)+1:null;return <td key={j}>{p?<span className="cr">{medal(p-1)}</span>:<span style={{color:C.muted}}>—</span>}</td>;})}
                <td><span style={{fontFamily:"JetBrains Mono",fontWeight:600,color:C.teal}}>{ts.avgRank?`#${ts.avgRank.toFixed(1)}`:"—"}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )}

      {tab==="awards" && (
        <div>
          <div className="grid3">
            {[
              {title:"💻 Most Innovative",hint:"Highest avg Technical Execution",winner:innovWinner,catId:"technical"},
              {title:"🎨 Most Creative",hint:"Highest avg Creativity & Originality",winner:creativeWinner,catId:"creativity"},
              {title:"💫 Most Inspirational",hint:"Best overall spirit & story",winner:inspWinner,catId:null},
            ].map(aw=>{
              const ts=teamStats.find(t=>t.team===aw.winner);
              const sc=aw.catId?ts?.catAvgs.find(c=>c.id===aw.catId)?.avg:ts?.avg;
              return (
                <div className="card" key={aw.title}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>{aw.title}</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:16}}>{aw.hint}</div>
                  {aw.winner?(<>
                    <div style={{fontSize:32,marginBottom:8}}>🏆</div>
                    <div style={{fontSize:20,fontWeight:700}}>{aw.winner}</div>
                    <div style={{fontSize:13,color:C.muted,marginTop:4,fontFamily:"JetBrains Mono"}}>{sc?.toFixed(1)} avg pts</div>
                    {aw.catId&&<div style={{marginTop:12}}>{judges.map(j=>{const v=scores[j]?.[aw.winner]?.[aw.catId];return v!==undefined?<div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:4}}><span>{j}</span><span className="mono" style={{color:C.text}}>{v}</span></div>:null;})}</div>}
                  </>):(<div style={{color:C.muted,fontSize:13}}>Awaiting scores…</div>)}
                </div>
              );
            })}
          </div>
          {outlierCount>0&&<div className="card" style={{marginTop:20}}>
            <div className="card-title"><div className="dot" style={{background:C.red}}/>Score Disagreements</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Teams where total scores differ by 4+ points</div>
            {teamStats.filter(t=>t.isOutlier).map(ts=>(
              <div key={ts.team} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:C.red+"11",borderRadius:8,border:`1px solid ${C.red}22`,marginBottom:8}}>
                <div><div style={{fontWeight:600}}>{ts.team}</div><div style={{fontSize:12,color:C.muted,fontFamily:"JetBrains Mono"}}>Scores: {ts.totals.join(", ")} — range: {Math.max(...ts.totals)-Math.min(...ts.totals)} pts</div></div>
                <span className="badge badge-out">⚠ Review</span>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { route, navigate } = useRoute();
  const [appState, setAppState] = useState({ teams:[], judges:[], scores:{}, rankings:{} });
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const reload = useCallback(async () => {
    try {
      const data = await apiFetch("/api/state");
      setAppState(data);
      setLoading(false);
    } catch { /* silently retry */ }
  }, []);

  useEffect(() => {
    reload();
    pollRef.current = setInterval(reload, 5000); // poll every 5s
    return () => clearInterval(pollRef.current);
  }, [reload]);

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:C.muted,fontFamily:"JetBrains Mono",fontSize:14}}>
        Connecting…
      </div>
    </>
  );

  const sharedProps = { state: appState, reload, navigate };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      {route==="/"&&(
        <div className="landing">
          <div className="landing-logo">🌌</div>
          <div className="landing-title">Hack the Valley 2026</div>
          <div className="landing-sub">RPG Game Judging System · Multiverse of Decisions</div>
          <div className="landing-btns">
            <button className="landing-btn lba" onClick={()=>navigate("/admin")}>⚙️ Admin Dashboard</button>
            <button className="landing-btn lbj" onClick={()=>navigate("/judge")}>🧑‍⚖️ Judge Scoring</button>
          </div>
        </div>
      )}
      {route==="/admin"&&<AdminPage {...sharedProps}/>}
      {route==="/judge"&&<JudgePage state={appState} navigate={navigate}/>}
      {route==="/results"&&(
        <div className="app">
          <Nav navigate={navigate} route="/results" state={appState}/>
          <main className="main">
            <div className="page-title">Results Dashboard</div>
            <div className="page-sub">Live aggregation across all judges</div>
            <ResultsView state={appState}/>
          </main>
        </div>
      )}
      {!["/","/admin","/judge","/results"].includes(route)&&navigate("/")}
    </>
  );
}
