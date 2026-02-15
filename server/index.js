const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let state = { teams: [], judges: [], scores: {}, rankings: {} };

app.get("/ping",       (req, res) => res.json({ ok: true }));
app.get("/api/state",  (req, res) => res.json(state));

app.post("/api/teams",  (req, res) => { state.teams   = req.body.teams   || state.teams;   res.json({ ok: true }); });
app.post("/api/judges", (req, res) => { state.judges  = req.body.judges  || state.judges;  res.json({ ok: true }); });

app.post("/api/scores", (req, res) => {
  const { judge, scores, ranking } = req.body;
  if (!judge) return res.status(400).json({ error: "judge required" });
  state.scores[judge]   = scores;
  state.rankings[judge] = ranking;
  res.json({ ok: true });
});

app.delete("/api/scores/:judge", (req, res) => {
  delete state.scores[req.params.judge];
  delete state.rankings[req.params.judge];
  res.json({ ok: true });
});

app.delete("/api/teams/:team/scores", (req, res) => {
  for (const j of Object.keys(state.scores)) delete state.scores[j]?.[req.params.team];
  res.json({ ok: true });
});

app.delete("/api/scores",  (req, res) => { state.scores = {}; state.rankings = {}; res.json({ ok: true }); });
app.delete("/api/state",   (req, res) => { state = { teams: [], judges: [], scores: {}, rankings: {} }; res.json({ ok: true }); });

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log("Server listening on 0.0.0.0:" + PORT));
