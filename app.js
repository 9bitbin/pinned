// Stuck on You: shared sticky-note board for two
import { CONFIG } from "./config.js";

// ---------------------------------------------------------------- constants
const BOARD_W = 420;                 // virtual board width (same on every phone)
const MIN_BOARD_H = 1500;
const COLORS = ["c1", "c2", "c3", "c4", "c5", "c6"];
const BRIGHT = { c1: "#ffe066", c2: "#ff8fb1", c3: "#7cc4ff", c4: "#7be495", c5: "#b79cff", c6: "#ffb370" };
const THEMES = [
  { id: "cork", name: "Cozy corkboard", bg: "linear-gradient(135deg,#c39463,#a87a4b)", notes: ["#fff176", "#ffb3c7", "#a7d8ff"] },
  { id: "pastel", name: "Pastel", bg: "linear-gradient(135deg,#ffd9ec,#d8f1ff 60%,#e3ffe9)", notes: ["#fff4b8", "#ffd6e5", "#e9dcff"] },
  { id: "midnight", name: "Dark & minimal", bg: "#0e1014", notes: ["#2b2a1f", "#1d2633", "#2e1f27"] },
  { id: "dreamy", name: "Liminal & dreamy", bg: "linear-gradient(180deg,#f2c9b5,#8d9cc4 55%,#4d5b84)", notes: ["rgba(255,255,255,.55)", "rgba(255,210,226,.6)", "rgba(200,230,255,.6)"] },
];
const EMOJIS = "❤️ 💕 💖 💘 💌 😘 🥰 😍 😊 😂 🥺 😴 🤗 😜 😎 🙈 🫶 🌹 🌸 🌻 💐 🌙 ⭐ ✨ 🔥 🌈 ☕ 🍕 🍜 🍓 🍰 🍿 🎵 🎧 🎉 🎁 🧸 🐱 🐶 🐻 🦋 🍀 👀 👋 🙏 💪 🤞 👏 💯 ✅ 🏠 🚗 ✈️ 💤 ☔ 🌊 🎮 📚 💡 🥂 🌮 🍩 😤 😭".split(" ");
const PENS = ["#222222", "#e5484d", "#f5a524", "#30a46c", "#3e63dd", "#8e4ec6", "#e93d82", "#ffffff"];
const SIZES = [3, 7, 14];

const $ = (s) => document.querySelector(s);
const isDemo = !CONFIG.supabaseUrl || CONFIG.supabaseUrl.includes("YOUR-");
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const fmtCode = (c) => (c || "").replace(/(.{4})(.{4})/, "$1-$2");
const ls = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } },
};

// ================================================================ backends
// Both backends expose the same async interface.

function createSupabaseApi() {
  let sb, session, channel;
  const bucket = () => sb.storage.from("board-media");
  const urlCache = new Map();
  const must = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

  return {
    async init() {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } });
      session = (await sb.auth.getSession()).data.session;
    },
    async me() {
      if (!session) return null;
      const rows = must(await sb.from("profiles").select("id,name,color").eq("id", session.user.id));
      return rows[0] || null;
    },
    async signIn(name, color) {
      if (!session) {
        const res = await sb.auth.signInAnonymously();
        if (res.error) throw new Error(res.error.message.includes("disabled") ? "Anonymous sign-ins are off. Turn them on in Supabase (see SETUP.md)." : res.error.message);
        session = res.data.session;
      }
      must(await sb.from("profiles").upsert({ id: session.user.id, name, color }));
      return { id: session.user.id, name, color };
    },
    async updateProfile(patch) {
      must(await sb.from("profiles").update(patch).eq("id", session.user.id));
    },
    async myBoard() {
      const rows = must(await sb.from("board_members").select("board_id, boards(id, code)").eq("user_id", session.user.id).order("joined_at", { ascending: false }).limit(1));
      return rows[0] ? rows[0].boards : null;
    },
    async createBoard() { return must(await sb.rpc("create_board")); },
    async joinBoard(code) { return must(await sb.rpc("join_board", { p_code: code })); },
    async members(boardId) {
      const ids = must(await sb.from("board_members").select("user_id").eq("board_id", boardId)).map((r) => r.user_id);
      if (!ids.length) return [];
      return must(await sb.from("profiles").select("id,name,color").in("id", ids));
    },
    async removeMember(boardId, userId) {
      must(await sb.from("board_members").delete().eq("board_id", boardId).eq("user_id", userId));
    },
    async listNotes(boardId) {
      return must(await sb.from("notes").select("*").eq("board_id", boardId).order("z", { ascending: true }));
    },
    async addNote(n) { return must(await sb.from("notes").insert(n).select().single()); },
    async updateNote(id, patch) {
      must(await sb.from("notes").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id));
    },
    async deleteNote(n) {
      must(await sb.from("notes").delete().eq("id", n.id));
      if (n.media_path) await bucket().remove([n.media_path]);
    },
    async uploadMedia(boardId, blob, ext) {
      const path = `${boardId}/${uid()}.${ext}`;
      must(await bucket().upload(path, blob, { contentType: blob.type, upsert: false }));
      return path;
    },
    async mediaUrls(paths) {
      const need = paths.filter((p) => p && !urlCache.has(p));
      if (need.length) {
        const rows = must(await bucket().createSignedUrls(need, 60 * 60 * 24 * 7));
        rows.forEach((r) => r.signedUrl && urlCache.set(r.path, r.signedUrl));
      }
      return Object.fromEntries(paths.map((p) => [p, urlCache.get(p)]));
    },
    subscribe(boardId, h) {
      if (channel) sb.removeChannel(channel);
      const f = `board_id=eq.${boardId}`;
      channel = sb.channel("board-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notes", filter: f }, (p) => h.onInsert(p.new))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notes", filter: f }, (p) => h.onUpdate(p.new))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "notes" }, (p) => h.onDelete(p.old.id))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board_members", filter: f }, () => h.onMembers())
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board_members" }, () => h.onMembers())
        .subscribe();
    },
    async savePushSub(sub) {
      must(await sb.from("push_subs").upsert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, user_id: session.user.id }));
    },
    async notify(boardId, kind, test = false) {
      try {
        const { data, error } = await sb.functions.invoke("notify", { body: { board_id: boardId, kind, test } });
        if (error) {
          let detail = error.message;
          const res = error.context;
          if (res && typeof res.status === "number") {
            let body = "";
            try { body = await res.clone().text(); } catch { /* no body */ }
            try { const j = JSON.parse(body); body = j.error || j.msg || j.message || body; } catch { /* plain text */ }
            detail = `${res.status} ${body || res.statusText || ""}`.trim();
          }
          return { error: detail };
        }
        return data;
      } catch (e) { console.warn("notify failed", e); return { error: e.message }; }
    },
    pushReady: () => !!CONFIG.vapidPublicKey && !CONFIG.vapidPublicKey.includes("YOUR-"),
  };
}

// Demo backend: localStorage + BroadcastChannel. Each browser tab is its own "person".
function createDemoApi() {
  const KEY = "soy-demo-db";
  const db = () => ls.get(KEY, { profiles: {}, boards: {}, members: [], notes: [], media: {} });
  const save = (d) => ls.set(KEY, d);
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("soy-demo") : null;
  // Open the app with ?as=2 in a second tab to play the other person.
  const who = new URLSearchParams(location.search).get("as") || "";
  const meId = () => { const k = "soy-demo-me" + who; let id = localStorage.getItem(k); if (!id) { id = uid(); localStorage.setItem(k, id); } return id; };
  let handlers = null;
  const emit = (msg) => bc && bc.postMessage(msg);
  if (bc) bc.onmessage = (e) => {
    if (!handlers) return;
    const m = e.data;
    if (m.type === "insert") handlers.onInsert(m.note);
    if (m.type === "update") handlers.onUpdate(m.note);
    if (m.type === "delete") handlers.onDelete(m.id);
    if (m.type === "members") handlers.onMembers();
  };
  const code = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

  return {
    async init() {},
    async me() { return db().profiles[meId()] || null; },
    async signIn(name, color) { const d = db(); d.profiles[meId()] = { id: meId(), name, color }; save(d); return d.profiles[meId()]; },
    async updateProfile(patch) { const d = db(); Object.assign(d.profiles[meId()], patch); save(d); emit({ type: "members" }); },
    async myBoard() { const d = db(); const m = d.members.find((x) => x.user_id === meId()); return m ? d.boards[m.board_id] : null; },
    async createBoard() { const d = db(); const b = { id: uid(), code: code() }; d.boards[b.id] = b; d.members.push({ board_id: b.id, user_id: meId() }); save(d); return b; },
    async joinBoard(c) {
      const d = db(); const clean = (c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const b = Object.values(d.boards).find((x) => x.code === clean);
      if (!b) throw new Error("No board with that code");
      if (!d.members.some((m) => m.board_id === b.id && m.user_id === meId())) {
        if (d.members.filter((m) => m.board_id === b.id).length >= 2) throw new Error("That board already has two people");
        d.members.push({ board_id: b.id, user_id: meId() }); save(d); emit({ type: "members" });
      }
      return b;
    },
    async members(boardId) { const d = db(); return d.members.filter((m) => m.board_id === boardId).map((m) => d.profiles[m.user_id]).filter(Boolean); },
    async removeMember(boardId, userId) { const d = db(); d.members = d.members.filter((m) => !(m.board_id === boardId && m.user_id === userId)); save(d); emit({ type: "members" }); },
    async listNotes(boardId) { return db().notes.filter((n) => n.board_id === boardId).sort((a, b) => a.z - b.z); },
    async addNote(n) { const d = db(); const row = { ...n, id: uid(), created_at: new Date().toISOString() }; d.notes.push(row); save(d); emit({ type: "insert", note: row }); return row; },
    async updateNote(id, patch) { const d = db(); const n = d.notes.find((x) => x.id === id); if (!n) return; Object.assign(n, patch); save(d); emit({ type: "update", note: n }); },
    async deleteNote(n) { const d = db(); d.notes = d.notes.filter((x) => x.id !== n.id); if (n.media_path) delete d.media[n.media_path]; save(d); emit({ type: "delete", id: n.id }); },
    async uploadMedia(boardId, blob, ext) {
      const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      const path = `${boardId}/${uid()}.${ext}`; const d = db(); d.media[path] = dataUrl; save(d); return path;
    },
    async mediaUrls(paths) { const d = db(); return Object.fromEntries(paths.map((p) => [p, d.media[p]])); },
    subscribe(boardId, h) { handlers = h; },
    async savePushSub() {},
    async notify() { return { sent: 1, devices: 1, failures: [] }; },
    pushReady: () => true,
    meId,
  };
}

const api = isDemo ? createDemoApi() : createSupabaseApi();

// ================================================================ state
const state = {
  me: null,
  board: null,
  members: [],
  notes: new Map(),     // id -> note row
  urls: {},             // media path -> url
  scale: 1,
  dragId: null,
  lastSeen: ls.get("soy-last-seen", 0),
};

// ================================================================ ui helpers
let toastTimer;
function toast(msg, ms = 2600) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), ms);
}
function show(id) { for (const s of ["#welcome", "#pair", "#boardScreen"]) $(s).hidden = s !== id; }
function setError(el, msg) { el.textContent = msg || ""; el.hidden = !msg; }
function busy(btn, on, label) {
  if (on) { btn.dataset.label = btn.textContent; btn.textContent = label || "…"; btn.disabled = true; }
  else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
}

function swatchRow(container, selected, onPick, palette = "note") {
  container.innerHTML = "";
  for (const c of COLORS) {
    const b = document.createElement("button");
    b.className = "swatch"; b.type = "button"; b.setAttribute("aria-label", "Color " + c);
    b.style.background = palette === "bright" ? BRIGHT[c] : `var(--n${c.slice(1)})`;
    if (palette !== "bright") b.style.boxShadow = `inset 0 -5px 0 ${BRIGHT[c]}, inset 0 0 0 1px rgba(0,0,0,.12)`;
    b.setAttribute("aria-pressed", String(c === selected));
    b.onclick = () => { container.querySelectorAll(".swatch").forEach((x) => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); onPick(c); };
    container.appendChild(b);
  }
}

function applyTheme(id) {
  document.documentElement.dataset.theme = id;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta.content = { cork: "#8a5e36", pastel: "#f5ecff", midnight: "#0e1014", dreamy: "#8d9cc4" }[id] || "#8a5e36";
  ls.set("soy-theme", id);
}

function memberById(id) { return state.members.find((m) => m.id === id); }
function nameOf(id) { return id === state.me?.id ? "you" : (memberById(id)?.name || "someone"); }
function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (s < 45) return "just now";
  if (s < 3600) return rtf.format(-Math.round(s / 60), "minute");
  if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
  return rtf.format(-Math.round(s / 86400), "day");
}

// ================================================================ boot
async function boot() {
  applyTheme(ls.get("soy-theme", "cork"));
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW failed", e));
  }
  try { await api.init(); } catch (e) { toast("Couldn't reach the server. Check your connection."); console.error(e); }
  $("#demoBanner").hidden = !isDemo;
  wireStatic();
  try {
    state.me = await api.me();
    if (!state.me) return showWelcome();
    const board = await api.myBoard();
    if (!board) return showPair();
    await openBoard(board);
  } catch (e) {
    console.error(e); toast(e.message || "Something went wrong");
    showWelcome();
  }
}

// ---------------------------------------------------------------- welcome / pair
let welcomeColor = "c2";
function showWelcome() {
  show("#welcome");
  swatchRow($("#profileSwatches"), welcomeColor, (c) => (welcomeColor = c), "bright");
}
async function onWelcome() {
  const name = $("#nameInput").value.trim();
  if (!name) return setError($("#welcomeError"), "Add a name first.");
  setError($("#welcomeError"));
  const btn = $("#welcomeGo"); busy(btn, true, "One sec…");
  try {
    state.me = await api.signIn(name, welcomeColor);
    const board = await api.myBoard();
    board ? await openBoard(board) : showPair();
  } catch (e) { setError($("#welcomeError"), e.message); }
  busy(btn, false);
}
function showPair() { show("#pair"); }
async function onCreateBoard() {
  const btn = $("#createBoard"); busy(btn, true, "Creating…"); setError($("#pairError"));
  try { await openBoard(await api.createBoard()); } catch (e) { setError($("#pairError"), e.message); }
  busy(btn, false);
}
async function onJoinBoard() {
  const code = $("#codeInput").value;
  if (code.replace(/[^a-z0-9]/gi, "").length < 8) return setError($("#pairError"), "Codes are 8 characters.");
  const btn = $("#joinBoard"); busy(btn, true, "Joining…"); setError($("#pairError"));
  try { await openBoard(await api.joinBoard(code)); } catch (e) { setError($("#pairError"), e.message); }
  busy(btn, false);
}

// ---------------------------------------------------------------- board
async function openBoard(board) {
  state.board = board;
  show("#boardScreen");
  layoutBoard();
  await refreshMembers();
  await resync();
  api.subscribe(board.id, {
    onInsert: (n) => upsertNote(n, true),
    onUpdate: (n) => { if (state.dragId !== n.id) upsertNote(n); },
    onDelete: (id) => removeNoteEl(id),
    onMembers: () => refreshMembers(),
  });
  refreshPushSubscription();
  clearBadge();
}

async function resync() {
  if (!state.board) return;
  const rows = await api.listNotes(state.board.id);
  const ids = new Set(rows.map((r) => r.id));
  for (const id of [...state.notes.keys()]) if (!ids.has(id)) removeNoteEl(id);
  await loadUrls(rows);
  for (const r of rows) upsertNote(r);
  updateEmpty();
}

async function loadUrls(rows) {
  const paths = rows.map((r) => r.media_path).filter((p) => p && !state.urls[p]);
  if (paths.length) Object.assign(state.urls, await api.mediaUrls(paths));
}

async function refreshMembers() {
  if (!state.board) return;
  state.members = await api.members(state.board.id);
  if (state.me && !state.members.some((m) => m.id === state.me.id)) {
    // removed from the board
    state.board = null; state.notes.clear(); $("#board").innerHTML = "";
    toast("You were removed from the board");
    return showPair();
  }
  const chips = $("#memberChips"); chips.innerHTML = "";
  for (const m of state.members) {
    const c = document.createElement("span");
    c.className = "chip"; c.style.background = BRIGHT[m.color] || BRIGHT.c1; c.textContent = (m.name || "?").slice(0, 1).toUpperCase();
    c.title = m.name; chips.appendChild(c);
  }
  const waiting = state.members.length < 2;
  $("#waitBanner").hidden = !waiting;
  $("#waitCode").textContent = fmtCode(state.board.code);
  renderMemberList();
  for (const n of state.notes.values()) { const el = noteEl(n.id); if (el) setFrom(el, n); }
}

function layoutBoard() {
  const scroller = $("#scroller");
  const w = scroller.clientWidth || window.innerWidth;
  state.scale = Math.min(Math.max(w / BOARD_W, 0.6), 1.5);
  let maxY = 0;
  for (const n of state.notes.values()) maxY = Math.max(maxY, n.y + 260);
  const h = Math.max(MIN_BOARD_H, maxY + 500);
  const board = $("#board");
  board.style.height = h + "px";
  board.style.transform = `scale(${state.scale})`;
  const sizer = $("#boardSizer");
  sizer.style.width = BOARD_W * state.scale + "px";
  sizer.style.height = h * state.scale + "px";
}

function noteEl(id) { return document.querySelector(`.note[data-id="${CSS.escape(id)}"]`); }

function setFrom(el, n) {
  const f = el.querySelector(".from");
  if (f) f.textContent = n.author_id === state.me?.id ? "" : (memberById(n.author_id)?.name || "");
}

function paintPaper(el, c) {
  c = c || "c1";
  el.style.setProperty("--paper", `var(--n${c.slice(1)})`);
  el.style.setProperty("--paper-bright", BRIGHT[c]);
  el.style.setProperty("--strip", BRIGHT[c]);
}

function buildNoteContent(n, el) {
  el.className = "note " + n.kind + (n.kind === "text" ? " paper" : "");
  paintPaper(el, n.color);
  el.innerHTML = "";
  if (n.kind === "text") {
    const b = document.createElement("div"); b.className = "body"; b.textContent = n.body || ""; el.appendChild(b);
  } else if (n.kind === "emoji") {
    el.appendChild(document.createTextNode(n.body || "❤️"));
  } else if (n.kind === "image" || n.kind === "drawing") {
    const img = document.createElement("img"); img.alt = n.kind === "image" ? (n.body || "Photo") : "Drawing"; img.draggable = false;
    if (state.urls[n.media_path]) img.src = state.urls[n.media_path];
    el.appendChild(img);
    if (n.kind === "image" && n.body) { const c = document.createElement("div"); c.className = "cap"; c.textContent = n.body; el.appendChild(c); }
  }
  const from = document.createElement("div"); from.className = "from"; el.appendChild(from);
  setFrom(el, n);
}

function placeNote(el, n) {
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
  el.style.zIndex = String(Math.max(1, Math.floor((n.z || 0) / 1000) % 2000000000));
  el.style.transform = `rotate(${n.rot || 0}deg)`;
}

async function upsertNote(n, fromRealtime = false) {
  const existed = state.notes.has(n.id);
  const prev = state.notes.get(n.id);
  state.notes.set(n.id, { ...prev, ...n });
  n = state.notes.get(n.id);
  if (n.media_path && !state.urls[n.media_path]) await loadUrls([n]);
  let el = noteEl(n.id);
  if (!el) {
    el = document.createElement("div");
    el.dataset.id = n.id;
    buildNoteContent(n, el);
    attachDrag(el);
    $("#board").appendChild(el);
  } else if (!prev || prev.body !== n.body || prev.color !== n.color || prev.media_path !== n.media_path) {
    buildNoteContent(n, el);
  }
  placeNote(el, n);
  const isPartner = n.author_id !== state.me?.id;
  if (isPartner && new Date(n.created_at).getTime() > state.lastSeen) el.classList.add("fresh");
  if (fromRealtime && !existed && isPartner) {
    toast(`New note from ${memberById(n.author_id)?.name || "your person"}`);
    if (isDemo && document.hidden) localNotify(`New note from ${memberById(n.author_id)?.name || "your person"}`);
  }
  layoutBoard();
  updateEmpty();
}

function removeNoteEl(id) {
  state.notes.delete(id);
  noteEl(id)?.remove();
  if (detailId === id) closeSheet("detail");
  updateEmpty();
}

function updateEmpty() { $("#emptyState").hidden = state.notes.size > 0; }

function markSeen() {
  state.lastSeen = Date.now(); ls.set("soy-last-seen", state.lastSeen);
  setTimeout(() => document.querySelectorAll(".note.fresh").forEach((e) => e.classList.remove("fresh")), 5000);
}

// ---------------------------------------------------------------- dragging
// Mouse: drag right away. Touch: press and hold briefly, then drag (so swiping still scrolls the board).
function attachDrag(el) {
  let start = null, origin = null, dragging = false, holdTimer = null, startScroll = null, touchId = null;
  const scroller = $("#scroller");

  const begin = (x, y) => {
    const n = state.notes.get(el.dataset.id); if (!n) return false;
    start = { x, y }; origin = { x: n.x, y: n.y }; startScroll = { top: scroller.scrollTop, left: scroller.scrollLeft };
    return true;
  };
  const lift = () => {
    dragging = true; state.dragId = el.dataset.id;
    el.classList.add("dragging");
    el.style.zIndex = "2147483000";
    const n = state.notes.get(el.dataset.id);
    el.style.transform = `rotate(${n.rot || 0}deg) scale(1.06)`;
    if (navigator.vibrate) navigator.vibrate(12);
  };
  let last = null, raf = null;
  const move = (x, y) => {
    last = { x, y };
    const n = state.notes.get(el.dataset.id);
    const s = state.scale;
    const dx = (x - start.x + (scroller.scrollLeft - startScroll.left)) / s;
    const dy = (y - start.y + (scroller.scrollTop - startScroll.top)) / s;
    const w = el.offsetWidth, boardH = parseFloat($("#board").style.height);
    n.x = Math.min(Math.max(origin.x + dx, -10), BOARD_W - w + 10);
    n.y = Math.min(Math.max(origin.y + dy, 0), boardH - 120);
    el.style.left = n.x + "px"; el.style.top = n.y + "px";
    // auto-scroll near the edges
    const r = scroller.getBoundingClientRect();
    if (!raf && (y < r.top + 60 || y > r.bottom - 60)) {
      const step = () => {
        if (!dragging || !last) { raf = null; return; }
        const dir = last.y < r.top + 60 ? -1 : last.y > r.bottom - 60 ? 1 : 0;
        if (!dir) { raf = null; return; }
        scroller.scrollTop += dir * 10;
        if (dir > 0) layoutGrow(n.y + 400);
        move(last.x, last.y);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
  };
  const finish = async (tap) => {
    clearTimeout(holdTimer); holdTimer = null;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    const id = el.dataset.id;
    if (dragging) {
      dragging = false; el.classList.remove("dragging");
      const n = state.notes.get(id);
      n.z = Date.now();
      placeNote(el, n);
      layoutBoard();
      try { await api.updateNote(id, { x: n.x, y: n.y, z: n.z }); } catch (e) { toast("Couldn't save the move"); }
      setTimeout(() => { if (state.dragId === id) state.dragId = null; }, 600);
    } else if (tap) {
      openDetail(id);
    }
    start = null;
  };

  // mouse / pen
  el.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    if (!begin(e.clientX, e.clientY)) return;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch" || !start) return;
    if (!dragging && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) lift();
    if (dragging) move(e.clientX, e.clientY);
  });
  el.addEventListener("pointerup", (e) => { if (e.pointerType !== "touch" && start) finish(true); });
  el.addEventListener("pointercancel", (e) => { if (e.pointerType !== "touch" && start) finish(false); });

  // touch
  el.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) return;
    const t = e.changedTouches[0]; touchId = t.identifier;
    if (!begin(t.clientX, t.clientY)) return;
    holdTimer = setTimeout(() => { holdTimer = null; if (start) lift(); }, 260);
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    const t = [...e.changedTouches].find((x) => x.identifier === touchId); if (!t || !start) return;
    if (dragging) { e.preventDefault(); move(t.clientX, t.clientY); return; }
    if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > 8) { clearTimeout(holdTimer); holdTimer = null; start = null; } // it's a scroll
  }, { passive: false });
  el.addEventListener("touchend", (e) => {
    if (![...e.changedTouches].some((x) => x.identifier === touchId)) return;
    if (dragging) { e.preventDefault(); finish(false); }
    else if (start) { e.preventDefault(); finish(true); }
  }, { passive: false });
  el.addEventListener("touchcancel", () => { if (start || dragging) finish(false); });
  el.addEventListener("contextmenu", (e) => e.preventDefault());
}

function layoutGrow(needY) {
  const board = $("#board"); const h = parseFloat(board.style.height);
  if (needY > h - 200) { board.style.height = h + 400 + "px"; $("#boardSizer").style.height = (h + 400) * state.scale + "px"; }
}

// ---------------------------------------------------------------- sheets
function openSheet(name) { $("#" + name).hidden = false; $("#" + name + "Backdrop").hidden = false; }
function closeSheet(name) { $("#" + name).hidden = true; $("#" + name + "Backdrop").hidden = true; if (name === "detail") detailId = null; }

// ---------------------------------------------------------------- note detail
let detailId = null;
function openDetail(id) {
  const n = state.notes.get(id); if (!n) return;
  detailId = id;
  const wrap = $("#detailBody"); wrap.innerHTML = "";
  const el = document.createElement("div"); buildNoteContent(n, el); wrap.appendChild(el);
  $("#detailMeta").textContent = `From ${nameOf(n.author_id)} · ${timeAgo(n.created_at)}`;
  noteEl(id)?.classList.remove("fresh");
  openSheet("detail");
}
async function removeDetail() {
  const n = state.notes.get(detailId); if (!n) return;
  if (!confirm("Remove this from the board for both of you?")) return;
  closeSheet("detail");
  removeNoteEl(n.id);
  try { await api.deleteNote(n); } catch (e) { toast("Couldn't remove it"); resync(); }
}
async function frontDetail() {
  const n = state.notes.get(detailId); if (!n) return;
  n.z = Date.now(); const el = noteEl(n.id); if (el) placeNote(el, n);
  closeSheet("detail");
  try { await api.updateNote(n.id, { z: n.z }); } catch { /* ignore */ }
}

// ---------------------------------------------------------------- composer
const compose = { tab: "text", color: "c1", emoji: "❤️", photo: null, padColor: "c1" };

function openComposer() {
  compose.photo = null;
  $("#textInput").value = ""; $("#photoCaption").value = ""; $("#emojiCustom").value = "";
  $("#photoPreview").hidden = true; $("#photoHint").hidden = false; $("#photoInput").value = "";
  pad.reset();
  setTab(compose.tab);
  openSheet("composer");
  if (compose.tab === "text") setTimeout(() => $("#textInput").focus(), 250);
}

function setTab(tab) {
  compose.tab = tab;
  document.querySelectorAll("#composerTabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll("#composer .pane").forEach((p) => (p.hidden = p.dataset.pane !== tab));
  if (tab === "drawing") pad.fit();
}

// Find an open spot in the visible part of the board, leaning toward the middle.
function viewportSpot(w, h) {
  const sc = $("#scroller"), s = state.scale;
  const top = sc.scrollTop / s + 10, bottom = (sc.scrollTop + sc.clientHeight) / s - h - 10;
  const cx = BOARD_W / 2, cy = (sc.scrollTop + sc.clientHeight / 2) / s;
  const rects = [...state.notes.values()].map((n) => {
    const el = noteEl(n.id);
    return { x: n.x, y: n.y, w: el ? el.offsetWidth : 150, h: el ? el.offsetHeight : 150 };
  });
  let best = null;
  for (let y = Math.max(8, top); y <= Math.max(top, bottom); y += 20) {
    for (let x = 6; x <= BOARD_W - w - 6; x += 20) {
      let overlap = 0;
      for (const r of rects) {
        const ox = Math.max(0, Math.min(x + w, r.x + r.w) - Math.max(x, r.x));
        const oy = Math.max(0, Math.min(y + h, r.y + r.h) - Math.max(y, r.y));
        overlap += ox * oy;
      }
      const dist = Math.hypot(x + w / 2 - cx, y + h / 2 - cy);
      const score = overlap * 4 + dist;
      if (!best || score < best.score) best = { x, y, score };
    }
  }
  const jitter = () => Math.round((Math.random() - 0.5) * 16);
  return { x: Math.min(Math.max(best.x + jitter(), 0), BOARD_W - w), y: Math.max(8, Math.round(best.y + jitter())) };
}

async function sendCompose() {
  const btn = $("#composerSend");
  const base = { board_id: state.board.id, author_id: state.me.id, rot: Math.round((Math.random() * 8 - 4) * 10) / 10, z: Date.now() };
  let row;
  try {
    busy(btn, true, "Sticking…");
    if (compose.tab === "text") {
      const body = $("#textInput").value.trim();
      if (!body) { busy(btn, false); return toast("Write something first"); }
      row = { ...base, kind: "text", body, color: compose.color, ...viewportSpot(150, 150) };
    } else if (compose.tab === "emoji") {
      const body = ($("#emojiCustom").value.trim() || compose.emoji).slice(0, 8);
      row = { ...base, kind: "emoji", body, color: "c1", ...viewportSpot(80, 80) };
    } else if (compose.tab === "image") {
      if (!compose.photo) { busy(btn, false); return toast("Pick a photo first"); }
      const path = await api.uploadMedia(state.board.id, compose.photo, "jpg");
      row = { ...base, kind: "image", media_path: path, body: $("#photoCaption").value.trim() || null, color: "c1", ...viewportSpot(172, 200) };
    } else {
      if (pad.isEmpty()) { busy(btn, false); return toast("Draw something first"); }
      const blob = await pad.toBlob();
      const path = await api.uploadMedia(state.board.id, blob, "png");
      row = { ...base, kind: "drawing", media_path: path, color: compose.padColor, ...viewportSpot(160, 160) };
    }
    const saved = await api.addNote(row);
    if (saved.media_path) {
      // show our own upload right away without waiting on a signed URL round trip
      const local = compose.tab === "image" ? compose.photo : null;
      if (local) state.urls[saved.media_path] = URL.createObjectURL(local);
    }
    if (compose.tab === "drawing" && saved.media_path && !state.urls[saved.media_path]) state.urls[saved.media_path] = pad.lastUrl;
    await upsertNote(saved);
    closeSheet("composer");
    api.notify(state.board.id, saved.kind);
  } catch (e) {
    console.error(e); toast(e.message || "Couldn't send that");
  } finally { busy(btn, false); }
}

async function compressImage(file, max = 1280, quality = 0.82) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("That file isn't an image I can read")); i.src = url; });
    const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
    const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, "image/jpeg", quality));
  } finally { URL.revokeObjectURL(url); }
}

// ---------------------------------------------------------------- drawing pad
const pad = (() => {
  const canvas = $("#pad"), ctx = canvas.getContext("2d");
  let strokes = [], current = null, color = PENS[0], size = SIZES[1], erasing = false;
  const S = canvas.width; // 600 internal px
  const api_ = {
    lastUrl: null,
    reset() { strokes = []; current = null; redraw(); },
    fit() { /* canvas is CSS-sized; nothing to do */ },
    isEmpty() { return !visibleStrokes().some((s) => !s.erase); },
    undo() { strokes.pop(); redraw(); },
    clear() { if (strokes.length) { strokes.push({ clear: true }); redraw(); } },
    setColor(c) { color = c; erasing = false; syncTools(); },
    setSize(s) { size = s; },
    toggleEraser() { erasing = !erasing; syncTools(); },
    toBlob() {
      return new Promise((res) => canvas.toBlob((b) => { api_.lastUrl = URL.createObjectURL(b); res(b); }, "image/png"));
    },
  };
  function visibleStrokes() {
    const i = strokes.map((s) => !!s.clear).lastIndexOf(true);
    return strokes.slice(i + 1);
  }
  function drawStroke(s) {
    const p = s.points; if (!p.length) return;
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.strokeStyle = s.color; ctx.fillStyle = s.color;
    ctx.lineWidth = s.size * 2 * (s.erase ? 1.6 : 1); ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0], p[0][1], ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); return; }
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
      ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
    }
    const l = p[p.length - 1]; ctx.lineTo(l[0], l[1]); ctx.stroke();
  }
  function redraw() {
    ctx.globalCompositeOperation = "source-over"; ctx.clearRect(0, 0, S, S);
    for (const s of visibleStrokes()) drawStroke(s);
    if (current) drawStroke(current);
    ctx.globalCompositeOperation = "source-over";
  }
  function pt(e) {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * S, ((e.clientY - r.top) / r.height) * S];
  }
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    current = { color, size, erase: erasing, points: [pt(e)] }; redraw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!current) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) current.points.push(pt(ev));
    redraw();
  });
  const end = () => { if (current) { strokes.push(current); current = null; redraw(); } };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  function syncTools() {
    document.querySelectorAll("#penColors .pen").forEach((b) => b.setAttribute("aria-pressed", String(!erasing && b.dataset.c === color)));
    $("#eraserBtn").setAttribute("aria-pressed", String(erasing));
  }
  // build tools
  const pens = $("#penColors");
  for (const c of PENS) {
    const b = document.createElement("button"); b.className = "pen"; b.type = "button"; b.dataset.c = c; b.style.background = c;
    b.setAttribute("aria-label", "Pen color " + c); b.onclick = () => api_.setColor(c); pens.appendChild(b);
  }
  const sizes = $("#penSizes");
  SIZES.forEach((sz, i) => {
    const b = document.createElement("button"); b.className = "size"; b.type = "button"; b.setAttribute("aria-label", ["Small", "Medium", "Large"][i] + " brush");
    b.innerHTML = `<span style="width:${4 + i * 5}px;height:${4 + i * 5}px"></span>`;
    b.setAttribute("aria-pressed", String(sz === size));
    b.onclick = () => { api_.setSize(sz); sizes.querySelectorAll(".size").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); };
    sizes.appendChild(b);
  });
  syncTools();
  return api_;
})();

// ---------------------------------------------------------------- settings
function openSettings() {
  // themes
  const tp = $("#themePicker"); tp.innerHTML = "";
  const cur = document.documentElement.dataset.theme;
  for (const t of THEMES) {
    const b = document.createElement("button"); b.className = "theme-card"; b.type = "button";
    b.setAttribute("aria-pressed", String(t.id === cur));
    b.innerHTML = `<div class="sw" style="background:${t.bg}">${t.notes.map((c) => `<i style="background:${c}"></i>`).join("")}</div><b>${t.name}</b>`;
    b.onclick = () => { applyTheme(t.id); tp.querySelectorAll(".theme-card").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); rebuildAllNotes(); };
    tp.appendChild(b);
  }
  $("#settingsCode").textContent = fmtCode(state.board?.code);
  $("#settingsName").value = state.me?.name || "";
  swatchRow($("#settingsSwatches"), state.me?.color, async (c) => {
    state.me.color = c;
    try { await api.updateProfile({ color: c }); await refreshMembers(); } catch (e) { toast(e.message); }
  }, "bright");
  renderMemberList();
  renderNotifStatus();
  openSheet("settings");
}

function rebuildAllNotes() {
  for (const n of state.notes.values()) { const el = noteEl(n.id); if (el) { buildNoteContent(n, el); placeNote(el, n); } }
}

function renderMemberList() {
  const ul = $("#memberList"); if (!ul) return; ul.innerHTML = "";
  for (const m of state.members) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="chip" style="background:${BRIGHT[m.color] || BRIGHT.c1}"></span><span></span>`;
    li.querySelector(".chip").textContent = (m.name || "?").slice(0, 1).toUpperCase();
    li.querySelector("span:last-child").textContent = m.name + (m.id === state.me?.id ? " (you)" : "");
    if (m.id !== state.me?.id) {
      const b = document.createElement("button"); b.className = "btn small danger"; b.textContent = "Remove";
      b.onclick = async () => {
        if (!confirm(`Remove ${m.name} from this board? They'd need the code to rejoin.`)) return;
        try { await api.removeMember(state.board.id, m.id); await refreshMembers(); } catch (e) { toast(e.message); }
      };
      li.appendChild(b);
    }
    ul.appendChild(li);
  }
}

async function shareCode() {
  const code = fmtCode(state.board?.code);
  const text = `Join my board on Stuck on You with code ${code}`;
  try {
    if (navigator.share) await navigator.share({ title: "Stuck on You", text, url: location.href.split("#")[0] });
    else { await navigator.clipboard.writeText(code); toast("Code copied"); }
  } catch { /* user cancelled */ }
}

// ---------------------------------------------------------------- notifications
function notifSupport() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    if (isIOS && !isStandalone()) return "install";
    return "unsupported";
  }
  if (!isDemo && !("PushManager" in window)) return isIOS && !isStandalone() ? "install" : "unsupported";
  if (isIOS && !isStandalone()) return "install";
  return "ok";
}

function renderNotifStatus() {
  const st = $("#notifStatus"), btn = $("#notifBtn"), hint = $("#notifHint");
  hint.hidden = true; btn.hidden = false;
  const sup = notifSupport();
  if (sup === "install") {
    st.textContent = "Add to Home Screen first";
    hint.textContent = "On iPhone: tap the Share button in Safari, choose \"Add to Home Screen\", then open Stuck on You from your home screen and turn notifications on here.";
    hint.hidden = false; btn.hidden = true; return;
  }
  if (sup === "unsupported") { st.textContent = "Not supported in this browser"; btn.hidden = true; return; }
  if (!api.pushReady()) { st.textContent = "Not set up yet (see SETUP.md)"; btn.hidden = true; return; }
  const p = Notification.permission;
  if (p === "granted") { st.textContent = "On"; btn.textContent = "Send test"; }
  else if (p === "denied") {
    st.textContent = "Blocked";
    hint.textContent = isIOS ? "Turn them back on in iPhone Settings > Notifications > Stuck on You." : "Turn them back on in your phone's settings for this app (long-press the icon > App info > Notifications).";
    hint.hidden = false; btn.hidden = true;
  } else { st.textContent = "Off"; btn.textContent = "Turn on"; }
}

async function onNotifBtn() {
  if (Notification.permission === "granted") {
    if (isDemo) return localNotify("Notifications are working 🎉");
    const btn = $("#notifBtn"); busy(btn, true, "Sending…");
    await refreshPushSubscription(true);
    const r = await api.notify(state.board.id, "text", true);
    busy(btn, false);
    if (!r) toast("No answer from the server");
    else if (r.error) toast("Server error: " + r.error, 6000);
    else if (!r.devices) toast("This phone isn't registered yet. Turn notifications off and on in your phone settings, then try again.", 6000);
    else if (r.sent) toast(`Test sent. It should pop up in a few seconds.`);
    else toast("Push service refused it: " + (r.failures || []).join("; "), 8000);
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") { await refreshPushSubscription(true); toast("Notifications on. Tap Test to check."); }
  renderNotifStatus();
}

async function refreshPushSubscription(force = false) {
  try {
    if (isDemo || notifSupport() !== "ok" || !api.pushReady()) return;
    if (Notification.permission !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const key = b64uToBytes(CONFIG.vapidPublicKey);
    let sub = await reg.pushManager.getSubscription();
    // if the keys were regenerated, the old subscription is useless: replace it
    const old = sub && sub.options && sub.options.applicationServerKey ? new Uint8Array(sub.options.applicationServerKey) : null;
    if (sub && old && (old.length !== key.length || old.some((b, i) => b !== key[i]))) { await sub.unsubscribe(); sub = null; }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await api.savePushSub(sub.toJSON());
  } catch (e) { console.warn("push subscribe failed", e); if (force) toast("Couldn't turn on notifications: " + e.message); }
}

async function localNotify(body) {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("Stuck on You", { body, icon: "icons/icon-192.png", tag: "soy-note" });
  } catch { toast(body); }
}

function clearBadge() { if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {}); }

function b64uToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

// ---------------------------------------------------------------- wiring
function wireStatic() {
  $("#welcomeGo").onclick = onWelcome;
  $("#nameInput").addEventListener("keydown", (e) => e.key === "Enter" && onWelcome());
  $("#createBoard").onclick = onCreateBoard;
  $("#joinBoard").onclick = onJoinBoard;
  $("#codeInput").addEventListener("input", (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    e.target.value = raw.length > 4 ? raw.slice(0, 4) + "-" + raw.slice(4) : raw;
  });
  $("#fab").onclick = openComposer;
  $("#composerCancel").onclick = () => closeSheet("composer");
  $("#composerBackdrop").onclick = () => closeSheet("composer");
  $("#composerSend").onclick = sendCompose;
  document.querySelectorAll("#composerTabs button").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));

  swatchRow($("#textSwatches"), compose.color, (c) => { compose.color = c; paintPaper($("#textPreview"), c); });
  paintPaper($("#textPreview"), compose.color);
  swatchRow($("#padSwatches"), compose.padColor, (c) => { compose.padColor = c; paintPaper($("#padWrap"), c); });
  paintPaper($("#padWrap"), compose.padColor);

  const grid = $("#emojiGrid");
  for (const em of EMOJIS) {
    const b = document.createElement("button"); b.type = "button"; b.textContent = em; b.setAttribute("aria-pressed", String(em === compose.emoji));
    b.onclick = () => { compose.emoji = em; $("#emojiCustom").value = ""; $("#emojiHero").textContent = em; grid.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); };
    grid.appendChild(b);
  }
  $("#emojiCustom").addEventListener("input", (e) => { $("#emojiHero").textContent = e.target.value.trim() || compose.emoji; });

  $("#photoInput").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      compose.photo = await compressImage(f);
      const p = $("#photoPreview"); p.src = URL.createObjectURL(compose.photo); p.hidden = false; $("#photoHint").hidden = true;
    } catch (err) { toast(err.message); }
  });

  $("#undoBtn").onclick = () => pad.undo();
  $("#clearBtn").onclick = () => pad.clear();
  $("#eraserBtn").onclick = () => pad.toggleEraser();

  $("#detailClose").onclick = () => closeSheet("detail");
  $("#detailBackdrop").onclick = () => closeSheet("detail");
  $("#detailRemove").onclick = removeDetail;
  $("#detailFront").onclick = frontDetail;

  $("#openSettings").onclick = openSettings;
  $("#settingsClose").onclick = () => closeSheet("settings");
  $("#settingsBackdrop").onclick = () => closeSheet("settings");
  $("#shareCode").onclick = shareCode;
  $("#waitShare").onclick = shareCode;
  $("#notifBtn").onclick = onNotifBtn;
  $("#saveName").onclick = async () => {
    const name = $("#settingsName").value.trim(); if (!name) return;
    try { await api.updateProfile({ name }); state.me.name = name; await refreshMembers(); toast("Saved"); } catch (e) { toast(e.message); }
  };

  window.addEventListener("resize", () => { if (state.board) layoutBoard(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.board) { resync().catch(() => {}); refreshMembers().catch(() => {}); clearBadge(); }
    if (document.visibilityState === "hidden") markSeen();
  });
  window.addEventListener("pagehide", markSeen);
}

boot();