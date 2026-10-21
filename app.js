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
const MUTE_TYPES = [["message", "Messages"], ["reaction", "Reactions"], ["reply", "Replies"], ["ping", "Check-ins"],
  ["answer", "Daily question answers"], ["doodle", "Draw-together invites"], ["bgrequest", "Background requests (owner)"], ["bgreply", "Background replies"],
  ["game", "Race invites"], ["lead", "Someone beats your best score"], ["ttt", "Tic-tac-toe"]];
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

// Crazy 8s rules engine (used by demo mode + the vs-computer AI; the real server
// runs the same rules in SQL). A game object: {deck,hand_x,hand_o,discard,top,suit,
// turn,status,winner,x_count,o_count,draw_count,last_note}.
const C8 = {
  RANKS: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"],
  SUITS: ["H", "D", "C", "S"],
  suitOf: (c) => c[1],
  rankOf: (c) => c[0],
  shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  fullDeck() { const d = []; for (const r of C8.RANKS) for (const s of C8.SUITS) d.push(r + s); return d; },
  playable(card, top, suit) { return !!card && (C8.suitOf(card) === suit || C8.rankOf(card) === C8.rankOf(top) || C8.rankOf(card) === "8"); },
  hasPlay(hand, top, suit) { return hand.some((c) => C8.playable(c, top, suit)); },
  deal() {
    const deck = C8.shuffle(C8.fullDeck());
    const hand_x = deck.splice(0, 7), hand_o = deck.splice(0, 7);
    let top; while (true) { top = deck.shift(); if (C8.rankOf(top) !== "8" || !deck.length) break; deck.push(top); }
    return { deck, hand_x, hand_o, discard: [top], top, suit: C8.suitOf(top), turn: "x", status: "active", winner: null,
      x_count: 7, o_count: 7, draw_count: deck.length, last_note: null };
  },
  play(g, mark, card, suit) {
    if (g.status !== "active") return { err: "This game is not being played" };
    if (g.turn !== mark) return { err: "Not your turn yet" };
    const hand = mark === "x" ? g.hand_x : g.hand_o;
    const i = hand.indexOf(card);
    if (i < 0) return { err: "That card is not in your hand" };
    if (!C8.playable(card, g.top, g.suit)) return { err: "That card does not match" };
    let newSuit;
    if (C8.rankOf(card) === "8") { if (!C8.SUITS.includes(suit)) return { err: "Pick a suit for your 8" }; newSuit = suit; }
    else newSuit = C8.suitOf(card);
    hand.splice(i, 1); g.discard.unshift(card); g.top = card; g.suit = newSuit;
    g[mark === "x" ? "x_count" : "o_count"] = hand.length;
    if (!hand.length) { g.status = "done"; g.winner = mark; g.last_note = `${card} — went out`; }
    else { g.turn = mark === "x" ? "o" : "x"; g.last_note = `played ${card}${C8.rankOf(card) === "8" ? " → " + newSuit : ""}`; }
    return { ok: true };
  },
  draw(g, mark) {
    if (g.status !== "active") return { err: "This game is not being played" };
    if (g.turn !== mark) return { err: "Not your turn yet" };
    const hand = mark === "x" ? g.hand_x : g.hand_o;
    if (!g.deck.length && g.discard.length > 1) { g.deck = C8.shuffle(g.discard.slice(1)); g.discard = [g.discard[0]]; }
    if (!g.deck.length) { g.turn = mark === "x" ? "o" : "x"; g.draw_count = 0; g.last_note = "no cards to draw — passed"; return { ok: true, passed: true }; }
    const card = g.deck.shift(); hand.push(card);
    const keep = C8.playable(card, g.top, g.suit);
    g[mark === "x" ? "x_count" : "o_count"] = hand.length; g.draw_count = g.deck.length;
    if (!keep) g.turn = mark === "x" ? "o" : "x";
    g.last_note = keep ? "drew a card" : "drew a card — passed";
    return { ok: true, drew: card, keep };
  },
  view(g, mark) {
    const hand = (mark === "x" ? g.hand_x : mark === "o" ? g.hand_o : []).slice().sort((a, b) => (C8.suitOf(a).localeCompare(C8.suitOf(b)) || C8.RANKS.indexOf(C8.rankOf(a)) - C8.RANKS.indexOf(C8.rankOf(b))));
    return { status: g.status, mark, your_turn: !!mark && g.turn === mark && g.status === "active", turn: g.turn,
      top: g.top, suit: g.suit, your_count: mark === "x" ? g.x_count : g.o_count, opp_count: mark === "x" ? g.o_count : g.x_count,
      x_count: g.x_count, o_count: g.o_count, draw_count: g.draw_count, winner: g.winner, last_note: g.last_note,
      can_pass: !!mark && g.turn === mark && g.status === "active" && !C8.hasPlay(mark === "x" ? g.hand_x : g.hand_o, g.top, g.suit) && g.draw_count === 0,
      hand };
  },
};

const $ = (s) => document.querySelector(s);
// ---- Batch A: small platform helpers ----
const APP_VERSION = "soy-v23";
const prefersReducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };
const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;
let hapticsOn;
function haptic(ms = 12) { if (hapticsOn !== false && canVibrate) { try { navigator.vibrate(ms); } catch { /* ignore */ } } }
// ---- Batch B: reliability (outbox, connection, undo/redo) ----
const isNetworkError = (e) => { const m = (e && e.message || "").toLowerCase(); return !navigator.onLine || /network|failed to fetch|load failed|timeout|timed out|fetch|connection|offline/.test(m); };
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
  let sb, session, channel, extras, liveCh, inkCh, chatCh, gamesCh;
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
      let res = await sb.from("profiles").select("id,name,color,muted,avatar_path,bio").eq("id", myId());
      if (res.error) res = await sb.from("profiles").select("id,name,color,muted").eq("id", myId());
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
      let res = await sb.from("board_members").select("board_id, bg, boards(id, code, created_by, bg_mode, bg)").eq("user_id", myId()).order("joined_at", { ascending: false }).limit(1);
      if (res.error) res = await sb.from("board_members").select("board_id, boards(id, code, created_by)").eq("user_id", myId()).order("joined_at", { ascending: false }).limit(1);
      const rows = must(res);
      return rows[0] ? { ...rows[0].boards, my_bg: rows[0].bg || null } : null;
    },
    async getBoard(boardId) {
      const res = await sb.from("boards").select("id, code, created_by, bg_mode, bg").eq("id", boardId).single();
      return res.error ? null : res.data;
    },
    async setBoardBg(boardId, mode, bg, setBg) { must(await sb.rpc("set_board_bg", { b: boardId, p_mode: mode, p_bg: bg, p_set_bg: setBg })); },
    async setMyBg(boardId, bg) { must(await sb.rpc("set_my_bg", { b: boardId, p_bg: bg })); },
    async requestBg(boardId, path, kind) { return must(await sb.from("bg_requests").insert({ board_id: boardId, user_id: myId(), media_path: path, kind }).select().single()); },
    async listBgRequests(boardId) { return must(await sb.from("bg_requests").select("*").eq("board_id", boardId).order("created_at", { ascending: false }).limit(30)); },
    async reviewBg(id, approve) { return must(await sb.rpc("review_bg_request", { r: id, approve })); },
    async listMessages(boardId) {
      const rows = must(await sb.from("messages").select("*").eq("board_id", boardId).order("created_at", { ascending: false }).limit(800));
      return rows.reverse();
    },
    async sendMessage(m) { return must(await sb.from("messages").insert(m).select().single()); },
    async listReads(boardId) { return must(await sb.from("message_reads").select("*").eq("board_id", boardId)); },
    async markRead(boardId, peer) { must(await sb.from("message_reads").upsert({ board_id: boardId, user_id: myId(), peer, read_at: new Date().toISOString() })); },
    async unfurl(url) {
      try { const { data } = await sb.functions.invoke("notify", { body: { unfurl: url } }); return data || {}; } catch { return {}; }
    },
    async createBoard() { return must(await sb.rpc("create_board")); },
    async joinBoard(code) { return must(await sb.rpc("join_board", { p_code: code })); },
    async members(boardId) {
      let res = await sb.from("board_members").select("user_id,last_seen,joined_at").eq("board_id", boardId);
      if (res.error) res = await sb.from("board_members").select("user_id,joined_at").eq("board_id", boardId);
      const rows = must(res) || [];
      if (!rows.length) return [];
      let pres = await sb.from("profiles").select("id,name,color,avatar_path,bio").in("id", rows.map((r) => r.user_id));
      if (pres.error) pres = await sb.from("profiles").select("id,name,color").in("id", rows.map((r) => r.user_id));
      const profs = must(pres);
      const byId = Object.fromEntries(rows.map((r) => [r.user_id, r]));
      return profs.map((p) => ({ ...p, last_seen: byId[p.id]?.last_seen || null, joined_at: byId[p.id]?.joined_at }))
        .sort((x, y) => (x.joined_at < y.joined_at ? -1 : 1));
    },
    async touchSeen(boardId) { try { await sb.rpc("touch_seen", { b: boardId }); } catch { /* v4 */ } },
    async listStrokes(boardId) { return must(await sb.from("strokes").select("*").eq("board_id", boardId).order("created_at")); },
    async addStroke(s) { must(await sb.from("strokes").insert(s)); },
    async deleteStroke(id) { must(await sb.from("strokes").delete().eq("id", id)); },
    async updateStroke(id, patch) { must(await sb.from("strokes").update(patch).eq("id", id)); },
    async deleteMedia(path) { try { await bucket().remove([path]); } catch { /* ignore */ } },
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
    async uploadAvatar(blob) {
      const path = `avatars/${myId()}-${Date.now()}.jpg`;
      must(await bucket().upload(path, blob, { contentType: "image/jpeg", upsert: true }));
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
        .subscribe((status) => { try { h.onConn?.(status); } catch { /* ignore */ } });
      // the v2 tables get their own channel, so the board keeps working before the upgrade is run
      extras = sb.channel("extras-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "reactions", filter: f }, (p) => h.onReaction(p.new, false))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "reactions" }, (p) => h.onReaction(p.old, true))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "replies", filter: f }, (p) => h.onReply(p.new))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "pings", filter: f }, (p) => h.onPing(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "answers", filter: f }, () => h.onAnswer())
        .subscribe();
      // v4 table on its own channel too
      if (inkCh) sb.removeChannel(inkCh);
      inkCh = sb.channel("ink-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "strokes", filter: f }, (p) => h.onStroke(p.new, false))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "strokes" }, (p) => h.onStroke(p.old, true))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "strokes", filter: f }, (p) => h.onStroke(p.new, false))
        .subscribe();
      // v6 tables on their own channel too
      if (chatCh) sb.removeChannel(chatCh);
      chatCh = sb.channel("chat-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: f }, (p) => h.onMessage(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "message_reads", filter: f }, (p) => h.onRead(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "bg_requests", filter: f }, (p) => h.onBgRequest(p.new))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "boards", filter: `id=eq.${boardId}` }, (p) => h.onBoard(p.new))
        .subscribe();
      // v7 games tables on their own channel too
      if (gamesCh) sb.removeChannel(gamesCh);
      gamesCh = sb.channel("games-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_scores", filter: f }, (p) => h.onScore(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "ttt_games", filter: f }, (p) => h.onTtt(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "crazy8_games", filter: f }, (p) => h.onC8(p.new))
        .subscribe();
    },
    // ---- Crazy 8s (v8) ----
    async c8List(boardId) { return must(await sb.from("crazy8_games").select("*").eq("board_id", boardId).order("updated_at", { ascending: false }).limit(80)); },
    async c8Challenge(boardId, oId) {
      const { data, error } = await sb.from("crazy8_games").insert({ board_id: boardId, x_id: myId(), o_id: oId }).select().single();
      if (error) throw new Error(/duplicate|unique/i.test(error.message) ? "You already have a game going with them" : error.message);
      return data;
    },
    async c8View(id) { return must(await sb.rpc("crazy8_view", { p_game: id })); },
    async c8Respond(id, accept) { return must(await sb.rpc("crazy8_respond", { p_game: id, p_accept: accept })); },
    async c8Play(id, card, suit) { return must(await sb.rpc("crazy8_play", { p_game: id, p_card: card, p_suit: suit || null })); },
    async c8Draw(id) { return must(await sb.rpc("crazy8_draw", { p_game: id })); },
    async c8Quit(id) { return must(await sb.rpc("crazy8_quit", { p_game: id })); },
    // ---- games (v7) ----
    async gameBoard(boardId, game) { return must(await sb.rpc("game_board", { p_board: boardId, p_game: game })) || { best: [], recent: [] }; },
    async saveScore(boardId, game, score, mode, roundId) {
      return must(await sb.from("game_scores").insert({ board_id: boardId, user_id: myId(), game, score, mode, round_id: roundId || null }).select().single());
    },
    async listTtt(boardId) { return must(await sb.from("ttt_games").select("*").eq("board_id", boardId).order("updated_at", { ascending: false }).limit(80)); },
    async tttChallenge(boardId, oId) {
      const { data, error } = await sb.from("ttt_games").insert({ board_id: boardId, x_id: myId(), o_id: oId }).select().single();
      if (error) throw new Error(/duplicate|unique/i.test(error.message) ? "You already have a game going with them" : error.message);
      return data;
    },
    async tttRespond(id, accept) { return must(await sb.rpc("ttt_respond", { p_game: id, p_accept: accept })); },
    async tttMove(id, cell) { return must(await sb.rpc("ttt_move", { p_game: id, p_cell: cell })); },
    async tttQuit(id) { return must(await sb.rpc("ttt_quit", { p_game: id })); },
    live(boardId, me, h) {
      if (liveCh) sb.removeChannel(liveCh);
      let presence = { name: me.name, color: me.color, visible: true, doodling: false };
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
  const blank = () => ({ profiles: {}, boards: {}, members: [], notes: [], media: {}, reactions: [], replies: [], answers: [], pings: [], strokes: [], messages: [], reads: [], bgreqs: [], scores: [], ttt: [], c8: [] });
  const canSee = (m) => !m.to_id || m.sender_id === meId() || m.to_id === meId();
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
    if (m.type === "stroke") handlers.onStroke(m.row, m.del);
    if (m.type === "message" && canSee(m.row)) handlers.onMessage(m.row);
    if (m.type === "read") handlers.onRead(m.row);
    if (m.type === "bgreq") { const b = db().boards[m.row.board_id]; if (m.row.user_id === meId() || b?.created_by === meId()) handlers.onBgRequest(m.row); }
    if (m.type === "board") handlers.onBoard(m.row);
    if (m.type === "score") handlers.onScore(m.row);
    if (m.type === "ttt") handlers.onTtt(m.row);
    if (m.type === "c8") handlers.onC8(m.row);
  };
  // tic-tac-toe rules, same as the database functions
  const TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const tttWinner = (c) => { for (const [a, b, e] of TTT_LINES) if (c[a] !== "-" && c[a] === c[b] && c[a] === c[e]) return c[a]; return c.includes("-") ? null : "draw"; };
  const tttSave = (d, g) => { g.updated_at = new Date().toISOString(); save(d); emit({ type: "ttt", row: g }); return { ...g }; };
  const c8Mark = (g) => (g.x_id === meId() ? "x" : g.o_id === meId() ? "o" : null);
  const c8Public = (g) => ({ id: g.id, board_id: g.board_id, x_id: g.x_id, o_id: g.o_id, status: g.status, turn: g.turn, top_card: g.top, suit: g.suit, x_count: g.x_count, o_count: g.o_count, draw_count: g.draw_count, winner: g.winner, last_note: g.last_note, updated_at: g.updated_at });
  const c8Save = (d, g) => { g.updated_at = new Date().toISOString(); save(d); emit({ type: "c8", row: c8Public(g) }); };
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
    async myBoard() { const d = db(); const m = d.members.find((x) => x.user_id === meId()); return m ? { bg_mode: "shared", bg: null, ...d.boards[m.board_id], my_bg: m.bg || null } : null; },
    async getBoard(boardId) { return { bg_mode: "shared", bg: null, ...db().boards[boardId] }; },
    async setBoardBg(boardId, mode, bg, setBg) {
      const d = db(); const b = d.boards[boardId];
      if (b.created_by !== meId()) throw new Error("Only the board owner can change this");
      if (mode) b.bg_mode = mode; if (setBg) b.bg = bg; save(d); emit({ type: "board", row: b });
    },
    async setMyBg(boardId, bg) { const d = db(); const m = d.members.find((x) => x.board_id === boardId && x.user_id === meId()); if (m) { m.bg = bg; save(d); } },
    async requestBg(boardId, path, kind) {
      const d = db(); const row = { id: uid(), board_id: boardId, user_id: meId(), media_path: path, kind, status: "pending", created_at: new Date().toISOString() };
      d.bgreqs.push(row); save(d); emit({ type: "bgreq", row }); return row;
    },
    async listBgRequests(boardId) {
      const d = db(); const owner = d.boards[boardId]?.created_by === meId();
      return d.bgreqs.filter((r) => r.board_id === boardId && (owner || r.user_id === meId())).sort((x, y) => (x.created_at < y.created_at ? 1 : -1));
    },
    async reviewBg(id, approve) {
      const d = db(); const r = d.bgreqs.find((x) => x.id === id); const b = d.boards[r.board_id];
      if (b.created_by !== meId()) throw new Error("Only the board owner can review requests");
      r.status = approve ? "approved" : "declined"; r.reviewed_at = new Date().toISOString();
      if (approve) b.bg = { type: r.kind, path: r.media_path };
      save(d); emit({ type: "bgreq", row: r }); if (approve) emit({ type: "board", row: b });
      return { user_id: r.user_id };
    },
    async listMessages(boardId) { return db().messages.filter((m) => m.board_id === boardId && canSee(m)); },
    async sendMessage(m) { if (typeof window !== "undefined" && window.__simOffline) throw new Error("Failed to fetch (simulated offline)"); const d = db(); const row = { ...m, id: uid(), created_at: new Date().toISOString() }; d.messages.push(row); save(d); emit({ type: "message", row }); return row; },
    async listReads(boardId) { return db().reads.filter((r) => r.board_id === boardId); },
    async markRead(boardId, peer) {
      const d = db(); d.reads = d.reads.filter((r) => !(r.board_id === boardId && r.user_id === meId() && r.peer === peer));
      const row = { board_id: boardId, user_id: meId(), peer, read_at: new Date().toISOString() }; d.reads.push(row); save(d); emit({ type: "read", row });
    },
    async unfurl(url) { try { const u = new URL(url); return { title: decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || u.hostname).replace(/[-_]/g, " "), thumb: null, author: u.hostname }; } catch { return {}; } },
    async createBoard() { const d = db(); const b = { id: uid(), code: code(), created_by: meId() }; d.boards[b.id] = b; d.members.push({ board_id: b.id, user_id: meId() }); save(d); return b; },
    async joinBoard(c) {
      const d = db(); const clean = (c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const b = Object.values(d.boards).find((x) => x.code === clean);
      if (!b) throw new Error("No board with that code");
      if (!d.members.some((m) => m.board_id === b.id && m.user_id === meId())) {
        if (d.members.filter((m) => m.board_id === b.id).length >= 10) throw new Error("That board is full (10 people max)");
        d.members.push({ board_id: b.id, user_id: meId(), joined_at: new Date().toISOString() }); save(d); emit({ type: "members" });
      }
      return b;
    },
    async members(boardId) {
      const d = db();
      return d.members.filter((m) => m.board_id === boardId).map((m) => d.profiles[m.user_id] && { ...d.profiles[m.user_id], last_seen: m.last_seen || null }).filter(Boolean);
    },
    async touchSeen(boardId) { const d = db(); const m = d.members.find((x) => x.board_id === boardId && x.user_id === meId()); if (m) { m.last_seen = new Date().toISOString(); save(d); } },
    async listStrokes(boardId) { return db().strokes.filter((s) => s.board_id === boardId); },
    async addStroke(s) { const d = db(); const row = { ...s, created_at: new Date().toISOString() }; d.strokes.push(row); save(d); emit({ type: "stroke", row, del: false }); },
    async deleteStroke(id) { const d = db(); d.strokes = d.strokes.filter((s) => s.id !== id); save(d); emit({ type: "stroke", row: { id }, del: true }); },
    async updateStroke(id, patch) { const d = db(); const s = d.strokes.find((x) => x.id === id); if (!s) return; Object.assign(s, patch); save(d); emit({ type: "stroke", row: s, del: false }); },
    async deleteMedia(path) { const d = db(); delete d.media[path]; save(d); },
    async removeMember(boardId, userId) { const d = db(); d.members = d.members.filter((m) => !(m.board_id === boardId && m.user_id === userId)); save(d); emit({ type: "members" }); },
    async leaveBoard(boardId) { return this.removeMember(boardId, meId()); },
    async deleteBoard(boardId) {
      const d = db(); const b = d.boards[boardId];
      const mine = d.members.filter((m) => m.board_id === boardId);
      if (!b || !(b.created_by === meId() || (mine.length === 1 && mine[0].user_id === meId()))) throw new Error("Only the person who made this board can delete it. You can leave it instead.");
      delete d.boards[boardId];
      for (const n of d.notes) if (n.board_id === boardId && n.media_path) delete d.media[n.media_path];
      for (const k of ["members", "notes", "reactions", "replies", "answers", "pings", "strokes", "messages", "reads", "bgreqs"]) d[k] = d[k].filter((x) => x.board_id !== boardId);
      save(d); emit({ type: "members" });
    },
    async listNotes(boardId) { return db().notes.filter((n) => n.board_id === boardId && !hiddenFromMe(n)).sort((a, b) => a.z - b.z); },
    async addNote(n) { if (typeof window !== "undefined" && window.__simOffline) throw new Error("Failed to fetch (simulated offline)"); const d = db(); const row = { pinned: false, ...n, id: uid(), created_at: new Date().toISOString() }; d.notes.push(row); save(d); emit({ type: "insert", note: row }); return row; },
    async updateNote(id, patch) {
      const d = db(); const n = d.notes.find((x) => x.id === id); if (!n) return;
      const looks = ["body", "color", "media_path", "meta", "kind", "scale", "rot", "flip_x", "flip_y", "show_at"];
      const owner = d.boards[n.board_id]?.created_by;
      if (looks.some((k) => k in patch && JSON.stringify(patch[k]) !== JSON.stringify(n[k])) && n.author_id !== meId() && owner !== meId())
        throw new Error("Only the person who made this, or the board owner, can change it");
      Object.assign(n, patch); save(d); emit({ type: "update", note: n });
    },
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
    async uploadAvatar(blob) {
      const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      const path = `avatars/${meId()}-${Date.now()}.jpg`; const d = db(); d.media[path] = dataUrl; save(d); return path;
    },
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
      const peers = {}; let presence = { name: me.name, color: me.color, visible: true, doodling: false };
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
    async gameBoard(boardId, game) {
      const rows = db().scores.filter((r) => r.board_id === boardId && r.game === game);
      const by = {};
      for (const r of rows) { const b = by[r.user_id] || (by[r.user_id] = { user_id: r.user_id, best: -1, plays: 0, best_at: null }); b.plays++; if (r.score > b.best) { b.best = r.score; b.best_at = r.created_at; } }
      return { best: Object.values(by).sort((a, b) => b.best - a.best), recent: rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 10) };
    },
    async saveScore(boardId, game, score, mode, roundId) {
      const d = db(); const row = { id: uid(), board_id: boardId, user_id: meId(), game, score, mode, round_id: roundId || null, created_at: new Date().toISOString() };
      d.scores.push(row); save(d); emit({ type: "score", row }); return row;
    },
    async listTtt(boardId) { return db().ttt.filter((g) => g.board_id === boardId).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)); },
    async tttChallenge(boardId, oId) {
      const d = db();
      if (d.ttt.some((g) => g.board_id === boardId && ["invited", "active"].includes(g.status) && [g.x_id, g.o_id].includes(oId) && [g.x_id, g.o_id].includes(meId()))) throw new Error("You already have a game going with them");
      const g = { id: uid(), board_id: boardId, x_id: meId(), o_id: oId, cells: "---------", turn: "X", status: "invited", winner: null, created_at: new Date().toISOString() };
      d.ttt.push(g); return tttSave(d, g);
    },
    async tttRespond(id, accept) {
      const d = db(), g = d.ttt.find((x) => x.id === id);
      if (!g) throw new Error("Game not found");
      if (g.o_id !== meId()) throw new Error("Only the person challenged can answer");
      if (g.status !== "invited") throw new Error("This challenge was already answered");
      g.status = accept ? "active" : "declined"; return tttSave(d, g);
    },
    async tttMove(id, cell) {
      const d = db(), g = d.ttt.find((x) => x.id === id);
      if (!g) throw new Error("Game not found");
      if (g.status !== "active") throw new Error("This game is not being played");
      const mark = meId() === g.x_id ? "X" : meId() === g.o_id ? "O" : null;
      if (!mark) throw new Error("You are watching this game, not playing");
      if (g.turn !== mark) throw new Error("Not your turn yet");
      if (g.cells[cell] !== "-") throw new Error("That square is taken");
      g.cells = g.cells.slice(0, cell) + mark + g.cells.slice(cell + 1);
      g.winner = tttWinner(g.cells); g.turn = mark === "X" ? "O" : "X"; if (g.winner) g.status = "done";
      return tttSave(d, g);
    },
    async tttQuit(id) {
      const d = db(), g = d.ttt.find((x) => x.id === id);
      if (!g || ![g.x_id, g.o_id].includes(meId())) throw new Error("Not your game");
      if (g.status === "invited") g.status = "cancelled";
      else if (g.status === "active") { g.status = "done"; g.winner = meId() === g.x_id ? "O" : "X"; }
      return tttSave(d, g);
    },
    // ---- Crazy 8s (demo) ----
    async c8List(boardId) { return db().c8.filter((g) => g.board_id === boardId).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)).map(c8Public); },
    async c8Challenge(boardId, oId) {
      const d = db();
      if (d.c8.some((g) => g.board_id === boardId && ["invited", "active"].includes(g.status) && [g.x_id, g.o_id].includes(oId) && [g.x_id, g.o_id].includes(meId()))) throw new Error("You already have a game going with them");
      const g = { id: uid(), board_id: boardId, x_id: meId(), o_id: oId, status: "invited", turn: "x", top: null, suit: null, deck: [], hand_x: [], hand_o: [], discard: [], x_count: 0, o_count: 0, draw_count: 0, winner: null, last_note: null, created_at: new Date().toISOString() };
      d.c8.push(g); c8Save(d, g); return c8Public(g);
    },
    async c8View(id) { const g = db().c8.find((x) => x.id === id); if (!g) throw new Error("Game not found"); return C8.view(g, c8Mark(g)); },
    async c8Respond(id, accept) {
      const d = db(), g = d.c8.find((x) => x.id === id);
      if (!g) throw new Error("Game not found");
      if (g.o_id !== meId()) throw new Error("Only the person challenged can answer");
      if (g.status !== "invited") throw new Error("This challenge was already answered");
      if (!accept) { g.status = "declined"; c8Save(d, g); return C8.view(g, c8Mark(g)); }
      Object.assign(g, C8.deal()); c8Save(d, g); return C8.view(g, c8Mark(g));
    },
    async c8Play(id, card, suit) {
      const d = db(), g = d.c8.find((x) => x.id === id); if (!g) throw new Error("Game not found");
      const mark = c8Mark(g); if (!mark) throw new Error("You are watching this game, not playing");
      const r = C8.play(g, mark, card, suit); if (r.err) throw new Error(r.err);
      c8Save(d, g); return C8.view(g, mark);
    },
    async c8Draw(id) {
      const d = db(), g = d.c8.find((x) => x.id === id); if (!g) throw new Error("Game not found");
      const mark = c8Mark(g); if (!mark) throw new Error("You are watching this game, not playing");
      const r = C8.draw(g, mark); if (r.err) throw new Error(r.err);
      c8Save(d, g); return C8.view(g, mark);
    },
    async c8Quit(id) {
      const d = db(), g = d.c8.find((x) => x.id === id); if (!g || ![g.x_id, g.o_id].includes(meId())) throw new Error("Not your game");
      if (g.status === "invited") g.status = "cancelled";
      else if (g.status === "active") { g.status = "done"; g.winner = meId() === g.x_id ? "o" : "x"; }
      c8Save(d, g); return C8.view(g, c8Mark(g));
    },
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
  strokes: new Map(),    // board ink: id -> row
  view: { tx: 0, ty: 0, s: 1 },
  views: {},             // what each person is looking at: id -> {cx, cy, s, at}
  cursors: new Map(),    // id -> {x, y, at, touch}
  msgs: [],              // messages you can see, oldest first
  reads: new Map(),      // "user|peer" -> read_at
  bgReqs: [],            // background requests you can see
  playing: null,         // id of the music card playing on the board
  urls: {},              // media path -> url
  scale: 1,
  dragId: null,
  lastSeen: ls.get("soy-last-seen", 0),
  v2: true,              // false when the v2 database upgrade hasn't been run
};
let live = null;

// ================================================================ ui helpers
let toastTimer;
function toast(msg, ms = 2600, action = null) {
  const t = $("#toast"); t.innerHTML = ""; t.hidden = false;
  t.appendChild(document.createTextNode(msg));
  if (action && action.label && typeof action.fn === "function") {
    const b = document.createElement("button"); b.className = "toast-action"; b.textContent = action.label;
    b.onclick = () => { t.hidden = true; clearTimeout(toastTimer); action.fn(); };
    t.appendChild(b);
  }
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
function others() { return state.members.filter((m) => m.id !== state.me?.id); }
function partner() { return others()[0]; }
function ownerName() { return memberById(state.board?.created_by)?.name || "the board's owner"; }
const listNames = (arr) => arr.length <= 2 ? arr.join(" and ") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
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
  if (prefersReducedMotion()) return;
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

// ================================================================ Batch B: connection, outbox, undo/redo
let outbox = ls.get("pinned-outbox", []) || [];
let flushing = false, realtimeDown = false, connHideT = 0;
const saveOutbox = () => ls.set("pinned-outbox", outbox);

function setConn(state_) {
  // state_: "online" | "offline" | "reconnecting"
  const banner = $("#connBanner"), txt = $("#connText");
  if (!banner) return;
  clearTimeout(connHideT);
  if (state_ === "offline") { txt.textContent = outbox.length ? `Offline — ${outbox.length} waiting to send` : "You're offline"; banner.hidden = false; }
  else if (state_ === "reconnecting") { txt.textContent = "Reconnecting…"; banner.hidden = false; }
  else { // online
    if (outbox.length) { txt.textContent = "Back online — sending…"; banner.hidden = false; }
    else connHideT = setTimeout(() => (banner.hidden = true), 1200);
  }
}
function updateConn() {
  if (!state.board) return;
  if (!navigator.onLine) setConn("offline");
  else if (realtimeDown) setConn("reconnecting");
  else setConn("online");
}

// Try to send everything queued while offline, in order. Stops on the first network failure.
async function flushOutbox() {
  if (flushing || !outbox.length || !state.board || !navigator.onLine) return;
  flushing = true;
  try {
    while (navigator.onLine) {
      const item = outbox.find((it) => it.row.board_id === state.board.id);   // only this board's queue
      if (!item) break;
      try {
        if (item.kind === "note") {
          const saved = await api.addNote(item.row);
          removeNoteEl(item.tempId);
          state.notes.delete(item.tempId);
          await upsertNote(saved);
          api.notify(state.board.id, "note", { note_id: saved.id });
        } else if (item.kind === "msg") {
          const saved = await api.sendMessage(item.row);
          state.msgs = state.msgs.filter((x) => x.id !== item.tempId);
          onMessageEvent(saved);
          api.notify(state.board.id, "message", item.row.to_id ? { to: item.row.to_id } : {});
        }
        outbox = outbox.filter((x) => x !== item); saveOutbox();
      } catch (e) {
        if (isNetworkError(e)) break;          // still offline — leave it queued
        outbox = outbox.filter((x) => x !== item); saveOutbox();   // a real rejection (bad data): drop it so it can't wedge the queue
        toast("One queued item couldn't be sent and was dropped");
      }
    }
  } finally { flushing = false; updateConn(); renderPendingCount(); if (!outbox.length && navigator.onLine) setConn("online"); }
}
function queueNote(row, tempId) { outbox.push({ kind: "note", row, tempId, at: Date.now() }); saveOutbox(); renderPendingCount(); }
function queueMsg(row, tempId) { outbox.push({ kind: "msg", row, tempId, at: Date.now() }); saveOutbox(); renderPendingCount(); }
function renderPendingCount() { if (!$("#connBanner").hidden) updateConn(); }

// ---- undo / redo (session-local, best-effort on a shared board) ----
const hist = { undo: [], redo: [] };
function pushHist(action) { hist.undo.push(action); if (hist.undo.length > 40) hist.undo.shift(); hist.redo.length = 0; renderHistBar(); }
function renderHistBar() {
  const bar = $("#histBar"); if (!bar) return;
  const any = hist.undo.length || hist.redo.length;
  bar.hidden = !any || !state.board;
  $("#histUndo").disabled = !hist.undo.length;
  $("#histRedo").disabled = !hist.redo.length;
}
async function doUndo() {
  const a = hist.undo.pop(); if (!a) return;
  renderHistBar();
  try { await a.undo(); hist.redo.push(a); haptic(10); toast(`Undid: ${a.label}`, 1800); }
  catch (e) { toast("Couldn't undo that"); }
  renderHistBar();
}
async function doRedo() {
  const a = hist.redo.pop(); if (!a) return;
  renderHistBar();
  try { await a.redo(); hist.undo.push(a); haptic(10); toast(`Redid: ${a.label}`, 1800); }
  catch (e) { toast("Couldn't redo that"); }
  renderHistBar();
}

// realtime connection status, with backoff resubscribe
let reconnectT = 0, reconnectTries = 0;
function onConnStatus(status) {
  if (status === "SUBSCRIBED") { realtimeDown = false; reconnectTries = 0; clearTimeout(reconnectT); updateConn(); flushOutbox(); }
  else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) { realtimeDown = true; updateConn(); scheduleResub(); }
}
function scheduleResub() {
  clearTimeout(reconnectT);
  if (!navigator.onLine || !state.board) return;
  const delay = Math.min(30000, 1500 * Math.pow(2, reconnectTries++));
  reconnectT = setTimeout(() => { if (state.board && navigator.onLine) { api.subscribe(state.board.id, boardHandlers()); refreshReads(); } }, delay);
}

// ================================================================ boot
async function boot() {
  hapticsOn = ls.get("pinned-haptics", true);
  applyTheme(ls.get("soy-theme", "cork"));
  handleJoinLink();
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
let pendingJoinCode = null;
function handleJoinLink() {
  try {
    const c = new URLSearchParams(location.search).get("join");
    if (c) { pendingJoinCode = c.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8); history.replaceState(null, "", location.pathname); }
  } catch { /* ignore */ }
}
const inviteUrl = (code) => location.origin + location.pathname + "?join=" + (code || "").replace(/[^A-Za-z0-9]/gi, "").toUpperCase();
async function renderInviteQR(code) {
  const cv = $("#waitQR"), wrap = $("#waitQrWrap"); if (!cv || cv.dataset.tried) return;
  cv.dataset.tried = "1";
  try {
    const m = await import("https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm");
    await (m.default || m).toCanvas(cv, inviteUrl(code), { width: 170, margin: 1, color: { dark: "#2d2416", light: "#ffffff" } });
    cv.dataset.ok = "1";
  } catch { if (wrap) { wrap.hidden = true; } $("#waitQrBtn").textContent = "Copy link"; }
}
function showPair() {
  show("#pair");
  if (pendingJoinCode) {
    const inp = $("#codeInput"); inp.value = fmtCode(pendingJoinCode);
    setTimeout(() => { inp.scrollIntoView({ block: "center" }); inp.focus(); }, 200);
    toast("Code filled in — tap Join board");
  }
}
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
  onStroke: onStrokeEvent,
  onMessage: onMessageEvent,
  onRead: onReadEvent,
  onBgRequest: onBgRequestEvent,
  onBoard: onBoardEvent,
  onScore: onScoreEvent,
  onTtt: onTttEvent,
  onC8: onC8Event,
  onConn: onConnStatus,
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
  loadChats(); loadBgRequests(); loadTtt(); loadC8();
  if (!games.race) raceSend("ask");
  api.getBoard?.(state.board.id).then((b) => b && onBoardEvent(b)).catch(() => {});
  markThreadRead();
  clearBadge();
  // phones drop the geolocation watch when backgrounded; restart it if we're meant to be sharing
  if (geo.on && geo.watch == null && !geo.denied && state.board) {
    geo.watch = navigator.geolocation.watchPosition(onGeoOk, onGeoErr, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
  }
}
async function openBoard(board) {
  state.board = board;
  show("#boardScreen");
  const sk = $("#boardSkeleton"); if (sk) sk.hidden = false;
  await refreshMembers();
  await resync();
  initView();
  if (sk) sk.hidden = true;
  applyBackground();
  loadChats();
  loadBgRequests();
  api.subscribe(board.id, boardHandlers());
  live = api.live(board.id, state.me, { onMessage: onLiveMessage, onPresence: onPresence });
  api.touchSeen(board.id);
  loadTtt(); loadC8();
  setTimeout(() => raceSend("ask"), 1500);
  // restore live-location sharing if it was on for this board
  geo.on = false; geo.me = null; geo.watch = null; geo.denied = false;
  if (ls.get(geoKey(), false)) startGeo();
  updateLocDot();
  refreshPushSubscription();
  refreshQuestionDot();
  clearBadge();
  // keep countdowns and scheduled notes current; pick up scheduled notes as their time comes
  clearInterval(ticker);
  let n = 0;
  ticker = setInterval(() => {
    tickNotes();
    expireCursors();
    if (document.visibilityState === "visible" && ++n % 4 === 0) api.touchSeen(state.board.id);
    if (document.visibilityState === "visible") { resync().catch(() => {}); refreshReads(); }
    flushOutbox();
  }, 30000);
  renderHistBar();
  updateConn();
  flushOutbox();
}

async function resync() {
  if (!state.board) return;
  const rows = await api.listNotes(state.board.id);
  const ids = new Set(rows.map((r) => r.id));
  for (const id of [...state.notes.keys()]) if (!ids.has(id) && !state.notes.get(id)?._pending) removeNoteEl(id);
  await loadUrls(rows);
  await loadExtras();
  for (const r of rows) upsertNote(r);
  updateEmpty();
  markPartnerSeen();
}

async function loadExtras() {
  try {
    const strokes = await api.listStrokes(state.board.id);
    const ids = new Set(strokes.map((s) => s.id));
    for (const id of [...state.strokes.keys()]) if (!ids.has(id)) removeInk(id);
    for (const s of strokes) addInk(s);
  } catch { /* strokes arrive with the v4 upgrade */ }
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

async function ensureAvatars(members) {
  const paths = members.map((m) => m.avatar_path).filter((p) => p && !state.urls[p]);
  if (!paths.length) return;
  try { const urls = await api.mediaUrls(paths); Object.assign(state.urls, urls); } catch { /* ignore */ }
}
async function refreshMembers() {
  if (!state.board) return;
  state.members = await api.members(state.board.id);
  await ensureAvatars(state.members);
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
  if (waiting) renderInviteQR(state.board.code);
  renderMemberList();
  for (const n of state.notes.values()) { const el = noteEl(n.id); if (el) decorate(el, n); }
}

function latestMood(userId) {
  const p = state.pings.find((x) => x.user_id === userId && x.kind.startsWith("mood_"));
  return p && Date.now() - new Date(p.created_at).getTime() < 24 * 3600 * 1000 ? PING_EMOJI[p.kind] : null;
}

function isOnline(id) { const p = state.presence[id]; return !!p && p.visible !== false; }
function isActive(id) { const c = state.cursors.get(id); return isOnline(id) && !!c && Date.now() - c.at < 15000; }

function chipEl(m) {
  const c = document.createElement("span");
  c.className = "chip"; c.style.background = BRIGHT[m.color] || BRIGHT.c1;
  const av = m.avatar_path && state.urls[m.avatar_path];
  if (av) { c.classList.add("has-av"); c.style.backgroundImage = `url("${av}")`; c.textContent = ""; }
  else c.textContent = (m.name || "?").slice(0, 1).toUpperCase();
  c.title = m.name;
  const mood = latestMood(m.id);
  if (mood) { const i = document.createElement("i"); i.className = "mood"; i.textContent = mood; c.appendChild(i); }
  if (m.id !== state.me?.id && isOnline(m.id)) { const o = document.createElement("i"); o.className = "on"; c.appendChild(o); }
  return c;
}

function renderChips() {
  const chips = $("#memberChips"); chips.innerHTML = "";
  // you first, then whoever is online, then everyone else
  const list = [...state.members].sort((a, b) => (a.id === state.me?.id ? -1 : b.id === state.me?.id ? 1 : isOnline(b.id) - isOnline(a.id)));
  const max = 4;
  for (const m of list.slice(0, max)) chips.appendChild(chipEl(m));
  if (list.length > max) { const more = document.createElement("span"); more.className = "chip more"; more.textContent = "+" + (list.length - max); chips.appendChild(more); }
  if (!$("#people").hidden) renderPeople();
}

function openPeople() { renderPeople(); renderVoiceJoin(); $("#people").hidden = false; $("#peopleBackdrop").hidden = false; refreshMembers().catch(() => {}); }
function closePeople() { $("#people").hidden = true; $("#peopleBackdrop").hidden = true; }

function renderPeople() {
  const ul = $("#peopleList"); ul.innerHTML = "";
  const list = [...state.members].sort((a, b) => (a.id === state.me?.id ? -1 : b.id === state.me?.id ? 1 : (isActive(b.id) - isActive(a.id)) || (isOnline(b.id) - isOnline(a.id))));
  $("#peopleCount").textContent = `${state.members.length} of 10 · ${list.filter((m) => m.id !== state.me?.id && isOnline(m.id)).length} online`;
  $("#peopleCode").textContent = fmtCode(state.board?.code);
  for (const m of list) {
    const li = document.createElement("li");
    li.appendChild(chipEl(m));
    const info = document.createElement("div"); info.className = "info";
    const nm = document.createElement("div"); nm.className = "nm"; nm.textContent = m.name + (m.id === state.me?.id ? " (you)" : "");
    if (m.id === state.board?.created_by) { const o = document.createElement("small"); o.textContent = "owner"; nm.appendChild(o); }
    const st = document.createElement("div"); st.className = "st"; st.appendChild(document.createElement("i"));
    let txt;
    if (m.id === state.me?.id) { txt = "Online"; st.classList.add("online"); }
    else if (isActive(m.id)) { txt = state.presence[m.id]?.doodling ? "Active now · drawing together" : "Active now"; st.classList.add("active"); }
    else if (isOnline(m.id)) { txt = "Online"; st.classList.add("online"); }
    else txt = m.last_seen ? `Last seen ${timeAgo(m.last_seen)}` : "Offline";
    st.appendChild(document.createTextNode(txt));
    info.append(nm, st);
    if (m.bio) { const b = document.createElement("div"); b.className = "bio"; b.textContent = m.bio; info.appendChild(b); }
    li.appendChild(info);
    if (m.id !== state.me?.id) {
      const b = document.createElement("button"); b.className = "btn small"; b.textContent = "Find";
      b.disabled = !state.views[m.id];
      b.title = state.views[m.id] ? `Jump to where ${m.name} is looking` : `${m.name} isn't on the board right now`;
      b.onclick = () => { closePeople(); findPerson(m.id); };
      li.appendChild(b);
    }
    ul.appendChild(li);
  }
}

// ================================================================ live location (opt-in, both ways)
// Each person shares their OWN location and can see anyone else who is sharing.
// It's broadcast over the live presence channel only — never saved to the database.
const geo = { on: false, watch: null, me: null, lastSent: 0, denied: false };
const geoKey = () => "pinned-geo-" + (state.board?.id || "");

function haversine(a, b) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
  const la1 = a.lat * toR, la2 = b.lat * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function bearing(a, b) {
  const toR = Math.PI / 180;
  const y = Math.sin((b.lng - a.lng) * toR) * Math.cos(b.lat * toR);
  const x = Math.cos(a.lat * toR) * Math.sin(b.lat * toR) - Math.sin(a.lat * toR) * Math.cos(b.lat * toR) * Math.cos((b.lng - a.lng) * toR);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const compassOf = (deg) => COMPASS[Math.round(deg / 45) % 8];
function fmtDist(m) {
  const ft = m * 3.28084;
  if (ft < 528) return `${Math.round(ft / 10) * 10} ft`;            // under ~0.1 mi: feet
  const mi = m / 1609.344;
  return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;
}
function fmtAcc(m) { return m == null ? "" : m < 1609 ? `±${Math.round(m * 3.28084)} ft` : `±${(m / 1609.344).toFixed(1)} mi`; }

function startGeo() {
  if (!("geolocation" in navigator)) { toast("This device can't share location."); return; }
  geo.on = true; geo.denied = false;
  try { ls.set(geoKey(), true); } catch { /* ignore */ }
  renderLoc(); updateLocDot();
  geo.watch = navigator.geolocation.watchPosition(onGeoOk, onGeoErr, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
}
function stopGeo(silent = false) {
  geo.on = false; geo.me = null;
  if (geo.watch != null) { try { navigator.geolocation.clearWatch(geo.watch); } catch { /* ignore */ } geo.watch = null; }
  try { ls.set(geoKey(), false); } catch { /* ignore */ }
  live?.track({ loc: null });            // clear it for everyone right away
  if (!silent) renderLoc();
  updateLocDot();
}
function onGeoOk(pos) {
  const c = pos.coords;
  geo.me = { lat: c.latitude, lng: c.longitude, acc: c.accuracy, at: Date.now() };
  const now = Date.now();
  // send at most every 5s (presence updates are cheap but no need to spam)
  if (now - geo.lastSent > 5000 || !geo.lastSent) { geo.lastSent = now; live?.track({ loc: geo.me }); }
  renderLoc();
}
function onGeoErr(err) {
  if (err && err.code === 1) {            // permission denied
    geo.denied = true; stopGeo(true);
    toast("Location permission was blocked. Turn it on for this site in your phone's settings, then try again.", 5000);
  } else toast("Couldn't get your location. Make sure location is on.", 4000);
  renderLoc();
}

function toggleGeo() {
  if (geo.on) stopGeo(); else startGeo();
}

function openLoc() {
  closePeople();
  renderLoc();
  $("#locPanel").hidden = false; $("#locBackdrop").hidden = false;
}
function closeLoc() { $("#locPanel").hidden = true; $("#locBackdrop").hidden = true; }

function sharers() {
  // everyone (incl. me) who currently has a location on the board
  const out = [];
  if (geo.on && geo.me) out.push({ id: state.me.id, loc: geo.me, me: true });
  for (const m of others()) { const p = state.presence[m.id]; if (p && p.loc && isOnline(m.id)) out.push({ id: m.id, loc: p.loc, me: false }); }
  return out;
}

function updateLocDot() {
  const anyone = sharers().length > 0;
  const d = $("#locDot"); if (d) d.hidden = !anyone;
  const btn = $("#toolLoc"); if (btn) btn.setAttribute("aria-pressed", String(geo.on));
}

function renderLoc() {
  updateLocDot();
  if ($("#locPanel").hidden) return;
  const sw = $("#locSwitch");
  sw.setAttribute("aria-checked", String(geo.on));
  $("#locMyState").textContent = geo.on
    ? (geo.me ? `On · updated ${timeAgo(new Date(geo.me.at).toISOString())}` : "On · getting your location…")
    : (geo.denied ? "Blocked in your phone's settings" : "Off");
  const list = sharers().filter((s) => !s.me);
  $("#locCount").textContent = geo.on ? `${list.length} sharing with you` : "";
  const ul = $("#locList"); ul.innerHTML = "";
  if (!geo.on) return;
  if (!list.length) {
    const li = document.createElement("li"); li.className = "loc-empty";
    li.textContent = others().length ? "Nobody else is sharing right now. They'll show up here when they turn it on." : "Invite someone to the board first.";
    ul.appendChild(li); return;
  }
  for (const s of list) {
    const m = memberById(s.id) || { name: "Someone", color: "c1" };
    const li = document.createElement("li");
    li.appendChild(chipEl({ ...m, id: s.id }));
    const info = document.createElement("div"); info.className = "info";
    info.appendChild(Object.assign(document.createElement("div"), { className: "nm", textContent: m.name }));
    const st = document.createElement("div"); st.className = "st";
    if (geo.me) {
      const dist = haversine(geo.me, s.loc), dir = compassOf(bearing(geo.me, s.loc));
      st.textContent = `${fmtDist(dist)} ${dir} · ${fmtAcc(s.loc.acc)} · ${timeAgo(new Date(s.loc.at).toISOString())}`;
    } else st.textContent = `${fmtAcc(s.loc.acc)} · ${timeAgo(new Date(s.loc.at).toISOString())}`;
    info.appendChild(st);
    li.appendChild(info);
    const a = document.createElement("a"); a.className = "btn small"; a.textContent = "Map";
    a.href = `https://www.google.com/maps?q=${s.loc.lat},${s.loc.lng}`; a.target = "_blank"; a.rel = "noopener";
    li.appendChild(a);
    ul.appendChild(li);
  }
}

// ================================================================ endless canvas
// world coords: notes keep x/y forever. screen = world * s + t
const MIN_S = 0.08, MAX_S = 3;   // 8% lets you see a big area of the board at once
let viewRaf = 0, viewSaveT = 0, viewSendT = 0;
function vp() { return $("#scroller").getBoundingClientRect(); }
function toWorld(cx, cy) { const r = vp(), v = state.view; return { x: (cx - r.left - v.tx) / v.s, y: (cy - r.top - v.ty) / v.s }; }

function applyView() {
  if (viewRaf) return;
  viewRaf = requestAnimationFrame(() => {
    viewRaf = 0;
    const { tx, ty, s } = state.view;
    $("#board").style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    const sc = $("#scroller");
    sc.style.backgroundPosition = `${tx}px ${ty}px`;
    for (const el of document.querySelectorAll("#cursors .cursor")) placeCursor(el);
    if (sel) renderSel();
    const now = Date.now();
    if (state.board && now - viewSaveT > 400) { viewSaveT = now; ls.set("pinned-view-" + state.board.id, state.view); }
    if (now - viewSendT > 500) { viewSendT = now; sendView(); }
  });
}

function sendView() {
  if (!live || !state.me || document.visibilityState !== "visible") return;
  const r = vp(), c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  live.send({ t: "view", u: state.me.id, cx: Math.round(c.x), cy: Math.round(c.y), s: +state.view.s.toFixed(2) });
}

function setView(v, animate = false) {
  const target = { tx: v.tx, ty: v.ty, s: Math.min(MAX_S, Math.max(MIN_S, v.s)) };
  if (!animate) { state.view = target; return applyView(); }
  const from = { ...state.view }, t0 = performance.now(), dur = 380;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    state.view = { tx: from.tx + (target.tx - from.tx) * e, ty: from.ty + (target.ty - from.ty) * e, s: from.s + (target.s - from.s) * e };
    applyView();
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function centerOn(wx, wy, s, animate = true) {
  const r = vp();
  setView({ s, tx: r.width / 2 - wx * s, ty: r.height / 2 - wy * s }, animate);
}

function zoomAt(cx, cy, factor) {
  const v = state.view, r = vp();
  const s = Math.min(MAX_S, Math.max(MIN_S, v.s * factor));
  const wx = (cx - r.left - v.tx) / v.s, wy = (cy - r.top - v.ty) / v.s;
  setView({ s, tx: cx - r.left - wx * s, ty: cy - r.top - wy * s });
}

function noteBox(n) {
  const el = noteEl(n.id), s = n.scale || 1;
  const w = el ? el.offsetWidth : 150, h = el ? el.offsetHeight : 150;
  return { x: n.x - (w * s - w) / 2, y: n.y - (h * s - h) / 2, w: w * s, h: h * s };
}

function goHome(animate = true) {
  const r = vp();
  const notes = [...state.notes.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 6);
  if (!notes.length) return centerOn(BOARD_W / 2, 320, Math.min(1.2, Math.max(0.6, r.width / BOARD_W)), animate);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of notes) { const b = noteBox(n); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
  const pad = 40;
  const s = Math.min(1.2, Math.max(MIN_S, Math.min(r.width / (x1 - x0 + pad * 2), (r.height - 140) / (y1 - y0 + pad * 2))));
  centerOn((x0 + x1) / 2, (y0 + y1) / 2 + 30 / s, s, animate);
}

function initView() {
  const saved = ls.get("pinned-view-" + state.board.id);
  if (saved && isFinite(saved.s)) setView(saved);
  else goHome(false);
}

function findPerson(id) {
  const v = state.views[id];
  const m = memberById(id);
  if (!v) return toast(`${m?.name || "They"} isn't on the board right now`);
  centerOn(v.cx, v.cy, v.s || 1);
  toast(`Here's where ${m?.name || "they"} ${isOnline(id) ? "is" : "was"} looking 👀`);
}

function findSomeone() {
  const list = others().filter((m) => state.views[m.id]);
  if (!list.length) return toast(others().length ? "Nobody else is on the board right now" : "It's just you on this board so far");
  // most recently active first
  list.sort((a, b) => (state.views[b.id].at || 0) - (state.views[a.id].at || 0));
  findPerson(list[0].id);
}

function layoutBoard() { applyView(); }

// ---------------------------------------------------------------- gestures
// One gesture system for the whole canvas:
//   touch: drag empty space = pan · hold a note then drag = move it · tap a note = open · two fingers = pinch zoom
//   mouse: drag empty space = pan · drag a note = move it · click = open · wheel = zoom
//   draw mode: one finger/mouse draws · two fingers still pan and zoom
const pointers = new Map();
let gest = null, pinch = null;

function wireCanvas() {
  const sc = $("#scroller");
  sc.addEventListener("pointerdown", onDown);
  sc.addEventListener("pointermove", onMove);
  sc.addEventListener("pointerup", onUp);
  sc.addEventListener("pointercancel", onUp);
  sc.addEventListener("lostpointercapture", (e) => { if (pointers.has(e.pointerId)) onUp(e); });
  sc.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.shiftKey && !e.ctrlKey) { setView({ ...state.view, tx: state.view.tx - (e.deltaX || e.deltaY), ty: state.view.ty }); return; }
    zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
  }, { passive: false });
  sc.addEventListener("contextmenu", (e) => e.preventDefault());
  sc.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") sendCursor(null); });
}

function onDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  $("#scroller").setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) return startPinch();
  if (pointers.size > 2) return;
  const touch = e.pointerType !== "mouse";
  const handle = e.target.closest?.("#sel .h");
  if (handle && sel) { gest = { id: e.pointerId, sx: e.clientX, sy: e.clientY, touch, type: handle.dataset.h === "rot" ? "rotate" : "resize" }; beginTransform(e); return; }
  const noteT = e.target.closest?.("#board .note");
  gest = { id: e.pointerId, sx: e.clientX, sy: e.clientY, touch, noteId: noteT?.dataset.id || null, strokeId: null, type: "pending",
    ctl: e.target.closest?.(".lk-play, .lk-stop, .lk-open")?.className || null };
  if (inkMode) { gest.type = "ink"; inkStart(e); return; }
  if (!gest.noteId) gest.strokeId = hitOwnStroke(e);
  gest.selected = !!sel && (sel.id === gest.noteId || sel.id === gest.strokeId);
  if (gest.noteId && touch && !gest.selected) gest.hold = setTimeout(() => { if (gest?.type === "pending") startNoteDrag(); }, 280);
}

function onMove(e) {
  sendCursor(e);
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch) return movePinch();
  if (!gest || gest.id !== e.pointerId) return;
  const dx = e.clientX - gest.sx, dy = e.clientY - gest.sy;
  if (gest.type === "ink") return inkMove(e);
  if (gest.type === "resize" || gest.type === "rotate") return moveTransform(e);
  if (gest.type === "pending" && Math.hypot(dx, dy) > 7) {
    clearTimeout(gest.hold);
    if (gest.noteId && (!gest.touch || gest.selected)) startNoteDrag();
    else if (gest.strokeId && gest.selected) startStrokeDrag();
    else { gest.type = "pan"; gest.tx = state.view.tx; gest.ty = state.view.ty; $("#scroller").classList.add("panning"); }
  }
  if (gest.type === "pan") setView({ s: state.view.s, tx: gest.tx + dx, ty: gest.ty + dy });
  if (gest.type === "note") moveNoteDrag(dx, dy);
  if (gest.type === "sdrag") { sel.pv.dx = dx / state.view.s; sel.pv.dy = dy / state.view.s; previewStroke(); }
}

function onUp(e) {
  pointers.delete(e.pointerId);
  if (pinch) { if (pointers.size < 2) { const p = pinch; pinch = null; gest = null; if (p.item) commitTransform(); } return; }
  if (!gest || gest.id !== e.pointerId) return;
  clearTimeout(gest.hold);
  const g = gest; gest = null;
  $("#scroller").classList.remove("panning");
  if (g.type === "ink") inkEnd();
  else if (g.type === "note") endNoteDrag(g);
  else if (g.type === "resize" || g.type === "rotate" || g.type === "sdrag") commitTransform();
  else if (g.type === "pending" && e.type === "pointerup") {
    if (g.touch) swallowGhostClick();
    onTap(g);
  }
  if (g.touch) sendCursor(null);
}

// tap: select something you can edit; tap it again (or anything you can't edit) to open it
function onTap(g) {
  if (g.noteId) {
    const n = state.notes.get(g.noteId); if (!n) return;
    if (g.ctl && n.kind === "link") {
      if (/lk-open/.test(g.ctl)) { window.open(n.meta?.url, "_blank", "noopener"); return; }
      return playCard(n.id);
    }
    if (sel?.type === "note" && sel.id === n.id) { deselect(); return openDetail(n.id); }
    if (canEdit(n)) return select("note", n.id);
    deselect();
    return openDetail(n.id);
  }
  if (g.strokeId) return select("stroke", g.strokeId);
  deselect();
}

// After a touch tap, phones fire a delayed "click" at the same spot. If a sheet or toolbar has just
// appeared there, that click would hit it, so eat it.
function swallowGhostClick() {
  const eat = (ev) => { ev.stopPropagation(); ev.preventDefault(); document.removeEventListener("click", eat, true); };
  document.addEventListener("click", eat, true);   // only the one ghost click
  setTimeout(() => document.removeEventListener("click", eat, true), 450);
}

function startPinch() {
  const onItem = gest && sel && (gest.selected || gest.type === "note" && gest.noteId === sel.id);
  if (gest) {
    clearTimeout(gest.hold);
    if (gest.type === "ink") inkCancel();
    if (gest.type === "note") endNoteDrag(gest);
    gest = null;
  }
  const [a, b] = [...pointers.values()];
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), s0: state.view.s, w: toWorld(mid.x, mid.y) };
  if (onItem) { pinch.item = true; beginTransform(null); }   // two fingers on the selected item: resize + twist it
}

function movePinch() {
  const [a, b] = [...pointers.values()]; if (!a || !b) return;
  const d = Math.hypot(a.x - b.x, a.y - b.y), ang = Math.atan2(b.y - a.y, b.x - a.x);
  if (pinch.item) {
    applyTransform(d / pinch.d0, (ang - pinch.a0) * 180 / Math.PI);
    return;
  }
  const r = vp();
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const s = Math.min(MAX_S, Math.max(MIN_S, pinch.s0 * d / pinch.d0));
  setView({ s, tx: mid.x - r.left - pinch.w.x * s, ty: mid.y - r.top - pinch.w.y * s });
}

function startNoteDrag() {
  const n = state.notes.get(gest.noteId); const el = noteEl(gest.noteId);
  if (!n || !el) return;
  if (n.pinned) {
    toast("It's pinned. Tap it and choose Unpin to move it.");
    gest.type = "pan"; gest.tx = state.view.tx; gest.ty = state.view.ty; gest.sx = pointers.get(gest.id)?.x ?? gest.sx; gest.sy = pointers.get(gest.id)?.y ?? gest.sy;
    return;
  }
  gest.type = "note"; gest.ox = n.x; gest.oy = n.y;
  n._dragFrom = { x: n.x, y: n.y, z: n.z };
  state.dragId = n.id;
  el.classList.add("dragging");
  el.style.zIndex = "2147483000";
  el.style.transform = noteTransform(n, "scale(1.06)");
  if (navigator.vibrate) navigator.vibrate(12);
}

function moveNoteDrag(dx, dy) {
  const n = state.notes.get(gest.noteId), el = noteEl(gest.noteId); if (!n || !el) return;
  n.x = Math.round(gest.ox + dx / state.view.s); n.y = Math.round(gest.oy + dy / state.view.s);
  el.style.left = n.x + "px"; el.style.top = n.y + "px";
  if (sel?.id === n.id) renderSel();
}

async function endNoteDrag(g) {
  const n = state.notes.get(g.noteId), el = noteEl(g.noteId);
  if (!n || !el) return;
  el.classList.remove("dragging");
  n.z = Date.now();
  placeNote(el, n);
  const from = n._dragFrom; delete n._dragFrom;
  const to = { x: n.x, y: n.y, z: n.z };
  const moved = from && (Math.abs(from.x - to.x) > 1 || Math.abs(from.y - to.y) > 1);
  try {
    await api.updateNote(n.id, to);
    if (moved) pushHist({ label: "move", undo: () => moveNoteTo(n.id, from), redo: () => moveNoteTo(n.id, to) });
  } catch (e) {
    if (isNetworkError(e)) { updateConn(); toast("Offline — reconnect to save where you moved it", 3000); }
    else toast("Couldn't save the move");
  }
  setTimeout(() => { if (state.dragId === n.id) state.dragId = null; }, 600);
}
async function moveNoteTo(id, pos) {
  const n = state.notes.get(id); if (!n) return;
  Object.assign(n, pos); const el = noteEl(id); if (el) placeNote(el, n);
  await api.updateNote(id, pos);
}

// ================================================================ select · resize · rotate · flip
// sel = { type: "note" | "stroke", id, pv: live preview for lines {dx, dy, sc, rot, fx, fy}, t0: values when a transform began }
let sel = null;

function canEdit(n) { return n.author_id === state.me?.id || state.board?.created_by === state.me?.id; }

function hitOwnStroke(e) {
  const w = toWorld(e.clientX, e.clientY), r = 12 / state.view.s;
  const list = [...state.strokes.values()].filter((s) => s.author_id === state.me?.id && !s._live).reverse();
  for (const s of list) {
    const pad = r + s.width / 2;
    if (s.points.some(([x, y]) => Math.abs(x - w.x) < pad && Math.abs(y - w.y) < pad && Math.hypot(x - w.x, y - w.y) < pad)) return s.id;
  }
  return null;
}

function strokeBox(s) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of s.points) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const p = s.width / 2 + 4;
  return { x: x0 - p, y: y0 - p, w: x1 - x0 + p * 2, h: y1 - y0 + p * 2 };
}

function select(type, id) {
  if (sel && sel.id !== id) deselect();
  sel = { type, id, pv: { dx: 0, dy: 0, sc: 1, rot: 0, fx: 1, fy: 1 } };
  document.body.classList.add("selecting");
  $("#selBar").hidden = false;
  const isNote = type === "note";
  for (const b of document.querySelectorAll("#selBar [data-for]")) b.hidden = b.dataset.for !== (isNote ? "note" : "stroke") && b.dataset.for !== "both";
  if (isNote) noteEl(id)?.classList.add("selected");
  renderSel();
}

function deselect() {
  if (!sel) return;
  if (sel.type === "note") noteEl(sel.id)?.classList.remove("selected");
  if (sel.type === "stroke") { inkPathEl(sel.id)?.removeAttribute("transform"); }
  sel = null;
  document.body.classList.remove("selecting");
  $("#selBar").hidden = true;
  $("#sel").hidden = true;
}

function renderSel() {
  const box = $("#sel");
  if (!sel) { box.hidden = true; return; }
  let x, y, w, h, tf;
  if (sel.type === "note") {
    const n = state.notes.get(sel.id), el = noteEl(sel.id);
    if (!n || !el) return deselect();
    w = el.offsetWidth; h = el.offsetHeight; x = n.x; y = n.y;
    tf = `rotate(${n.rot || 0}deg) scale(${n.scale || 1})`;
    box.style.setProperty("--k", 1 / (state.view.s * (n.scale || 1)));
  } else {
    const s = state.strokes.get(sel.id);
    if (!s) return deselect();
    const b = strokeBox(s), p = sel.pv;
    ({ x, y, w, h } = b);
    tf = `translate(${p.dx}px, ${p.dy}px) rotate(${p.rot}deg) scale(${p.sc})`;
    box.style.setProperty("--k", 1 / (state.view.s * p.sc));
  }
  Object.assign(box.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px", transform: tf });
  box.hidden = false;
}

function selCenter() {
  if (sel.type === "note") {
    const n = state.notes.get(sel.id), el = noteEl(sel.id);
    return { x: n.x + el.offsetWidth / 2, y: n.y + el.offsetHeight / 2 };
  }
  const b = strokeBox(state.strokes.get(sel.id));
  return { x: b.x + b.w / 2 + sel.pv.dx, y: b.y + b.h / 2 + sel.pv.dy };
}

function beginTransform(e) {
  const c = selCenter();
  if (sel.type === "note") {
    const n = state.notes.get(sel.id);
    sel.t0 = { sc: n.scale || 1, rot: n.rot || 0 };
    state.dragId = n.id;
  } else sel.t0 = { sc: sel.pv.sc, rot: sel.pv.rot };
  if (e) {
    const w = toWorld(e.clientX, e.clientY);
    sel.t0.c = c; sel.t0.d = Math.hypot(w.x - c.x, w.y - c.y) || 1; sel.t0.a = Math.atan2(w.y - c.y, w.x - c.x);
  }
}

function moveTransform(e) {
  const w = toWorld(e.clientX, e.clientY), c = sel.t0.c;
  if (gest.type === "resize") applyTransform(Math.hypot(w.x - c.x, w.y - c.y) / sel.t0.d, 0);
  else applyTransform(1, (Math.atan2(w.y - c.y, w.x - c.x) - sel.t0.a) * 180 / Math.PI);
}

const snapAngle = (deg) => { const r = ((deg % 360) + 360) % 360; for (const t of [0, 90, 180, 270, 360]) if (Math.abs(r - t) < 5) return deg - r + t; return deg; };

function applyTransform(k, dRot) {
  const sc = Math.min(4, Math.max(0.3, sel.t0.sc * k));
  const rot = Math.round(snapAngle(sel.t0.rot + dRot) * 10) / 10;
  if (sel.type === "note") {
    const n = state.notes.get(sel.id), el = noteEl(sel.id); if (!n || !el) return;
    n.scale = Math.round(sc * 100) / 100; n.rot = rot;
    el.style.transform = noteTransform(n);
    renderSel();
  } else { sel.pv.sc = sc; sel.pv.rot = rot; previewStroke(); }
}

function startStrokeDrag() { gest.type = "sdrag"; sel.pv.dx0 = sel.pv.dx; sel.pv.dy0 = sel.pv.dy; }

function previewStroke() {
  const s = state.strokes.get(sel.id); if (!s) return;
  const b = strokeBox(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2, p = sel.pv;
  inkPathEl(s.id)?.setAttribute("transform", `translate(${cx + p.dx} ${cy + p.dy}) rotate(${p.rot}) scale(${p.sc * p.fx} ${p.sc * p.fy}) translate(${-cx} ${-cy})`);
  renderSel();
}

async function commitTransform() {
  if (!sel) return;
  if (sel.type === "note") {
    const n = state.notes.get(sel.id); if (!n) return;
    const prev = sel.t0 || {};
    try { await api.updateNote(n.id, { scale: n.scale || 1, rot: n.rot || 0 }); }
    catch (e) { n.scale = prev.sc; n.rot = prev.rot; const el = noteEl(n.id); if (el) placeNote(el, n); editError(e); }
    setTimeout(() => { if (state.dragId === n.id) state.dragId = null; }, 600);
  } else await bakeStroke();
}

// lines are saved with the move/size/turn/flip baked into their points
async function bakeStroke() {
  const s = state.strokes.get(sel.id); if (!s) return;
  const p = sel.pv;
  if (!p.dx && !p.dy && p.sc === 1 && !p.rot && p.fx === 1 && p.fy === 1) return;
  const b = strokeBox(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const rad = p.rot * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
  const points = s.points.map(([x, y]) => {
    const lx = (x - cx) * p.sc * p.fx, ly = (y - cy) * p.sc * p.fy;
    return [+(cx + p.dx + lx * cos - ly * sin).toFixed(1), +(cy + p.dy + lx * sin + ly * cos).toFixed(1)];
  });
  const old = { points: s.points, width: s.width };
  s.points = points; s.width = +(s.width * p.sc).toFixed(2);
  sel.pv = { dx: 0, dy: 0, sc: 1, rot: 0, fx: 1, fy: 1 };
  inkPathEl(s.id)?.removeAttribute("transform");
  drawInk(s); renderSel();
  try { await api.updateStroke(s.id, { points: s.points, width: s.width }); }
  catch (e) { Object.assign(s, old); drawInk(s); renderSel(); /schema|policy|permission/i.test(e.message || "") ? toast("Changing lines needs upgrade-v5.sql in Supabase", 4000) : toast("Couldn't save that change"); }
}

function editError(e) {
  const m = e?.message || "";
  if (/Only the person/i.test(m)) toast("Only the person who made this, or the board owner, can change it", 4000);
  else if (/column|schema cache|scale/i.test(m)) toast("Resizing and flipping need upgrade-v5.sql in Supabase", 4000);
  else toast("Couldn't save that change");
}

async function selRotate(deg) {
  if (!sel) return;
  if (sel.type === "note") { beginTransform(null); applyTransform(1, deg); return commitTransform(); }
  sel.pv.rot += deg; previewStroke(); bakeStroke();
}

async function selFlip(axis) {
  if (!sel) return;
  if (sel.type === "stroke") { sel.pv[axis === "x" ? "fx" : "fy"] *= -1; previewStroke(); return bakeStroke(); }
  const n = state.notes.get(sel.id), el = noteEl(sel.id); if (!n || !el) return;
  const k = axis === "x" ? "flip_x" : "flip_y";
  n[k] = !n[k]; placeNote(el, n);
  try { await api.updateNote(n.id, { [k]: n[k] }); } catch (e) { n[k] = !n[k]; placeNote(el, n); editError(e); }
}

async function selReset() {
  if (!sel || sel.type !== "note") return;
  const n = state.notes.get(sel.id), el = noteEl(sel.id); if (!n || !el) return;
  const prev = { scale: n.scale, rot: n.rot, flip_x: n.flip_x, flip_y: n.flip_y };
  Object.assign(n, { scale: 1, rot: 0, flip_x: false, flip_y: false }); placeNote(el, n);
  try { await api.updateNote(n.id, { scale: 1, rot: 0, flip_x: false, flip_y: false }); }
  catch (e) { Object.assign(n, prev); placeNote(el, n); editError(e); }
}

function selDeleteStroke() {
  if (sel?.type !== "stroke") return;
  const s = state.strokes.get(sel.id); deselect(); if (!s) return;
  removeInk(s.id);
  api.deleteStroke(s.id).catch(() => { addInk(s); toast("Couldn't delete that line"); });
}

// ---------------------------------------------------------------- edit sheet
let editId = null, editPhoto = null, editColor = "c1";
function openEdit(id) {
  const n = state.notes.get(id); if (!n) return;
  if (!canEdit(n)) return toast("Only the person who made this, or the board owner, can change it");
  if (n.kind === "link") return toast("Link cards can be resized, rotated and flipped, but not edited");
  editId = id; editPhoto = null; editColor = n.color || "c1";
  for (const s of document.querySelectorAll("#edit [data-kinds]")) s.hidden = !s.dataset.kinds.split(" ").includes(n.kind);
  $("#eText").value = n.kind === "text" ? n.body || "" : "";
  $("#eEmoji").value = n.kind === "emoji" ? n.body || "" : "";
  $("#eCap").value = n.kind === "image" ? n.body || "" : "";
  $("#ePhotoName").textContent = "";
  if (n.kind === "countdown") {
    const t = new Date(n.meta?.target || Date.now());
    $("#eCdTitle").value = n.meta?.title || "";
    $("#eCdDate").value = localDateKey(t);
    $("#eCdTime").value = n.meta?.allDay ? "" : `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
  }
  swatchRow($("#eSwatches"), editColor, (c) => (editColor = c));
  $("#editTitle").textContent = { text: "Edit note", emoji: "Change emoji", image: "Edit photo", drawing: "Edit drawing", voice: "Edit voice note", countdown: "Edit countdown" }[n.kind] || "Edit";
  openSheet("edit");
}

async function saveEdit() {
  const n = state.notes.get(editId); if (!n) return closeSheet("edit");
  const patch = {};
  if (["text", "drawing", "voice", "countdown"].includes(n.kind) && editColor !== n.color) patch.color = editColor;
  if (n.kind === "text") { const b = $("#eText").value.trim(); if (!b) return toast("A note can't be empty"); if (b !== n.body) patch.body = b; }
  if (n.kind === "emoji") { const b = $("#eEmoji").value.trim().slice(0, 8); if (!b) return toast("Pick an emoji"); if (b !== n.body) patch.body = b; }
  if (n.kind === "image") { const c = $("#eCap").value.trim() || null; if (c !== (n.body || null)) patch.body = c; }
  if (n.kind === "countdown") {
    const date = $("#eCdDate").value, time = $("#eCdTime").value, title = $("#eCdTitle").value.trim();
    if (!date || !title) return toast("A countdown needs a name and a date");
    const target = new Date(`${date}T${time || "00:00"}`);
    patch.meta = { ...n.meta, target: target.toISOString(), allDay: !time, title }; patch.body = title;
  }
  const btn = $("#eSave"); busy(btn, true, "Saving…");
  const oldPath = n.media_path;
  try {
    if (n.kind === "image" && editPhoto) {
      patch.media_path = await api.uploadMedia(state.board.id, editPhoto, "jpg");
      state.urls[patch.media_path] = URL.createObjectURL(editPhoto);
    }
    if (Object.keys(patch).length) {
      const before = {}; for (const k of Object.keys(patch)) before[k] = n[k];
      await api.updateNote(n.id, patch);
      await upsertNote({ ...n, ...patch });
      if (patch.media_path && oldPath) api.deleteMedia(oldPath);
      if (!patch.media_path) pushHist({ label: "edit", undo: () => editNoteTo(n.id, before), redo: () => editNoteTo(n.id, patch) });
    }
    closeSheet("edit");
    toast("Saved");
  } catch (e) { editError(e); }
  busy(btn, false);
}

// ---------------------------------------------------------------- live cursors
let curSendT = 0, curHidden = true;
function sendCursor(e) {
  if (!live || !state.me) return;
  if (!e) { if (!curHidden) { curHidden = true; live.send({ t: "cur", u: state.me.id, hide: true }); } return; }
  const now = Date.now();
  if (now - curSendT < 100) return;
  if (e.pointerType !== "mouse" && !pointers.has(e.pointerId)) return;
  curSendT = now; curHidden = false;
  const w = toWorld(e.clientX, e.clientY);
  live.send({ t: "cur", u: state.me.id, x: Math.round(w.x), y: Math.round(w.y), touch: e.pointerType !== "mouse" });
}

function placeCursor(el) {
  const c = state.cursors.get(el.dataset.u); if (!c) return;
  el.style.transform = `translate(${c.x}px, ${c.y}px) scale(${1 / state.view.s})`;
}

function onCursor(m) {
  if (!m.u || m.u === state.me?.id) return;
  const box = $("#cursors");
  let el = box.querySelector(`.cursor[data-u="${CSS.escape(m.u)}"]`);
  if (m.hide) { el?.remove(); const c = state.cursors.get(m.u); if (c) c.hidden = true; return; }
  const mem = memberById(m.u); if (!mem) return;
  const prev = state.cursors.get(m.u);
  state.cursors.set(m.u, { x: m.x, y: m.y, at: Date.now(), touch: m.touch });
  if (!el) {
    el = document.createElement("div"); el.className = "cursor"; el.dataset.u = m.u;
    const col = BRIGHT[mem.color] || BRIGHT.c1;
    el.style.setProperty("--c", col);
    el.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="${col}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><span></span>`;
    el.querySelector("span").textContent = mem.name;
    el.querySelector("span").style.background = col;
    box.appendChild(el);
  }
  el.classList.toggle("touch", !!m.touch);
  placeCursor(el);
  if (!prev || Date.now() - prev.at > 15000) renderChips();
}

function expireCursors() {
  for (const [u, c] of state.cursors) {
    if (Date.now() - c.at > 6000) document.querySelector(`#cursors .cursor[data-u="${CSS.escape(u)}"]`)?.remove();
  }
  if (!$("#people").hidden) renderPeople();
}

// ---------------------------------------------------------------- drawing on the board (vector ink)
let inkMode = false, inkCur = null, inkSendT = 0, inkSent = 0;
const inkTool = {
  color: PENS[0], size: SIZES[1], erasing: false,
  tools() { return { color: this.color, size: this.size, erasing: this.erasing }; },
  setColor(c) { this.color = c; this.erasing = false; }, setSize(s) { this.size = s; }, toggleEraser() { this.erasing = !this.erasing; },
};
const SVGNS = "http://www.w3.org/2000/svg";

function inkD(p) {
  if (!p.length) return "";
  if (p.length === 1) return `M${p[0][0]} ${p[0][1]}l0.01 0`;
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = ((p[i][0] + p[i + 1][0]) / 2).toFixed(1), my = ((p[i][1] + p[i + 1][1]) / 2).toFixed(1);
    d += `Q${p[i][0]} ${p[i][1]} ${mx} ${my}`;
  }
  const l = p[p.length - 1];
  return d + `L${l[0]} ${l[1]}`;
}

function inkPathEl(id) { return document.querySelector(`#ink path[data-id="${CSS.escape(id)}"]`); }

function drawInk(row, live_ = false) {
  let el = inkPathEl(row.id);
  if (!el) { el = document.createElementNS(SVGNS, "path"); el.dataset.id = row.id; $("#ink").appendChild(el); }
  el.setAttribute("d", inkD(row.points));
  el.setAttribute("stroke", row.color);
  el.setAttribute("stroke-width", row.width);
  el.classList.toggle("live", live_);
}

function addInk(row) { state.strokes.set(row.id, row); drawInk(row); }
function removeInk(id) { state.strokes.delete(id); inkPathEl(id)?.remove(); }

function onStrokeEvent(row, deleted) {
  if (deleted) { if (sel?.id === row.id) deselect(); return removeInk(row.id); }
  if (sel?.id === row.id && gest) return;   // you're mid-change on it
  addInk(row);
  if (sel?.id === row.id) renderSel();
}

function setInkMode(on) {
  if (on) deselect();
  inkMode = on;
  document.body.classList.toggle("drawmode", on);
  $("#drawBar").hidden = !on;
  $("#toolDraw").setAttribute("aria-pressed", String(on));
  $("#scroller").classList.toggle("drawing", on);
  if (on && !state.v2 && !isDemo) toast("Drawing on the board needs the latest database update (upgrade-v4.sql)", 4000);
}

function inkStart(e) {
  if (inkTool.erasing) { inkCur = { erase: true }; inkEraseAt(e); return; }
  const w = toWorld(e.clientX, e.clientY);
  inkCur = { id: uid(), board_id: state.board.id, author_id: state.me.id, color: inkTool.color, width: +(inkTool.size * 2 / state.view.s).toFixed(2), points: [[+w.x.toFixed(1), +w.y.toFixed(1)]] };
  inkSent = 0;
  drawInk(inkCur, true);
}

function inkMove(e) {
  if (!inkCur) return;
  if (inkCur.erase) return inkEraseAt(e);
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  const minGap = 1.5 / state.view.s;
  for (const ev of evs) {
    const w = toWorld(ev.clientX, ev.clientY), l = inkCur.points[inkCur.points.length - 1];
    if (Math.hypot(w.x - l[0], w.y - l[1]) >= minGap && inkCur.points.length < 3000) inkCur.points.push([+w.x.toFixed(1), +w.y.toFixed(1)]);
  }
  drawInk(inkCur, true);
  const now = Date.now();
  if (now - inkSendT > 60) {
    inkSendT = now;
    live?.send({ t: "ink", id: inkCur.id, u: state.me.id, color: inkCur.color, width: inkCur.width, from: inkSent, pts: inkCur.points.slice(inkSent) });
    inkSent = inkCur.points.length;
  }
}

async function inkEnd() {
  const s = inkCur; inkCur = null;
  if (!s || s.erase) return;
  drawInk(s, false);
  state.strokes.set(s.id, s);
  try { await api.addStroke(s); }
  catch (err) {
    console.warn(err); removeInk(s.id);
    live?.send({ t: "inkx", id: s.id });
    /relation|schema cache|does not exist/i.test(err.message || "") ? toast("Drawing on the board needs upgrade-v4.sql in Supabase", 4000) : toast("Couldn't save that line");
  }
}

function inkCancel() { if (inkCur && !inkCur.erase) { inkPathEl(inkCur.id)?.remove(); live?.send({ t: "inkx", id: inkCur.id }); } inkCur = null; }

let eraseWarned = false;
function inkEraseAt(e) {
  const w = toWorld(e.clientX, e.clientY), r = 14 / state.view.s;
  for (const [id, s] of state.strokes) {
    const hit = s.points.some(([x, y]) => Math.abs(x - w.x) < r + s.width / 2 && Math.abs(y - w.y) < r + s.width / 2 && Math.hypot(x - w.x, y - w.y) < r + s.width / 2);
    if (!hit) continue;
    if (s.author_id !== state.me.id) { if (!eraseWarned) { eraseWarned = true; toast("You can only erase your own lines"); setTimeout(() => (eraseWarned = false), 4000); } continue; }
    removeInk(id);
    api.deleteStroke(id).catch(() => { addInk(s); toast("Couldn't erase that"); });
  }
}

function inkUndo() {
  const mine = [...state.strokes.values()].filter((s) => s.author_id === state.me.id);
  const last = mine[mine.length - 1];
  if (!last) return toast("Nothing of yours to undo");
  removeInk(last.id);
  api.deleteStroke(last.id).catch(() => { addInk(last); toast("Couldn't undo"); });
}

function onRemoteInk(m) {
  if (m.u === state.me?.id) return;
  let s = state.strokes.get(m.id);
  if (s && !s._live) return;           // already saved
  if (!s) {
    if (m.from !== 0) return;          // missed the start: the saved line will arrive shortly
    s = { id: m.id, author_id: m.u, color: m.color, width: m.width, points: [], _live: true };
    state.strokes.set(m.id, s);
  }
  if (m.from !== s.points.length) return;
  s.points.push(...m.pts);
  drawInk(s, true);
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
  } else if (n.kind === "link") {
    buildLinkCard(n, el);
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
  el.classList.toggle("pending", !!n._pending);
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

function noteTransform(n, extra = "") {
  const s = n.scale || 1;
  return `rotate(${n.rot || 0}deg) scale(${s * (n.flip_x ? -1 : 1)}, ${s * (n.flip_y ? -1 : 1)}) ${extra}`.trim();
}

function placeNote(el, n) {
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
  const base = Math.max(1, Math.floor((n.z || 0) / 1000) % 1000000000);
  el.style.zIndex = String(n.pinned ? 1000000000 + base : base);
  el.style.transform = noteTransform(n);
  if (sel?.type === "note" && sel.id === n.id) renderSel();
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
  if (sel?.id === n.id) renderSel();
  updateEmpty();
}

function removeNoteEl(id) {
  if (sel?.id === id) deselect();
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

// ---------------------------------------------------------------- sheets
function openSheet(name) { $("#" + name).hidden = false; $("#" + name + "Backdrop").hidden = false; }
function closeSheet(name) {
  $("#" + name).hidden = true; $("#" + name + "Backdrop").hidden = true;
  if (name === "detail") { detailId = null; if (detailAudio) { detailAudio.pause(); detailAudio = null; } $("#detailBody").innerHTML = ""; }
  if (name === "chats") { chat.peer = null; }
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
  else if (n.kind === "link") {
    const md = n.meta || {};
    const box = document.createElement("div"); box.className = "detail-player";
    if (md.embed) {
      if (state.playing === n.id) playCard(n.id);   // move playback into the sheet
      const f = document.createElement("iframe"); f.src = md.embed; f.height = Math.max(md.h || 152, 152);
      if (md.provider === "YouTube") f.style.aspectRatio = "16 / 9", f.removeAttribute("height");
      f.allow = "autoplay; encrypted-media; clipboard-write; picture-in-picture"; f.setAttribute("allowfullscreen", ""); f.title = md.title || md.provider;
      box.appendChild(f);
    }
    const t = document.createElement("b"); t.textContent = md.title || md.url; box.appendChild(t);
    const open = document.createElement("a"); open.className = "btn small"; open.href = md.url; open.target = "_blank"; open.rel = "noopener"; open.textContent = `Open in ${md.embed ? md.provider : "browser"} ↗`;
    box.appendChild(open);
    wrap.appendChild(box);
  }
  else {
    const el = document.createElement("div"); buildNoteContent(n, el);
    el.querySelector(".badges")?.remove(); el.querySelector(".pinmark")?.remove();
    wrap.appendChild(el);
  }
  renderDetailMeta(n);
  $("#detailEdit").hidden = !canEdit(n);
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

async function editNoteTo(id, fields) {
  const n = state.notes.get(id); if (!n) return;
  Object.assign(n, fields); await upsertNote({ ...n }); await api.updateNote(id, fields);
}
async function removeDetail() {
  const n = state.notes.get(detailId); if (!n) return;
  if (!confirm("Remove this from the board for both of you?")) return;
  closeSheet("detail");
  const row = noteRowFor(n);
  removeNoteEl(n.id);
  try {
    await api.deleteNote(n);
    let liveId = n.id;
    // media notes can't be cleanly re-created from the client, so only offer undo for simple notes
    if (!n.media_path) pushHist({
      label: "delete",
      undo: async () => { const saved = await api.addNote(row); liveId = saved.id; await upsertNote(saved); },
      redo: async () => { const cur = state.notes.get(liveId); removeNoteEl(liveId); state.notes.delete(liveId); if (cur) await api.deleteNote(cur); },
    });
  } catch (e) { toast("Couldn't remove it"); resync(); }
}
const noteRowFor = (n) => { const { id, created_at, updated_at, seen_at, _pending, _dragFrom, notified_at, ...rest } = n; return rest; };
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

// ---------------------------------------------------------------- export your board
// A small zip writer (no compression: photos and audio are already compressed).
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(bytes) { let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint16(8, 0, true); h.setUint16(10, 0, true); h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true); h.setUint32(18, size, true); h.setUint32(22, size, true);
    h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, f.data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, size, true); c.setUint32(24, size, true);
    c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + size;
  }
  const csize = central.reduce((n, p) => n + p.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, csize, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: "application/zip" });
}

// Download everything on this board: notes, replies, and every photo, drawing and voice note.
async function exportBoard() {
  const btn = $("#exportBoardBtn");
  busy(btn, true, "Packing…");
  try {
    const boardId = state.board.id;
    const names = Object.fromEntries(state.members.map((m) => [m.id, m.name]));
    const notes = await api.listNotes(boardId);
    const replies = await api.listReplies(boardId);
    const paths = [...new Set(notes.map((n) => n.media_path).filter(Boolean))];
    const urls = paths.length ? await api.mediaUrls(paths) : {};
    const enc = new TextEncoder();
    const files = [];
    const note = (n) => ({ ...n, author: names[n.author_id] || "someone", media_file: n.media_path ? `media/${n.media_path.split("/").pop()}` : null });
    const reply = (r) => ({ ...r, author: names[r.user_id] || "someone" });
    const meta = { exported_at: new Date().toISOString(), board_id: boardId, board_name: state.board.name ?? null, members: state.members.map((m) => m.name), note_count: notes.length, reply_count: replies.length, media_count: paths.length };
    files.push({ name: "board.json", data: enc.encode(JSON.stringify(meta, null, 2)) });
    files.push({ name: "notes.json", data: enc.encode(JSON.stringify(notes.map(note), null, 2)) });
    files.push({ name: "replies.json", data: enc.encode(JSON.stringify(replies.map(reply), null, 2)) });
    let missing = 0;
    for (const p of paths) {
      const url = urls[p];
      if (!url) { missing++; continue; }
      try {
        const blob = await (await fetch(url)).blob();
        files.push({ name: `media/${p.split("/").pop()}`, data: new Uint8Array(await blob.arrayBuffer()) });
      } catch { missing++; }
    }
    const zip = makeZip(files);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = URL.createObjectURL(zip);
    a.download = `pinned-export-${stamp}.zip`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    toast(missing ? `Exported. ${missing} photo(s) couldn't be fetched, try again later.` : "Exported 📦 Check your downloads.", 5000);
  } catch (e) {
    console.error(e);
    toast("Couldn't export right now. Check your connection and try again.", 5000);
  } finally { busy(btn, false); }
}

// ---------------------------------------------------------------- composer
const compose = { tab: ls.get("pinned-compose-tab", "text"), color: ls.get("pinned-note-color", "c1"), emoji: "❤️", photo: null, padColor: ls.get("pinned-pen-color", "c1"), cdColor: "c5", sched: false };


function openComposer() {
  deselect();
  compose.photo = null;
  $("#textInput").value = ""; $("#photoCaption").value = ""; $("#emojiCustom").value = "";
  $("#photoPreview").hidden = true; $("#photoHint").hidden = false; $("#photoInput").value = "";
  $("#cdTitle").value = ""; $("#cdDate").value = ""; $("#cdTime").value = "";
  $("#linkInput").value = ""; $("#linkPreview").innerHTML = ""; linkMeta = null;
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
  ls.set("pinned-compose-tab", tab);
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
  const r = vp(), s = state.view.s;
  const tl = toWorld(r.left, r.top + 60), br = toWorld(r.right, r.bottom - 90);
  const c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  const rects = [...state.notes.values()].map(noteBox);
  const step = Math.max(16, 20 / s);
  let best = null;
  for (let y = tl.y; y <= Math.max(tl.y, br.y - h); y += step) {
    for (let x = tl.x; x <= Math.max(tl.x, br.x - w); x += step) {
      let overlap = 0;
      for (const q of rects) {
        const ox = Math.max(0, Math.min(x + w, q.x + q.w) - Math.max(x, q.x));
        const oy = Math.max(0, Math.min(y + h, q.y + q.h) - Math.max(y, q.y));
        overlap += ox * oy;
      }
      const score = overlap * 4 + Math.hypot(x + w / 2 - c.x, y + h / 2 - c.y);
      if (!best || score < best.score) best = { x, y, score };
    }
  }
  best = best || { x: c.x - w / 2, y: c.y - h / 2 };
  const jitter = () => Math.round((Math.random() - 0.5) * 16);
  return { x: Math.round(best.x + jitter()), y: Math.round(best.y + jitter()) };
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
    } else if (compose.tab === "link") {
      if (!linkMeta) { busy(btn, false); return toast("Paste a link first"); }
      if (!state.v2 && !isDemo) { busy(btn, false); return needsUpgrade(); }
      row = { ...base, kind: "link", body: linkMeta.title || linkMeta.url, color: "c1", meta: { ...linkMeta }, ...viewportSpot(220, 200) };
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
    haptic(15);
    if (!saved.media_path && !showAt) {
      let liveId = saved.id;
      pushHist({ label: "new note",
        undo: async () => { const cur = state.notes.get(liveId); removeNoteEl(liveId); state.notes.delete(liveId); if (cur) await api.deleteNote(cur); },
        redo: async () => { const re = await api.addNote(noteRowFor(saved)); liveId = re.id; await upsertNote(re); } });
    }
    closeSheet("composer");
    if (showAt) toast(`Scheduled for ${fmtWhen(showAt)} ⏰ Only you can see it until then.`, 4000);
    else api.notify(state.board.id, "note", { note_id: saved.id });
    if (compose.tab === "voice") resetRec(true);
  } catch (e) {
    console.error(e);
    const msg = e.message || "";
    if (isNetworkError(e) && row && !row.media_path) {
      // offline: save it locally and send on reconnect
      const tempId = uid();
      await upsertNote({ ...row, id: tempId, _pending: true, created_at: new Date().toISOString() });
      queueNote(row, tempId);
      closeSheet("composer");
      updateConn();
      toast("Offline — saved and will send when you're back ⏳", 3500);
    }
    else if (/mime|type/i.test(msg) && compose.tab === "voice") needsUpgrade();
    else if (/violates check constraint|column .* does not exist|schema cache/i.test(msg)) toast(compose.tab === "link" ? "Music cards need upgrade-v6.sql in Supabase" : "This needs the latest database update (see SETUP)", 4500);
    else toast("Couldn't stick that note", 7000, { label: "Retry", fn: () => sendCompose() });
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
  if (m.t === "race") return onRaceMsg(m);
  if (m.t === "cur") return onCursor(m);
  if (m.t === "typing") return onTyping(m);
  if (m.t === "view") { if (m.u !== state.me?.id) state.views[m.u] = { cx: m.cx, cy: m.cy, s: m.s, at: Date.now() }; return; }
  if (m.t === "vjoin" || m.t === "vleave" || m.t === "rtc") return onVoiceMsg(m);
  if (m.t === "ink") return onRemoteInk(m);
  if (m.t === "inkx") { const s = state.strokes.get(m.id); if (s?._live) removeInk(m.id); return; }
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
  for (const m of others()) {
    const was = prev[m.id]?.doodling, now = state.presence[m.id]?.doodling;
    if (now && !was && !together.open) toast(`${m.name} is drawing together. Tap 🎨 Together to join.`, 4000);
    const wasV = prev[m.id]?.voice, nowV = state.presence[m.id]?.voice;
    if (nowV && !wasV && !voice.on) toast(`${m.name} started a voice chat. Open the people panel to join.`, 4000);
    if (voice.on && wasV && !nowV) { const p = voice.peers.get(m.id); if (p) { closePeer(p); voice.peers.delete(m.id); renderVoiceBar(); } }   // they left voice
    if (!isOnline(m.id)) { document.querySelector(`#cursors .cursor[data-u="${CSS.escape(m.id)}"]`)?.remove(); const p = voice.peers.get(m.id); if (p) { closePeer(p); voice.peers.delete(m.id); renderVoiceBar(); } }
  }
  renderPresence();
  renderChips();
  renderLoc();
  renderVoiceJoin();
  renderVoiceBar();
}

function renderPresence() {
  const drawing = others().filter((m) => state.presence[m.id]?.doodling).map((m) => m.name);
  $("#doodleDot").hidden = !drawing.length || together.open;
  const w = $("#togetherWho");
  w.textContent = drawing.length ? `${listNames(drawing)} ${drawing.length > 1 ? "are" : "is"} here ✏️` : others().length ? "Nobody else here yet" : "Just you for now";
  w.classList.toggle("on", !!drawing.length);
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
  const last = state.pings.find((p) => p.user_id !== state.me.id);
  const who = last && memberById(last.user_id);
  $("#pingLast").textContent = last && who ? `${who.name} ${PING_TEXT[last.kind] || ""} · ${timeAgo(last.created_at)}` : others().length ? "Let everyone know how you're doing." : "";
}

async function sendPing(key) {
  try {
    const row = await api.sendPing(state.board.id, key);
    if (!state.pings.some((p) => p.id === row.id)) state.pings.unshift(row);
    rain(PING_EMOJI[key], 10);
    renderChips(); openPing();
    const os = others();
    toast(key.startsWith("mood_") ? "Mood shared" : `Sent to ${os.length === 1 ? os[0].name : "everyone"} ${PING_EMOJI[key]}`);
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
  const me = state.me.id;
  const mine = rows.find((r) => r.user_id === me && r.qdate === key);
  const answeredOthers = others().filter((m) => status.includes(m.id));
  $("#qAnswerBox").hidden = !!mine;
  $("#qHint").textContent = answeredOthers.length && !mine
    ? `${listNames(answeredOthers.map((m) => m.name))} already answered! Share yours to see theirs 👀`
    : "You'll see everyone's answers once you've answered.";
  const box = $("#qAnswers"); box.innerHTML = "";
  const card = (who, text, waiting) => {
    const d = document.createElement("div"); d.className = "q-ans" + (waiting ? " waiting" : "");
    const b = document.createElement("b"); b.textContent = who; d.appendChild(b);
    d.appendChild(document.createTextNode(text)); box.appendChild(d);
  };
  if (mine) {
    card("You", mine.body);
    for (const m of others()) {
      const r = rows.find((x) => x.user_id === m.id && x.qdate === key);
      if (r) card(m.name, r.body);
    }
    const waiting = others().filter((m) => !rows.some((x) => x.user_id === m.id && x.qdate === key)).map((m) => m.name);
    if (waiting.length) card(waiting.length > 3 ? `${waiting.length} people` : listNames(waiting), "Haven't answered yet…", true);
  }
  // earlier days you answered together
  const past = $("#qPast"); past.innerHTML = "";
  const byDay = groupBy(rows.filter((r) => r.qdate !== key), "qdate");
  let shown = 0;
  for (const [day, list] of byDay) {
    if (list.length < 2) continue;
    const it = document.createElement("div"); it.className = "item";
    const p = document.createElement("p"); p.textContent = questionFor(day); it.appendChild(p);
    for (const r of list) {
      const d = document.createElement("div"); const b = document.createElement("b");
      b.textContent = (r.user_id === me ? "You" : memberById(r.user_id)?.name || "Someone") + ": "; d.appendChild(b); d.appendChild(document.createTextNode(r.body)); it.appendChild(d);
    }
    past.appendChild(it); shown++;
  }
  $("#qPastTitle").hidden = !shown;
  $("#qDot").hidden = !(answeredOthers.length && !mine);
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
    $("#qDot").hidden = !(others().some((m) => status.includes(m.id)) && !status.includes(state.me.id));
    if (!$("#question").hidden) renderQuestion();
  } catch { $("#qDot").hidden = true; }
}

function clearBoardDom() {
  document.querySelectorAll("#board .note").forEach((e) => e.remove());
  $("#ink").innerHTML = ""; $("#cursors").innerHTML = "";
}

// ---------------------------------------------------------------- switch / leave / delete board
let leaving = false;
function resetBoardState() {
  clearInterval(ticker);
  state.board = null; state.members = [];
  state.notes.clear(); state.reactions = new Map(); state.replies = new Map(); state.pings = []; state.presence = {};
  clearBoardDom(); $("#memberChips").innerHTML = "";
  state.strokes = new Map(); state.cursors = new Map(); state.views = {};
  deselect(); setInkMode(false); closePeople();
  state.msgs = []; state.reads = new Map(); state.bgReqs = []; state.playing = null; chat.peer = null;
  $("#chatDot").hidden = true; $("#gearDot").hidden = true; clearBgLayer();
  resetGames();
  if (geo.watch != null) { try { navigator.geolocation.clearWatch(geo.watch); } catch { /* ignore */ } }
  geo.on = false; geo.me = null; geo.watch = null; geo.denied = false; closeLoc(); $("#locDot").hidden = true;
  together.pad?.reset(); together.open = false;
  for (const s of ["detail", "composer", "settings", "ping", "question", "together", "chats", "edit", "games", "ttt", "c8"]) { $("#" + s).hidden = true; $("#" + s + "Backdrop").hidden = true; }
  $("#qDot").hidden = true; $("#doodleDot").hidden = true;
  hist.undo.length = 0; hist.redo.length = 0; renderHistBar();
  if (voice.on) leaveVoice();
  $("#connBanner").hidden = true;
  $("#codeInput").value = ""; setError($("#pairError"));
}

function canDeleteBoard() {
  return state.board && (state.board.created_by === state.me?.id || state.members.length <= 1);
}

function renderBoardActions() {
  $("#switchRow").hidden = true; $("#switchCode").value = "";
  const can = canDeleteBoard();
  $("#deleteBoardBtn").hidden = !can;
  const hint = $("#boardHint");
  hint.hidden = can;
  if (!can) hint.textContent = `Only ${ownerName()} (the owner) can delete this board. You can leave it instead.`;
}

async function switchBoard() {
  const code = $("#switchCode").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 8) return toast("Codes are 8 characters");
  if (code === state.board?.code) return toast("You're already on that board");
  if (!confirm(`Move to the other board? You'll leave this one${others().length ? " (everyone else keeps it)" : ""}.`)) return;
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
  const os = others();
  const msg = os.length ? `Leave this board? ${os.length === 1 ? os[0].name : "Everyone else"} keeps it and everything on it. You'd need the code to come back.`
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
  const os = others();
  const n = state.notes.size;
  if (!confirm(`Delete this board for ${os.length ? `everyone (${os.length + 1} people)` : "good"}?\n\n${n} note${n === 1 ? "" : "s"} plus all photos, voice notes, drawings, messages and game scores will be erased. This can't be undone.`)) return;
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

// ================================================================ messages (1-on-1 + group)
const chat = { peer: null, typingT: 0, typingShow: null };
const readKey = (u, p) => `${u}|${p}`;
const threadOf = (m) => (!m.to_id ? "group" : m.sender_id === state.me?.id ? m.to_id : m.sender_id);

async function loadChats() {
  try {
    const [msgs, reads] = await Promise.all([api.listMessages(state.board.id), api.listReads(state.board.id)]);
    const pending = state.msgs.filter((m) => m._pending);   // keep offline-queued messages until they send
    state.msgs = [...msgs, ...pending];
    state.reads = new Map(reads.map((r) => [readKey(r.user_id, r.peer), r.read_at]));
    await loadUrls(msgs);
    updateChatDot();
    if (!$("#chats").hidden) chat.peer ? renderThread() : renderThreadList();
  } catch { /* messages arrive with upgrade-v6.sql */ }
}
async function refreshReads() {
  if (!state.board) return;
  try {
    const reads = await api.listReads(state.board.id);
    state.reads = new Map(reads.map((r) => [readKey(r.user_id, r.peer), r.read_at]));
    if (!$("#chats").hidden && chat.peer) renderThread();
  } catch { /* ignore */ }
}

function unreadIn(peer) {
  const last = state.reads.get(readKey(state.me.id, peer));
  return state.msgs.filter((m) => threadOf(m) === peer && m.sender_id !== state.me.id && (!last || m.created_at > last)).length;
}

function updateChatDot() {
  const peers = new Set(state.msgs.map(threadOf));
  $("#chatDot").hidden = ![...peers].some((p) => unreadIn(p) > 0);
}

function openChats() {
  chat.peer = null;
  $("#chatList").hidden = false; $("#chatThread").hidden = true;
  renderThreadList();
  openSheet("chats");
}

function renderThreadList() {
  const ul = $("#threadList"); ul.innerHTML = "";
  const rows = [{ peer: "group", name: "Everyone", sub: `${state.members.length} people` },
    ...others().map((m) => ({ peer: m.id, name: m.name, m }))];
  const lastOf = (p) => { const list = state.msgs.filter((x) => threadOf(x) === p); return list[list.length - 1]; };
  rows.sort((x, y) => (x.peer === "group" ? -1 : y.peer === "group" ? 1 : ((lastOf(y.peer)?.created_at || "") > (lastOf(x.peer)?.created_at || "") ? 1 : -1)));
  for (const r of rows) {
    const li = document.createElement("li");
    const last = lastOf(r.peer), unread = unreadIn(r.peer);
    li.classList.toggle("unread", unread > 0);
    let chip;
    if (r.m) chip = chipEl(r.m);
    else { chip = document.createElement("span"); chip.className = "chip group"; chip.textContent = "👥"; }
    li.appendChild(chip);
    const info = document.createElement("div"); info.className = "tinfo";
    const nm = document.createElement("div"); nm.className = "tname";
    const b = document.createElement("span"); b.textContent = r.name; nm.appendChild(b);
    if (last) { const t = document.createElement("small"); t.textContent = timeAgo(last.created_at); nm.appendChild(t); }
    const lt = document.createElement("div"); lt.className = "tlast";
    lt.textContent = last ? `${last.sender_id === state.me.id ? "You: " : r.peer === "group" ? (memberById(last.sender_id)?.name || "Someone") + ": " : ""}${last.body || "📷 Photo"}` : r.peer === "group" ? "Group chat for the whole board" : "Say hi 👋";
    info.append(nm, lt); li.appendChild(info);
    if (unread) { const d = document.createElement("i"); d.className = "udot"; li.appendChild(d); }
    li.onclick = () => openThread(r.peer);
    ul.appendChild(li);
  }
}

function openThread(peer) {
  chat.peer = peer;
  $("#chatList").hidden = true; $("#chatThread").hidden = false;
  const m = memberById(peer);
  $("#threadName").textContent = peer === "group" ? "Everyone" : m?.name || "Chat";
  $("#threadSub").textContent = peer === "group" ? `Group chat · ${state.members.length} people` : isOnline(peer) ? "Online" : m?.last_seen ? `Last seen ${timeAgo(m.last_seen)}` : "";
  $("#threadTyping").hidden = true;
  renderThread();
  markThreadRead();
  setTimeout(() => $("#msgInput").focus(), 200);
}

function renderThread() {
  const box = $("#msgList"); box.innerHTML = "";
  const list = state.msgs.filter((x) => threadOf(x) === chat.peer);
  if (!list.length) { const p = document.createElement("p"); p.className = "msg-time"; p.textContent = chat.peer === "group" ? "Say something to everyone 👋" : "No messages yet"; box.appendChild(p); }
  let lastTime = 0;
  for (const m of list) {
    const t = new Date(m.created_at).getTime();
    if (t - lastTime > 30 * 60 * 1000) {
      const d = document.createElement("div"); d.className = "msg-time";
      d.textContent = new Date(m.created_at).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
      box.appendChild(d);
    }
    lastTime = t;
    const el = document.createElement("div");
    el.className = "msg" + (m.sender_id === state.me.id ? " mine" : "") + (m._pending ? " pending" : "");
    if (chat.peer === "group" && m.sender_id !== state.me.id) { const by = document.createElement("span"); by.className = "by"; by.textContent = memberById(m.sender_id)?.name || "Someone"; el.appendChild(by); }
    if (m.media_path) { const img = document.createElement("img"); img.alt = "Photo"; img.src = state.urls[m.media_path] || ""; el.appendChild(img); }
    if (m.body) el.appendChild(document.createTextNode(m.body));
    box.appendChild(el);
  }
  // read receipt under your last message
  const mineLast = [...list].reverse().find((m) => m.sender_id === state.me.id);
  if (mineLast && list[list.length - 1] === mineLast) {
    let txt = "";
    if (chat.peer === "group") {
      const n = others().filter((o) => (state.reads.get(readKey(o.id, "group")) || "") >= mineLast.created_at).length;
      if (n) txt = n === others().length ? "Seen by everyone" : `Seen by ${n}`;
    } else if ((state.reads.get(readKey(chat.peer, state.me.id)) || "") >= mineLast.created_at) txt = "Seen";
    if (txt) { const s = document.createElement("div"); s.className = "msg-seen"; s.textContent = "✓ " + txt; box.appendChild(s); }
  }
  box.scrollTop = box.scrollHeight;
}

let readT = null;
function markThreadRead() {
  if (!chat.peer || $("#chats").hidden || document.visibilityState !== "visible") return;
  clearTimeout(readT);
  readT = setTimeout(async () => {
    const peer = chat.peer; if (!peer) return;
    state.reads.set(readKey(state.me.id, peer), new Date().toISOString());
    updateChatDot();
    try { await api.markRead(state.board.id, peer); } catch { /* v6 */ }
  }, 300);
}

async function sendChat(photo = null) {
  const body = $("#msgInput").value.trim();
  if (!body && !photo) return;
  const peer = chat.peer; if (!peer) return;
  const btn = $("#msgSend"); busy(btn, true, "…");
  try {
    const row = { board_id: state.board.id, sender_id: state.me.id, to_id: peer === "group" ? null : peer, body: body || null };
    if (photo) {
      row.media_path = await api.uploadMedia(state.board.id, photo, "jpg");
      state.urls[row.media_path] = URL.createObjectURL(photo);
    }
    const saved = await api.sendMessage(row);
    $("#msgInput").value = "";
    haptic(10);
    onMessageEvent(saved);
    api.notify(state.board.id, "message", peer === "group" ? {} : { to: peer });
  } catch (e) {
    console.warn(e);
    const row = { board_id: state.board.id, sender_id: state.me.id, to_id: peer === "group" ? null : peer, body: body || null };
    if (isNetworkError(e) && !photo && body) {
      const tempId = uid();
      $("#msgInput").value = "";
      onMessageEvent({ ...row, id: tempId, _pending: true, created_at: new Date().toISOString() });
      queueMsg(row, tempId);
      updateConn();
      toast("Offline — your message will send when you're back ⏳", 3000);
    }
    else if (/relation|schema cache|does not exist/i.test(e.message || "")) toast("Messages need upgrade-v6.sql in Supabase", 4000);
    else toast("Couldn't send that message", 7000, { label: "Retry", fn: () => sendChat(photo) });
  }
  busy(btn, false);
}

async function onMessageEvent(m) {
  if (state.msgs.some((x) => x.id === m.id)) return;
  state.msgs.push(m);
  if (m.media_path && !state.urls[m.media_path]) await loadUrls([m]);
  const peer = threadOf(m);
  const open = !$("#chats").hidden;
  if (open && chat.peer === peer) { renderThread(); if (m.sender_id !== state.me.id) markThreadRead(); }
  else if (open && !chat.peer) renderThreadList();
  if (m.sender_id !== state.me.id && !(open && chat.peer === peer)) {
    const who = memberById(m.sender_id)?.name || "Someone";
    toast(`${peer === "group" ? who + " (group)" : who}: ${(m.body || "📷 Photo").slice(0, 60)}`, 3500);
  }
  if (m.sender_id !== state.me.id && chat.peer === peer) { $("#threadTyping").hidden = true; }
  updateChatDot();
}

function onReadEvent(r) {
  if (!r?.user_id) return;
  state.reads.set(readKey(r.user_id, r.peer), r.read_at);
  if (!$("#chats").hidden && chat.peer) renderThread();
}

function sendTyping() {
  const now = Date.now();
  if (!chat.peer || now - chat.typingT < 2000) return;
  chat.typingT = now;
  live?.send({ t: "typing", u: state.me.id, to: chat.peer });
}

function onTyping(m) {
  if (m.u === state.me?.id || $("#chats").hidden) return;
  const forMe = (chat.peer === "group" && m.to === "group") || (chat.peer === m.u && m.to === state.me.id);
  if (!forMe) return;
  const el = $("#threadTyping");
  el.textContent = `${memberById(m.u)?.name || "Someone"} is typing…`;
  el.hidden = false;
  clearTimeout(chat.typingShow);
  chat.typingShow = setTimeout(() => (el.hidden = true), 3500);
}

// ================================================================ backgrounds
const BG_COLORS = ["#f4efe6", "#ffe3ec", "#e3f0ff", "#e6f7e9", "#efe6ff", "#1b1d24", "#2b3a55", "#5b3a29"];
const MAX_BG_BYTES = 10 * 1024 * 1024;

function isOwner() { return state.board?.created_by === state.me?.id; }
function effectiveBg() {
  if (!state.board) return null;
  return (state.board.bg_mode === "personal" ? state.board.my_bg : state.board.bg) || null;
}

function clearBgLayer() { const l = $("#bgLayer"); l.innerHTML = ""; l.style.background = ""; l.style.backgroundImage = ""; delete l.dataset.key; }

async function applyBackground() {
  const bg = effectiveBg(), l = $("#bgLayer");
  const key = bg ? JSON.stringify(bg) : "";
  if (l.dataset.key === key) return;
  clearBgLayer(); l.dataset.key = key;
  if (!bg) return;
  if (bg.type === "color") { l.style.background = bg.value; return; }
  if (!bg.path) return;
  if (!state.urls[bg.path]) Object.assign(state.urls, await api.mediaUrls([bg.path]));
  const url = state.urls[bg.path]; if (!url) return;
  if (bg.type === "video") {
    const v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
    v.disablePictureInPicture = true; v.controls = false; v.src = url;
    l.appendChild(v);
    v.play().catch(() => {});
  } else {
    l.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
  }
}

function onBoardEvent(row) {
  if (!state.board || row.id !== state.board.id) return;
  const modeChanged = row.bg_mode !== state.board.bg_mode;
  Object.assign(state.board, { bg_mode: row.bg_mode, bg: row.bg, created_by: row.created_by });
  applyBackground();
  if (modeChanged && !isOwner()) toast(row.bg_mode === "personal" ? "You can now pick your own background in Settings" : "The board has a shared background again");
  if (!$("#settings").hidden) renderBgSettings();
}

async function loadBgRequests() {
  try { state.bgReqs = await api.listBgRequests(state.board.id); } catch { state.bgReqs = []; }
  updateGearDot();
}

function updateGearDot() { $("#gearDot").hidden = !(isOwner() && state.bgReqs.some((r) => r.status === "pending")); }

function onBgRequestEvent(r) {
  const i = state.bgReqs.findIndex((x) => x.id === r.id);
  const prev = i >= 0 ? state.bgReqs[i] : null;
  if (i >= 0) state.bgReqs[i] = r; else state.bgReqs.unshift(r);
  if (isOwner() && r.status === "pending" && !prev && r.user_id !== state.me.id) toast(`${memberById(r.user_id)?.name || "Someone"} suggested a background. Open Settings to see it 🖼️`, 4500);
  if (r.user_id === state.me.id && prev?.status === "pending" && r.status !== "pending") toast(r.status === "approved" ? "Your background was approved 🎉" : "The owner passed on your background idea", 4500);
  updateGearDot();
  if (!$("#settings").hidden) renderBgSettings();
}

function renderBgSettings() {
  const owner = isOwner(), mode = state.board?.bg_mode || "shared";
  const canSetOwn = owner || mode === "personal";
  const segEl = $("#bgMode");
  segEl.hidden = !owner;
  segEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  const info = $("#bgInfo");
  if (owner) info.textContent = mode === "shared" ? "Everyone sees the background you pick. Members can suggest an image or GIF for you to approve." : "Everyone picks their own background. Yours is below.";
  else info.textContent = mode === "shared" ? `${ownerName()} picks the shared background. You can suggest an image or GIF.` : "Pick your own background. Only you see it.";
  // colors
  const cur = effectiveBg();
  const colors = $("#bgColors"); colors.innerHTML = ""; colors.hidden = !canSetOwn;
  for (const c of BG_COLORS) {
    const b = document.createElement("button"); b.type = "button"; b.style.background = c; b.setAttribute("aria-label", "Background color " + c);
    b.setAttribute("aria-pressed", String(cur?.type === "color" && cur.value === c));
    b.onclick = () => setBackground({ type: "color", value: c });
    colors.appendChild(b);
  }
  const lbl = $("#bgFileLbl"), file = $("#bgFile");
  if (canSetOwn) { lbl.textContent = owner ? "Upload image, GIF or video" : "Upload image or GIF"; file.accept = owner ? "image/*,video/mp4,video/webm,video/quicktime" : "image/*"; }
  else { lbl.textContent = "Suggest an image or GIF"; file.accept = "image/*"; }
  $("#bgClear").hidden = !canSetOwn || !cur;
  // requests
  const box = $("#bgRequests"); box.innerHTML = "";
  const list = owner ? state.bgReqs.filter((r) => r.status === "pending") : state.bgReqs.filter((r) => r.user_id === state.me.id).slice(0, 3);
  if (list.length) {
    const paths = list.map((r) => r.media_path).filter((p) => !state.urls[p]);
    if (paths.length) api.mediaUrls(paths).then((u) => { Object.assign(state.urls, u); box.querySelectorAll("img[data-p]").forEach((im) => (im.src = state.urls[im.dataset.p] || "")); });
  }
  for (const r of list) {
    const row = document.createElement("div"); row.className = "bgreq";
    const img = document.createElement("img"); img.alt = "Suggested background"; img.dataset.p = r.media_path; img.src = state.urls[r.media_path] || "";
    const who = document.createElement("span"); who.className = "who";
    who.textContent = owner ? `${memberById(r.user_id)?.name || "Someone"} suggested this` : "Your suggestion";
    const sm = document.createElement("small"); sm.textContent = owner ? timeAgo(r.created_at) : { pending: "Waiting for the owner", approved: "Approved 🎉", declined: "Not this time" }[r.status];
    who.appendChild(sm);
    row.append(img, who);
    if (owner) {
      const acts = document.createElement("div"); acts.className = "acts";
      const ok = document.createElement("button"); ok.className = "btn small primary"; ok.textContent = "Approve"; ok.onclick = () => reviewBg(r, true);
      const no = document.createElement("button"); no.className = "btn small"; no.textContent = "Decline"; no.onclick = () => reviewBg(r, false);
      acts.append(ok, no); row.appendChild(acts);
    }
    box.appendChild(row);
  }
}

async function setBackground(bg) {
  try {
    if (isOwner() && state.board.bg_mode !== "personal") { await api.setBoardBg(state.board.id, null, bg, true); state.board.bg = bg; }
    else { await api.setMyBg(state.board.id, bg); state.board.my_bg = bg; }
    applyBackground(); renderBgSettings();
  } catch (e) { bgError(e); }
}

async function setBgMode(mode) {
  if (!isOwner() || mode === state.board.bg_mode) return;
  try { await api.setBoardBg(state.board.id, mode, null, false); state.board.bg_mode = mode; applyBackground(); renderBgSettings(); }
  catch (e) { bgError(e); }
}

function bgError(e) {
  const m = e?.message || "";
  if (/function|schema cache|column|does not exist/i.test(m)) toast("Backgrounds need upgrade-v6.sql in Supabase", 4000);
  else if (/mime|type|size|large/i.test(m)) toast("That file type or size isn't allowed (10 MB max)", 4000);
  else toast(m || "Couldn't change the background");
}

function videoDuration(file) {
  return new Promise((res) => {
    const v = document.createElement("video"); v.preload = "metadata"; v.muted = true;
    const url = URL.createObjectURL(file);
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); res(v.duration); };
    v.onerror = () => { URL.revokeObjectURL(url); res(NaN); };
    v.src = url;
  });
}

async function onBgFile(file) {
  if (!file) return;
  const owner = isOwner(), mode = state.board.bg_mode || "shared";
  const isVideo = /^video\//.test(file.type), isGif = file.type === "image/gif", isImage = /^image\//.test(file.type);
  if (!isVideo && !isImage) return toast("Pick an image, GIF or video");
  if (isVideo && !owner) return toast("Only the owner can use a video background");
  if (file.size > MAX_BG_BYTES) return toast("That file is over 10 MB. Try a smaller one.");
  const lbl = $("#bgFileLbl"); const old = lbl.textContent; lbl.textContent = "Uploading…";
  try {
    let blob = file, ext = isGif ? "gif" : "jpg", type = isGif ? "gif" : "image";
    if (isVideo) {
      const d = await videoDuration(file);
      if (isFinite(d) && d > 15.5) { lbl.textContent = old; return toast("Videos can be up to 15 seconds"); }
      ext = (file.type.split("/")[1] || "mp4").replace("quicktime", "mov"); type = "video";
    } else if (!isGif) blob = await compressImage(file, 1920, 0.85);
    const path = await api.uploadMedia(state.board.id, blob, ext);
    state.urls[path] = URL.createObjectURL(blob);
    if (!owner && mode === "shared") {
      const r = await api.requestBg(state.board.id, path, type === "gif" ? "gif" : "image");
      onBgRequestEvent(r);
      api.notify(state.board.id, "bgrequest");
      toast(`Sent to ${ownerName()} for approval 🖼️`);
    } else await setBackground({ type, path });
  } catch (e) { bgError(e); }
  lbl.textContent = old; renderBgSettings();
}

async function reviewBg(r, approve) {
  try {
    await api.reviewBg(r.id, approve);
    r.status = approve ? "approved" : "declined";
    if (approve) { state.board.bg = { type: r.kind, path: r.media_path }; if (state.board.bg_mode === "personal") toast("Approved. Switch to Shared so everyone sees it."); applyBackground(); }
    api.notify(state.board.id, "bgreply", { to: r.user_id, approved: approve });
    updateGearDot(); renderBgSettings();
    toast(approve ? "Background updated for everyone" : "Declined");
  } catch (e) { bgError(e); }
}

// ================================================================ music / link cards
function parseLink(raw) {
  let u; try { u = new URL(raw.trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const h = u.hostname.replace(/^www\.|^m\./, ""), p = u.pathname;
  let m;
  if (/(^|\.)youtube\.com$/.test(h) || h === "youtu.be" || h === "music.youtube.com") {
    const list = u.searchParams.get("list");
    const id = h === "youtu.be" ? p.slice(1).split("/")[0] : u.searchParams.get("v") || (p.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/) || [])[1];
    if (id) return { provider: "YouTube", icon: "▶️", embed: `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1${list ? "&list=" + list : ""}`, h: 124 };
    if (list) return { provider: "YouTube", icon: "▶️", embed: `https://www.youtube.com/embed/videoseries?list=${list}&autoplay=1&playsinline=1`, h: 124 };
  }
  if (h === "open.spotify.com" && (m = p.match(/\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)))
    return { provider: "Spotify", icon: "🎧", embed: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=pinned`, h: m[1] === "track" || m[1] === "episode" ? 152 : 232 };
  if (h === "music.apple.com" || h === "embed.music.apple.com")
    return { provider: "Apple Music", icon: "🎵", embed: `https://embed.music.apple.com${p}${u.search}`, h: u.searchParams.get("i") || /\/song\//.test(p) ? 175 : 300 };
  if (h === "soundcloud.com" || h === "on.soundcloud.com")
    return { provider: "SoundCloud", icon: "☁️", embed: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&auto_play=true&visual=false&hide_related=true`, h: 166 };
  return { provider: h, icon: "🔗", embed: null, h: 0 };
}

function buildLinkCard(n, el, inDetail = false) {
  const md = n.meta || {};
  const playing = !inDetail && state.playing === n.id && md.embed;
  if (playing) {
    const f = document.createElement("iframe");
    f.src = md.embed; f.height = md.h || 152; f.allow = "autoplay; encrypted-media; clipboard-write; picture-in-picture"; f.loading = "lazy";
    f.setAttribute("allowfullscreen", ""); f.title = md.title || md.provider;
    el.appendChild(f);
    const stop = document.createElement("span"); stop.className = "lk-stop"; stop.textContent = "■ Stop";
    el.appendChild(stop);
  } else {
    const cover = document.createElement("div"); cover.className = "lk-cover" + (md.thumb ? "" : " none");
    cover.dataset.icon = md.icon || "🎵";
    if (md.thumb) cover.style.backgroundImage = `url("${String(md.thumb).replace(/"/g, "%22")}")`;
    const badge = document.createElement("span"); badge.className = "lk-badge"; badge.textContent = md.provider || "Link"; cover.appendChild(badge);
    const btn = document.createElement("span"); btn.className = md.embed ? "lk-play" : "lk-open"; btn.textContent = md.embed ? "▶" : "↗";
    if (inDetail) btn.onclick = () => (md.embed ? null : window.open(md.url, "_blank", "noopener"));
    cover.appendChild(btn);
    el.appendChild(cover);
  }
  const t = document.createElement("div"); t.className = "lk-title"; t.textContent = md.title || md.url || "Link"; el.appendChild(t);
  if (md.author) { const s = document.createElement("div"); s.className = "lk-sub"; s.textContent = md.author; el.appendChild(s); }
}

function playCard(id) {
  const prev = state.playing;
  state.playing = state.playing === id ? null : id;
  for (const pid of [prev, state.playing]) { if (!pid) continue; const n = state.notes.get(pid), el = noteEl(pid); if (n && el) { buildNoteContent(n, el); placeNote(el, n); } }
}

let linkTimer = null, linkMeta = null;
function onLinkInput() {
  clearTimeout(linkTimer);
  linkTimer = setTimeout(async () => {
    const raw = $("#linkInput").value.trim();
    const box = $("#linkPreview"); box.innerHTML = "";
    linkMeta = null;
    const info = parseLink(raw);
    if (!info) return;
    linkMeta = { url: new URL(raw).href, ...info, title: null, thumb: null, author: null };
    const draw = () => { box.innerHTML = ""; const el = document.createElement("div"); el.className = "note link"; buildLinkCard({ id: "preview", meta: linkMeta }, el, true); box.appendChild(el); };
    draw();
    const u = await api.unfurl(linkMeta.url);
    if (linkMeta && linkMeta.url === new URL($("#linkInput").value.trim() || "about:blank").href) {
      Object.assign(linkMeta, { title: u.title || linkMeta.title, thumb: u.thumb || null, author: u.author || (info.embed ? info.provider : null) });
      draw();
    }
  }, 350);
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
  renderBgSettings();
  $("#vibeSwitch").setAttribute("aria-checked", String(hapticsOn !== false));
  $("#vibeRow").hidden = !canVibrate;
  $("#appVersion").textContent = `Pinned · ${APP_VERSION}${isStandalone() ? " · installed" : ""}`;
  // avatar + bio
  const av = state.me?.avatar_path && state.urls[state.me.avatar_path];
  const ap = $("#avatarPreview");
  if (av) { ap.style.backgroundImage = `url("${av}")`; ap.textContent = ""; }
  else { ap.style.backgroundImage = ""; ap.style.background = BRIGHT[state.me?.color] || BRIGHT.c1; ap.textContent = (state.me?.name || "?").slice(0, 1).toUpperCase(); }
  $("#settingsBio").value = state.me?.bio || "";
  $("#bioCount").textContent = `${(state.me?.bio || "").length}/300`;
  openSheet("settings");
}

// ================================================================ games (Phase 3)
const GAME_LIST = [
  { id: "kestrel", name: "Neon Kestrel", icon: "🦅", file: "games/neon-kestrel.html", blurb: "Himal's synthwave flyer. Tap to flap through the neon towers." },
  { id: "pindrop", name: "Pin Drop", icon: "📌", file: "games/pin-drop.html", blurb: "Drop the swinging pin on a sliding bullseye. 10 drops." },
  { id: "plane", name: "Paper Plane", icon: "✈️", file: "games/paper-plane.html", blurb: "Hold to climb, let go to dive. Dodge pins, grab hearts." },
  { id: "blocks", name: "Block Drop", icon: "🟦", file: "games/block-drop.html", blurb: "Stack falling blocks and clear lines. A race gets the same pieces." },
  { id: "typerace", name: "Type Race", icon: "⌨️", file: "games/type-race.html", blurb: "Type the passage fast and clean. Everyone gets the same text." },
  { id: "speak", name: "Polyglot", icon: "🗣️", file: "games/polyglot.html", blurb: "Say phrases in another language. Voice-scored (or practice mode on iPhone)." },
];
const gameById = (id) => GAME_LIST.find((g) => g.id === id);
const RACE_WAIT = 20000, RACE_MAX = 4 * 60000, RACE_STALE = 20000;
const games = { boards: {}, v7: true, v8: true, v7Warned: false, ttt: [], c8: [], boardGame: null, race: null, play: null, tttId: null, cpu: null, cpuLevel: "easy", picking: false, timer: null, c8Id: null, c8View: null, c8cpu: null, c8pick: false, c8sel: null };
const colorOf = (id) => BRIGHT[memberById(id)?.color] || BRIGHT.c1;
const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const fmtSecs = (ms) => `0:${pad2(Math.max(0, Math.ceil(ms / 1000)))}`;
const v7Missing = (e) => /game_board|game_scores|ttt_|schema cache|does not exist|Could not find/i.test(e?.message || "");
function needsV7() {
  games.v7 = false;
  if (!games.v7Warned) { games.v7Warned = true; toast("Scores and tic-tac-toe need the latest database update. Run upgrade-v7.sql in Supabase (see SETUP).", 6000); }
}

function resetGames() {
  if (games.play) closeGameOverlay(true);
  clearInterval(games.timer); games.timer = null;
  games.race = null; games.boards = {}; games.ttt = []; games.tttId = null; games.cpu = null; games.boardGame = null;
  games.c8 = []; games.c8Id = null; games.c8View = null; games.c8cpu = null; games.c8sel = null;
  const d = $("#gamesDot"); if (d) d.hidden = true;
}

// ---------------------------------------------------------------- scoreboards
async function loadGameBoard(game) {
  if (!state.board) return null;
  try { const b = await api.gameBoard(state.board.id, game); games.boards[game] = b || { best: [], recent: [] }; games.v7 = true; }
  catch (e) { if (v7Missing(e)) games.v7 = false; }
  return games.boards[game] || null;
}
const loadAllGameBoards = () => Promise.all(GAME_LIST.map((g) => loadGameBoard(g.id)));
const bestOf = (game, id) => games.boards[game]?.best?.find((r) => r.user_id === id)?.best ?? null;

function onScoreEvent(row) {
  if (!row || row.board_id !== state.board?.id) return;
  loadGameBoard(row.game).then(renderGamesIfOpen);
}

async function recordScore(game, score, mode, rid) {
  if (!state.board) return;
  const before = (games.boards[game] || (await loadGameBoard(game)))?.best || [];
  const mine = before.find((r) => r.user_id === state.me.id)?.best ?? -1;
  try { await api.saveScore(state.board.id, game, score, mode, rid || null); }
  catch (e) { if (v7Missing(e)) needsV7(); else toast("Couldn't save your score: " + e.message); return; }
  const top = before[0];
  if (!before.length) toast(`🏆 First score on the board: ${score}`, 3000);
  else if (score > 0 && score > top.best) toast(`🏆 New board record in ${gameById(game).name}: ${score}!`, 3500);
  else if (score > mine && mine >= 0) toast(`⭐ New personal best: ${score}`, 3000);
  // tell people whose best you just passed (once: only when you were below them before)
  const passed = before.filter((r) => r.user_id !== state.me.id && score > r.best && mine <= r.best);
  for (const r of passed) api.notify(state.board.id, "lead", { game, score, to: r.user_id });
  await loadGameBoard(game);
  renderGamesIfOpen();
}

// ---------------------------------------------------------------- games sheet
function openGames() {
  games.boardGame = null; games.picking = false;
  renderGames(); openSheet("games");
  loadAllGameBoards().then(renderGamesIfOpen);
  loadTtt(); loadC8();
}
function renderGamesIfOpen() { if (!$("#games").hidden) renderGames(); if (!$("#ttt").hidden) renderTtt(); if (!$("#c8").hidden && games.c8View) renderC8(); updateGamesDot(); }

function renderGames() {
  $("#gamesV7").hidden = games.v7;
  $("#gameListView").hidden = !!games.boardGame;
  $("#gameBoardView").hidden = !games.boardGame;
  if (games.boardGame) return renderScoreboard();
  renderRaceBanner();
  const list = $("#gameList"); list.innerHTML = "";
  const r = games.race;
  for (const g of GAME_LIST) {
    const card = mk("div", "game-card");
    const top = mk("div", "gc-top");
    top.appendChild(mk("span", "gc-ic", g.icon));
    const t = mk("div"); t.appendChild(mk("b", null, g.name)); t.appendChild(mk("small", null, g.blurb)); top.appendChild(t);
    card.appendChild(top);
    const b = games.boards[g.id]?.best || [];
    const line = mk("div", "gc-best");
    if (b.length) {
      const lead = b[0], mine = bestOf(g.id, state.me.id);
      line.textContent = `🏆 ${lead.user_id === state.me.id ? "You" : (memberById(lead.user_id)?.name || "Someone")} ${lead.best}` +
        (mine != null && lead.user_id !== state.me.id ? ` · You ${mine}` : "");
    } else line.textContent = games.v7 ? "No scores yet. Be the first!" : "";
    card.appendChild(line);
    const acts = mk("div", "gc-actions");
    const solo = mk("button", "btn small", "Play solo"); solo.onclick = () => openGameOverlay(g.id, "solo");
    const raceOpen = r && r.game === g.id && r.phase === "lobby";
    const raceBusy = r && (r.phase === "count" || r.phase === "run");
    const race = mk("button", "btn small primary", raceOpen ? (r.joined ? "Back to lobby" : "Join race") : "Race");
    race.disabled = !!raceBusy || (r && r.phase === "lobby" && r.game !== g.id);
    race.onclick = () => (raceOpen ? (r.joined ? openGameOverlay(g.id, "race") : joinRace()) : startRace(g.id));
    const sb = mk("button", "btn small", "Scores"); sb.onclick = () => { games.boardGame = g.id; renderGames(); loadGameBoard(g.id).then(renderGamesIfOpen); };
    acts.append(solo, race, sb);
    card.appendChild(acts);
    list.appendChild(card);
  }
  renderTttCard();
  renderC8Card();
}

function renderRaceBanner() {
  const el = $("#raceBanner"), r = games.race;
  el.hidden = true; el.innerHTML = "";
  if (!r) return;
  const g = gameById(r.game); if (!g) return;
  const host = r.host === state.me.id ? "You" : (memberById(r.host)?.name || "Someone");
  if (r.phase === "lobby") {
    el.appendChild(mk("span", null, `🏁 ${host} started a ${g.name} race · ${fmtSecs(r.deadline - Date.now())}`));
    const b = mk("button", "btn small primary", r.joined ? "Open" : "Join");
    b.onclick = () => (r.joined ? openGameOverlay(r.game, "race") : joinRace());
    el.appendChild(b);
  } else if (r.phase === "count" || r.phase === "run") {
    el.appendChild(mk("span", null, r.joined ? `🏁 Your ${g.name} race is on` : `🏁 A ${g.name} race is on. You'll be in the next one.`));
    if (r.joined) { const b = mk("button", "btn small primary", "Back"); b.onclick = () => openGameOverlay(r.game, "race"); el.appendChild(b); }
  } else if (r.phase === "results" && r.ranking?.length) {
    const w = r.ranking[0];
    el.appendChild(mk("span", null, `🏆 ${w.id === state.me.id ? "You" : (memberById(w.id)?.name || "Someone")} won the ${g.name} race with ${w.score}`));
  } else return;
  el.hidden = false;
}

function renderScoreboard() {
  const g = gameById(games.boardGame), b = games.boards[g.id] || { best: [], recent: [] };
  $("#sbTitle").textContent = `${g.icon} ${g.name}`;
  const best = $("#sbBest"); best.innerHTML = "";
  b.best.forEach((r, i) => {
    const li = mk("li"); const m = memberById(r.user_id) || { name: "Someone who left", color: "c1" };
    li.appendChild(mk("span", "rank", ["🥇", "🥈", "🥉"][i] || String(i + 1)));
    li.appendChild(chipEl({ ...m, id: r.user_id }));
    li.appendChild(mk("span", "nm", r.user_id === state.me.id ? `${m.name} (you)` : m.name));
    li.appendChild(mk("small", null, `${r.plays} ${r.plays === 1 ? "round" : "rounds"}`));
    li.appendChild(mk("b", "sc", String(r.best)));
    best.appendChild(li);
  });
  if (!b.best.length) best.appendChild(mk("li", "empty", games.v7 ? "Nobody has played yet." : "Run upgrade-v7.sql to keep scores."));
  const rec = $("#sbRecent"); rec.innerHTML = "";
  for (const r of b.recent) {
    const li = mk("li"); const m = memberById(r.user_id);
    li.appendChild(mk("span", "nm", r.user_id === state.me.id ? "You" : (m?.name || "Someone")));
    li.appendChild(mk("small", null, `${r.mode === "race" ? "🏁 race" : "solo"} · ${timeAgo(r.created_at)}`));
    li.appendChild(mk("b", "sc", String(r.score)));
    rec.appendChild(li);
  }
  if (!b.recent.length) rec.appendChild(mk("li", "empty", "No rounds yet."));
}

function updateGamesDot() {
  const me = state.me?.id, r = games.race;
  const myTurn = games.ttt.some((g) => (g.status === "active" && ((g.turn === "X" && g.x_id === me) || (g.turn === "O" && g.o_id === me))) || (g.status === "invited" && g.o_id === me))
    || games.c8.some((g) => (g.status === "active" && ((g.turn === "x" && g.x_id === me) || (g.turn === "o" && g.o_id === me))) || (g.status === "invited" && g.o_id === me));
  const lobby = r && r.phase === "lobby" && !r.joined;
  const d = $("#gamesDot");
  d.hidden = !(myTurn || lobby);
  d.classList.toggle("live", !!lobby);
}

// ---------------------------------------------------------------- the game window
function sendToGame(msg) {
  const f = $("#gameFrame");
  try { f.contentWindow?.postMessage({ pinned: 1, ...msg }, location.origin); } catch { /* frame gone */ }
}

function openGameOverlay(gameId, mode) {
  const g = gameById(gameId), me = state.me;
  if (games.play && games.play.game === gameId && games.play.mode === mode && (mode === "solo" || games.play.rid === games.race?.rid)) {
    $("#gameOverlay").hidden = false; closeSheet("games"); renderLobby(); return;
  }
  if (games.play) closeGameOverlay(true);
  const q = new URLSearchParams({ embed: "1", mode, name: me.name || "You", color: BRIGHT[me.color] || "#ff8fb1" });
  if (mode === "race") q.set("seed", String(games.race.seed));
  games.play = { game: gameId, mode, ready: false, pendingGo: false, rid: mode === "race" ? games.race.rid : null };
  $("#gameFrame").src = `${g.file}?${q}`;
  $("#gameTitle").textContent = `${g.icon} ${g.name}`;
  $("#gameOverlay").hidden = false; document.body.classList.add("gaming");
  $("#raceResults").hidden = true; $("#gameCount").hidden = true;
  $("#raceLobby").hidden = mode !== "race" || games.race?.phase !== "lobby";
  closeSheet("games");
  renderLobby(); renderRaceChips();
}

function closeGameOverlay(silent = false) {
  const p = games.play; if (!p) return;
  const r = games.race;
  if (p.mode === "race" && r && r.rid === p.rid && r.joined) {
    if (r.phase === "lobby") {
      r.players.delete(state.me.id); r.joined = false;
      if (!r.players.size) { raceSend("cancel"); games.race = null; }
      else {
        if (r.host === state.me.id) r.host = [...r.players.keys()].sort()[0];
        raceSend("leave", { host: r.host });
      }
    } else if (r.phase === "count" || r.phase === "run") {
      const mine = r.players.get(state.me.id);
      if (mine && !mine.over) { mine.over = true; mine.left = true; mine.alive = false; raceSend("over", { s: mine.score || 0, quit: true }); checkRaceDone(); }
    }
  }
  games.play = null;
  $("#gameFrame").src = "about:blank";
  $("#gameOverlay").hidden = true; document.body.classList.remove("gaming");
  updateGamesDot();
  if (!silent && state.board) { renderGames(); openSheet("games"); }
}

window.addEventListener("message", (e) => {
  const f = $("#gameFrame");
  if (!games.play || !f || e.source !== f.contentWindow || e.origin !== location.origin || !e.data?.pinned) return;
  const m = e.data, p = games.play, r = games.race;
  if (m.t === "ready") {
    p.ready = true;
    if (p.pendingGo) { p.pendingGo = false; sendToGame({ t: "go" }); f.focus(); }
    if (p.mode === "race" && r) for (const pl of r.players.values()) if (pl.id !== state.me.id) sendToGame({ t: "ghost", s: ghostOf(pl) });
  } else if (m.t === "state") {
    if (p.mode === "race" && r && r.joined && r.rid === p.rid && r.phase === "run") {
      const mine = r.players.get(state.me.id);
      if (!mine || mine.over) return;
      Object.assign(mine, { d: m.d, y: m.y, alive: m.alive !== false, score: m.score || 0, at: Date.now() });
      raceSend("st", { d: m.d, y: m.y, a: m.alive !== false, s: m.score || 0 });
      renderRaceChips();
    }
  } else if (m.t === "over") onGameOver(m.score);
});

async function onGameOver(raw) {
  const p = games.play; if (!p) return;
  const score = Math.max(0, Math.min(100000, Math.floor(Number(raw) || 0)));
  const r = games.race;
  if (p.mode === "race") {
    if (!r || r.rid !== p.rid || !r.joined) return;
    const mine = r.players.get(state.me.id);
    if (!mine || mine.over) return;           // one run per race
    Object.assign(mine, { over: true, alive: false, score, at: Date.now() });
    raceSend("over", { s: score });
    renderRaceChips();
    checkRaceDone();
    recordScore(p.game, score, "race", r.rid);
  } else recordScore(p.game, score, "solo");
}

// ---------------------------------------------------------------- races
function raceSend(k, extra = {}) { live?.send({ t: "race", k, rid: games.race?.rid, u: state.me.id, ...extra }); }
function addRacer(id) {
  const r = games.race;
  if (id && !r.players.has(id)) r.players.set(id, { id, d: 0, y: 0, alive: true, score: 0, over: false, at: Date.now() });
}
const ghostOf = (pl) => ({ id: pl.id, name: memberById(pl.id)?.name || "Friend", color: colorOf(pl.id), d: pl.d, y: pl.y, alive: pl.alive, score: pl.score });
const openMsg = (r) => ({ game: r.game, seed: r.seed, host: r.host, wait: Math.max(0, r.deadline - Date.now()), players: [...r.players.keys()] });

function startRace(gameId) {
  const r = games.race;
  if (r && r.phase === "lobby") return r.game === gameId ? joinRace() : toast(`Finish the ${gameById(r.game).name} race first`);
  if (r && (r.phase === "count" || r.phase === "run")) return toast("A race is on right now. You'll be in the next one.");
  games.race = { rid: uid().replace(/-/g, "").slice(0, 16), game: gameId, seed: (Math.random() * 4294967296) >>> 0, host: state.me.id,
    phase: "lobby", deadline: Date.now() + RACE_WAIT, players: new Map(), joined: true };
  addRacer(state.me.id);
  raceSend("open", openMsg(games.race));
  if (others().length) api.notify(state.board.id, "game", { game: gameId });
  openGameOverlay(gameId, "race");
  raceTick();
}

function joinRace() {
  const r = games.race;
  if (!r || r.phase !== "lobby") return toast("That race already started. Catch the next one!");
  r.joined = true; addRacer(state.me.id);
  raceSend("join");
  openGameOverlay(r.game, "race");
  raceTick();
}

function onRaceMsg(m) {
  if (!m.u || m.u === state.me?.id) return;
  let r = games.race;
  const same = r && r.rid === m.rid;
  switch (m.k) {
    case "ask":
      if (r && r.phase === "lobby" && r.host === state.me.id) raceSend("open", openMsg(r));
      else if (r && (r.phase === "count" || r.phase === "run") && r.host === state.me.id) raceSend("busy", { game: r.game, players: [...r.players.keys()] });
      return;
    case "open": {
      if (same) { r.deadline = Date.now() + m.wait; (m.players || []).forEach(addRacer); renderLobby(); return; }
      if (!gameById(m.game)) return;
      if (r && (r.phase === "count" || r.phase === "run") && r.joined) return; // busy racing
      if (r && r.phase === "lobby") {
        // two people opened a race at the same moment: everyone keeps the one with the smaller id
        if (r.rid < m.rid) return;
        if (r.joined) { const wasPlaying = games.play?.mode === "race"; games.race = null; if (wasPlaying) closeGameOverlay(true); }
      }
      const adopt = r && r.phase === "lobby" && r.joined;
      games.race = r = { rid: m.rid, game: m.game, seed: m.seed >>> 0, host: m.host, phase: "lobby", deadline: Date.now() + m.wait, players: new Map(), joined: false };
      addRacer(m.host); (m.players || []).forEach(addRacer);
      if (adopt) joinRace();
      else toast(`🏁 ${memberById(m.host)?.name || "Someone"} started a ${gameById(m.game).name} race. Tap 🎮 Games to join!`, 5000);
      raceTick(); renderGamesIfOpen();
      return;
    }
    case "busy":
      if (!r && gameById(m.game)) {
        games.race = r = { rid: m.rid, game: m.game, seed: 0, host: m.u, phase: "run", startedAt: Date.now(), players: new Map(), joined: false };
        (m.players || []).forEach(addRacer); raceTick(); renderGamesIfOpen();
      }
      return;
    case "join": if (same) { addRacer(m.u); renderLobby(); renderRaceChips(); } return;
    case "leave":
      if (same) { r.players.delete(m.u); if (m.host) r.host = m.host; renderLobby(); renderRaceChips(); }
      return;
    case "cancel":
      if (same && r.phase === "lobby") {
        games.race = null;
        if (games.play?.mode === "race") { closeGameOverlay(true); toast("The race was called off"); }
        renderGamesIfOpen();
      }
      return;
    case "go": if (same && r.phase === "lobby") beginRace(m.players || []); return;
    case "st": {
      if (!same) return;
      const pl = r.players.get(m.u); if (!pl || pl.over) return;
      Object.assign(pl, { d: m.d, y: m.y, alive: m.a !== false, score: m.s || 0, at: Date.now() });
      if (r.joined) sendToGame({ t: "ghost", s: ghostOf(pl) });
      renderRaceChips();
      return;
    }
    case "over": {
      if (!same) return;
      const pl = r.players.get(m.u); if (!pl) return;
      Object.assign(pl, { over: true, alive: false, score: m.s || 0, left: !!m.quit, at: Date.now() });
      if (r.joined) sendToGame({ t: "ghost", s: ghostOf(pl) });
      renderRaceChips(); checkRaceDone();
      return;
    }
  }
}

function beginRace(ids) {
  const r = games.race;
  r.phase = "count"; r.startedAt = Date.now();
  for (const id of [...r.players.keys()]) if (!ids.includes(id)) r.players.delete(id);
  ids.forEach(addRacer);
  for (const pl of r.players.values()) pl.at = Date.now();
  if (!ids.includes(state.me.id)) r.joined = false;
  if (!r.joined) { r.phase = "run"; r.runAt = Date.now(); renderGamesIfOpen(); return; }  // watching: just follow along
  renderGamesIfOpen();
  $("#raceLobby").hidden = true;
  const el = $("#gameCount"); el.hidden = false;
  const steps = ["3", "2", "1", "GO!"];
  let i = 0;
  const next = () => {
    if (games.race !== r || !games.play) { el.hidden = true; return; }
    if (i < steps.length) { el.textContent = steps[i]; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); i++; setTimeout(next, i === steps.length ? 600 : 800); return; }
    el.hidden = true;
    r.phase = "run"; r.runAt = Date.now();
    for (const pl of r.players.values()) pl.at = Date.now();
    if (games.play.ready) { sendToGame({ t: "go" }); $("#gameFrame").focus(); } else games.play.pendingGo = true;
    renderRaceChips();
  };
  next();
}

function raceStartNow() {
  const r = games.race;
  if (!r || r.phase !== "lobby" || r.host !== state.me.id) return;
  const ids = [...r.players.keys()];
  raceSend("go", { players: ids });
  beginRace(ids);
}

function checkRaceDone() {
  const r = games.race;
  if (!r || r.phase !== "run") return;
  const now = Date.now();
  for (const pl of r.players.values()) if (!pl.over && pl.id !== state.me.id && now - pl.at > RACE_STALE) { pl.over = true; pl.left = true; pl.alive = false; }
  const all = [...r.players.values()];
  if (all.every((pl) => pl.over) || now - (r.runAt || r.startedAt) > RACE_MAX) finishRace();
}

function finishRace() {
  const r = games.race;
  r.phase = "results"; r.endedAt = Date.now();
  r.ranking = [...r.players.values()].sort((a, b) => (!!a.left - !!b.left) || (b.score - a.score));
  renderGamesIfOpen();
  if (!r.joined || !games.play || games.play.rid !== r.rid) return;
  const ol = $("#resultList"); ol.innerHTML = "";
  r.ranking.forEach((pl, i) => {
    const li = mk("li"); const m = memberById(pl.id) || { name: "Friend", color: "c1" };
    li.appendChild(mk("span", "rank", pl.left ? "👋" : (["🥇", "🥈", "🥉"][i] || String(i + 1))));
    li.appendChild(chipEl({ ...m, id: pl.id }));
    li.appendChild(mk("span", "nm", pl.id === state.me.id ? `${m.name} (you)` : m.name));
    li.appendChild(mk("b", "sc", pl.left ? "left" : String(pl.score)));
    ol.appendChild(li);
  });
  const win = r.ranking[0];
  $("#resultTitle").textContent = r.ranking.length < 2 ? "Race finished" : win.id === state.me.id ? "You won! 🎉" : `${memberById(win.id)?.name || "Someone"} wins!`;
  $("#raceResults").hidden = false;
  if (win.id === state.me.id && r.ranking.length > 1) rain("🏆", 14);
}

// one ticker drives lobby timers, the "start" signal, stale players, and clearing old results
function raceTick() {
  if (games.timer) return;
  games.timer = setInterval(() => {
    const r = games.race;
    if (!r) { clearInterval(games.timer); games.timer = null; return; }
    const now = Date.now();
    if (r.phase === "lobby") {
      const ids = [...r.players.keys()].sort();
      const hostHere = r.host === state.me.id || isOnline(r.host);
      // the host starts it; if the host vanished, whoever is first in line does
      if (now >= r.deadline && (r.host === state.me.id || (!hostHere && r.joined && ids[0] === state.me.id && now >= r.deadline + 3000))) {
        r.host = state.me.id; raceStartNow();
      } else if (now > r.deadline + 15000 && !r.joined) { games.race = null; }
      renderLobby();
    } else if (r.phase === "run") checkRaceDone();
    else if (r.phase === "results" && now - r.endedAt > 90000) { if (!games.play || games.play.rid !== r.rid) games.race = null; }
    if (!r.joined && r.phase !== "lobby" && r.phase !== "results" && now - r.startedAt > RACE_MAX) games.race = null;
    if (!$("#games").hidden) renderRaceBanner();
    updateGamesDot();
  }, 500);
}

function renderLobby() {
  const r = games.race, box = $("#raceLobby");
  if (!games.play || games.play.mode !== "race" || !r || r.rid !== games.play.rid || r.phase !== "lobby") { box.hidden = true; return; }
  box.hidden = false;
  const g = gameById(r.game);
  $("#lobbyGame").textContent = `${g.icon} ${g.name}`;
  const ul = $("#lobbyList"); ul.innerHTML = "";
  for (const id of r.players.keys()) {
    const m = memberById(id) || { name: "Friend", color: "c1" };
    const li = mk("li"); li.appendChild(chipEl({ ...m, id }));
    li.appendChild(mk("span", null, id === state.me.id ? `${m.name} (you)` : m.name));
    if (id === r.host) li.appendChild(mk("small", null, "host"));
    ul.appendChild(li);
  }
  const waiting = others().filter((m) => !r.players.has(m.id) && isOnline(m.id)).length;
  $("#lobbyTimer").textContent = `Starting in ${fmtSecs(r.deadline - Date.now())}` + (waiting ? ` · ${waiting} more online` : "");
  $("#lobbyStart").hidden = r.host !== state.me.id;
}

function renderRaceChips() {
  const box = $("#raceChips"); box.innerHTML = "";
  const p = games.play, r = games.race;
  if (!p) return;
  if (p.mode !== "race" || !r || r.rid !== p.rid) {
    const b = bestOf(p.game, state.me.id);
    box.appendChild(mk("span", "rc solo", b != null ? `Solo · your best ${b}` : "Solo"));
    return;
  }
  const list = [...r.players.values()].sort((a, b) => b.score - a.score || b.d - a.d);
  for (const pl of list) {
    const c = mk("span", "rc" + (pl.over ? " out" : ""));
    const dot = mk("i"); dot.style.background = colorOf(pl.id); c.appendChild(dot);
    c.appendChild(document.createTextNode(`${pl.id === state.me.id ? "You" : (memberById(pl.id)?.name || "Friend")} ${pl.score}${pl.left ? " 👋" : pl.over ? " 💥" : ""}`));
    box.appendChild(c);
  }
}

// ---------------------------------------------------------------- tic-tac-toe
const TTT_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function tttWinnerOf(c) { for (const [a, b, e] of TTT_LINES) if (c[a] !== "-" && c[a] === c[b] && c[a] === c[e]) return c[a]; return c.includes("-") ? null : "draw"; }
function tttLine(c) { return TTT_LINES.find(([a, b, e]) => c[a] !== "-" && c[a] === c[b] && c[a] === c[e]) || null; }
function negamax(c, turn) {
  const w = tttWinnerOf(c);
  if (w === "draw") return 0;
  if (w) return -10;                       // the player who just moved won
  let best = -99;
  const next = turn === "X" ? "O" : "X";
  for (let i = 0; i < 9; i++) if (c[i] === "-") {
    const v = -negamax(c.slice(0, i) + turn + c.slice(i + 1), next) * 0.9;
    if (v > best) best = v;
  }
  return best;
}
function cpuMove(c, mark, level) {
  const free = [...c].map((x, i) => (x === "-" ? i : -1)).filter((i) => i >= 0);
  if (level === "easy" && Math.random() < 0.55) return free[Math.floor(Math.random() * free.length)];
  const next = mark === "X" ? "O" : "X";
  let best = -99, pick = free[0];
  for (const i of free) { const v = -negamax(c.slice(0, i) + mark + c.slice(i + 1), next); if (v > best || (v === best && Math.random() < 0.3)) { best = v; pick = i; } }
  return pick;
}

async function loadTtt() {
  if (!state.board) return;
  try { games.ttt = await api.listTtt(state.board.id); games.v7 = true; }
  catch (e) { if (v7Missing(e)) games.v7 = false; }
  renderGamesIfOpen();
}
function upsertTtt(row) {
  const i = games.ttt.findIndex((g) => g.id === row.id);
  if (i >= 0) games.ttt[i] = { ...games.ttt[i], ...row }; else games.ttt.unshift(row);
  games.ttt.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}
function onTttEvent(row) {
  if (!row || row.board_id !== state.board?.id) return;
  const prev = games.ttt.find((g) => g.id === row.id);
  upsertTtt(row);
  const me = state.me.id, opp = row.x_id === me ? row.o_id : row.x_id, name = memberById(opp)?.name || "Someone";
  const mine = row.x_id === me || row.o_id === me;
  const watching = !$("#ttt").hidden && games.tttId === row.id;
  if (mine && !watching) {
    if (row.status === "invited" && row.o_id === me && !prev) toast(`❌⭕ ${name} challenged you to tic-tac-toe. Tap 🎮 Games.`, 5000);
    else if (row.status === "active" && prev?.status === "invited" && row.x_id === me) toast(`${name} accepted! Your move ❌`, 4000);
    else if (row.status === "declined" && row.x_id === me && prev?.status !== "declined") toast(`${name} passed on tic-tac-toe`);
  }
  renderGamesIfOpen();
}

const tttMark = (g, id) => (g.x_id === id ? "X" : g.o_id === id ? "O" : null);
function tttStatusText(g) {
  const me = state.me.id, mark = tttMark(g, me);
  const nm = (id) => (id === me ? "You" : (memberById(id)?.name || "Someone"));
  const opp = mark === "X" ? g.o_id : g.x_id;
  if (!mark) {
    if (g.status === "active") return `${nm(g.turn === "X" ? g.x_id : g.o_id)} to move`;
    if (g.status === "done") return g.winner === "draw" ? "Draw" : `${nm(g.winner === "X" ? g.x_id : g.o_id)} won`;
    return g.status === "invited" ? "Waiting to start" : "";
  }
  if (g.status === "invited") return g.o_id === me ? `${nm(g.x_id)} challenged you` : `Waiting for ${nm(opp)} to accept`;
  if (g.status === "active") return g.turn === mark ? "Your move" : `${nm(opp)}'s move`;
  if (g.status === "declined") return `${nm(g.o_id === me ? me : opp)} passed`;
  if (g.status === "cancelled") return "Called off";
  if (g.status === "done") return g.winner === "draw" ? "It's a draw 🤝" : g.winner === mark ? "You won! 🎉" : `${nm(opp)} won`;
  return "";
}

function renderTttCard() {
  const card = $("#tttCard"); card.innerHTML = "";
  const top = mk("div", "gc-top");
  top.appendChild(mk("span", "gc-ic", "❌⭕"));
  const t = mk("div"); t.appendChild(mk("b", null, "Tic-tac-toe")); t.appendChild(mk("small", null, "Challenge someone on the board, or play the computer.")); top.appendChild(t);
  card.appendChild(top);
  const me = state.me.id;
  // your record against each person
  const rec = {};
  for (const g of games.ttt) {
    if (g.status !== "done") continue;
    const mark = tttMark(g, me); if (!mark) continue;
    const opp = mark === "X" ? g.o_id : g.x_id, r = rec[opp] || (rec[opp] = { w: 0, l: 0, d: 0 });
    if (g.winner === "draw") r.d++; else if (g.winner === mark) r.w++; else r.l++;
  }
  const recs = Object.entries(rec).map(([id, r]) => `vs ${memberById(id)?.name || "someone"} ${r.w}–${r.l}${r.d ? ` (${r.d} draw${r.d > 1 ? "s" : ""})` : ""}`);
  card.appendChild(mk("div", "gc-best", recs.length ? `Your record: ${recs.join(" · ")}` : "No games yet."));
  const acts = mk("div", "gc-actions");
  const cpu = mk("button", "btn small", "vs Computer"); cpu.onclick = () => openCpu();
  const ch = mk("button", "btn small primary", "Challenge");
  ch.disabled = !others().length || !games.v7;
  ch.onclick = () => { if (others().length === 1) tttChallenge(others()[0].id); else { games.picking = !games.picking; renderGames(); } };
  acts.append(cpu, ch);
  card.appendChild(acts);
  if (games.picking && others().length > 1) {
    const pick = mk("div", "ttt-pick");
    for (const m of others()) { const b = mk("button", "btn small"); b.appendChild(chipEl(m)); b.appendChild(document.createTextNode(m.name)); b.onclick = () => { games.picking = false; tttChallenge(m.id); }; pick.appendChild(b); }
    card.appendChild(pick);
  }
  const open = games.ttt.filter((g) => g.status === "invited" || g.status === "active").slice(0, 12);
  if (open.length) {
    const ul = mk("ul", "ttt-list");
    for (const g of open) {
      const li = mk("li");
      const mine = !!tttMark(g, me);
      const who = mine ? `vs ${memberById(g.x_id === me ? g.o_id : g.x_id)?.name || "someone"}` : `${memberById(g.x_id)?.name || "?"} vs ${memberById(g.o_id)?.name || "?"}`;
      li.appendChild(mk("span", "nm", who));
      const st = tttStatusText(g);
      li.appendChild(mk("small", st === "Your move" || st.endsWith("challenged you") ? "hot" : null, st));
      const b = mk("button", "btn small", mine ? "Open" : "Watch"); b.onclick = () => openTtt(g.id);
      li.appendChild(b);
      ul.appendChild(li);
    }
    card.appendChild(ul);
  }
}

async function tttChallenge(oppId) {
  try {
    const g = await api.tttChallenge(state.board.id, oppId);
    upsertTtt(g); api.notify(state.board.id, "ttt", { game_id: g.id });
    openTtt(g.id);
  } catch (e) { if (v7Missing(e)) needsV7(); else toast(e.message); }
}

function openCpu() {
  games.cpu = { cells: "---------", turn: "X", first: "X", winner: null, busy: false };
  games.tttId = "cpu"; closeSheet("games"); renderTtt(); openSheet("ttt");
}
function openTtt(id) { games.tttId = id; closeSheet("games"); renderTtt(); openSheet("ttt"); }
function closeTtt() { closeSheet("ttt"); games.tttId = null; games.cpu = null; renderGames(); openSheet("games"); }

function renderTtt() {
  const cpu = games.tttId === "cpu", g = cpu ? null : games.ttt.find((x) => x.id === games.tttId);
  if (!cpu && !g) return;
  const me = state.me.id;
  const cells = cpu ? games.cpu.cells : g.cells;
  let canMove = false, status = "";
  if (cpu) {
    const c = games.cpu;
    $("#tttTitle").textContent = "You ❌ vs Computer ⭕";
    status = c.winner ? (c.winner === "draw" ? "It's a draw 🤝" : c.winner === "X" ? "You won! 🎉" : "The computer won") : c.turn === "X" ? "Your move" : "Thinking…";
    canMove = !c.winner && c.turn === "X" && !c.busy;
  } else {
    const nm = (id) => (id === me ? "You" : (memberById(id)?.name || "Someone"));
    $("#tttTitle").textContent = `${nm(g.x_id)} ❌ vs ${nm(g.o_id)} ⭕`;
    status = tttStatusText(g);
    const mark = tttMark(g, me);
    canMove = g.status === "active" && mark && g.turn === mark;
  }
  $("#tttStatus").textContent = status;
  $("#tttStatus").classList.toggle("hot", status === "Your move");
  const grid = $("#tttGrid"); grid.innerHTML = "";
  const line = tttLine(cells) || [];
  [...cells].forEach((v, i) => {
    const b = mk("button", "cell" + (line.includes(i) ? " win" : ""), v === "X" ? "❌" : v === "O" ? "⭕" : "");
    b.setAttribute("aria-label", `Square ${i + 1}${v !== "-" ? (v === "X" ? ", X" : ", O") : ""}`);
    b.disabled = !canMove || v !== "-";
    b.onclick = () => (cpu ? cpuPlay(i) : tttPlay(g.id, i));
    grid.appendChild(b);
  });
  const mark = g ? tttMark(g, me) : "X";
  $("#tttAccept").hidden = cpu || !(g.status === "invited" && g.o_id === me);
  $("#tttDecline").hidden = $("#tttAccept").hidden;
  $("#tttQuit").hidden = cpu || !mark || !(g.status === "invited" || g.status === "active");
  $("#tttQuit").textContent = g?.status === "invited" ? (g.x_id === me ? "Call off" : "Not now") : "Resign";
  if (g?.status === "invited" && g.o_id === me) $("#tttQuit").hidden = true;
  $("#tttRematch").hidden = cpu ? !games.cpu.winner : !(mark && ["done", "declined", "cancelled"].includes(g.status));
  $("#tttLevel").hidden = !cpu;
  $("#tttLevel").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.level === games.cpuLevel)));
}

async function tttPlay(id, cell) {
  const g = games.ttt.find((x) => x.id === id); if (!g) return;
  const mark = tttMark(g, state.me.id);
  // show it right away; the database has the final say
  const before = { ...g };
  upsertTtt({ ...g, cells: g.cells.slice(0, cell) + mark + g.cells.slice(cell + 1), turn: mark === "X" ? "O" : "X" });
  renderTtt();
  try { const row = await api.tttMove(id, cell); upsertTtt(row); api.notify(state.board.id, "ttt", { game_id: id }); if (row.status === "done" && row.winner === mark) rain("🎉", 10); }
  catch (e) { upsertTtt(before); toast(e.message); }
  renderTtt(); updateGamesDot();
}
async function tttRespondUi(accept) {
  const id = games.tttId;
  try { const row = await api.tttRespond(id, accept); upsertTtt(row); api.notify(state.board.id, "ttt", { game_id: id }); }
  catch (e) { toast(e.message); }
  if (accept) renderTtt(); else closeTtt();
}
async function tttQuitUi() {
  const g = games.ttt.find((x) => x.id === games.tttId); if (!g) return;
  if (g.status === "active" && !confirm("Resign this game? It counts as a loss.")) return;
  try { const row = await api.tttQuit(g.id); upsertTtt(row); if (row.status === "done") api.notify(state.board.id, "ttt", { game_id: g.id }); }
  catch (e) { toast(e.message); }
  renderTtt();
}
function tttRematch() {
  if (games.tttId === "cpu") {
    const first = games.cpu.first === "X" ? "O" : "X";
    games.cpu = { cells: "---------", turn: first, first, winner: null, busy: false };
    renderTtt(); if (first === "O") cpuTurn();
    return;
  }
  const g = games.ttt.find((x) => x.id === games.tttId); if (!g) return;
  tttChallenge(g.x_id === state.me.id ? g.o_id : g.x_id);
}
function cpuPlay(i) {
  const c = games.cpu; if (!c || c.winner || c.turn !== "X" || c.cells[i] !== "-") return;
  c.cells = c.cells.slice(0, i) + "X" + c.cells.slice(i + 1);
  c.winner = tttWinnerOf(c.cells); c.turn = "O";
  renderTtt();
  if (c.winner === "X") rain("🎉", 10);
  if (!c.winner) cpuTurn();
}
function cpuTurn() {
  const c = games.cpu; c.busy = true; renderTtt();
  setTimeout(() => {
    if (games.cpu !== c) return;
    const i = cpuMove(c.cells, "O", games.cpuLevel);
    c.cells = c.cells.slice(0, i) + "O" + c.cells.slice(i + 1);
    c.winner = tttWinnerOf(c.cells); c.turn = "X"; c.busy = false;
    renderTtt();
  }, 450);
}

// ---------------------------------------------------------------- Crazy 8s
const SUIT_SYM = { H: "♥", D: "♦", C: "♣", S: "♠" };
const SUIT_NAME = { H: "Hearts", D: "Diamonds", C: "Clubs", S: "Spades" };
const rankLabel = (r) => (r === "T" ? "10" : r);
function cardFace(card, { onClick, dim, small } = {}) {
  const el = mk("button", "pcard" + (dim ? " dim" : "") + (small ? " sm" : ""));
  if (!card) { el.classList.add("back"); el.disabled = true; return el; }
  const s = card[1], red = s === "H" || s === "D";
  el.classList.add(red ? "red" : "blk");
  el.innerHTML = `<span class="r">${rankLabel(card[0])}</span><span class="s">${SUIT_SYM[s]}</span>`;
  if (onClick) el.onclick = onClick; else el.disabled = true;
  el.setAttribute("aria-label", `${rankLabel(card[0])} of ${SUIT_NAME[s]}`);
  return el;
}

async function loadC8() {
  if (!state.board) return;
  try { games.c8 = await api.c8List(state.board.id); games.v7 = true; }
  catch (e) { if (v7Missing(e) || /crazy8/i.test(e.message)) games.v8 = false; }
  renderGamesIfOpen();
}
function upsertC8(row) {
  const i = games.c8.findIndex((g) => g.id === row.id);
  if (i >= 0) games.c8[i] = { ...games.c8[i], ...row }; else games.c8.unshift(row);
  games.c8.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}
async function onC8Event(row) {
  if (!row || row.board_id !== state.board?.id) return;
  const prev = games.c8.find((g) => g.id === row.id);
  upsertC8(row);
  const me = state.me.id, opp = row.x_id === me ? row.o_id : row.x_id, name = memberById(opp)?.name || "Someone";
  const mine = row.x_id === me || row.o_id === me;
  const watching = !$("#c8").hidden && games.c8Id === row.id;
  if (mine && !watching) {
    if (row.status === "invited" && row.o_id === me && !prev) toast(`🃏 ${name} challenged you to Crazy 8s. Tap 🎮 Games.`, 5000);
    else if (row.status === "declined" && row.x_id === me && prev?.status !== "declined") toast(`${name} passed on Crazy 8s`);
  }
  if (watching) { try { games.c8View = await api.c8View(row.id); } catch (e) {} renderC8(); }
  renderGamesIfOpen();
}

const c8Mark = (g) => (g.x_id === state.me.id ? "x" : g.o_id === state.me.id ? "o" : null);
function c8StatusText(g) {
  const me = state.me.id, mark = c8Mark(g);
  const nm = (id) => (id === me ? "You" : (memberById(id)?.name || "Someone"));
  const opp = mark === "x" ? g.o_id : g.x_id;
  if (!mark) {
    if (g.status === "active") return `${nm(g.turn === "x" ? g.x_id : g.o_id)} to play`;
    if (g.status === "done") return g.winner ? `${nm(g.winner === "x" ? g.x_id : g.o_id)} won` : "Over";
    return g.status === "invited" ? "Waiting to start" : "";
  }
  if (g.status === "invited") return g.o_id === me ? `${nm(g.x_id)} challenged you` : `Waiting for ${nm(opp)}`;
  if (g.status === "active") return g.turn === mark ? "Your move" : `${nm(opp)}'s move`;
  if (g.status === "declined") return "Declined";
  if (g.status === "cancelled") return "Called off";
  if (g.status === "done") return g.winner === mark ? "You won! 🎉" : `${nm(opp)} won`;
  return "";
}

function renderC8Card() {
  const card = $("#c8Card"); card.innerHTML = "";
  const top = mk("div", "gc-top");
  top.appendChild(mk("span", "gc-ic", "🃏"));
  const t = mk("div"); t.appendChild(mk("b", null, "Crazy 8s")); t.appendChild(mk("small", null, "Match suit or rank. 8s are wild. First to empty their hand wins.")); top.appendChild(t);
  card.appendChild(top);
  const me = state.me.id, rec = {};
  for (const g of games.c8) {
    if (g.status !== "done" || !g.winner) continue;
    const mark = c8Mark(g); if (!mark) continue;
    const opp = mark === "x" ? g.o_id : g.x_id, r = rec[opp] || (rec[opp] = { w: 0, l: 0 });
    if (g.winner === mark) r.w++; else r.l++;
  }
  const recs = Object.entries(rec).map(([id, r]) => `vs ${memberById(id)?.name || "someone"} ${r.w}–${r.l}`);
  card.appendChild(mk("div", "gc-best", recs.length ? `Your record: ${recs.join(" · ")}` : "No games yet."));
  const acts = mk("div", "gc-actions");
  const cpu = mk("button", "btn small", "vs Computer"); cpu.onclick = () => openC8Cpu();
  const ch = mk("button", "btn small primary", "Challenge");
  ch.disabled = !others().length || games.v8 === false;
  ch.onclick = () => { if (others().length === 1) c8Challenge(others()[0].id); else { games.c8pick = !games.c8pick; renderGames(); } };
  acts.append(cpu, ch); card.appendChild(acts);
  if (games.c8pick && others().length > 1) {
    const pick = mk("div", "ttt-pick");
    for (const m of others()) { const b = mk("button", "btn small"); b.appendChild(chipEl(m)); b.appendChild(document.createTextNode(m.name)); b.onclick = () => { games.c8pick = false; c8Challenge(m.id); }; pick.appendChild(b); }
    card.appendChild(pick);
  }
  const open = games.c8.filter((g) => g.status === "invited" || g.status === "active").slice(0, 12);
  if (open.length) {
    const ul = mk("ul", "ttt-list");
    for (const g of open) {
      const li = mk("li"); const mine = !!c8Mark(g);
      const who = mine ? `vs ${memberById(g.x_id === me ? g.o_id : g.x_id)?.name || "someone"}` : `${memberById(g.x_id)?.name || "?"} vs ${memberById(g.o_id)?.name || "?"}`;
      li.appendChild(mk("span", "nm", who));
      const st = c8StatusText(g);
      li.appendChild(mk("small", (st === "Your move" || st.endsWith("challenged you")) ? "hot" : null, st));
      const b = mk("button", "btn small", mine ? "Open" : "Watch"); b.onclick = () => openC8(g.id);
      li.appendChild(b); ul.appendChild(li);
    }
    card.appendChild(ul);
  }
}

async function c8Challenge(oppId) {
  try {
    const g = await api.c8Challenge(state.board.id, oppId);
    upsertC8(g); api.notify(state.board.id, "c8", { game_id: g.id });
    openC8(g.id);
  } catch (e) { if (v7Missing(e)) needsV7(); else toast(e.message); }
}
async function openC8(id) {
  games.c8Id = id; games.c8cpu = null; games.c8sel = null;
  try { games.c8View = await api.c8View(id); } catch (e) { toast(e.message); return; }
  closeSheet("games"); renderC8(); openSheet("c8");
}
function openC8Cpu() {
  const g = { x_id: "me", o_id: "cpu", ...C8.deal() };
  games.c8cpu = g; games.c8Id = "cpu"; games.c8sel = null;
  games.c8View = C8.view(g, "x");
  closeSheet("games"); renderC8(); openSheet("c8");
}
function closeC8() { closeSheet("c8"); games.c8Id = null; games.c8cpu = null; games.c8View = null; renderGames(); openSheet("games"); }

function renderC8() {
  const v = games.c8View; if (!v) return;
  const cpu = games.c8Id === "cpu";
  const g = cpu ? null : games.c8.find((x) => x.id === games.c8Id);
  const nm = (id) => (id === state.me.id ? "You" : (memberById(id)?.name || "Someone"));
  const oppName = cpu ? "Computer" : (g ? nm(g.x_id === state.me.id ? g.o_id : g.x_id) : "Opponent");
  $("#c8Title").textContent = `You 🃏 vs ${oppName}`;
  // status
  let status = v.last_note ? v.last_note[0].toUpperCase() + v.last_note.slice(1) : "";
  if (cpu) status = v.status === "done" ? (v.winner === "x" ? "You won! 🎉" : "Computer won") : (v.your_turn ? "Your move" : "Computer thinking…");
  else status = c8StatusText(g);
  $("#c8Status").textContent = status;
  $("#c8Status").classList.toggle("hot", status === "Your move");
  // opponent cards (face-down count)
  const opp = $("#c8Opp"); opp.innerHTML = "";
  opp.appendChild(mk("span", "c8-count", `${oppName}: ${v.opp_count ?? "?"} cards`));
  const fan = mk("div", "c8-fan");
  for (let i = 0; i < Math.min(v.opp_count || 0, 12); i++) fan.appendChild(cardFace(null, {}));
  opp.appendChild(fan);
  // discard + suit + draw
  const mid = $("#c8Mid"); mid.innerHTML = "";
  const pile = mk("div", "c8-pile");
  pile.appendChild(cardFace(v.top, {}));
  const suitBadge = mk("div", "c8-suit " + (v.suit === "H" || v.suit === "D" ? "red" : "blk"), SUIT_SYM[v.suit] || "");
  if (v.top && v.top[0] === "8") suitBadge.classList.add("wild");
  pile.appendChild(suitBadge);
  mid.appendChild(pile);
  const drawBtn = mk("button", "c8-draw", `Draw\n(${v.draw_count})`);
  drawBtn.disabled = !v.your_turn;
  drawBtn.onclick = c8DrawUi;
  mid.appendChild(drawBtn);
  // your hand
  const hand = $("#c8Hand"); hand.innerHTML = "";
  for (const c of v.hand) {
    const ok = v.your_turn && C8.playable(c, v.top, v.suit);
    hand.appendChild(cardFace(c, { onClick: ok ? () => c8PlayUi(c) : null, dim: v.your_turn && !ok }));
  }
  if (!v.hand.length && v.status !== "done") hand.appendChild(mk("div", "c8-empty", "No cards"));
  // suit chooser
  $("#c8Suits").hidden = !games.c8sel;
  // actions
  const invitedToMe = !cpu && g && g.status === "invited" && g.o_id === state.me.id;
  $("#c8Accept").hidden = !invitedToMe; $("#c8Decline").hidden = !invitedToMe;
  $("#c8Pass").hidden = !v.can_pass;
  const mark = cpu ? "x" : c8Mark(g);
  $("#c8Quit").hidden = cpu || !mark || !(g.status === "invited" || g.status === "active") || invitedToMe;
  $("#c8Quit").textContent = g && g.status === "invited" ? "Call off" : "Resign";
  $("#c8Rematch").hidden = cpu ? v.status !== "done" : !(mark && ["done", "declined", "cancelled"].includes(g.status));
  $("#c8Level").hidden = !cpu;
  $("#c8Level").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.level === games.cpuLevel)));
  updateGamesDot();
}

function c8PlayUi(card) {
  if (card[0] === "8") { games.c8sel = card; renderSuitChooser(); $("#c8Suits").hidden = false; return; }
  c8Commit(card, null);
}
function renderSuitChooser() {
  const box = $("#c8Suits"); box.querySelectorAll(".c8-suitpick").forEach((e) => e.remove());
  for (const s of ["H", "D", "C", "S"]) {
    const b = mk("button", "c8-suitpick " + (s === "H" || s === "D" ? "red" : "blk"), SUIT_SYM[s]);
    b.onclick = () => { const c = games.c8sel; games.c8sel = null; $("#c8Suits").hidden = true; c8Commit(c, s); };
    box.appendChild(b);
  }
}
async function c8Commit(card, suit) {
  if (games.c8Id === "cpu") {
    const g = games.c8cpu, r = C8.play(g, "x", card, suit);
    if (r.err) { toast(r.err); return; }
    games.c8View = C8.view(g, "x"); renderC8();
    if (g.status === "done" && g.winner === "x") rain("🎉", 10);
    if (g.status === "active") c8CpuTurn();
    return;
  }
  const g = games.c8.find((x) => x.id === games.c8Id);
  try { games.c8View = await api.c8Play(games.c8Id, card, suit); upsertC8(await api.c8List(state.board.id).then((l) => l.find((x) => x.id === games.c8Id) || g)); api.notify(state.board.id, "c8", { game_id: games.c8Id }); if (games.c8View.status === "done" && games.c8View.winner === games.c8View.mark) rain("🎉", 10); }
  catch (e) { toast(e.message); try { games.c8View = await api.c8View(games.c8Id); } catch (_) {} }
  renderC8();
}
async function c8DrawUi() {
  if (games.c8Id === "cpu") {
    const g = games.c8cpu; C8.draw(g, "x"); games.c8View = C8.view(g, "x"); renderC8();
    if (g.status === "active" && g.turn === "o") c8CpuTurn();
    return;
  }
  try { games.c8View = await api.c8Draw(games.c8Id); api.notify(state.board.id, "c8", { game_id: games.c8Id }); }
  catch (e) { toast(e.message); }
  renderC8();
}
async function c8RespondUi(accept) {
  try { games.c8View = await api.c8Respond(games.c8Id, accept); api.notify(state.board.id, "c8", { game_id: games.c8Id }); }
  catch (e) { toast(e.message); }
  if (accept) renderC8(); else closeC8();
}
async function c8QuitUi() {
  const g = games.c8.find((x) => x.id === games.c8Id);
  if (g && g.status === "active" && !confirm("Resign this game? It counts as a loss.")) return;
  try { games.c8View = await api.c8Quit(games.c8Id); if (games.c8View.status === "done") api.notify(state.board.id, "c8", { game_id: games.c8Id }); }
  catch (e) { toast(e.message); }
  renderC8();
}
function c8Rematch() {
  if (games.c8Id === "cpu") { openC8Cpu(); return; }
  const g = games.c8.find((x) => x.id === games.c8Id); if (!g) return;
  c8Challenge(g.x_id === state.me.id ? g.o_id : g.x_id);
}
// computer: play a sensible card, else draw
function c8CpuTurn() {
  const g = games.c8cpu; games.c8View = C8.view(g, "x"); renderC8();
  setTimeout(() => {
    if (games.c8cpu !== g || g.status !== "active" || g.turn !== "o") return;
    const hand = g.hand_o;
    const plain = hand.filter((c) => c[0] !== "8" && C8.playable(c, g.top, g.suit));
    const eights = hand.filter((c) => c[0] === "8");
    let moved = false;
    if (plain.length) { C8.play(g, "o", plain[Math.floor(Math.random() * plain.length)]); moved = true; }
    else if (eights.length && (games.cpuLevel === "hard" || !C8.hasPlay(hand.filter((c) => c[0] !== "8"), g.top, g.suit))) {
      const cnt = { H: 0, D: 0, C: 0, S: 0 }; for (const c of hand) if (c[0] !== "8") cnt[c[1]]++;
      const best = ["H", "D", "C", "S"].sort((a, b) => cnt[b] - cnt[a])[0];
      C8.play(g, "o", eights[0], best); moved = true;
    } else {
      const r = C8.draw(g, "o");
      if (r.keep && r.drew) { if (r.drew[0] === "8") { const cnt = { H: 0, D: 0, C: 0, S: 0 }; for (const c of g.hand_o) if (c[0] !== "8") cnt[c[1]]++; C8.play(g, "o", r.drew, ["H", "D", "C", "S"].sort((a, b) => cnt[b] - cnt[a])[0]); } else C8.play(g, "o", r.drew); }
    }
    games.c8View = C8.view(g, "x"); renderC8();
    if (g.status === "active" && g.turn === "o") c8CpuTurn();   // drew-and-passed? (shouldn't loop; turn would be x)
  }, 700);
}

// ================================================================ Spatial voice chat (WebRTC mesh + Web Audio)
const ICE = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// read-only voice diagnostics (handy for "why won't it connect?")
if (typeof window !== "undefined") window.voiceStatus = () => ({ on: voice.on, muted: voice.muted, micEnabled: voice.mic?.getAudioTracks?.()[0]?.enabled, peers: [...voice.peers.values()].map((p) => ({ id: p.id, state: p.pc.connectionState, ice: p.pc.iceConnectionState, stream: !!p.stream, panner: !!p.panner })) });
const voice = { on: false, ctx: null, mic: null, master: null, convolver: null, wetGain: null, peers: new Map(), muted: false, posT: 0, speakT: 0, raf: 0 };
const myVoiceId = () => state.me?.id || "";

function hallImpulse(ctx, seconds = 1.8, decay = 2.6) {
  const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}

async function joinVoice() {
  if (voice.on) return;
  try {
    voice.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
  } catch (e) { toast(e && e.name === "NotAllowedError" ? "Microphone blocked — allow it in your phone's settings" : "Couldn't get the microphone"); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  voice.ctx = new AC();
  if (voice.ctx.state === "suspended") await voice.ctx.resume();
  voice.master = voice.ctx.createGain(); voice.master.gain.value = 1; voice.master.connect(voice.ctx.destination);
  voice.convolver = voice.ctx.createConvolver(); voice.convolver.buffer = hallImpulse(voice.ctx);
  voice.wetGain = voice.ctx.createGain(); voice.wetGain.gain.value = 0.18;   // gentle hall, not too intense
  voice.convolver.connect(voice.wetGain); voice.wetGain.connect(voice.master);
  try { const L = voice.ctx.listener; if (L.positionX) { L.positionX.value = 0; L.positionY.value = 0; L.positionZ.value = 0; } } catch { /* ignore */ }
  voice.on = true; voice.muted = false;
  live?.track?.({ voice: true, vmuted: false });
  live?.send({ t: "vjoin", u: myVoiceId() });
  // connect to anyone already in voice (from presence)
  for (const m of others()) if (state.presence[m.id]?.voice) ensurePeer(m.id);
  showVoiceBar();
  startVoiceLoop();
  haptic(15);
}
function leaveVoice() {
  if (!voice.on) return;
  voice.on = false;
  live?.send({ t: "vleave", u: myVoiceId() });
  live?.track?.({ voice: false, vmuted: false });
  for (const [, p] of voice.peers) closePeer(p);
  voice.peers.clear();
  voice.mic?.getTracks().forEach((t) => t.stop()); voice.mic = null;
  cancelAnimationFrame(voice.raf); voice.raf = 0;
  try { voice.ctx?.close(); } catch { /* ignore */ }
  voice.ctx = null;
  $("#voiceBar").hidden = true;
  renderVoiceJoin();
}
function toggleVoiceMute() {
  if (!voice.on) return;
  voice.muted = !voice.muted;
  voice.mic?.getAudioTracks().forEach((t) => (t.enabled = !voice.muted));
  live?.track?.({ voice: true, vmuted: voice.muted });
  renderVoiceBar();
  haptic(10);
}

function ensurePeer(id) {
  if (!voice.on || id === myVoiceId() || voice.peers.has(id)) return voice.peers.get(id);
  const polite = myVoiceId() < id;             // smaller id is the polite peer (perfect negotiation)
  const pc = new RTCPeerConnection({ iceServers: ICE });
  const p = { id, pc, polite, makingOffer: false, ignoreOffer: false, stream: null, audioEl: null, src: null, panner: null, dry: null, analyser: null, level: 0 };
  voice.peers.set(id, p);
  for (const track of voice.mic.getTracks()) pc.addTrack(track, voice.mic);
  pc.onicecandidate = ({ candidate }) => { if (candidate) live?.send({ t: "rtc", to: id, u: myVoiceId(), kind: "ice", data: candidate.toJSON ? candidate.toJSON() : { candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex } }); };
  pc.onnegotiationneeded = async () => {
    try { p.makingOffer = true; await pc.setLocalDescription(); const d = pc.localDescription; live?.send({ t: "rtc", to: id, u: myVoiceId(), kind: "desc", data: { type: d.type, sdp: d.sdp } }); }
    catch (e) { console.warn("voice offer", e); } finally { p.makingOffer = false; }
  };
  pc.ontrack = ({ streams }) => { p.stream = streams[0]; wirePeerAudio(p); };
  pc.onconnectionstatechange = () => { if (["failed", "closed", "disconnected"].includes(pc.connectionState)) renderVoiceBar(); else if (pc.connectionState === "connected") renderVoiceBar(); };
  renderVoiceBar();
  return p;
}
function wirePeerAudio(p) {
  if (!voice.ctx || !p.stream) return;
  // Chrome needs the stream attached to an <audio> element too, or Web Audio gets silence
  p.audioEl = new Audio(); p.audioEl.srcObject = p.stream; p.audioEl.muted = true; p.audioEl.play().catch(() => {});
  p.src = voice.ctx.createMediaStreamSource(p.stream);
  p.panner = voice.ctx.createPanner();
  Object.assign(p.panner, { panningModel: "HRTF", distanceModel: "inverse", refDistance: 1, maxDistance: 14, rolloffFactor: 1.1 });
  p.dry = voice.ctx.createGain(); p.dry.gain.value = 1;
  p.src.connect(p.panner);
  p.panner.connect(p.dry); p.dry.connect(voice.master);     // dry (spatial)
  p.panner.connect(voice.convolver);                         // wet send (shared hall)
  p.analyser = voice.ctx.createAnalyser(); p.analyser.fftSize = 256; p.src.connect(p.analyser);
  positionPeer(p);
  renderVoiceBar();
}
function closePeer(p) {
  try { p.pc.close(); } catch { /* ignore */ }
  try { p.src?.disconnect(); p.panner?.disconnect(); p.dry?.disconnect(); p.analyser?.disconnect(); } catch { /* ignore */ }
  if (p.audioEl) { p.audioEl.srcObject = null; p.audioEl = null; }
}

// spatial: a peer's position comes from where they are on the board relative to me
function positionPeer(p) {
  if (!p.panner) return;
  const mine = myViewCenter(), theirs = state.views[p.id];
  if (!theirs) { setPanner(p.panner, 0, 0); return; }
  const k = 1 / 140;                                  // board units -> audio units
  setPanner(p.panner, clamp((theirs.cx - mine.cx) * k, -9, 9), clamp((theirs.cy - mine.cy) * k, -9, 9));
}
function setPanner(panner, x, y) {
  const z = -1.2;   // slightly in front so there's always a little presence
  if (panner.positionX) { panner.positionX.value = x; panner.positionY.value = y; panner.positionZ.value = z; }
  else panner.setPosition(x, y, z);
}
function myViewCenter() {
  const r = vp(), v = state.view;
  return { cx: (r.width / 2 - v.tx) / v.s, cy: (r.height / 2 - v.ty) / v.s };
}

function startVoiceLoop() {
  const tick = () => {
    if (!voice.on) return;
    const now = performance.now();
    if (now - voice.posT > 180) { voice.posT = now; for (const [, p] of voice.peers) positionPeer(p); }
    if (now - voice.speakT > 120) { voice.speakT = now; updateSpeaking(); }
    voice.raf = requestAnimationFrame(tick);
  };
  voice.raf = requestAnimationFrame(tick);
}
const _buf = new Uint8Array(256);
function levelOf(analyser) {
  if (!analyser) return 0;
  analyser.getByteTimeDomainData(_buf);
  let sum = 0; for (let i = 0; i < _buf.length; i++) { const v = (_buf[i] - 128) / 128; sum += v * v; }
  return Math.sqrt(sum / _buf.length);
}
function updateSpeaking() {
  const bar = $("#voiceWho"); if (!bar) return;
  for (const [, p] of voice.peers) {
    p.level = p.level * 0.6 + levelOf(p.analyser) * 0.4;
    const el = bar.querySelector(`[data-vu="${CSS.escape(p.id)}"]`);
    if (el) el.classList.toggle("speaking", p.level > 0.045);
  }
}

function onVoiceMsg(m) {
  if (!m.u || m.u === myVoiceId()) return;
  if (m.t === "vjoin") { renderVoiceJoin(); if (voice.on) ensurePeer(m.u); return; }
  if (m.t === "vleave") { const p = voice.peers.get(m.u); if (p) { closePeer(p); voice.peers.delete(m.u); renderVoiceBar(); } renderVoiceJoin(); return; }
  if (m.t === "rtc") {
    if (m.to !== myVoiceId() || !voice.on) return;
    const p = ensurePeer(m.u); if (!p) return;
    handleRtc(p, m.kind, m.data);
  }
}
async function handleRtc(p, kind, data) {
  const pc = p.pc;
  try {
    if (kind === "desc") {
      const offerCollision = data.type === "offer" && (p.makingOffer || pc.signalingState !== "stable");
      p.ignoreOffer = !p.polite && offerCollision;
      if (p.ignoreOffer) return;
      await pc.setRemoteDescription(data);
      if (data.type === "offer") { await pc.setLocalDescription(); const d = pc.localDescription; live?.send({ t: "rtc", to: p.id, u: myVoiceId(), kind: "desc", data: { type: d.type, sdp: d.sdp } }); }
    } else if (kind === "ice") {
      try { await pc.addIceCandidate(data); } catch (e) { if (!p.ignoreOffer) console.warn("ice", e); }
    }
  } catch (e) { console.warn("voice rtc", e); }
}

// ---- voice UI ----
function voiceSupported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection); }
function renderVoiceJoin() {
  const btn = $("#voiceJoinBtn"); if (!btn) return;
  const inVoice = others().filter((m) => state.presence[m.id]?.voice);
  if (!voiceSupported()) { btn.hidden = true; return; }
  btn.hidden = false;
  btn.textContent = voice.on ? "🎙️ In voice — tap to leave" : (inVoice.length ? `🎙️ Join voice (${inVoice.length} in)` : "🎙️ Start voice chat");
  btn.classList.toggle("live", voice.on || inVoice.length > 0);
}
function showVoiceBar() { $("#voiceBar").hidden = false; renderVoiceBar(); }
function renderVoiceBar() {
  const bar = $("#voiceBar"); if (!bar || !voice.on) { if (bar) bar.hidden = !voice.on; return; }
  bar.hidden = false;
  $("#voiceMute").textContent = voice.muted ? "🔇" : "🎙️";
  $("#voiceMute").setAttribute("aria-pressed", String(voice.muted));
  const who = $("#voiceWho"); who.innerHTML = "";
  // me
  who.appendChild(voiceAvatar(state.me, voice.muted, true));
  for (const [id, p] of voice.peers) {
    const m = memberById(id) || { id, name: "Friend", color: "c1" };
    const connected = p.pc && p.pc.connectionState === "connected";
    const chip = voiceAvatar(m, state.presence[id]?.vmuted, false, !connected);
    who.appendChild(chip);
  }
}
function voiceAvatar(m, muted, isMe, connecting) {
  const w = document.createElement("span"); w.className = "vu" + (connecting ? " connecting" : ""); w.dataset.vu = m.id;
  const c = chipEl({ ...m }); c.classList.remove("more"); w.appendChild(c);
  if (muted) { const mm = document.createElement("i"); mm.className = "vmute"; mm.textContent = "🔇"; w.appendChild(mm); }
  const label = document.createElement("small"); label.textContent = isMe ? "You" : (m.name || "").split(" ")[0]; w.appendChild(label);
  return w;
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
  const url = inviteUrl(state.board?.code);
  const text = `Join my board on Pinned 💌 Tap the link, or use code ${code}`;
  try {
    if (navigator.share) await navigator.share({ title: "Pinned", text, url });
    else { await navigator.clipboard.writeText(`${text}\n${url}`); toast("Invite link copied"); }
  } catch { /* user cancelled */ }
}
function toggleWaitQr() {
  const wrap = $("#waitQrWrap");
  if (!wrap || $("#waitQR")?.dataset.ok !== "1") { // QR unavailable (offline / blocked) → copy the link instead
    const url = inviteUrl(state.board?.code);
    navigator.clipboard?.writeText(url).then(() => toast("Invite link copied")).catch(() => toast(url, 6000));
    return;
  }
  wrap.hidden = !wrap.hidden;
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
  hint.hidden = true; btn.hidden = false; $("#notifReset").hidden = true;
  const sup = notifSupport();
  if (sup === "install") {
    st.textContent = "Add to Home Screen first";
    hint.textContent = "On iPhone: tap the Share button in Safari, choose \"Add to Home Screen\", then open Pinned from your home screen and turn notifications on here.";
    hint.hidden = false; btn.hidden = true; return;
  }
  if (sup === "unsupported") { st.textContent = "Not supported in this browser"; btn.hidden = true; return; }
  if (!api.pushReady()) { st.textContent = "Not set up yet (see SETUP.md)"; btn.hidden = true; return; }
  const p = Notification.permission;
  if (p === "granted") {
    st.textContent = "On"; btn.textContent = "Send test"; $("#notifReset").hidden = false;
    // health check: is this device actually registered to receive push?
    if (!isDemo) navigator.serviceWorker?.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (Notification.permission !== "granted") return; st.textContent = sub ? "On · this phone is registered ✓" : "On, but this phone isn't registered — tap Reset"; })
      .catch(() => {});
  }
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
    else if (r.sent) toast(`Test sent to ${r.devices} device${r.devices > 1 ? "s" : ""}. It should pop up in a few seconds.${(r.failures || []).length ? " (" + r.failures.length + " failed)" : ""}`, 5000);
    else {
      const f = (r.failures || []).join("; ");
      toast(/BadJwtToken|403/.test(f) ? "Apple refused the notification (403). Redeploy the notify function from the latest files, then tap Reset." : "Push service refused it: " + f, 9000);
    }
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") { await refreshPushSubscription(true); toast("Notifications on. Tap Send test to check."); }
  renderNotifStatus();
}

// Throw away this phone's notification registration and make a fresh one (fixes stale iPhone registrations)
async function resetPush() {
  if (notifSupport() !== "ok" || Notification.permission !== "granted") return toast("Turn notifications on first");
  const btn = $("#notifReset"); busy(btn, true, "Resetting…");
  try {
    const reg = await navigator.serviceWorker.ready;
    const old = await reg.pushManager.getSubscription();
    if (old) { await old.unsubscribe().catch(() => {}); }
    await refreshPushSubscription(true);
    const r = await api.notify(state.board.id, "note", { test: true });
    if (r?.sent) toast("Reset done. A test notification is on its way ✅", 5000);
    else toast("Reset done, but the test didn't send: " + (r?.error || (r?.failures || []).join("; ") || "no device registered"), 9000);
  } catch (e) { toast("Couldn't reset: " + e.message, 6000); }
  busy(btn, false);
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
  swatchRow($("#textSwatches"), compose.color, (c) => { compose.color = c; ls.set("pinned-note-color", c); paintPaper($("#textPreview"), c); });
  paintPaper($("#textPreview"), compose.color);
  swatchRow($("#padSwatches"), compose.padColor, (c) => { compose.padColor = c; ls.set("pinned-pen-color", c); paintPaper($("#padWrap"), c); });
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
  $("#detailEdit").onclick = () => { const id = detailId; closeSheet("detail"); if (id) openEdit(id); };
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
    toast(r?.error ? "Couldn't send the invite" : `Invite sent to ${others().length === 1 ? others()[0].name : "everyone"} 💌`);
  };

  // settings
  $("#switchBoardBtn").onclick = () => { $("#switchRow").hidden = !$("#switchRow").hidden; if (!$("#switchRow").hidden) $("#switchCode").focus(); };
  $("#switchGo").onclick = switchBoard;
  $("#switchCode").addEventListener("input", (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    e.target.value = raw.length > 4 ? raw.slice(0, 4) + "-" + raw.slice(4) : raw;
  });
  $("#leaveBoardBtn").onclick = leaveBoard;
  $("#exportBoardBtn").onclick = exportBoard;
  $("#deleteBoardBtn").onclick = deleteBoard;
  $("#openSettings").onclick = openSettings;
  $("#settingsClose").onclick = () => closeSheet("settings");
  $("#settingsBackdrop").onclick = () => closeSheet("settings");
  $("#shareCode").onclick = shareCode;
  $("#waitShare").onclick = shareCode;
  $("#waitQrBtn").onclick = toggleWaitQr;
  $("#notifBtn").onclick = onNotifBtn;
  $("#notifReset").onclick = resetPush;
  $("#vibeSwitch").onclick = () => { hapticsOn = hapticsOn === false; ls.set("pinned-haptics", hapticsOn); $("#vibeSwitch").setAttribute("aria-checked", String(hapticsOn)); if (hapticsOn) haptic(20); };
  $("#saveName").onclick = async () => {
    const name = $("#settingsName").value.trim(); if (!name) return;
    try { await api.updateProfile({ name }); state.me.name = name; await refreshMembers(); toast("Saved"); } catch (e) { toast(e.message); }
  };
  $("#avatarEdit").onclick = () => $("#avatarInput").click();
  $("#avatarInput").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    try {
      const blob = await compressImage(f, 256, 0.85);
      const path = await api.uploadAvatar(blob);
      await api.updateProfile({ avatar_path: path });
      const urls = await api.mediaUrls([path]); Object.assign(state.urls, urls);
      state.me.avatar_path = path;
      const ap = $("#avatarPreview"); ap.style.backgroundImage = `url("${state.urls[path]}")`; ap.textContent = "";
      await refreshMembers(); haptic(12); toast("Picture updated");
    } catch (err) { toast(err.message || "Couldn't update your picture"); }
  });
  $("#settingsBio").addEventListener("input", (e) => { $("#bioCount").textContent = `${e.target.value.length}/300`; });
  $("#saveBio").onclick = async () => {
    const bio = $("#settingsBio").value.trim() || null;
    try { await api.updateProfile({ bio }); state.me.bio = bio; await refreshMembers(); toast("Bio saved"); }
    catch (e) { /relation|column|schema cache/i.test(e.message || "") ? toast("Bios need upgrade-v10.sql in Supabase", 4000) : toast(e.message); }
  };

  window.addEventListener("resize", () => { if (state.board) layoutBoard(); });
  wireCanvas();
  $("#toolHome").onclick = () => goHome();
  $("#toolFind").onclick = () => (others().filter((m) => state.views[m.id]).length > 1 ? openPeople() : findSomeone());
  $("#toolDraw").onclick = () => setInkMode(!inkMode);
  $("#bDone").onclick = () => setInkMode(false);
  buildTools({ pens: $("#bPens"), sizes: $("#bSizes"), eraser: $("#bEraser"), undo: $("#bUndo"), clear: $("#bClear") }, inkTool, { onUndo: inkUndo, onClear: () => {} });
  $("#memberChips").onclick = openPeople;
  $("#dockChats").onclick = openChats;
  // games
  $("#dockGames").onclick = openGames;
  $("#gamesClose").onclick = () => closeSheet("games");
  $("#gamesBackdrop").onclick = () => closeSheet("games");
  $("#sbBack").onclick = () => { games.boardGame = null; renderGames(); };
  $("#sbSolo").onclick = () => games.boardGame && openGameOverlay(games.boardGame, "solo");
  $("#sbRace").onclick = () => games.boardGame && startRace(games.boardGame);
  $("#gameExit").onclick = () => closeGameOverlay();
  $("#lobbyStart").onclick = raceStartNow;
  $("#lobbyLeave").onclick = () => closeGameOverlay();
  $("#raceAgain").onclick = () => { const g = games.race?.game || games.play?.game; closeGameOverlay(true); games.race = null; if (g) startRace(g); };
  $("#raceDone").onclick = () => closeGameOverlay();
  $("#tttClose").onclick = closeTtt;
  $("#tttBackdrop").onclick = closeTtt;
  $("#tttAccept").onclick = () => tttRespondUi(true);
  $("#tttDecline").onclick = () => tttRespondUi(false);
  $("#tttQuit").onclick = tttQuitUi;
  $("#tttRematch").onclick = tttRematch;
  $("#tttLevel").querySelectorAll("button").forEach((b) => (b.onclick = () => { games.cpuLevel = b.dataset.level; renderTtt(); }));
  // crazy 8s
  $("#c8Close").onclick = closeC8;
  $("#c8Backdrop").onclick = closeC8;
  $("#c8Accept").onclick = () => c8RespondUi(true);
  $("#c8Decline").onclick = () => c8RespondUi(false);
  $("#c8Pass").onclick = c8DrawUi;
  $("#c8Quit").onclick = c8QuitUi;
  $("#c8Rematch").onclick = c8Rematch;
  $("#c8Level").querySelectorAll("button").forEach((b) => (b.onclick = () => { games.cpuLevel = b.dataset.level; renderC8(); }));
  $("#chatsClose").onclick = () => closeSheet("chats");
  $("#chatsBackdrop").onclick = () => closeSheet("chats");
  $("#chatBack").onclick = () => { chat.peer = null; $("#chatList").hidden = false; $("#chatThread").hidden = true; renderThreadList(); };
  $("#msgSend").onclick = () => sendChat();
  $("#msgInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } });
  $("#msgInput").addEventListener("input", sendTyping);
  $("#msgPhoto").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    try { sendChat(await compressImage(f)); } catch (err) { toast(err.message); }
  });
  $("#bgMode").querySelectorAll("button").forEach((b) => (b.onclick = () => setBgMode(b.dataset.mode)));
  $("#bgFile").addEventListener("change", (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; onBgFile(f); });
  $("#bgClear").onclick = () => setBackground(null);
  $("#linkInput").addEventListener("input", onLinkInput);
  $("#linkInput").addEventListener("paste", () => setTimeout(onLinkInput, 0));
  $("#sOpen").onclick = () => { const id = sel?.id; deselect(); if (id) openDetail(id); };
  $("#sEdit").onclick = () => { const id = sel?.id; if (id) openEdit(id); };
  $("#sRotL").onclick = () => selRotate(-15);
  $("#sRotR").onclick = () => selRotate(15);
  $("#sFlipX").onclick = () => selFlip("x");
  $("#sFlipY").onclick = () => selFlip("y");
  $("#sReset").onclick = selReset;
  $("#sDelete").onclick = selDeleteStroke;
  $("#sDone").onclick = deselect;
  $("#eSave").onclick = saveEdit;
  $("#eCancel").onclick = () => closeSheet("edit");
  $("#editBackdrop").onclick = () => closeSheet("edit");
  $("#ePhoto").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try { editPhoto = await compressImage(f); $("#ePhotoName").textContent = "New photo ready ✓"; } catch (err) { toast(err.message); }
  });
  $("#peopleClose").onclick = closePeople;
  $("#peopleBackdrop").onclick = closePeople;
  $("#peopleInvite").onclick = shareCode;
  // voice chat
  $("#voiceJoinBtn").onclick = () => (voice.on ? leaveVoice() : joinVoice());
  $("#voiceMute").onclick = toggleVoiceMute;
  $("#voiceLeave").onclick = leaveVoice;
  // live location
  $("#toolLoc").onclick = openLoc;
  $("#locClose").onclick = closeLoc;
  $("#locBackdrop").onclick = closeLoc;
  $("#locSwitch").onclick = toggleGeo;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && pollTimer) { const p = ls.get(PENDING); if (p) startPolling(p.nonce); }
    if (document.visibilityState === "visible") onResume(true);
    if (document.visibilityState === "hidden") { hiddenAt = Date.now(); markSeen(); live?.track({ visible: false }); sendCursor(null); if (state.board) api.touchSeen(state.board.id); }
    else live?.track({ visible: true });
  });
  // iPhone home-screen apps don't always fire visibilitychange when reopened; these catch the rest
  window.addEventListener("pageshow", () => onResume());
  window.addEventListener("focus", () => onResume());
  window.addEventListener("online", () => { hiddenAt = hiddenAt || 1; realtimeDown = false; updateConn(); onResume(true); flushOutbox(); });
  window.addEventListener("offline", () => updateConn());
  window.addEventListener("pagehide", () => { hiddenAt = Date.now(); markSeen(); });
  // undo / redo
  $("#histUndo").onclick = doUndo;
  $("#histRedo").onclick = doRedo;
  window.addEventListener("keydown", (e) => {
    if (!state.board || $("#boardScreen").hidden) return;
    if (e.target.matches && e.target.matches("input, textarea, [contenteditable]")) return;
    const z = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";
    if (z && e.shiftKey) { e.preventDefault(); doRedo(); }
    else if (z) { e.preventDefault(); doUndo(); }
  });
}

boot();
