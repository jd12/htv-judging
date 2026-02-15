const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── IN-MEMORY STORE ──────────────────────────────────────────────────────────
// Data persists as long as the server is running (plenty for a single-day event).
// If Render restarts the server, data resets — admin just re-enters teams/judges.
let state = {
  teams: [],
  judges: [],
  scores: {},    // { judgeName: { teamName: { technical, creativity, theme, presentation } } }
  rankings: {},  // { judgeName: [teamName, teamName, ...] }
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health / keep-alive ping (called by the server itself every 10 min)
app.get("/ping", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Get full state (polled by frontend every 5s)
app.get("/api/state", (req, res) => res.json(state));

// Admin: set teams
app.post("/api/teams", (req, res) => {
  const { teams } = req.body;
  if (!Array.isArray(teams)) return res.status(400).json({ error: "teams must be an array" });
  state.teams = teams;
  res.json({ ok: true, teams: state.teams });
});

// Admin: set judges
app.post("/api/judges", (req, res) => {
  const { judges } = req.body;
  if (!Array.isArray(judges)) return res.status(400).json({ error: "judges must be an array" });
  state.judges = judges;
  res.json({ ok: true, judges: state.judges });
});

// Judge: submit scores for all teams + ranking
app.post("/api/scores", (req, res) => {
  const { judge, scores, ranking } = req.body;
  if (!judge || !scores || !ranking) return res.status(400).json({ error: "judge, scores and ranking required" });
  if (!state.judges.includes(judge)) return res.status(400).json({ error: "Unknown judge" });
  state.scores[judge] = scores;
  state.rankings[judge] = ranking;
  res.json({ ok: true });
});

// Admin: reset one judge's scores + ranking
app.delete("/api/scores/:judge", (req, res) => {
  const { judge } = req.params;
  delete state.scores[judge];
  delete state.rankings[judge];
  res.json({ ok: true });
});

// Admin: reset one team's scores across all judges
app.delete("/api/teams/:team/scores", (req, res) => {
  const { team } = req.params;
  for (const j of Object.keys(state.scores)) {
    if (state.scores[j]) delete state.scores[j][team];
  }
  res.json({ ok: true });
});

// Admin: reset all scores + rankings
app.delete("/api/scores", (req, res) => {
  state.scores = {};
  state.rankings = {};
  res.json({ ok: true });
});

// Admin: full reset (wipe everything)
app.delete("/api/state", (req, res) => {
  state = { teams: [], judges: [], scores: {}, rankings: {} };
  res.json({ ok: true });
});

// ─── SELF-PING (keeps free tier alive during the event) ───────────────────────
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3001}`;
setInterval(() => {
  const http = require("http");
  const https = require("https");
  const lib = SELF_URL.startsWith("https") ? https : http;
  lib.get(`${SELF_URL}/ping`, (res) => {
    // silent — just keeping the instance warm
  }).on("error", () => {});
}, 10 * 60 * 1000); // every 10 minutes

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`HTV Judging API running on port ${PORT}`));
