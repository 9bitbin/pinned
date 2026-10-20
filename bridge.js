// Pinned game bridge: lets a game running inside the app talk to the board.
// The app opens a game as  games/<name>.html?embed=1&mode=solo|race&seed=123&name=Himal&color=%23ff8fb1
// Game -> app:  ready, state {d, y, alive, score} (a few times a second), over {score}
// App  -> game: go (race countdown finished), ghost {s: {id, name, color, d, y, alive, score}}, end
(function () {
  const P = new URLSearchParams(location.search);
  const mode = P.get("mode") || "solo";
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const handlers = {};
  const PB = {
    embed: P.has("embed"),
    mode,
    race: mode === "race",
    seed: (Number(P.get("seed")) >>> 0) || ((Math.random() * 4294967296) >>> 0),
    name: (P.get("name") || "You").slice(0, 24),
    color: P.get("color") || "#ff8fb1",
    char: P.get("char") || "",
    rng,
    ghosts: new Map(), // id -> {name, color, d, y, alive, score, at, v, ry}
    on(t, fn) { (handlers[t] = handlers[t] || []).push(fn); },
    send(t, data = {}) { if (window.parent !== window) window.parent.postMessage({ pinned: 1, t, ...data }, location.origin); },
    _last: 0,
    // throttled position report (about 8 a second); force=true sends right away
    state(s, force = false) {
      const now = performance.now();
      if (!force && now - this._last < 120) return;
      this._last = now;
      this.send("state", s);
    },
    // where a ghost probably is right now, smoothing over the gaps between updates
    ghostD(g, now = performance.now()) {
      if (!g.alive) return g.d;
      return g.d + g.v * Math.min(0.4, (now - g.at) / 1000);
    },
    ghostY(g) { g.ry = g.ry == null ? g.y : g.ry + (g.y - g.ry) * 0.2; return g.ry; },
  };
  function upd(s) {
    if (!s || !s.id) return;
    const now = performance.now();
    const g = PB.ghosts.get(s.id);
    if (!g) { PB.ghosts.set(s.id, { ...s, at: now, v: 0, ry: s.y }); return; }
    const dt = (now - g.at) / 1000;
    if (dt > 0.03 && typeof s.d === "number" && typeof g.d === "number") g.v = Math.max(0, (s.d - g.d) / dt) * 0.6 + g.v * 0.4;
    Object.assign(g, s);
    g.at = now;
  }
  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.pinned) return;
    const m = e.data;
    if (m.t === "ghost") upd(m.s);
    if (m.t === "ghostgone") PB.ghosts.delete(m.id);
    (handlers[m.t] || []).forEach((f) => { try { f(m); } catch (err) { console.error(err); } });
  });
  if (PB.embed) document.documentElement.classList.add("pb-embed");
  if (PB.race) document.documentElement.classList.add("pb-race");
  window.PB = PB;
  window.addEventListener("load", () => PB.send("ready"));
})();
