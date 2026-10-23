// Church: one shared Orthodox church, opened from the board sidebar.
// Everyone in the church sees each other (presence only: no chat, no typing).
// The lectern opens a Bible reader with search, a book browser and text size.
// Loaded by app.js, which passes in the signed-in person, the live API and a way back.

const CH_KEY = { mute: "pinned.fxMuted", ambient: "pinned.churchAmbient", bible: "pinned.churchBible", size: "pinned.churchTextSize" };
const chGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
const chSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
const chEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

// ---------------------------------------------------------------- sound
// All sound is made with the Web Audio API. Nothing loads from files.
let chAudio = null;
function chCtx() {
  if (chGet(CH_KEY.mute, false) === true) return null;
  try {
    if (!chAudio) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; chAudio = new C(); }
    if (chAudio.state === "suspended") chAudio.resume().catch(() => {});
    return chAudio;
  } catch { return null; }
}
// A door: a filtered wood creak that sweeps up (opening) or down (closing), then a soft thud.
function chDoor(opening, volume = 1) {
  const a = chCtx(); if (!a) return;
  try {
    const t = a.currentTime, len = Math.floor(a.sampleRate * 0.9);
    const buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * 0.6;
    const src = a.createBufferSource(); src.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 7;
    bp.frequency.setValueAtTime(opening ? 320 : 820, t);
    bp.frequency.linearRampToValueAtTime(opening ? 900 : 260, t + 0.8);
    const g = a.createGain(); g.gain.value = 0.3 * volume;
    src.connect(bp).connect(g).connect(a.destination); src.start(t);
    const o = a.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(120, t + 0.8); o.frequency.exponentialRampToValueAtTime(42, t + 1.12);
    const og = a.createGain();
    og.gain.setValueAtTime(0.0001, t + 0.8);
    og.gain.exponentialRampToValueAtTime(0.38 * volume, t + 0.84);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(og).connect(a.destination); o.start(t + 0.8); o.stop(t + 1.25);
  } catch { /* audio blocked: visuals still work */ }
}
// Ambient church tone: a quiet hum with a soft bell now and then. Off by default.
let chAmbientTimer = 0, chHum = null;
function chAmbientOn() {
  const a = chCtx(); if (!a || chHum) return;
  try {
    const g = a.createGain(); g.gain.value = 0.012;
    const o = a.createOscillator(); o.type = "sine"; o.frequency.value = 110;
    o.connect(g).connect(a.destination); o.start();
    chHum = { o, g };
    const bell = () => {
      const c = chCtx(); if (!c || !chHum) return;
      const t = c.currentTime, b = c.createOscillator(), bg = c.createGain();
      b.type = "sine"; b.frequency.value = 660;
      bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.06, t + 0.02); bg.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
      b.connect(bg).connect(c.destination); b.start(t); b.stop(t + 3.6);
    };
    chAmbientTimer = setInterval(() => { if (Math.random() < 0.5) bell(); }, 9000);
  } catch { /* ignore */ }
}
function chAmbientOff() {
  clearInterval(chAmbientTimer); chAmbientTimer = 0;
  if (chHum) { try { chHum.o.stop(); } catch { /* already stopped */ } chHum = null; }
}

// ---------------------------------------------------------------- scene
// Viewbox 400 x 700. Every position below is in these units; HTML pews are placed in percentages.
const VB_W = 400, VB_H = 700;
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;
const PEWS = [
  { id: "L0", x: 26, y: 382 }, { id: "L1", x: 26, y: 438 }, { id: "L2", x: 26, y: 494 }, { id: "L3", x: 26, y: 550 },
  { id: "R0", x: 244, y: 382 }, { id: "R1", x: 244, y: 438 }, { id: "R2", x: 244, y: 494 }, { id: "R3", x: 244, y: 550 },
];
const PEW_W = 130, PEW_H = 34;
const BACK_ROW = { y: 636 }; // standing place at the back, near the door
const ICON_KINDS = [
  { label: "Christ", robe: "#7a1f2b", halo: true, book: true },
  { label: "Theotokos", robe: "#2a3d8f", halo: true, child: true },
  { label: "John the Baptist", robe: "#6b4a1e", halo: true },
  { label: "Saint Nicholas", robe: "#2f6b4e", halo: true, staff: true },
  { label: "Saint Sergius", robe: "#7a1f2b", halo: true },
];
// Original icon art: flat gold-backed figures. Nothing copied from a real icon.
function chIcon(x, y, w, h, kind) {
  const cx = x + w / 2;
  const face = `<ellipse cx="${cx}" cy="${y + h * 0.36}" rx="${w * 0.14}" ry="${h * 0.12}" fill="#e9c9a0"/>`;
  const halo = kind.halo ? `<circle cx="${cx}" cy="${y + h * 0.34}" r="${w * 0.24}" fill="none" stroke="#f6d77a" stroke-width="2.4"/>` : "";
  const robe = `<path d="M${cx - w * 0.32} ${y + h * 0.95} L${cx - w * 0.2} ${y + h * 0.5} Q${cx} ${y + h * 0.44} ${cx + w * 0.2} ${y + h * 0.5} L${cx + w * 0.32} ${y + h * 0.95} Z" fill="${kind.robe}"/>`;
  const extra = [
    kind.book ? `<rect x="${cx - w * 0.2}" y="${y + h * 0.6}" width="${w * 0.4}" height="${h * 0.14}" fill="#f2e6c2" stroke="#b8862b" stroke-width="1"/>` : "",
    kind.child ? `<circle cx="${cx}" cy="${y + h * 0.7}" r="${w * 0.08}" fill="#e9c9a0"/>` : "",
    kind.staff ? `<line x1="${cx + w * 0.3}" y1="${y + h * 0.4}" x2="${cx + w * 0.3}" y2="${y + h * 0.95}" stroke="#d9b45b" stroke-width="2"/>` : "",
  ].join("");
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#d9a63a" stroke="#8a5a14" stroke-width="2"/>
    <rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="2" fill="#1d3d7a"/>
    ${halo}${robe}${face}${extra}
  </g>`;
}
function chIconostasis() {
  const frame = `<rect x="58" y="150" width="284" height="172" fill="#c99a3c" stroke="#7a4f12" stroke-width="2"/>`;
  const doors = `<rect x="170" y="176" width="60" height="146" fill="#9c2a2a" stroke="#f1d27a" stroke-width="2"/>
    <line x1="200" y1="176" x2="200" y2="322" stroke="#f1d27a" stroke-width="1.5"/>
    <circle cx="200" cy="248" r="7" fill="#f1d27a"/>`;
  const topRow = [0, 1, 2, 3, 4].map((i) => chIcon(74 + i * 52, 102, 44, 44, ICON_KINDS[i % ICON_KINDS.length])).join("");
  const sideIcons = [chIcon(72, 176, 40, 66, ICON_KINDS[2]), chIcon(288, 176, 40, 66, ICON_KINDS[3]), chIcon(72, 256, 40, 66, ICON_KINDS[4]), chIcon(288, 256, 40, 66, ICON_KINDS[1])].join("");
  const crown = `<rect x="46" y="88" width="308" height="14" rx="3" fill="#d9a63a" stroke="#7a4f12"/>`;
  return frame + doors + topRow + sideIcons + crown;
}
function chCandles() {
  const xs = [14, 386];
  let out = "";
  for (const x of xs) for (const y of [236, 300, 364]) {
    out += `<rect x="${x - 2.5}" y="${y}" width="5" height="22" fill="#f4eee0"/><ellipse class="ch-flame" cx="${x}" cy="${y - 4}" rx="3" ry="6" fill="#ffd27a"/>`;
  }
  for (const x of [176, 200, 224]) out += `<rect x="${x - 3}" y="330" width="6" height="26" fill="#f4eee0"/><ellipse class="ch-flame" cx="${x}" cy="326" rx="3.4" ry="7" fill="#ffd27a"/>`;
  return out;
}
function chLamps() {
  return [110, 290].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="34" stroke="#7a4f12" stroke-width="1.5"/>
    <circle cx="${x}" cy="54" r="58" fill="url(#chGlow)" class="ch-glow"/>
    <path d="M${x - 12} 40 Q${x} 36 ${x + 12} 40 L${x + 9} 58 Q${x} 64 ${x - 9} 58 Z" fill="#c99a3c" stroke="#7a4f12"/>
    <ellipse class="ch-flame" cx="${x}" cy="50" rx="4" ry="6" fill="#ffe2a0"/>`).join("");
}
function chDome() {
  let stars = "";
  const seeds = [[60, 30], [120, 18], [180, 40], [230, 16], [300, 34], [340, 20], [90, 60], [260, 58], [150, 8], [210, 6], [40, 50], [360, 56]];
  for (const [x, y] of seeds) stars += `<circle cx="${x}" cy="${y}" r="1.6" fill="#f6d77a" opacity=".8"/>`;
  return `<path d="M0 0 L400 0 L400 46 Q200 -18 0 46 Z" fill="#1c2c63"/>${stars}`;
}
function chMosaic() {
  return `<pattern id="chTile" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#f2e6c2"/>
      <path d="M14 2 L26 14 L14 26 L2 14 Z" fill="#9c2a2a"/>
      <path d="M14 8 L20 14 L14 20 L8 14 Z" fill="#d9a63a"/>
    </pattern>`;
}
function chLectern() {
  return `<g class="ch-lectern-art">
    <rect x="334" y="300" width="50" height="10" rx="2" fill="#7a4f12"/>
    <rect x="352" y="310" width="14" height="36" fill="#7a4f12"/>
    <path d="M330 292 L368 288 L368 300 L330 304 Z" fill="#f2e6c2" stroke="#b8862b"/>
    <path d="M368 288 L406 292 L406 304 L368 300 Z" fill="#f2e6c2" stroke="#b8862b"/>
    <rect x="364" y="284" width="8" height="20" fill="#d9a63a"/>
  </g>`;
}
function chSvg() {
  return `<svg class="ch-svg" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="chGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <linearGradient id="chWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d3d"/><stop offset=".55" stop-color="#4a2a3a"/><stop offset="1" stop-color="#2a1d1d"/></linearGradient>
      <linearGradient id="chWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b3f1f"/><stop offset=".5" stop-color="#8a5a2e"/><stop offset="1" stop-color="#5a3418"/></linearGradient>
      ${chMosaic()}
    </defs>
    <rect width="${VB_W}" height="${VB_H}" fill="url(#chWall)"/>
    ${chDome()}
    <path d="M30 330 L370 330 L400 700 L0 700 Z" fill="url(#chTile)"/>
    <path d="M30 330 L370 330 L400 700 L0 700 Z" fill="none" stroke="#f1d27a" stroke-width="2" opacity=".5"/>
    ${chIconostasis()}
    ${chCandles()}
    ${chLamps()}
    ${chLectern()}
    ${PEWS.map((p) => `<rect class="ch-pewart" x="${p.x}" y="${p.y}" width="${PEW_W}" height="${PEW_H}" rx="4" fill="url(#chWood)" stroke="#3a2412"/>`).join("")}
    <rect x="164" y="660" width="72" height="40" fill="#3a2412" stroke="#d9a63a" stroke-width="2" class="ch-door-art"/>
  </svg>`;
}

// ---------------------------------------------------------------- the church screen
let chRoot = null, chOpen = false, chLive = null, chMe = null, chApi = null, chPushed = false, chSeat = null;
let chPeople = {}, chSynced = false, chOnLeave = () => {}, chBoardEl = null;
const CH_BIBLE = { manifest: null, data: new Map(), tr: null, book: 0, chap: 1, view: "books", sel: null, token: 0, sheet: null };

function chBuildRoot() {
  const root = document.createElement("section");
  root.id = "churchScreen"; root.className = "screen church"; root.hidden = true;
  root.setAttribute("aria-label", "Church");
  root.innerHTML = `
    <header class="ch-bar">
      <button class="ch-back" id="chBack" type="button">‹ Back to my room</button>
      <span class="ch-count" id="chCount" aria-live="polite"></span>
    </header>
    <div class="ch-stage" id="chStage">
      ${chSvg()}
      <div class="ch-pews" id="chPews">
        ${PEWS.map((p) => `<button class="ch-pew" type="button" data-pew="${p.id}" style="left:${pct(p.x, VB_W)};top:${pct(p.y, VB_H)};width:${pct(PEW_W, VB_W)};height:${pct(PEW_H + 14, VB_H)}" aria-label="Sit in pew ${p.id[0] === "L" ? "left" : "right"} ${Number(p.id[1]) + 1}"></button>`).join("")}
        <button class="ch-pew ch-back-row" type="button" data-pew="back" style="left:${pct(120, VB_W)};top:${pct(BACK_ROW.y, VB_H)};width:${pct(160, VB_W)};height:${pct(40, VB_H)}" aria-label="Stand at the back"></button>
        <button class="ch-lectern" type="button" id="chLectern" style="left:${pct(322, VB_W)};top:${pct(282, VB_H)};width:${pct(88, VB_W)};height:${pct(60, VB_H)}" aria-label="Open the Bible"><span class="ch-lbl">Bible</span></button>
        <button class="ch-door-tap" type="button" id="chDoor" aria-label="Back to my room" style="left:${pct(164, VB_W)};top:${pct(660, VB_H)};width:${pct(72, VB_W)};height:${pct(40, VB_H)}"></button>
      </div>
      <div class="ch-people" id="chPeople" aria-live="polite"></div>
    </div>
    <p class="ch-hint" id="chHint">Tap a pew to sit, tap the lectern to read the Bible. Everyone here can see you.</p>
    <div class="ch-tools">
      <label class="ch-toggle"><input type="checkbox" id="chAmbient"> Church hum and bells</label>
    </div>`;
  document.body.appendChild(root);
  return root;
}

function chPaintPeople() {
  const box = chRoot && chRoot.querySelector("#chPeople"); if (!box) return;
  const entries = Object.entries(chPeople).filter(([, p]) => p);
  const seated = {};
  const html = entries.map(([id, p]) => {
    const key = p.seat && PEWS.some((x) => x.id === p.seat) ? p.seat : "back";
    const n = (seated[key] = (seated[key] || 0) + 1) - 1;
    const pew = PEWS.find((x) => x.id === key);
    const left = pew ? pct(pew.x + 14 + n * 28, VB_W) : pct(120 + (n % 6) * 26 + (Math.floor(n / 6) * 6), VB_W);
    const top = pew ? pct(pew.y - 16, VB_H) : pct(BACK_ROW.y + (Math.floor(n / 6)) * 6, VB_H);
    const me = id === chMe.id;
    const name = me ? "You" : (p.name || "Visitor");
    return `<div class="ch-person${me ? " me" : ""}${p.away ? " away" : ""}" style="left:${left};top:${top};--pc:${chEsc(p.color || "#c2410c")}" data-id="${chEsc(id)}" role="img" aria-label="${chEsc(name)}${pew ? ", sitting" : ", standing"}">
      <span class="ch-fig" aria-hidden="true"></span><span class="ch-name">${chEsc(name)}</span></div>`;
  }).join("");
  box.innerHTML = html;
  const count = entries.length;
  const cEl = chRoot.querySelector("#chCount");
  if (cEl) cEl.textContent = count === 1 ? "Only you are here" : `${count} people here`;
}

function chSetSeatLabels() {
  if (!chRoot) return;
  chRoot.querySelectorAll(".ch-pew[data-pew]").forEach((b) => {
    const id = b.dataset.pew;
    const mine = chSeat === id;
    b.classList.toggle("mine", mine);
    b.setAttribute("aria-pressed", String(mine));
  });
}

function chSit(id) {
  chSeat = chSeat === id ? null : id;
  chSetSeatLabels();
  if (chLive) chLive.track({ seat: chSeat });
}

// Presence: name, colour and seat are the only things shared. Nothing about the room they came from.
function chOnPresence(map) {
  const prev = chPeople;
  chPeople = {};
  for (const [id, p] of Object.entries(map || {})) {
    if (!p) continue;
    chPeople[id] = { name: p.name, color: p.color, seat: p.seat || null, away: false };
  }
  // Door sounds for others coming and going (quiet). Skip the first sync so opening the church is silent.
  if (chSynced) {
    const others = (m) => Object.keys(m).filter((k) => k !== chMe.id);
    const came = others(chPeople).some((k) => !(k in prev));
    const went = others(prev).some((k) => !(k in chPeople));
    if (came) chDoor(true, 0.35);
    else if (went) chDoor(false, 0.35);
  }
  chSynced = true;
  chPaintPeople();
}

function chPresenceSet() { // used when the screen opens
  const ok = !!chApi && typeof chApi.church === "function";
  return ok;
}

// ---------------------------------------------------------------- open and close
function openChurch({ me, api, boardEl, onLeave }) {
  if (chOpen) return;
  chMe = me; chApi = api; chOnLeave = onLeave || (() => {}); chBoardEl = boardEl || null;
  if (!chPresenceSet()) { console.warn("church: live API missing"); return; }
  if (!chRoot) {
    chRoot = chBuildRoot();
    chRoot.querySelector("#chBack").addEventListener("click", () => chLeave(true));
    chRoot.querySelector("#chDoor").addEventListener("click", () => chLeave(true));
    chRoot.querySelector("#chLectern").addEventListener("click", () => openBible());
    chRoot.querySelectorAll(".ch-pew[data-pew]").forEach((b) => b.addEventListener("click", () => chSit(b.dataset.pew)));
    const amb = chRoot.querySelector("#chAmbient");
    amb.checked = chGet(CH_KEY.ambient, false) === true;
    amb.addEventListener("change", () => {
      chSet(CH_KEY.ambient, amb.checked);
      if (amb.checked && chOpen) chAmbientOn(); else chAmbientOff();
    });
  }
  chOpen = true; chSynced = false; chPeople = {}; chSeat = null;
  if (chBoardEl) chBoardEl.hidden = true;
  chRoot.hidden = false;
  chSetSeatLabels();
  chPaintPeople();
  try { history.pushState({ pinnedChurch: 1 }, ""); chPushed = true; } catch { chPushed = false; }
  chDoor(true);
  chRoot.classList.remove("closing"); chRoot.classList.add("opening");
  setTimeout(() => chRoot && chRoot.classList.remove("opening"), 1400);
  chLive = chApi.church(chMe, { onPresence: chOnPresence });
  chLive.track({ name: chMe.name, color: chMe.color, seat: null });
  if (chGet(CH_KEY.ambient, false) === true) chAmbientOn();
  chRoot.querySelector("#chBack").focus({ preventScroll: true });
}

function chLeave(fromUi) {
  if (!chOpen) return;
  if (fromUi && chPushed) { chPushed = false; try { history.back(); } catch { /* ignore */ } }
  else chPushed = false;
  chDoor(false);
  chRoot.classList.remove("opening"); chRoot.classList.add("closing");
  setTimeout(() => chRoot && chRoot.classList.remove("closing"), 1400);
  chOpen = false;
  chAmbientOff();
  chCloseBible();
  try { if (chLive && chLive.close) chLive.close(); } catch { /* channel already closed */ }
  chLive = null; chPeople = {}; chSeat = null;
  chRoot.hidden = true;
  if (chBoardEl) chBoardEl.hidden = false;
  chOnLeave();
}

// Browser back also goes to the board, never out of the app.
addEventListener("popstate", () => { if (chOpen) chLeave(false); });

// ---------------------------------------------------------------- Bible
const CH_ALIAS = { jn: "john", jhn: "john", ps: "psalms", psa: "psalms", rom: "romans", gen: "genesis", mt: "matthew", mk: "mark", lk: "luke", rev: "revelation" };
const CH_SIZES = { s: "Small", m: "Medium", l: "Large" };

async function chManifest() {
  if (CH_BIBLE.manifest) return CH_BIBLE.manifest;
  const res = await fetch("bible/manifest.json");
  if (!res.ok) throw new Error("manifest");
  CH_BIBLE.manifest = await res.json();
  return CH_BIBLE.manifest;
}
function chIncluded(m) { return m.translations.filter((t) => t.status === "included"); }

async function chLoadTr(entry) {
  if (CH_BIBLE.data.has(entry.id)) return CH_BIBLE.data.get(entry.id);
  const res = await fetch(entry.file);
  if (!res.ok) throw new Error("file");
  if (!("DecompressionStream" in window)) throw new Error("This browser can't open the Bible text yet.");
  const text = await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text();
  const doc = JSON.parse(text);
  CH_BIBLE.data.set(entry.id, doc);
  return doc;
}

function chNorm(s) { return String(s).toLowerCase().replace(/[.’']/g, "").replace(/\s+/g, " ").trim(); }
function chFindBook(doc, key) {
  const k = chNorm(key);
  const alias = CH_ALIAS[k] || k;
  let idx = doc.books.findIndex((b) => chNorm(b.name) === alias || chNorm(b.abbr) === alias);
  if (idx < 0 && alias.length >= 2) idx = doc.books.findIndex((b) => chNorm(b.name).startsWith(alias));
  return idx;
}
// "John 3:16", "Jn 3:16", "1 Cor 13", "Ps 23:1-4", "Genesis 1"
function chParseRef(q, doc) {
  const m = q.trim().match(/^(.+?)\s+(\d+)(?:\s*[:.,]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?$/u);
  if (!m) return null;
  const bi = chFindBook(doc, m[1]); if (bi < 0) return null;
  const chap = Number(m[2]);
  if (chap < 1 || chap > doc.books[bi].chapters.length) return null;
  return { bi, chap, from: m[3] ? Number(m[3]) : null, to: m[4] ? Number(m[4]) : (m[3] ? Number(m[3]) : null) };
}

async function openBible() {
  const sheet = chBuildSheet();
  sheet.hidden = false;
  CH_BIBLE.sheet = sheet;
  const back = sheet.querySelector(".ch-sheet-close"); if (back) back.focus();
  try {
    const m = await chManifest();
    const list = chIncluded(m);
    const savedId = chGet(CH_KEY.bible, null);
    const entry = list.find((t) => t.id === savedId) || list[0];
    await chSelectTr(entry.id, true);
  } catch (e) {
    chSheetMsg("The Bible could not load. Check your connection and try again.");
  }
}

function chCloseBible() {
  if (!CH_BIBLE.sheet) return;
  CH_BIBLE.token++;
  CH_BIBLE.sheet.remove(); CH_BIBLE.sheet = null;
  // return focus to the lectern so keyboard users land back in the church
  const l = chRoot && chRoot.querySelector("#chLectern"); if (l && chOpen) l.focus({ preventScroll: true });
}

function chBuildSheet() {
  if (CH_BIBLE.sheet) CH_BIBLE.sheet.remove();
  const size = chGet(CH_KEY.size, "m");
  const el = document.createElement("section");
  el.className = `ch-sheet sz-${size}`; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "chSheetTitle");
  el.innerHTML = `
    <header class="ch-sheet-bar">
      <h2 id="chSheetTitle" class="ch-sheet-title">Bible</h2>
      <button type="button" class="ch-sheet-close" aria-label="Close the Bible">Close</button>
    </header>
    <div class="ch-sheet-controls">
      <label class="ch-field"><span>Language</span><select id="chLang"></select></label>
      <label class="ch-field"><span>Translation</span><select id="chTr"></select></label>
      <div class="ch-size" role="group" aria-label="Text size">
        ${["s", "m", "l"].map((k) => `<button type="button" data-size="${k}" aria-pressed="${k === size}" class="${k === size ? "on" : ""}" aria-label="${CH_SIZES[k]} text">A<small>${k === "s" ? "−" : k === "m" ? "" : "+"}</small></button>`).join("")}
      </div>
    </div>
    <form class="ch-search" id="chSearch" role="search">
      <input id="chQuery" type="search" placeholder="Reference (John 3:16) or a word" aria-label="Search the Bible by reference or word" autocomplete="off" enterkeyhint="search">
      <button type="submit" class="ch-go">Search</button>
    </form>
    <nav class="ch-crumbs" id="chCrumbs" aria-label="Where you are"></nav>
    <div class="ch-body" id="chBody" tabindex="-1"></div>
    <p class="ch-foot" id="chFoot"></p>`;
  document.body.appendChild(el);

  el.querySelector(".ch-sheet-close").addEventListener("click", () => chCloseBible());
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); chCloseBible(); return; }
    if (e.key === "Tab") { // keep focus inside the sheet
      const f = [...el.querySelectorAll("button, input, select, [tabindex]")].filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  el.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.size; chSet(CH_KEY.size, k);
    el.className = `ch-sheet sz-${k}`;
    el.querySelectorAll("[data-size]").forEach((x) => { x.setAttribute("aria-pressed", String(x === b)); x.classList.toggle("on", x === b); });
  }));
  el.querySelector("#chSearch").addEventListener("submit", (e) => { e.preventDefault(); chRunSearch(el.querySelector("#chQuery").value); });
  el.querySelector("#chLang").addEventListener("change", (e) => {
    const first = chIncluded(CH_BIBLE.manifest).find((t) => t.language === e.target.value);
    if (first) chSelectTr(first.id);
  });
  el.querySelector("#chTr").addEventListener("change", (e) => chSelectTr(e.target.value));
  return el;
}

function chSheetMsg(text) {
  const b = CH_BIBLE.sheet && CH_BIBLE.sheet.querySelector("#chBody");
  if (b) b.innerHTML = `<p class="ch-msg">${chEsc(text)}</p>`;
}

async function chSelectTr(id, first = false) {
  const m = await chManifest();
  const list = chIncluded(m);
  const entry = list.find((t) => t.id === id) || list[0];
  CH_BIBLE.tr = entry.id;
  chSet(CH_KEY.bible, entry.id);
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const langs = [...new Set(list.map((t) => t.language))];
  sheet.querySelector("#chLang").innerHTML = langs.map((l) => `<option ${l === entry.language ? "selected" : ""}>${chEsc(l)}</option>`).join("");
  sheet.querySelector("#chTr").innerHTML = list.filter((t) => t.language === entry.language)
    .map((t) => `<option value="${chEsc(t.id)}" ${t.id === entry.id ? "selected" : ""}>${chEsc(t.name)}</option>`).join("");
  sheet.querySelector("#chTitle, #chSheetTitle").textContent = entry.name;
  sheet.querySelector("#chFoot").textContent = `${entry.name} · ${entry.language} · ${entry.year || ""}. ${entry.licence}`.replace(/\s+/g, " ").trim();
  CH_BIBLE.view = "books";
  const body = sheet.querySelector("#chBody");
  body.innerHTML = `<p class="ch-msg">Loading ${chEsc(entry.name)}…</p>`;
  const token = ++CH_BIBLE.token;
  try {
    const doc = await chLoadTr(entry);
    if (token !== CH_BIBLE.token && !first) return;
    CH_BIBLE.doc = doc;
    chShowBooks();
  } catch (err) {
    chSheetMsg(err && err.message ? err.message : "This translation could not load.");
  }
}

function chCrumbs(parts) {
  const c = CH_BIBLE.sheet && CH_BIBLE.sheet.querySelector("#chCrumbs"); if (!c) return;
  c.innerHTML = parts.map((p, i) => p.go ? `<button type="button" data-i="${i}">${chEsc(p.label)}</button>` : `<span>${chEsc(p.label)}</span>`).join(" › ");
  c.querySelectorAll("button").forEach((b) => { const p = parts[Number(b.dataset.i)]; b.addEventListener("click", p.go); });
}

function chShowBooks() {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  CH_BIBLE.view = "books";
  chCrumbs([{ label: "Books" }]);
  const doc = CH_BIBLE.doc;
  const group = (t, label) => `<h3 class="ch-h">${label}</h3><div class="ch-grid books">${doc.books.map((b, i) => b.testament === t ? `<button type="button" data-b="${i}">${chEsc(b.name)}<small>${b.chapters.length}</small></button>` : "").join("")}</div>`;
  const body = sheet.querySelector("#chBody");
  body.innerHTML = group("OT", "Old Testament") + group("NT", "New Testament");
  body.scrollTop = 0;
  body.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => chShowChapters(Number(b.dataset.b))));
}

function chShowChapters(bi) {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const book = CH_BIBLE.doc.books[bi];
  CH_BIBLE.view = "chapters"; CH_BIBLE.book = bi;
  chCrumbs([{ label: "Books", go: () => chShowBooks() }, { label: book.name }]);
  const body = sheet.querySelector("#chBody");
  body.innerHTML = `<h3 class="ch-h">${chEsc(book.name)}</h3><div class="ch-grid chaps">${book.chapters.map((_, i) => `<button type="button" data-c="${i + 1}">${i + 1}</button>`).join("")}</div>`;
  body.scrollTop = 0;
  body.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => chShowChapter(bi, Number(b.dataset.c))));
}

function chShowChapter(bi, chap, highlight = null) {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const doc = CH_BIBLE.doc, book = doc.books[bi];
  if (chap < 1 || chap > book.chapters.length) return;
  CH_BIBLE.view = "reader"; CH_BIBLE.book = bi; CH_BIBLE.chap = chap; CH_BIBLE.sel = null;
  chCrumbs([{ label: "Books", go: () => chShowBooks() }, { label: book.name, go: () => chShowChapters(bi) }, { label: String(chap) }]);
  const verses = book.chapters[chap - 1];
  const body = sheet.querySelector("#chBody");
  const prevOk = chap > 1, nextOk = chap < book.chapters.length;
  body.innerHTML = `
    <div class="ch-readhead"><h3 class="ch-h">${chEsc(book.name)} ${chap}</h3></div>
    <div class="ch-verses" id="chVerses">${verses.map((t, i) => `<span class="ch-v" data-v="${i + 1}" id="v${i + 1}"><sup>${i + 1}</sup> ${chEsc(t)}</span> `).join("")}</div>
    <div class="ch-selbar" id="chSelBar" hidden><span id="chSelRef"></span><button type="button" id="chCopy">Copy reference</button></div>
    <div class="ch-pager">
      <button type="button" id="chPrev" ${prevOk ? "" : "disabled"}>‹ Previous chapter</button>
      <button type="button" id="chNext" ${nextOk ? "" : "disabled"}>Next chapter ›</button>
    </div>`;
  body.scrollTop = 0;
  body.querySelectorAll(".ch-v").forEach((v) => v.addEventListener("click", () => chSelectVerse(Number(v.dataset.v))));
  body.querySelector("#chPrev").addEventListener("click", () => chShowChapter(bi, chap - 1));
  body.querySelector("#chNext").addEventListener("click", () => chShowChapter(bi, chap + 1));
  body.querySelector("#chCopy").addEventListener("click", () => chCopyRef());
  if (highlight) {
    const hv = body.querySelector(`#v${highlight.from || 1}`);
    if (hv) { hv.classList.add("hit"); hv.scrollIntoView({ block: "center" }); }
  }
  // swipe left / right to change chapter
  let x0 = null;
  body.ontouchstart = (e) => { x0 = e.touches[0].clientX; };
  body.ontouchend = (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) < 70) return;
    if (dx < 0 && nextOk) chShowChapter(bi, chap + 1);
    if (dx > 0 && prevOk) chShowChapter(bi, chap - 1);
  };
}

function chSelectVerse(n) {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const book = CH_BIBLE.doc.books[CH_BIBLE.book];
  CH_BIBLE.sel = n;
  sheet.querySelectorAll(".ch-v").forEach((v) => v.classList.toggle("sel", Number(v.dataset.v) === n));
  const bar = sheet.querySelector("#chSelBar");
  bar.hidden = false;
  sheet.querySelector("#chSelRef").textContent = `${book.name} ${CH_BIBLE.chap}:${n}`;
}

async function chCopyRef() {
  const sheet = CH_BIBLE.sheet; if (!sheet || !CH_BIBLE.sel) return;
  const book = CH_BIBLE.doc.books[CH_BIBLE.book];
  const text = `${book.name} ${CH_BIBLE.chap}:${CH_BIBLE.sel}`;
  try { await navigator.clipboard.writeText(text); sheet.querySelector("#chCopy").textContent = "Copied"; }
  catch { sheet.querySelector("#chCopy").textContent = text; }
}

// Search: references jump to the chapter; words list matching verses (up to 100), scanned in small steps.
async function chRunSearch(raw) {
  const q = String(raw || "").trim();
  if (!q || !CH_BIBLE.doc) return;
  const doc = CH_BIBLE.doc;
  const token = ++CH_BIBLE.token;
  const ref = chParseRef(q, doc);
  if (ref) {
    chShowChapter(ref.bi, ref.chap, { from: ref.from });
    return;
  }
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  CH_BIBLE.view = "results";
  chCrumbs([{ label: `Results for “${q.slice(0, 40)}”` }]);
  const body = sheet.querySelector("#chBody");
  body.innerHTML = `<p class="ch-msg">Searching…</p>`;
  const needle = chNorm(q);
  const words = needle.split(" ").filter(Boolean);
  const hits = [];
  let scanned = 0;
  outer: for (let bi = 0; bi < doc.books.length; bi++) {
    const b = doc.books[bi];
    for (let ci = 0; ci < b.chapters.length; ci++) {
      const vs = b.chapters[ci];
      for (let vi = 0; vi < vs.length; vi++) {
        const t = vs[vi];
        scanned++;
        const low = chNorm(t);
        if (words.every((w) => low.includes(w))) {
          hits.push({ bi, ci: ci + 1, vi: vi + 1, t });
          if (hits.length >= 100) break outer;
        }
        if (scanned % 2500 === 0) {
          await new Promise((r) => setTimeout(r, 0));
          if (token !== CH_BIBLE.token) return;
        }
      }
    }
  }
  if (token !== CH_BIBLE.token) return;
  if (!hits.length) { body.innerHTML = `<p class="ch-msg">No verses found for “${chEsc(q)}”.</p>`; return; }
  const hl = (t) => {
    let out = chEsc(t);
    for (const w of words) out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), (m) => `<b>${m}</b>`);
    return out;
  };
  body.innerHTML = `<p class="ch-msg">${hits.length}${hits.length >= 100 ? "+" : ""} verse${hits.length === 1 ? "" : "s"}</p>` +
    hits.map((h) => `<button type="button" class="ch-hit" data-bi="${h.bi}" data-c="${h.ci}" data-v="${h.vi}"><span class="ch-hit-ref">${chEsc(doc.books[h.bi].name)} ${h.ci}:${h.vi}</span>${hl(h.t)}</button>`).join("");
  body.querySelectorAll(".ch-hit").forEach((b) => b.addEventListener("click", () => chShowChapter(Number(b.dataset.bi), Number(b.dataset.c), { from: Number(b.dataset.v) })));
}

// ---------------------------------------------------------------- export
export { openChurch };
export function churchIsOpen() { return chOpen; }
