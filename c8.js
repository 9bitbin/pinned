// Crazy 8s rules engine. Pure functions, no DOM, so they can be tested in node (tests/c8.test.js).
// Used by demo mode and the vs-computer AI. The real server runs the same rules in SQL (supabase/upgrade-v8.sql).
// A game object: {deck,hand_x,hand_o,discard,top,suit,
// turn,status,winner,x_count,o_count,draw_count,last_note}.
export const C8 = {
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
