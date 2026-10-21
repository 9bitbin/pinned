// Memory Race rules. Pure functions, so they can be tested in node (tests/games.test.js).
export const SYMBOLS = ['🍓', '🌙', '⭐', '🌈', '🍀', '🎈', '🐸', '🌸', '🚀', '🍉', '🎲', '💎'];

// shuffled deck with `pairs` matching pairs (2 * pairs cards)
export function makeDeck(pairs, rng = Math.random) {
  const pick = SYMBOLS.slice(0, pairs);
  const deck = [...pick, ...pick].map((s, i) => ({ id: i, s, up: false, gone: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Lower moves and time give a higher score. 1200 is the best possible.
export function scoreFor(moves, seconds) {
  return Math.max(0, Math.round(1200 - moves * 25 - seconds * 3));
}
