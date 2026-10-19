// Pinned: shared sticky-note board for two
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
const REACTIONS = ["❤️", "😂", "🥺", "😍", "🔥", "👍"];
const FEELINGS = [["think", "💭", "Thinking of you"], ["miss", "🥺", "Miss you"], ["love", "❤️", "Love you"],
  ["hug", "🤗", "Hug"], ["morning", "☀️", "Good morning"], ["night", "🌙", "Good night"]];
const MOODS = [["mood_happy", "😊", "Happy"], ["mood_chill", "😌", "Chill"], ["mood_excited", "🤩", "Excited"],
  ["mood_tired", "😴", "Tired"], ["mood_stressed", "😣", "Stressed"], ["mood_sad", "😢", "Down"]];
const PING_TEXT = {
  think: "is thinking of you 💭", miss: "misses you 🥺", love: "loves you ❤️", hug: "sent you a hug 🤗",
  morning: "says good morning ☀️", night: "says good night 🌙",
  mood_happy: "is feeling happy 😊", mood_chill: "is feeling chill 😌", mood_excited: "is feeling excited 🤩",
  mood_tired: "is feeling tired 😴", mood_stressed: "is feeling stressed 😣", mood_sad: "is feeling down 😢",
};
const PING_EMOJI = Object.fromEntries([...FEELINGS, ...MOODS].map(([k, e]) => [k, e]));
const MUTE_TYPES = [["reaction", "Reactions"], ["reply", "Replies"], ["ping", "Check-ins"],
  ["answer", "Daily question answers"], ["doodle", "Draw-together invites"]];
const QUESTIONS = [
  "What's a small thing I do that makes your day better?", "If we could teleport anywhere for one day, where would we go?",
  "What song reminds you of us?", "What's your favorite memory of us so far?", "What's something you've never told me but want to?",
  "What would our perfect lazy Sunday look like?", "What's one thing you want us to try together this year?",
  "What did you think of me when we first met?", "What's your comfort food after a long day?",
  "If our relationship had a theme song, what would it be?", "What's a dream you haven't told many people about?",
  "What makes you feel most loved?", "What's the best date we've been on?", "What made you laugh today?",
  "Where do you see us in five years?", "What's a habit of mine you secretly find cute?", "What's one thing you're proud of this week?",
  "If we started a business together, what would it be?", "What's your favorite way to spend time with me?",
  "What's a place from your childhood you'd love to show me?", "What movie should we watch together next?",
  "What's something you're looking forward to?", "What's a little thing that always cheers you up?",
  "If you could relive one day with me, which would it be?", "What's one thing I could do to support you more?",
  "What's your favorite thing about yourself?", "What smell instantly takes you back somewhere?",
  "What would you name our future pet?", "What's a goal you want us to reach together?",
  "What's the most spontaneous thing you'd want to do with me?", "What's your love language, honestly?",
  "What's a fear you'd like to get over?", "What's your favorite photo of us and why?", "What's something new you learned recently?",
  "If you could have any superpower for a day, what would it be?", "What's the best compliment you've ever gotten?",
  "What would your perfect birthday look like?", "What's one word that describes us?", "What's a tradition you'd like us to start?",
  "What's something that always makes you think of me?", "If we wrote a book about us, what would the title be?",
  "What's a food you want us to cook together?", "What made you smile the most this week?", "What's one thing on your bucket list?",
  "How do you like to be comforted when you're sad?", "What's your favorite season and why?", "What's a song you've had on repeat lately?",
  "What's something you wish we did more often?", "What's one thing you admire about me?", "What would a perfect day off look like for you?",
  "What's the weirdest dream you remember?", "If we could live in any city, which would it be?", "What's a small win you had today?",
  "What's a hobby you'd love to pick up?", "What's your go-to karaoke song?", "What's a memory that always makes you laugh?",
  "What's one thing you're grateful for right now?", "What's a trip we should plan next?", "What does home feel like to you?",
  "What's something you want me to know today?",
];

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
const isScheduled = (n) => !!n.show_at && new Date(n.show_at).getTime() > Date.now();
const fmtWhen = (iso) => new Date(iso).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
const pad2 = (x) => String(x).padStart(2, "0");
const localDateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toLocalInput = (d) => `${localDateKey(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

// ================================================================ backends
// Both backends expose the same async interface.

function createSupabaseApi() {
  let sb, session, channel, extras, liveCh;
  const bucket = () => sb.storage.from("board-media");
  const urlCache = new Map();
  const must = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  const myId = () => session?.user?.id;

  return {
    async init() {
      // read what the email link put in the address before supabase-js tidies it away
      const q = new URLSearchParams(location.search);
      const h = new URLSearchParams(location.hash.slice(1));
      const handoff = q.get("handoff");
      const cameFromLink = h.has("access_token") || q.has("code") || h.has("error_description") || q.has("error_description");
      const linkError = h.get("error_description") || q.get("error_description");

      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      session = (await sb.auth.getSession()).data.session;
      sb.auth.onAuthStateChange((_e, s) => { session = s; });
      if (cameFromLink || handoff) history.replaceState(null, "", location.pathname);

      if (linkError) return { linkError: linkError.replace(/\+/g, " ") };
      if (handoff && session && cameFromLink) {
        // pass this sign-in to the app that asked for it, then forget it here
        await sb.rpc("put_handoff", { p_nonce: handoff, p_access: session.access_token, p_refresh: session.refresh_token });
        if (!isStandalone()) {
          sb.auth.stopAutoRefresh();
          Object.keys(localStorage).filter((k) => k.startsWith("sb-")).forEach((k) => localStorage.removeItem(k));
          session = null;
          return { landing: "linked" };
        }
      }
      return {};
    },
    hasSession: () => !!session,
    async sendLink(email, nonce) {
      const base = location.origin + location.pathname;
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${base}?handoff=${nonce}`, shouldCreateUser: true } });
      if (error) throw new Error(/rate|limit/i.test(error.message) ? "Too many emails sent. Wait a bit and try again." : error.message);
    },
    async claimHandoff(nonce) {
      const { data, error } = await sb.rpc("claim_handoff", { p_nonce: nonce });
      if (error || !data) return false;
      const res = await sb.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      if (res.error) throw new Error(res.error.message);
      session = res.data.session;
      return true;
    },
    async account() {
      const { data } = await sb.auth.getUser();
      const u = data.user || session?.user || {};
      return { email: u.email || null, pending: u.new_email || null, anonymous: !!u.is_anonymous || !u.email };
    },
    async linkEmail(email) {
      const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: location.origin + location.pathname });
      if (error) throw new Error(error.message);
    },
    async signOut() {
      try {
        const reg = await navigator.serviceWorker?.ready;
        const sub = await reg?.pushManager?.getSubscription();
        if (sub) { await sb.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
      } catch { /* ignore */ }
      await sb.auth.signOut({ scope: "local" });
      session = null;
    },
    async me() {
      if (!session) return null;
      // "muted" arrives with the v2 database upgrade; fall back if it isn't there yet
      let res = await sb.from("profiles").select("id,name,color,muted").eq("id", myId());
      if (res.error) res = await sb.from("profiles").select("id,name,color").eq("id", myId());
      const rows = must(res);
      return rows[0] || null;
    },
    async signIn(name, color) {
      if (!session) throw new Error("Please sign in with your email first.");
      must(await sb.from("profiles").upsert({ id: myId(), name, color }));
      return { id: myId(), name, color, muted: [] };
    },
    async updateProfile(patch) {
      must(await sb.from("profiles").update(patch).eq("id", myId()));
    },
    async myBoard() {
      const rows = must(await sb.from("board_members").select("board_id, boards(id, code, created_by)").eq("user_id", myId()).order("joined_at", { ascending: false }).limit(1));
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
    async leaveBoard(boardId) {
      must(await sb.from("board_members").delete().eq("board_id", boardId).eq("user_id", myId()));
    },
    async deleteBoard(boardId) {
      // photos, drawings and voice notes live in storage, which doesn't cascade: clear them first
      try {
        const files = must(await bucket().list(boardId, { limit: 1000 })) || [];
        if (files.length) await bucket().remove(files.map((f) => `${boardId}/${f.name}`));
      } catch (e) { console.warn("media cleanup", e); }
      const { error } = await sb.rpc("delete_board", { b: boardId });
      if (error) throw new Error(/function .*delete_board|schema cache/i.test(error.message) ? "Run upgrade-v3.sql in Supabase first (see SETUP)." : error.message);
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
    async markSeen(ids) {
      if (ids.length) must(await sb.from("notes").update({ seen_at: new Date().toISOString() }).in("id", ids).is("seen_at", null));
    },
    async uploadMedia(boardId, blob, ext) {
      const path = `${boardId}/${uid()}.${ext}`;
      must(await bucket().upload(path, blob, { contentType: (blob.type || "").split(";")[0], upsert: false }));
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

    // reactions / replies / answers / check-ins (v2 database upgrade)
    async listReactions(boardId) { return must(await sb.from("reactions").select("note_id,user_id,emoji").eq("board_id", boardId)); },
    async addReaction(r) { must(await sb.from("reactions").insert(r)); },
    async removeReaction(noteId, emoji) { must(await sb.from("reactions").delete().eq("note_id", noteId).eq("user_id", myId()).eq("emoji", emoji)); },
    async listReplies(boardId) { return must(await sb.from("replies").select("*").eq("board_id", boardId).order("created_at")); },
    async addReply(r) { return must(await sb.from("replies").insert(r).select().single()); },
    async listAnswers(boardId, since) { return must(await sb.from("answers").select("*").eq("board_id", boardId).gte("qdate", since).order("qdate", { ascending: false })); },
    async saveAnswer(boardId, qdate, body) { must(await sb.from("answers").upsert({ board_id: boardId, user_id: myId(), qdate, body })); },
    async answerStatus(boardId, qdate) {
      const rows = must(await sb.rpc("answer_status", { b: boardId, d: qdate })) || [];
      return rows.map((x) => (typeof x === "string" ? x : x.answer_status));
    },
    async listPings(boardId) { return must(await sb.from("pings").select("*").eq("board_id", boardId).order("created_at", { ascending: false }).limit(40)); },
    async sendPing(boardId, kind) { return must(await sb.from("pings").insert({ board_id: boardId, user_id: myId(), kind }).select().single()); },

    subscribe(boardId, h) {
      if (channel) sb.removeChannel(channel);
      if (extras) sb.removeChannel(extras);
      const f = `board_id=eq.${boardId}`;
      channel = sb.channel("board-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notes", filter: f }, (p) => h.onInsert(p.new))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notes", filter: f }, (p) => h.onUpdate(p.new))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "notes" }, (p) => h.onDelete(p.old.id))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board_members", filter: f }, () => h.onMembers())
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board_members" }, () => h.onMembers())
        .subscribe();
      // the v2 tables get their own channel, so the board keeps working before the upgrade is run
      extras = sb.channel("extras-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "reactions", filter: f }, (p) => h.onReaction(p.new, false))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "reactions" }, (p) => h.onReaction(p.old, true))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "replies", filter: f }, (p) => h.onReply(p.new))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "pings", filter: f }, (p) => h.onPing(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "answers", filter: f }, () => h.onAnswer())
        .subscribe();
    },
    live(boardId, me, h) {
      if (liveCh) sb.removeChannel(liveCh);
      let presence = { name: me.name, doodling: false };
      liveCh = sb.channel("live-" + boardId, { config: { broadcast: { self: false }, presence: { key: me.id } } });
      liveCh.on("broadcast", { event: "m" }, ({ payload }) => h.onMessage(payload));
      liveCh.on("presence", { event: "sync" }, () => {
        const out = {};
        for (const [k, metas] of Object.entries(liveCh.presenceState())) out[k] = metas[metas.length - 1];
        h.onPresence(out);
      });
      liveCh.subscribe((status) => { if (status === "SUBSCRIBED") liveCh.track(presence); });
      return {
        send: (p) => liveCh.send({ type: "broadcast", event: "m", payload: p }),
        track: (p) => { presence = { ...presence, ...p }; liveCh.track(presence); },
      };
    },
    async savePushSub(sub) {
      must(await sb.from("push_subs").upsert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, user_id: myId() }));
    },
    async notify(boardId, type = "note", extra = {}) {
      try {
        const { data, error } = await sb.functions.invoke("notify", { body: { board_id: boardId, type, ...extra } });
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
  const blank = () => ({ profiles: {}, boards: {}, members: [], notes: [], media: {}, reactions: [], replies: [], answers: [], pings: [] });
  const db = () => ({ ...blank(), ...ls.get(KEY, {}) });
  const save = (d) => ls.set(KEY, d);
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("soy-demo") : null;
  // Open the app with ?as=2 in a second tab to play the other person.
  const who = new URLSearchParams(location.search).get("as") || "";
  const meId = () => { const k = "soy-demo-me" + who; let id = localStorage.getItem(k); if (!id) { id = uid(); localStorage.setItem(k, id); } return id; };
  const hiddenFromMe = (n) => isScheduled(n) && n.author_id !== meId();
  let handlers = null;
  const emit = (msg) => bc && bc.postMessage(msg);
  if (bc) bc.onmessage = (e) => {
    if (!handlers) return;
    const m = e.data;
    if (m.type === "insert" && !hiddenFromMe(m.note)) handlers.onInsert(m.note);
    if (m.type === "update" && !hiddenFromMe(m.note)) handlers.onUpdate(m.note);
    if (m.type === "delete") handlers.onDelete(m.id);
    if (m.type === "members") handlers.onMembers();
    if (m.type === "reaction") handlers.onReaction(m.row, m.del);
    if (m.type === "reply") handlers.onReply(m.row);
    if (m.type === "ping") handlers.onPing(m.row);
    if (m.type === "answer") handlers.onAnswer();
  };
  const code = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

  return {
    async init() { return {}; },
    hasSession: () => true,
    async sendLink() {},
    async claimHandoff() { return true; },
    async account() { return { email: "demo@example.com", pending: null, anonymous: false }; },
    async linkEmail() {},
    async signOut() { localStorage.removeItem("soy-demo-me" + who); },
    async me() { return db().profiles[meId()] || null; },
    async signIn(name, color) { const d = db(); d.profiles[meId()] = { id: meId(), name, color, muted: [] }; save(d); return d.profiles[meId()]; },
    async updateProfile(patch) { const d = db(); Object.assign(d.profiles[meId()], patch); save(d); emit({ type: "members" }); },
    async myBoard() { const d = db(); const m = d.members.find((x) => x.user_id === meId()); return m ? d.boards[m.board_id] : null; },
    async createBoard() { const d = db(); const b = { id: uid(), code: code(), created_by: meId() }; d.boards[b.id] = b; d.members.push({ board_id: b.id, user_id: meId() }); save(d); return b; },
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
    async leaveBoard(boardId) { return this.removeMember(boardId, meId()); },
    async deleteBoard(boardId) {
      const d = db(); const b = d.boards[boardId];
      const mine = d.members.filter((m) => m.board_id === boardId);
      if (!b || !(b.created_by === meId() || (mine.length === 1 && mine[0].user_id === meId()))) throw new Error("Only the person who made this board can delete it. You can leave it instead.");
      delete d.boards[boardId];
      for (const n of d.notes) if (n.board_id === boardId && n.media_path) delete d.media[n.media_path];
      for (const k of ["members", "notes", "reactions", "replies", "answers", "pings"]) d[k] = d[k].filter((x) => x.board_id !== boardId);
      save(d); emit({ type: "members" });
    },
    async listNotes(boardId) { return db().notes.filter((n) => n.board_id === boardId && !hiddenFromMe(n)).sort((a, b) => a.z - b.z); },
    async addNote(n) { const d = db(); const row = { pinned: false, ...n, id: uid(), created_at: new Date().toISOString() }; d.notes.push(row); save(d); emit({ type: "insert", note: row }); return row; },
    async updateNote(id, patch) { const d = db(); const n = d.notes.find((x) => x.id === id); if (!n) return; Object.assign(n, patch); save(d); emit({ type: "update", note: n }); },
    async deleteNote(n) {
      const d = db(); d.notes = d.notes.filter((x) => x.id !== n.id); if (n.media_path) delete d.media[n.media_path];
      d.reactions = d.reactions.filter((r) => r.note_id !== n.id); d.replies = d.replies.filter((r) => r.note_id !== n.id);
      save(d); emit({ type: "delete", id: n.id });
    },
    async markSeen(ids) {
      const d = db(); const now = new Date().toISOString();
      for (const n of d.notes) if (ids.includes(n.id) && !n.seen_at) { n.seen_at = now; emit({ type: "update", note: n }); }
      save(d);
    },
    async uploadMedia(boardId, blob, ext) {
      const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      const path = `${boardId}/${uid()}.${ext}`; const d = db(); d.media[path] = dataUrl; save(d); return path;
    },
    async mediaUrls(paths) { const d = db(); return Object.fromEntries(paths.map((p) => [p, d.media[p]])); },
    async listReactions(boardId) { return db().reactions.filter((r) => r.board_id === boardId); },
    async addReaction(r) { const d = db(); d.reactions.push(r); save(d); emit({ type: "reaction", row: r, del: false }); },
    async removeReaction(noteId, emoji) {
      const d = db(); const row = { note_id: noteId, user_id: meId(), emoji };
      d.reactions = d.reactions.filter((r) => !(r.note_id === noteId && r.user_id === meId() && r.emoji === emoji)); save(d);
      emit({ type: "reaction", row, del: true });
    },
    async listReplies(boardId) { return db().replies.filter((r) => r.board_id === boardId); },
    async addReply(r) { const d = db(); const row = { ...r, id: uid(), created_at: new Date().toISOString() }; d.replies.push(row); save(d); emit({ type: "reply", row }); return row; },
    async listAnswers(boardId, since) {
      const d = db(); const mine = new Set(d.answers.filter((a) => a.board_id === boardId && a.user_id === meId()).map((a) => a.qdate));
      return d.answers.filter((a) => a.board_id === boardId && a.qdate >= since && (a.user_id === meId() || mine.has(a.qdate)))
        .sort((a, b) => (a.qdate < b.qdate ? 1 : -1));
    },
    async saveAnswer(boardId, qdate, body) {
      const d = db(); d.answers = d.answers.filter((a) => !(a.board_id === boardId && a.user_id === meId() && a.qdate === qdate));
      d.answers.push({ board_id: boardId, user_id: meId(), qdate, body, created_at: new Date().toISOString() }); save(d); emit({ type: "answer" });
    },
    async answerStatus(boardId, qdate) { return db().answers.filter((a) => a.board_id === boardId && a.qdate === qdate).map((a) => a.user_id); },
    async listPings(boardId) { return db().pings.filter((p) => p.board_id === boardId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 40); },
    async sendPing(boardId, kind) { const d = db(); const row = { id: uid(), board_id: boardId, user_id: meId(), kind, created_at: new Date().toISOString() }; d.pings.push(row); save(d); emit({ type: "ping", row }); return row; },
    subscribe(boardId, h) { handlers = h; },
    live(boardId, me, h) {
      const ch = "BroadcastChannel" in window ? new BroadcastChannel("soy-live-" + boardId) : null;
      const peers = {}; let presence = { name: me.name, doodling: false };
      const pub = () => h.onPresence({ ...peers, [me.id]: presence });
      const post = (m) => ch && ch.postMessage({ ...m, from: me.id });
      if (ch) ch.onmessage = (e) => {
        const m = e.data; if (m.from === me.id) return;
        if (m.k === "m") h.onMessage(m.p);
        if (m.k === "pres") { peers[m.from] = m.p; pub(); if (m.ask) post({ k: "pres", p: presence }); }
        if (m.k === "bye") { delete peers[m.from]; pub(); }
      };
      post({ k: "pres", p: presence, ask: true });
      addEventListener("pagehide", () => post({ k: "bye" }));
      pub();
      return { send: (p) => post({ k: "m", p }), track: (p) => { presence = { ...presence, ...p }; post({ k: "pres", p: presence }); pub(); } };
    },
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
  notes: new Map(),      // id -> note row
  reactions: new Map(),  // note id -> [{user_id, emoji}]
  replies: new Map(),    // note id -> [reply rows]
  pings: [],             // newest first
  presence: {},
  urls: {},              // media path -> url
  scale: 1,
  dragId: null,
  lastSeen: ls.get("soy-last-seen", 0),
  v2: true,              // false when the v2 database upgrade hasn't been run
};
let live = null;

// ================================================================ ui helpers
let toastTimer;
function toast(msg, ms = 2600) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), ms);
}
function show(id) { for (const s of ["#login", "#linked", "#welcome", "#pair", "#boardScreen"]) $(s).hidden = s !== id; }
function setError(el, msg) { el.textContent = msg || ""; el.hidden = !msg; }
function busy(btn, on, label) {
  if (on) { btn.dataset.label = btn.textContent; btn.textContent = label || "…"; btn.disabled = true; }
  else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
}
function needsUpgrade() { toast("This needs the latest database update. Run upgrade-v2.sql in Supabase (see SETUP).", 5000); }

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
function partner() { return state.members.find((m) => m.id !== state.me?.id); }
function nameOf(id) { return id === state.me?.id ? "you" : (memberById(id)?.name || "someone"); }
function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (s < 45) return "just now";
  if (s < 3600) return rtf.format(-Math.round(s / 60), "minute");
  if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
  return rtf.format(-Math.round(s / 86400), "day");
}

// floating emoji burst
function rain(emoji, count = 12) {
  const fx = $("#fx");
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = emoji;
    s.style.left = Math.random() * 92 + "%";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    s.style.fontSize = 24 + Math.random() * 22 + "px";
    s.style.setProperty("--r", (Math.random() * 60 - 30) + "deg");
    fx.appendChild(s);
    setTimeout(() => s.remove(), 3600);
  }
}

// ================================================================ boot
async function boot() {
  applyTheme(ls.get("soy-theme", "cork"));
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW failed", e));
  }
  let init = {};
  try { init = (await api.init()) || {}; } catch (e) { toast("Couldn't reach the server. Check your connection."); console.error(e); }
  $("#demoBanner").hidden = !isDemo;
  wireStatic();
  if (init.landing === "linked") return show("#linked");
  if (!api.hasSession()) return showLogin(init.linkError);
  await afterLogin();
}

async function afterLogin() {
  try {
    state.me = await api.me();
    if (!state.me) return showWelcome();
    state.me.muted = state.me.muted || [];
    const board = await api.myBoard();
    if (!board) return showPair();
    await openBoard(board);
  } catch (e) {
    console.error(e); toast(e.message || "Something went wrong");
    showWelcome();
  }
}

// ---------------------------------------------------------------- email login
let pollTimer = null;
const PENDING = "soy-login-pending";
function newNonce() {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
function showLogin(err) {
  show("#login");
  const p = ls.get(PENDING);
  if (p && Date.now() - p.ts < 15 * 60 * 1000) showWaiting(p);
  else { ls.set(PENDING, null); $("#loginForm").hidden = false; $("#loginWait").hidden = true; }
  if (err) setError($("#loginError"), /expired|invalid/i.test(err) ? "That link expired or was already used. Send a new one." : err);
}
function showWaiting(p) {
  $("#loginForm").hidden = true; $("#loginWait").hidden = false;
  $("#waitEmail").textContent = p.email;
  startPolling(p.nonce);
}
async function onSendLink(again = false) {
  const email = (again ? (ls.get(PENDING) || {}).email : $("#emailInput").value || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError($("#loginError"), "That email doesn't look right.");
  setError($("#loginError"));
  const btn = again ? $("#resendLink") : $("#sendLink"); busy(btn, true, "Sending…");
  try {
    const p = { email, nonce: newNonce(), ts: Date.now() };
    await api.sendLink(email, p.nonce);
    ls.set(PENDING, p);
    showWaiting(p);
    if (again) toast("Sent a new link. Use the newest email.");
  } catch (e) { setError($("#loginError"), e.message); }
  busy(btn, false);
}
function startPolling(nonce) {
  clearInterval(pollTimer);
  const tick = async () => {
    try {
      if (await api.claimHandoff(nonce)) {
        clearInterval(pollTimer); pollTimer = null; ls.set(PENDING, null);
        toast("Signed in");
        await afterLogin();
      }
    } catch (e) { setError($("#loginError"), e.message); }
  };
  pollTimer = setInterval(tick, 3000);
  tick();
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
let ticker = null;
const boardHandlers = () => ({
  onInsert: (n) => { upsertNote(n, true); markPartnerSeen(); },
  onUpdate: (n) => { if (state.dragId !== n.id) upsertNote(n); },
  onDelete: (id) => removeNoteEl(id),
  onMembers: () => refreshMembers(),
  onReaction: onReactionEvent,
  onReply: onReplyEvent,
  onPing: onPingEvent,
  onAnswer: () => refreshQuestionDot(),
});

// Phones pause backgrounded web apps and drop their live connection.
// When the app comes back, reconnect and pull anything that was missed (including "seen" ticks).
let lastResume = 0, hiddenAt = 0;
function onResume(force = false) {
  if (!state.board || document.visibilityState !== "visible") return;
  if (!force && Date.now() - lastResume < 3000) return;
  lastResume = Date.now();
  if (hiddenAt && Date.now() - hiddenAt > 20000) api.subscribe(state.board.id, boardHandlers());
  hiddenAt = 0;
  resync().catch(() => {});
  refreshMembers().catch(() => {});
  refreshQuestionDot();
  clearBadge();
}
async function openBoard(board) {
  state.board = board;
  show("#boardScreen");
  layoutBoard();
  await refreshMembers();
  await resync();
  api.subscribe(board.id, boardHandlers());
  live = api.live(board.id, state.me, { onMessage: onLiveMessage, onPresence: onPresence });
  refreshPushSubscription();
  refreshQuestionDot();
  clearBadge();
  // keep countdowns and scheduled notes current; pick up scheduled notes as their time comes
  clearInterval(ticker);
  let n = 0;
  ticker = setInterval(() => {
    tickNotes();
    if (document.visibilityState === "visible") resync().catch(() => {});
  }, 30000);
}

async function resync() {
  if (!state.board) return;
  const rows = await api.listNotes(state.board.id);
  const ids = new Set(rows.map((r) => r.id));
  for (const id of [...state.notes.keys()]) if (!ids.has(id)) removeNoteEl(id);
  await loadUrls(rows);
  await loadExtras();
  for (const r of rows) upsertNote(r);
  updateEmpty();
  markPartnerSeen();
}

async function loadExtras() {
  try {
    const [rs, reps, pings] = await Promise.all([api.listReactions(state.board.id), api.listReplies(state.board.id), api.listPings(state.board.id)]);
    state.reactions = groupBy(rs, "note_id");
    state.replies = groupBy(reps, "note_id");
    state.pings = pings;
    state.v2 = true;
    renderChips();
  } catch (e) {
    if (state.v2) console.warn("v2 tables not ready", e.message);
    state.v2 = false;
  }
}

function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) { if (!m.has(r[key])) m.set(r[key], []); m.get(r[key]).push(r); }
  return m;
}

async function loadUrls(rows) {
  const paths = rows.map((r) => r.media_path).filter((p) => p && !state.urls[p]);
  if (paths.length) Object.assign(state.urls, await api.mediaUrls(paths));
}

async function refreshMembers() {
  if (!state.board) return;
  state.members = await api.members(state.board.id);
  if (state.me && !state.members.some((m) => m.id === state.me.id)) {
    // removed from the board, or it was deleted
    if (leaving) return;
    resetBoardState();
    toast("This board was deleted, or you were removed from it");
    return showPair();
  }
  renderChips();
  const waiting = state.members.length < 2;
  $("#waitBanner").hidden = !waiting;
  $("#waitCode").textContent = fmtCode(state.board.code);
  renderMemberList();
  for (const n of state.notes.values()) { const el = noteEl(n.id); if (el) decorate(el, n); }
}

function latestMood(userId) {
  const p = state.pings.find((x) => x.user_id === userId && x.kind.startsWith("mood_"));
  return p && Date.now() - new Date(p.created_at).getTime() < 24 * 3600 * 1000 ? PING_EMOJI[p.kind] : null;
}

function renderChips() {
  const chips = $("#memberChips"); chips.innerHTML = "";
  for (const m of state.members) {
    const c = document.createElement("span");
    c.className = "chip"; c.style.background = BRIGHT[m.color] || BRIGHT.c1; c.textContent = (m.name || "?").slice(0, 1).toUpperCase();
    c.title = m.name;
    const mood = latestMood(m.id);
    if (mood) { const i = document.createElement("i"); i.className = "mood"; i.textContent = mood; c.appendChild(i); }
    chips.appendChild(c);
  }
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

function noteEl(id) { return document.querySelector(`#board .note[data-id="${CSS.escape(id)}"]`); }

function paintPaper(el, c) {
  c = c || "c1";
  el.style.setProperty("--paper", `var(--n${c.slice(1)})`);
  el.style.setProperty("--paper-bright", BRIGHT[c]);
  el.style.setProperty("--strip", BRIGHT[c]);
}

function hashNum(s, i) { let h = 2166136261; for (const ch of s + i) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967295; }
const fmtDur = (s) => `${Math.floor(s / 60)}:${pad2(Math.round(s % 60))}`;

function countdownParts(meta) {
  const t = new Date(meta?.target || Date.now()).getTime();
  const ms = t - Date.now(); const title = meta?.title || "";
  const plural = (n, one, many) => `${n === 1 ? one : many}`;
  if (ms > 0) {
    if (meta?.allDay || ms >= 864e5) {
      const d = meta?.allDay ? Math.ceil(ms / 864e5) : Math.floor(ms / 864e5);
      return { big: d, unit: plural(d, "day until", "days until"), title };
    }
    const h = Math.floor(ms / 36e5);
    if (h >= 1) return { big: h, unit: plural(h, "hour until", "hours until"), title };
    const m = Math.max(1, Math.ceil(ms / 6e4));
    return { big: m, unit: plural(m, "minute until", "minutes until"), title };
  }
  const since = -ms / 864e5;
  if (since < 1) return { big: "🎉", unit: "it's here!", title };
  const d = Math.floor(since);
  return { big: d, unit: plural(d, "day since", "days since"), title };
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
  } else if (n.kind === "voice") {
    const row = document.createElement("div"); row.className = "vrow";
    row.innerHTML = `<div class="play">▶</div><div class="wave"></div>`;
    const wave = row.querySelector(".wave");
    for (let i = 0; i < 16; i++) { const b = document.createElement("i"); b.style.height = 6 + hashNum(n.id, i) * 24 + "px"; wave.appendChild(b); }
    el.appendChild(row);
    const d = document.createElement("div"); d.className = "dur"; d.textContent = "Voice note · " + fmtDur(n.meta?.duration || 0); el.appendChild(d);
  } else if (n.kind === "countdown") {
    const p = countdownParts(n.meta);
    el.innerHTML = `<div class="cd-big"></div><div class="cd-unit"></div><div class="cd-title"></div>`;
    el.querySelector(".cd-big").textContent = p.big;
    el.querySelector(".cd-unit").textContent = p.unit;
    el.querySelector(".cd-title").textContent = p.title;
  }
  const from = document.createElement("div"); from.className = "from"; el.appendChild(from);
  decorate(el, n);
}

// author label, seen tick, schedule time, pin, reaction and reply badges
function decorate(el, n) {
  const who = memberById(n.author_id);
  el.style.setProperty("--who", BRIGHT[who?.color] || BRIGHT.c1);
  el.classList.toggle("pinned", !!n.pinned);
  const sched = isScheduled(n);
  el.classList.toggle("scheduled", sched);
  el.querySelector(".badges")?.remove();
  el.querySelector(".pinmark")?.remove();
  const f = el.querySelector(".from");
  if (f) {
    f.classList.remove("seen");
    if (n.author_id !== state.me?.id) f.textContent = who?.name || "";
    else if (sched) f.textContent = "⏰ " + fmtWhen(n.show_at);
    else if (n.seen_at) { f.textContent = "✓ Seen"; f.classList.add("seen"); }
    else f.textContent = "";
  }
  if (n.pinned) { const p = document.createElement("div"); p.className = "pinmark"; p.textContent = "📌"; el.appendChild(p); }
  const rs = state.reactions.get(n.id) || [], reps = state.replies.get(n.id) || [];
  if (rs.length || reps.length) {
    const b = document.createElement("div"); b.className = "badges";
    if (rs.length) {
      const s = document.createElement("span"); s.className = "badge";
      s.textContent = [...new Set(rs.map((r) => r.emoji))].slice(0, 3).join("") + (rs.length > 1 ? " " + rs.length : "");
      b.appendChild(s);
    }
    if (reps.length) { const s = document.createElement("span"); s.className = "badge"; s.textContent = "💬 " + reps.length; b.appendChild(s); }
    el.appendChild(b);
  }
}

function redecorate(id) { const n = state.notes.get(id), el = noteEl(id); if (n && el) decorate(el, n); }

function placeNote(el, n) {
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
  const base = Math.max(1, Math.floor((n.z || 0) / 1000) % 1000000000);
  el.style.zIndex = String(n.pinned ? 1000000000 + base : base);
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
  } else if (!prev || prev.body !== n.body || prev.color !== n.color || prev.media_path !== n.media_path || JSON.stringify(prev.meta) !== JSON.stringify(n.meta)) {
    buildNoteContent(n, el);
  } else decorate(el, n);
  placeNote(el, n);
  const isPartner = n.author_id !== state.me?.id;
  if (isPartner && new Date(n.show_at || n.created_at).getTime() > state.lastSeen) el.classList.add("fresh");
  if (fromRealtime && !existed && isPartner) {
    toast(`New note from ${memberById(n.author_id)?.name || "your person"}`);
    if (isDemo && document.hidden) localNotify(`New note from ${memberById(n.author_id)?.name || "your person"}`);
  }
  if (detailId === n.id) renderDetailMeta(n);
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

// tell the other person their notes have been seen
let seenTimer = null;
function markPartnerSeen(delay = 1200) {
  clearTimeout(seenTimer);
  seenTimer = setTimeout(async () => {
    if (document.visibilityState !== "visible") return;
    const ids = [...state.notes.values()].filter((n) => n.author_id !== state.me?.id && !n.seen_at && !isScheduled(n)).map((n) => n.id);
    if (!ids.length) return;
    try { await api.markSeen(ids); ids.forEach((id) => { const n = state.notes.get(id); if (n) n.seen_at = new Date().toISOString(); }); } catch { /* column missing until v2 */ }
  }, delay);
}

function tickNotes() {
  for (const n of state.notes.values()) {
    const el = noteEl(n.id); if (!el) continue;
    if (n.kind === "countdown") buildNoteContent(n, el);
    else if (n.show_at) decorate(el, n);
  }
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
    const n = state.notes.get(el.dataset.id);
    if (n?.pinned) { start = null; toast("It's pinned. Tap it and choose Unpin to move it."); return; }
    dragging = true; state.dragId = el.dataset.id;
    el.classList.add("dragging");
    el.style.zIndex = "2147483000";
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
function closeSheet(name) {
  $("#" + name).hidden = true; $("#" + name + "Backdrop").hidden = true;
  if (name === "detail") { detailId = null; if (detailAudio) { detailAudio.pause(); detailAudio = null; } }
  if (name === "together") closeTogether();
}

// ---------------------------------------------------------------- note detail
let detailId = null, detailAudio = null;
function openDetail(id) {
  const n = state.notes.get(id); if (!n) return;
  detailId = id;
  const wrap = $("#detailBody"); wrap.innerHTML = "";
  if (detailAudio) { detailAudio.pause(); detailAudio = null; }
  if (n.kind === "voice") wrap.appendChild(audioPlayer(n, true));
  else {
    const el = document.createElement("div"); buildNoteContent(n, el);
    el.querySelector(".badges")?.remove(); el.querySelector(".pinmark")?.remove();
    wrap.appendChild(el);
  }
  renderDetailMeta(n);
  renderReactRow();
  renderReplies();
  $("#replyInput").value = "";
  noteEl(id)?.classList.remove("fresh");
  openSheet("detail");
  if (n.author_id !== state.me?.id && !n.seen_at) markPartnerSeen(0);
}

function renderDetailMeta(n) {
  let meta = `From ${nameOf(n.author_id)} · ${timeAgo(n.show_at && !isScheduled(n) ? n.show_at : n.created_at)}`;
  if (isScheduled(n)) meta += ` · shows ${fmtWhen(n.show_at)}`;
  else if (n.author_id === state.me?.id && n.seen_at) meta += ` · seen ${timeAgo(n.seen_at)}`;
  $("#detailMeta").textContent = meta;
  $("#detailPin").textContent = n.pinned ? "Unpin" : "📌 Pin";
}

function audioPlayer(n, autoplay) {
  const wrap = document.createElement("div"); wrap.className = "detail-audio";
  paintPaper(wrap, n.color);
  wrap.innerHTML = `<button type="button" aria-label="Play">▶</button><div class="bar"><i></i></div><span class="t">0:00</span>`;
  const btn = wrap.querySelector("button"), fill = wrap.querySelector(".bar i"), t = wrap.querySelector(".t");
  const a = new Audio(state.urls[n.media_path] || "");
  a.preload = "auto";
  const total = n.meta?.duration || 0;
  t.textContent = fmtDur(total);
  btn.onclick = () => (a.paused ? a.play().catch(() => toast("Couldn't play this voice note")) : a.pause());
  a.onplay = () => (btn.textContent = "❚❚");
  a.onpause = () => (btn.textContent = "▶");
  a.onended = () => { btn.textContent = "▶"; fill.style.width = "0"; t.textContent = fmtDur(total); };
  a.ontimeupdate = () => {
    const d = isFinite(a.duration) && a.duration > 0 ? a.duration : total || 1;
    fill.style.width = Math.min(100, (a.currentTime / d) * 100) + "%";
    t.textContent = fmtDur(a.currentTime);
  };
  a.onerror = () => toast("This voice note can't play on this phone");
  detailAudio = a;
  if (autoplay) a.play().catch(() => {});
  return wrap;
}

function renderReactRow() {
  const row = $("#reactRow"); row.innerHTML = "";
  const n = state.notes.get(detailId); if (!n) return;
  const list = state.reactions.get(n.id) || [];
  for (const em of REACTIONS) {
    const count = list.filter((r) => r.emoji === em).length;
    const mine = list.some((r) => r.emoji === em && r.user_id === state.me.id);
    const b = document.createElement("button"); b.type = "button";
    b.setAttribute("aria-pressed", String(mine));
    b.innerHTML = `<span></span>${count ? `<b>${count}</b>` : ""}`;
    b.querySelector("span").textContent = em;
    b.onclick = () => toggleReaction(em);
    row.appendChild(b);
  }
}

async function toggleReaction(emoji) {
  const n = state.notes.get(detailId); if (!n) return;
  const list = state.reactions.get(n.id) || [];
  const mine = list.find((r) => r.user_id === state.me.id && r.emoji === emoji);
  try {
    if (mine) {
      state.reactions.set(n.id, list.filter((r) => r !== mine));
      renderReactRow(); redecorate(n.id);
      await api.removeReaction(n.id, emoji);
    } else {
      const r = { note_id: n.id, board_id: state.board.id, user_id: state.me.id, emoji };
      state.reactions.set(n.id, [...list, r]);
      renderReactRow(); redecorate(n.id);
      rain(emoji, 6);
      await api.addReaction(r);
      if (n.author_id !== state.me.id) api.notify(state.board.id, "reaction", { emoji });
    }
  } catch (e) {
    console.warn(e);
    state.reactions.set(n.id, list); renderReactRow(); redecorate(n.id);
    state.v2 ? toast("Couldn't save that reaction") : needsUpgrade();
  }
}

function onReactionEvent(row, deleted) {
  const list = state.reactions.get(row.note_id) || [];
  const same = (r) => r.user_id === row.user_id && r.emoji === row.emoji;
  if (deleted) state.reactions.set(row.note_id, list.filter((r) => !same(r)));
  else {
    if (list.some(same)) return;
    state.reactions.set(row.note_id, [...list, row]);
    const n = state.notes.get(row.note_id);
    if (row.user_id !== state.me.id && n?.author_id === state.me.id) toast(`${memberById(row.user_id)?.name || "Your person"} reacted ${row.emoji}`);
  }
  redecorate(row.note_id);
  if (detailId === row.note_id) renderReactRow();
}

function renderReplies() {
  const box = $("#replyList"); box.innerHTML = "";
  const list = (state.replies.get(detailId) || []).slice().sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  for (const r of list) {
    const d = document.createElement("div");
    d.className = "reply" + (r.author_id === state.me.id ? " mine" : "");
    d.textContent = r.body;
    const s = document.createElement("small"); s.textContent = `${nameOf(r.author_id)} · ${timeAgo(r.created_at)}`;
    d.appendChild(s);
    box.appendChild(d);
  }
  box.scrollTop = box.scrollHeight;
}

async function sendReply() {
  const body = $("#replyInput").value.trim();
  const n = state.notes.get(detailId);
  if (!body || !n) return;
  const btn = $("#replySend"); busy(btn, true, "…");
  try {
    const row = await api.addReply({ note_id: n.id, board_id: state.board.id, author_id: state.me.id, body });
    onReplyEvent(row);
    $("#replyInput").value = "";
    api.notify(state.board.id, "reply");
  } catch (e) { console.warn(e); state.v2 ? toast("Couldn't send the reply") : needsUpgrade(); }
  busy(btn, false);
}

function onReplyEvent(row) {
  const list = state.replies.get(row.note_id) || [];
  if (list.some((r) => r.id === row.id)) return;
  state.replies.set(row.note_id, [...list, row]);
  if (row.author_id !== state.me.id) toast(`${memberById(row.author_id)?.name || "Your person"} replied: ${row.body.slice(0, 60)}`);
  redecorate(row.note_id);
  if (detailId === row.note_id) renderReplies();
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
async function pinDetail() {
  const n = state.notes.get(detailId); if (!n) return;
  n.pinned = !n.pinned;
  const el = noteEl(n.id); if (el) { placeNote(el, n); decorate(el, n); }
  renderDetailMeta(n);
  toast(n.pinned ? "Pinned. It stays on top and can't be dragged by accident." : "Unpinned");
  try { await api.updateNote(n.id, { pinned: n.pinned }); }
  catch (e) { n.pinned = !n.pinned; if (el) { placeNote(el, n); decorate(el, n); } renderDetailMeta(n); state.v2 ? toast("Couldn't pin it") : needsUpgrade(); }
}

// ---------------------------------------------------------------- composer
const compose = { tab: "text", color: "c1", emoji: "❤️", photo: null, padColor: "c1", cdColor: "c5", sched: false };

function openComposer() {
  compose.photo = null;
  $("#textInput").value = ""; $("#photoCaption").value = ""; $("#emojiCustom").value = "";
  $("#photoPreview").hidden = true; $("#photoHint").hidden = false; $("#photoInput").value = "";
  $("#cdTitle").value = ""; $("#cdDate").value = ""; $("#cdTime").value = "";
  pad.reset();
  resetRec();
  setSched(false);
  updateCdPreview();
  setTab(compose.tab);
  openSheet("composer");
  if (compose.tab === "text") setTimeout(() => $("#textInput").focus(), 250);
}

function setTab(tab) {
  if (compose.tab === "voice" && tab !== "voice" && rec.mr?.state === "recording") stopRec();
  compose.tab = tab;
  document.querySelectorAll("#composerTabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll("#composer .pane").forEach((p) => (p.hidden = p.dataset.pane !== tab));
}

function setSched(on) {
  compose.sched = on;
  $("#schedToggle").setAttribute("aria-pressed", String(on));
  $("#schedRow").hidden = !on;
  if (on && !$("#schedAt").value) setQuick("morning");
  $("#composerSend").textContent = on ? "Schedule it" : "Stick it";
}

function setQuick(q) {
  const d = new Date();
  if (q === "morning") { d.setDate(d.getDate() + 1); d.setHours(7, 0, 0, 0); }
  if (q === "tonight") { d.setHours(21, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); }
  if (q === "hour") d.setTime(Date.now() + 3600e3);
  $("#schedAt").value = toLocalInput(d);
}

function updateCdPreview() {
  const meta = cdMeta() || { target: new Date(Date.now() + 12 * 864e5).toISOString(), allDay: true, title: "our trip ✈️" };
  const p = countdownParts(meta);
  $("#cdPrevBig").textContent = p.big; $("#cdPrevUnit").textContent = p.unit; $("#cdPrevTitle").textContent = p.title || $("#cdTitle").placeholder;
  paintPaper($("#cdPreview"), compose.cdColor);
}

function cdMeta() {
  const date = $("#cdDate").value; if (!date) return null;
  const time = $("#cdTime").value;
  const target = new Date(`${date}T${time || "00:00"}`);
  if (isNaN(target)) return null;
  return { target: target.toISOString(), allDay: !time, title: $("#cdTitle").value.trim() };
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

const AUDIO_EXT = { "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/aac": "aac" };

async function sendCompose() {
  const btn = $("#composerSend");
  const base = { board_id: state.board.id, author_id: state.me.id, rot: Math.round((Math.random() * 8 - 4) * 10) / 10, z: Date.now() };
  let showAt = null;
  if (compose.sched) {
    const d = new Date($("#schedAt").value);
    if (isNaN(d) || d.getTime() < Date.now() + 60e3) return toast("Pick a time at least a minute from now");
    showAt = d.toISOString();
    if (!state.v2 && !isDemo) return needsUpgrade();
  }
  if (showAt) base.show_at = showAt;
  let row, localUrl = null;
  try {
    busy(btn, true, showAt ? "Scheduling…" : "Sticking…");
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
      localUrl = URL.createObjectURL(compose.photo);
      row = { ...base, kind: "image", media_path: path, body: $("#photoCaption").value.trim() || null, color: "c1", ...viewportSpot(172, 200) };
    } else if (compose.tab === "drawing") {
      if (pad.isEmpty()) { busy(btn, false); return toast("Draw something first"); }
      const blob = await pad.toBlob();
      const path = await api.uploadMedia(state.board.id, blob, "png");
      localUrl = pad.lastUrl;
      row = { ...base, kind: "drawing", media_path: path, color: compose.padColor, ...viewportSpot(160, 160) };
    } else if (compose.tab === "voice") {
      if (rec.mr?.state === "recording") stopRec();
      if (!rec.blob) { busy(btn, false); return toast("Record something first"); }
      if (!state.v2 && !isDemo) { busy(btn, false); return needsUpgrade(); }
      const type = rec.blob.type.split(";")[0] || "audio/webm";
      const path = await api.uploadMedia(state.board.id, rec.blob, AUDIO_EXT[type] || "webm");
      localUrl = rec.url;
      row = { ...base, kind: "voice", media_path: path, color: compose.color, meta: { duration: Math.round(rec.dur) }, ...viewportSpot(160, 90) };
    } else if (compose.tab === "countdown") {
      const meta = cdMeta();
      if (!meta) { busy(btn, false); return toast("Pick the date you're counting down to"); }
      if (!meta.title) { busy(btn, false); return toast("Give it a name, like \"Our trip ✈️\""); }
      if (!state.v2 && !isDemo) { busy(btn, false); return needsUpgrade(); }
      row = { ...base, kind: "countdown", body: meta.title, color: compose.cdColor, meta, ...viewportSpot(150, 150) };
    }
    const saved = await api.addNote(row);
    if (saved.media_path && localUrl) state.urls[saved.media_path] = localUrl;  // show our own upload right away
    await upsertNote(saved);
    closeSheet("composer");
    if (showAt) toast(`Scheduled for ${fmtWhen(showAt)} ⏰ Only you can see it until then.`, 4000);
    else api.notify(state.board.id, "note", { note_id: saved.id });
    if (compose.tab === "voice") resetRec(true);
  } catch (e) {
    console.error(e);
    const msg = e.message || "";
    if (/mime|type/i.test(msg) && compose.tab === "voice") needsUpgrade();
    else if (/violates check constraint|column .* does not exist|schema cache/i.test(msg)) needsUpgrade();
    else toast(msg || "Couldn't send that");
  } finally { busy(btn, false); $("#composerSend").textContent = compose.sched ? "Schedule it" : "Stick it"; }
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

// ---------------------------------------------------------------- voice recorder
const rec = { mr: null, chunks: [], blob: null, url: null, start: 0, timer: null, dur: 0, discard: false };
function pickMime() {
  const c = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  return c.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";
}
async function toggleRec() {
  if (rec.mr?.state === "recording") return stopRec();
  if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) return toast("Voice notes aren't supported in this browser");
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch { return toast("Allow the microphone to record a voice note"); }
  const mime = pickMime();
  rec.chunks = []; rec.blob = null; rec.discard = false;
  rec.mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  rec.mr.ondataavailable = (e) => e.data.size && rec.chunks.push(e.data);
  rec.mr.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    if (rec.discard) return;
    const type = (rec.mr.mimeType || mime || "audio/webm").split(";")[0];
    rec.blob = new Blob(rec.chunks, { type });
    rec.dur = Math.max(1, (Date.now() - rec.start) / 1000);
    rec.url = URL.createObjectURL(rec.blob);
    $("#recPreview").hidden = false;
    $("#recHint").textContent = "Sounds good? Tap Stick it to send.";
  };
  rec.mr.start(250);
  rec.start = Date.now();
  $("#recBtn").classList.add("on");
  $("#recHint").textContent = "Recording… tap to stop";
  $("#recPreview").hidden = true;
  rec.timer = setInterval(() => {
    const s = (Date.now() - rec.start) / 1000;
    $("#recTime").textContent = fmtDur(Math.floor(s));
    if (s >= 60) stopRec();
  }, 200);
}
function stopRec() {
  clearInterval(rec.timer);
  $("#recBtn").classList.remove("on");
  try { if (rec.mr?.state === "recording") rec.mr.stop(); } catch { /* ignore */ }
}
let recAudio = null;
function resetRec(keepUrl = false) {
  if (rec.mr?.state === "recording") { rec.discard = true; stopRec(); }
  if (recAudio) { recAudio.pause(); recAudio = null; }
  if (rec.url && !keepUrl) URL.revokeObjectURL(rec.url);
  rec.blob = null; rec.url = null; rec.dur = 0;
  $("#recTime").textContent = "0:00";
  $("#recPreview").hidden = true;
  $("#recHint").textContent = "Tap to record. Up to 60 seconds.";
}
function playRec() {
  if (!rec.url) return;
  if (recAudio && !recAudio.paused) { recAudio.pause(); return; }
  recAudio = new Audio(rec.url);
  recAudio.onended = () => ($("#recPlay").textContent = "▶ Play");
  recAudio.onpause = () => ($("#recPlay").textContent = "▶ Play");
  recAudio.play().then(() => ($("#recPlay").textContent = "❚❚ Pause")).catch(() => toast("Couldn't play it back"));
}

// ---------------------------------------------------------------- drawing pads
function makePad(canvas, { owner = "me", onLive = null, onDone = null } = {}) {
  const ctx = canvas.getContext("2d"), S = canvas.width;
  let strokes = [], current = null, color = PENS[0], size = SIZES[1], erasing = false, lastLive = 0;
  const remote = new Map();
  const visible = () => { const i = strokes.map((s) => !!s.clear).lastIndexOf(true); return strokes.slice(i + 1); };
  function drawStroke(s) {
    const p = s.points; if (!p || !p.length) return;
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
    for (const s of visible()) drawStroke(s);
    for (const s of remote.values()) drawStroke(s);
    if (current) drawStroke(current);
    ctx.globalCompositeOperation = "source-over";
  }
  function pt(e) {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * S, ((e.clientY - r.top) / r.height) * S];
  }
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    current = { id: uid(), owner, color, size, erase: erasing, points: [pt(e)] }; redraw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!current) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) current.points.push(pt(ev));
    redraw();
    if (onLive && Date.now() - lastLive > 60) { lastLive = Date.now(); onLive(current); }
  });
  const end = () => { if (current) { strokes.push(current); onDone?.(current); current = null; redraw(); } };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  const self = {
    lastUrl: null,
    reset() { strokes = []; remote.clear(); current = null; redraw(); },
    isEmpty() { return !visible().some((s) => !s.erase) && remote.size === 0; },
    undo() { strokes.pop(); redraw(); },
    undoOwn() {
      for (let i = strokes.length - 1; i >= 0; i--) if (strokes[i].owner === owner && !strokes[i].clear) { const [s] = strokes.splice(i, 1); redraw(); return s.id; }
      return null;
    },
    clear() { if (strokes.length) { strokes.push({ clear: true }); redraw(); } },
    clearAll() { strokes = []; remote.clear(); redraw(); },
    setColor(c) { color = c; erasing = false; },
    setSize(s) { size = s; },
    toggleEraser() { erasing = !erasing; },
    tools() { return { color, size, erasing }; },
    remoteLive(s) { remote.set(s.id, s); redraw(); },
    remoteDone(s) { remote.delete(s.id); if (!strokes.some((x) => x.id === s.id)) strokes.push(s); redraw(); },
    remove(id) { strokes = strokes.filter((s) => s.id !== id); remote.delete(id); redraw(); },
    getStrokes() { return visible(); },
    setStrokes(arr) { strokes = arr.slice(); redraw(); },
    toBlob() { return new Promise((res) => canvas.toBlob((b) => { self.lastUrl = URL.createObjectURL(b); res(b); }, "image/png")); },
  };
  return self;
}

function buildTools(els, p, { onUndo, onClear } = {}) {
  const sync = () => {
    const t = p.tools();
    els.pens.querySelectorAll(".pen").forEach((b) => b.setAttribute("aria-pressed", String(!t.erasing && b.dataset.c === t.color)));
    els.eraser.setAttribute("aria-pressed", String(t.erasing));
  };
  els.pens.innerHTML = "";
  for (const c of PENS) {
    const b = document.createElement("button"); b.className = "pen"; b.type = "button"; b.dataset.c = c; b.style.background = c;
    b.setAttribute("aria-label", "Pen color " + c); b.onclick = () => { p.setColor(c); sync(); }; els.pens.appendChild(b);
  }
  els.sizes.innerHTML = "";
  SIZES.forEach((sz, i) => {
    const b = document.createElement("button"); b.className = "size"; b.type = "button"; b.setAttribute("aria-label", ["Small", "Medium", "Large"][i] + " brush");
    b.innerHTML = `<span style="width:${4 + i * 5}px;height:${4 + i * 5}px"></span>`;
    b.setAttribute("aria-pressed", String(sz === p.tools().size));
    b.onclick = () => { p.setSize(sz); els.sizes.querySelectorAll(".size").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); };
    els.sizes.appendChild(b);
  });
  els.eraser.onclick = () => { p.toggleEraser(); sync(); };
  els.undo.onclick = onUndo || (() => p.undo());
  els.clear.onclick = onClear || (() => p.clear());
  sync();
}

const pad = makePad($("#pad"));
buildTools({ pens: $("#penColors"), sizes: $("#penSizes"), eraser: $("#eraserBtn"), undo: $("#undoBtn"), clear: $("#clearBtn") }, pad);

// ---------------------------------------------------------------- draw together (live)
const together = { pad: null, open: false, notifiedPresence: false };
const packStroke = (s) => ({ id: s.id, owner: s.owner, color: s.color, size: s.size, erase: s.erase, points: s.points.map(([x, y]) => [Math.round(x), Math.round(y)]) });

function ensureTogetherPad() {
  if (together.pad) return together.pad;
  together.pad = makePad($("#tPad"), {
    owner: state.me.id,
    onLive: (s) => live?.send({ t: "live", s: packStroke(s) }),
    onDone: (s) => live?.send({ t: "done", s: packStroke(s) }),
  });
  buildTools({ pens: $("#tPens"), sizes: $("#tSizes"), eraser: $("#tEraser"), undo: $("#tUndo"), clear: $("#tClear") }, together.pad, {
    onUndo: () => { const id = together.pad.undoOwn(); if (id) live?.send({ t: "remove", id }); },
    onClear: () => {
      if (!confirm("Clear the drawing for both of you?")) return;
      together.pad.clearAll(); live?.send({ t: "clear" });
    },
  });
  paintPaper($("#tPadWrap"), "c1");
  return together.pad;
}

function openTogether() {
  ensureTogetherPad();
  together.open = true;
  openSheet("together");
  live?.track({ doodling: true });
  live?.send({ t: "hello" });
  renderPresence();
}

function closeTogether() {
  if (!together.open) return;
  together.open = false;
  live?.track({ doodling: false });
  renderPresence();
}

async function stickTogether() {
  const p = ensureTogetherPad();
  if (p.isEmpty()) return toast("Draw something first");
  const btn = $("#tStick"); busy(btn, true, "Sticking…");
  try {
    const blob = await p.toBlob();
    const path = await api.uploadMedia(state.board.id, blob, "png");
    const row = { board_id: state.board.id, author_id: state.me.id, kind: "drawing", media_path: path, color: "c1",
      rot: Math.round((Math.random() * 8 - 4) * 10) / 10, z: Date.now(), ...viewportSpot(160, 160) };
    const saved = await api.addNote(row);
    state.urls[saved.media_path] = p.lastUrl;
    await upsertNote(saved);
    api.notify(state.board.id, "note", { note_id: saved.id });
    toast("Stuck on the board 🎨");
  } catch (e) { toast(e.message || "Couldn't stick it"); }
  busy(btn, false);
}

function onLiveMessage(m) {
  if (!m || !m.t) return;
  if (m.t === "answered") return refreshQuestionDot();
  const p = ensureTogetherPad();
  if (m.t === "hello") { const strokes = p.getStrokes(); if (strokes.length) live?.send({ t: "state", strokes: strokes.map(packStroke) }); }
  else if (m.t === "state") { if (!p.getStrokes().length && Array.isArray(m.strokes)) p.setStrokes(m.strokes); }
  else if (m.t === "live") p.remoteLive(m.s);
  else if (m.t === "done") p.remoteDone(m.s);
  else if (m.t === "remove") p.remove(m.id);
  else if (m.t === "clear") p.clearAll();
}

function onPresence(map) {
  const prev = state.presence;
  state.presence = map || {};
  const pt = partner();
  const wasDoodling = pt && prev[pt.id]?.doodling;
  const isDoodling = pt && state.presence[pt.id]?.doodling;
  if (isDoodling && !wasDoodling && !together.open) toast(`${pt.name} is drawing. Tap 🎨 Together to join.`, 4000);
  renderPresence();
}

function renderPresence() {
  const pt = partner();
  const on = !!(pt && state.presence[pt.id]?.doodling);
  $("#doodleDot").hidden = !on || together.open;
  const w = $("#togetherWho");
  w.textContent = on ? `${pt.name} is here ✏️` : pt ? `${pt.name} isn't here yet` : "Just you for now";
  w.classList.toggle("on", on);
}

// ---------------------------------------------------------------- check-ins
function buildPingGrid(el, items) {
  el.innerHTML = "";
  for (const [key, emoji, label] of items) {
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<span></span>`; b.querySelector("span").textContent = emoji;
    b.appendChild(document.createTextNode(label));
    b.onclick = () => sendPing(key);
    el.appendChild(b);
  }
}

function openPing() {
  renderPingLast();
  const myMood = state.pings.find((p) => p.user_id === state.me.id && p.kind.startsWith("mood_"));
  $("#pingMoods").querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(myMood?.kind === MOODS[i][0] && !!latestMood(state.me.id))));
  openSheet("ping");
}

function renderPingLast() {
  const pt = partner();
  const last = pt && state.pings.find((p) => p.user_id === pt.id);
  $("#pingLast").textContent = last ? `${pt.name} ${PING_TEXT[last.kind] || ""} · ${timeAgo(last.created_at)}` : pt ? `Let ${pt.name} know you're thinking of them.` : "";
}

async function sendPing(key) {
  try {
    const row = await api.sendPing(state.board.id, key);
    if (!state.pings.some((p) => p.id === row.id)) state.pings.unshift(row);
    rain(PING_EMOJI[key], 10);
    renderChips(); openPing();
    const pt = partner();
    toast(key.startsWith("mood_") ? "Mood shared" : `Sent to ${pt?.name || "your person"} ${PING_EMOJI[key]}`);
    api.notify(state.board.id, "ping", { ping: key });
  } catch (e) { console.warn(e); state.v2 ? toast("Couldn't send that") : needsUpgrade(); }
}

function onPingEvent(row) {
  if (state.pings.some((p) => p.id === row.id)) return;
  state.pings.unshift(row);
  renderChips();
  if (!$("#ping").hidden) renderPingLast();
  if (row.user_id !== state.me.id) {
    toast(`${memberById(row.user_id)?.name || "Your person"} ${PING_TEXT[row.kind] || ""}`, 4000);
    rain(PING_EMOJI[row.kind] || "💕", 12);
  }
}

// ---------------------------------------------------------------- daily question
function questionFor(key) {
  const [y, m, d] = key.split("-").map(Number);
  const days = Math.floor(Date.UTC(y, m - 1, d) / 864e5);
  return QUESTIONS[((days % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length];
}

async function openQuestion() {
  openSheet("question");
  await renderQuestion();
}

async function renderQuestion() {
  const key = localDateKey();
  $("#qDate").textContent = "Today's question · " + new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  $("#qText").textContent = questionFor(key);
  const since = localDateKey(new Date(Date.now() - 14 * 864e5));
  let rows = [], status = [];
  try { [rows, status] = await Promise.all([api.listAnswers(state.board.id, since), api.answerStatus(state.board.id, key)]); }
  catch (e) { console.warn(e); $("#qAnswers").innerHTML = ""; $("#qAnswerBox").hidden = true; return needsUpgrade(); }
  const me = state.me.id, pt = partner();
  const mine = rows.find((r) => r.user_id === me && r.qdate === key);
  const theirs = rows.find((r) => r.user_id !== me && r.qdate === key);
  const partnerAnswered = !!pt && status.includes(pt.id);
  $("#qAnswerBox").hidden = !!mine;
  $("#qHint").textContent = partnerAnswered && !mine ? `${pt.name} already answered! Share yours to see theirs 👀` : "You'll see their answer once you've both answered.";
  const box = $("#qAnswers"); box.innerHTML = "";
  const card = (who, text, waiting) => {
    const d = document.createElement("div"); d.className = "q-ans" + (waiting ? " waiting" : "");
    const b = document.createElement("b"); b.textContent = who; d.appendChild(b);
    d.appendChild(document.createTextNode(text)); box.appendChild(d);
  };
  if (mine) {
    card("You", mine.body);
    if (theirs) card(pt?.name || "Them", theirs.body);
    else card(pt?.name || "Them", `Waiting for ${pt?.name || "them"} to answer…`, true);
  }
  // earlier days you both answered
  const past = $("#qPast"); past.innerHTML = "";
  const byDay = groupBy(rows.filter((r) => r.qdate !== key), "qdate");
  let shown = 0;
  for (const [day, list] of byDay) {
    if (list.length < 2) continue;
    const it = document.createElement("div"); it.className = "item";
    const p = document.createElement("p"); p.textContent = questionFor(day); it.appendChild(p);
    for (const r of list) {
      const d = document.createElement("div"); const b = document.createElement("b");
      b.textContent = (r.user_id === me ? "You" : pt?.name || "Them") + ": "; d.appendChild(b); d.appendChild(document.createTextNode(r.body)); it.appendChild(d);
    }
    past.appendChild(it); shown++;
  }
  $("#qPastTitle").hidden = !shown;
  $("#qDot").hidden = !(partnerAnswered && !mine);
}

async function sendAnswer() {
  const body = $("#qInput").value.trim();
  if (!body) return toast("Write an answer first");
  const btn = $("#qSend"); busy(btn, true, "Sharing…");
  try {
    await api.saveAnswer(state.board.id, localDateKey(), body);
    $("#qInput").value = "";
    api.notify(state.board.id, "answer");
    live?.send({ t: "answered" });
    await renderQuestion();
  } catch (e) { console.warn(e); state.v2 ? toast("Couldn't save your answer") : needsUpgrade(); }
  busy(btn, false);
}

async function refreshQuestionDot() {
  if (!state.board) return;
  try {
    const status = await api.answerStatus(state.board.id, localDateKey());
    const pt = partner();
    $("#qDot").hidden = !(pt && status.includes(pt.id) && !status.includes(state.me.id));
    if (!$("#question").hidden) renderQuestion();
  } catch { $("#qDot").hidden = true; }
}

// ---------------------------------------------------------------- switch / leave / delete board
let leaving = false;
function resetBoardState() {
  clearInterval(ticker);
  state.board = null; state.members = [];
  state.notes.clear(); state.reactions = new Map(); state.replies = new Map(); state.pings = []; state.presence = {};
  $("#board").innerHTML = ""; $("#memberChips").innerHTML = "";
  together.pad?.reset(); together.open = false;
  for (const s of ["detail", "composer", "settings", "ping", "question", "together"]) { $("#" + s).hidden = true; $("#" + s + "Backdrop").hidden = true; }
  $("#qDot").hidden = true; $("#doodleDot").hidden = true;
  $("#codeInput").value = ""; setError($("#pairError"));
}

function canDeleteBoard() {
  return state.board && (state.board.created_by === state.me?.id || state.members.length <= 1);
}

function renderBoardActions() {
  $("#switchRow").hidden = true; $("#switchCode").value = "";
  const can = canDeleteBoard();
  $("#deleteBoardBtn").hidden = !can;
  const pt = partner();
  const hint = $("#boardHint");
  hint.hidden = can;
  if (!can) hint.textContent = `Only ${pt?.name || "the person who made it"} can delete this board. You can leave it instead.`;
}

async function switchBoard() {
  const code = $("#switchCode").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 8) return toast("Codes are 8 characters");
  if (code === state.board?.code) return toast("You're already on that board");
  const pt = partner();
  if (!confirm(`Move to the other board? You'll leave this one${pt ? ` (${pt.name} keeps it)` : ""}.`)) return;
  const btn = $("#switchGo"); busy(btn, true, "…");
  const old = state.board;
  leaving = true;
  try {
    const next = await api.joinBoard(code);      // join first, so a bad code leaves you where you are
    await api.leaveBoard(old.id);
    resetBoardState();
    await openBoard((await api.myBoard()) || next);
    toast("Joined the new board 🎉");
  } catch (e) { toast(e.message, 4000); }
  finally { leaving = false; busy(btn, false); }
}

async function leaveBoard() {
  const pt = partner();
  const msg = pt ? `Leave this board? ${pt.name} keeps it and everything on it. You'd need the code to come back.`
    : "Leave this board? Nobody else is on it, so you may want to delete it instead.";
  if (!confirm(msg)) return;
  leaving = true;
  try {
    await api.leaveBoard(state.board.id);
    resetBoardState();
    const other = await api.myBoard();
    other ? await openBoard(other) : showPair();
    toast("You left the board");
  } catch (e) { toast(e.message, 4000); }
  finally { leaving = false; }
}

async function deleteBoard() {
  const pt = partner();
  if (!confirm(`Delete this board for ${pt ? `both you and ${pt.name}` : "good"}? Every note, photo, voice note and answer on it will be erased. This can't be undone.`)) return;
  if (!confirm("Last check: delete everything and start over?")) return;
  const btn = $("#deleteBoardBtn"); busy(btn, true, "Deleting…");
  leaving = true;
  try {
    await api.deleteBoard(state.board.id);
    resetBoardState();
    const other = await api.myBoard();
    other ? await openBoard(other) : showPair();
    toast("Board deleted. Start a new one or join with a code.", 4000);
  } catch (e) { toast(e.message, 5000); }
  finally { leaving = false; busy(btn, false); }
}

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
  renderMutes();
  renderAccount();
  renderBoardActions();
  openSheet("settings");
}

function renderMutes() {
  const box = $("#muteList");
  box.querySelectorAll(".mute-row").forEach((r) => r.remove());
  const muted = state.me.muted || [];
  for (const [type, label] of MUTE_TYPES) {
    const row = document.createElement("div"); row.className = "mute-row";
    const s = document.createElement("span"); s.textContent = label; row.appendChild(s);
    const sw = document.createElement("button"); sw.className = "switch"; sw.type = "button"; sw.setAttribute("role", "switch");
    sw.setAttribute("aria-label", label); sw.setAttribute("aria-checked", String(!muted.includes(type)));
    sw.onclick = async () => {
      const prev = state.me.muted || [];
      const next = prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type];
      state.me.muted = next; sw.setAttribute("aria-checked", String(!next.includes(type)));
      try { await api.updateProfile({ muted: next }); }
      catch { state.me.muted = prev; sw.setAttribute("aria-checked", String(!prev.includes(type))); needsUpgrade(); }
    };
    row.appendChild(sw);
    box.appendChild(row);
  }
}

async function renderAccount() {
  const st = $("#acctStatus"), row = $("#acctLinkRow"), out = $("#logoutBtn");
  st.textContent = "…"; row.hidden = true; out.hidden = true;
  try {
    const a = await api.account();
    if (a.pending) { st.textContent = `Check ${a.pending} and tap the link to finish adding your email.`; row.hidden = false; }
    else if (a.anonymous) { st.textContent = "No email yet. Add one so you can sign back in on a new phone."; row.hidden = false; }
    else { st.textContent = `Signed in as ${a.email}`; out.hidden = false; }
  } catch { st.textContent = ""; }
}

async function onLinkEmail() {
  const email = $("#acctEmail").value.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast("That email doesn't look right");
  const btn = $("#acctLinkBtn"); busy(btn, true, "Sending…");
  try { await api.linkEmail(email); toast("Check your email and tap the link"); renderAccount(); }
  catch (e) { toast(e.message, 5000); }
  busy(btn, false);
}

async function onLogout() {
  if (!confirm("Log out of this phone? You can sign back in with your email anytime.")) return;
  await api.signOut();
  location.reload();
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
    if (m.id !== state.me?.id && state.board?.created_by === state.me?.id) {
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
  const text = `Join my board on Pinned with code ${code}`;
  try {
    if (navigator.share) await navigator.share({ title: "Pinned", text, url: location.href.split("#")[0] });
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
    hint.textContent = "On iPhone: tap the Share button in Safari, choose \"Add to Home Screen\", then open Pinned from your home screen and turn notifications on here.";
    hint.hidden = false; btn.hidden = true; return;
  }
  if (sup === "unsupported") { st.textContent = "Not supported in this browser"; btn.hidden = true; return; }
  if (!api.pushReady()) { st.textContent = "Not set up yet (see SETUP.md)"; btn.hidden = true; return; }
  const p = Notification.permission;
  if (p === "granted") { st.textContent = "On"; btn.textContent = "Send test"; }
  else if (p === "denied") {
    st.textContent = "Blocked";
    hint.textContent = isIOS ? "Turn them back on in iPhone Settings > Notifications > Pinned." : "Turn them back on in your phone's settings for this app (long-press the icon > App info > Notifications).";
    hint.hidden = false; btn.hidden = true;
  } else { st.textContent = "Off"; btn.textContent = "Turn on"; }
}

async function onNotifBtn() {
  if (Notification.permission === "granted") {
    if (isDemo) return localNotify("Notifications are working 🎉");
    const btn = $("#notifBtn"); busy(btn, true, "Sending…");
    await refreshPushSubscription(true);
    const r = await api.notify(state.board.id, "note", { test: true });
    busy(btn, false);
    if (!r) toast("No answer from the server");
    else if (r.error) toast("Server error: " + r.error, 6000);
    else if (!r.devices) toast("This phone isn't registered yet. Turn notifications off and on in your phone settings, then try again.", 6000);
    else if (r.sent) toast(`Test sent. It should pop up in a few seconds.`);
    else toast("Push service refused it: " + (r.failures || []).join("; "), 8000);
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") { await refreshPushSubscription(true); toast("Notifications on. Tap Send test to check."); }
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
    await reg.showNotification("Pinned", { body, icon: "icons/icon-192.png", tag: "soy-note" });
  } catch { toast(body); }
}

function clearBadge() { if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {}); }

function b64uToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

// ---------------------------------------------------------------- wiring
function wireStatic() {
  $("#sendLink").onclick = () => onSendLink(false);
  $("#emailInput").addEventListener("keydown", (e) => e.key === "Enter" && onSendLink(false));
  $("#resendLink").onclick = () => onSendLink(true);
  $("#changeEmail").onclick = () => { clearInterval(pollTimer); ls.set(PENDING, null); setError($("#loginError")); $("#loginForm").hidden = false; $("#loginWait").hidden = true; };
  $("#acctLinkBtn").onclick = onLinkEmail;
  $("#logoutBtn").onclick = onLogout;
  $("#welcomeGo").onclick = onWelcome;
  $("#nameInput").addEventListener("keydown", (e) => e.key === "Enter" && onWelcome());
  $("#createBoard").onclick = onCreateBoard;
  $("#joinBoard").onclick = onJoinBoard;
  $("#codeInput").addEventListener("input", (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    e.target.value = raw.length > 4 ? raw.slice(0, 4) + "-" + raw.slice(4) : raw;
  });

  // composer
  $("#fab").onclick = openComposer;
  $("#composerCancel").onclick = () => { resetRec(); closeSheet("composer"); };
  $("#composerBackdrop").onclick = () => { resetRec(); closeSheet("composer"); };
  $("#composerSend").onclick = sendCompose;
  document.querySelectorAll("#composerTabs button").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
  swatchRow($("#textSwatches"), compose.color, (c) => { compose.color = c; paintPaper($("#textPreview"), c); });
  paintPaper($("#textPreview"), compose.color);
  swatchRow($("#padSwatches"), compose.padColor, (c) => { compose.padColor = c; paintPaper($("#padWrap"), c); });
  paintPaper($("#padWrap"), compose.padColor);
  swatchRow($("#cdSwatches"), compose.cdColor, (c) => { compose.cdColor = c; updateCdPreview(); });
  ["#cdTitle", "#cdDate", "#cdTime"].forEach((s) => $(s).addEventListener("input", updateCdPreview));
  $("#schedToggle").onclick = () => setSched(!compose.sched);
  document.querySelectorAll("#schedRow .quick button").forEach((b) => (b.onclick = () => setQuick(b.dataset.q)));
  $("#recBtn").onclick = toggleRec;
  $("#recPlay").onclick = playRec;
  $("#recRedo").onclick = () => resetRec();

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

  // detail
  $("#detailClose").onclick = () => closeSheet("detail");
  $("#detailBackdrop").onclick = () => closeSheet("detail");
  $("#detailRemove").onclick = removeDetail;
  $("#detailFront").onclick = frontDetail;
  $("#detailPin").onclick = pinDetail;
  $("#replySend").onclick = sendReply;
  $("#replyInput").addEventListener("keydown", (e) => e.key === "Enter" && sendReply());

  // dock + extra sheets
  buildPingGrid($("#pingFeelings"), FEELINGS);
  buildPingGrid($("#pingMoods"), MOODS);
  $("#dockPing").onclick = openPing;
  $("#pingClose").onclick = () => closeSheet("ping");
  $("#pingBackdrop").onclick = () => closeSheet("ping");
  $("#dockQuestion").onclick = openQuestion;
  $("#qSend").onclick = sendAnswer;
  $("#qClose").onclick = () => closeSheet("question");
  $("#questionBackdrop").onclick = () => closeSheet("question");
  $("#dockDoodle").onclick = openTogether;
  $("#tClose").onclick = () => closeSheet("together");
  $("#togetherBackdrop").onclick = () => closeSheet("together");
  $("#tStick").onclick = stickTogether;
  $("#tInvite").onclick = async () => {
    const r = await api.notify(state.board.id, "doodle");
    toast(r?.error ? "Couldn't send the invite" : `Invite sent to ${partner()?.name || "your person"} 💌`);
  };

  // settings
  $("#switchBoardBtn").onclick = () => { $("#switchRow").hidden = !$("#switchRow").hidden; if (!$("#switchRow").hidden) $("#switchCode").focus(); };
  $("#switchGo").onclick = switchBoard;
  $("#switchCode").addEventListener("input", (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    e.target.value = raw.length > 4 ? raw.slice(0, 4) + "-" + raw.slice(4) : raw;
  });
  $("#leaveBoardBtn").onclick = leaveBoard;
  $("#deleteBoardBtn").onclick = deleteBoard;
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
    if (document.visibilityState === "visible" && pollTimer) { const p = ls.get(PENDING); if (p) startPolling(p.nonce); }
    if (document.visibilityState === "visible") onResume(true);
    if (document.visibilityState === "hidden") { hiddenAt = Date.now(); markSeen(); }
  });
  // iPhone home-screen apps don't always fire visibilitychange when reopened; these catch the rest
  window.addEventListener("pageshow", () => onResume());
  window.addEventListener("focus", () => onResume());
  window.addEventListener("online", () => { hiddenAt = hiddenAt || 1; onResume(true); });
  window.addEventListener("pagehide", () => { hiddenAt = Date.now(); markSeen(); });
}

boot();
