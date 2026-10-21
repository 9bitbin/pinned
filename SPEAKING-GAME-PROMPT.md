# Build prompt — "Polyglot" multilanguage speaking contest (Pinned game)

Hand this whole file back to me (or any builder) to build the game. It's written to
drop into Pinned's existing Games system, and it calls out the one hard constraint up
front so we design around it instead of into it.

---

## The one thing to know first (speech recognition support)

The game listens to you speak and scores how close you got. That relies on the browser's
**Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)**.

- **Android Chrome:** works well, supports dozens of languages, free.
- **Desktop Chrome/Edge:** works well.
- **iPhone Safari / any iOS browser:** unreliable. iOS has added partial support, but it
  often fails to start, needs Siri dictation enabled, stops after a second, or returns
  nothing — and every browser on iOS uses Safari's engine underneath, so a different
  browser won't fix it.

Because one of the two main phones here is an iPhone, the game **must not assume the mic
scoring works.** Build it so it:
1. Detects support on load.
2. If speech recognition is unavailable, falls back to a **"self-judge" mode** (you tap
   "I said it" / rate yourself, or type what you said) so the iPhone can still play.
3. Never makes the mic the only path to a score.

A separate, more reliable option (costs money, needs a backend) is noted at the end.

---

## What the game is

A fast, friendly "say it right, say it quick" contest across languages.

- A **prompt** appears: a word or short phrase in a chosen target language, shown with its
  script, a romanization, and the English meaning (e.g. Mandarin `你好` · *nǐ hǎo* ·
  "hello").
- You tap **🎤 and speak it.** The app shows what it heard and gives a **score** from how
  close your speech was to the target, plus a small **speed bonus**.
- Several rounds (default 5). Scores add up. Highest total wins.

Fits Pinned's existing pattern: **Solo** (practice, your score hits the board's
scoreboard) and a turn-based or live **contest** between people, same prompts for everyone.

---

## Languages (first set)

Include these, each with its `SpeechRecognition` language tag:
- English — `en-US`
- Spanish — `es-ES`
- Mandarin Chinese — `zh-CN`  *(Himal is learning this — make it a first-class option)*
- Nepali — `ne-NP`  *(recognition support is thin; if it fails, self-judge mode covers it)*
- French — `fr-FR`
- Hindi — `hi-IN`

Each language has a small **phrase bank** (20–40 entries) of common words/phrases, each
entry = `{ script, romanization, english, difficulty }`. Start easy (greetings, numbers,
food) and climb. Keep the bank in one JSON file per language so it's easy to extend.

---

## How a round works

1. Show the prompt (script + romanization + English). A 3-2-1 "get ready" tick.
2. Player taps 🎤. Start `SpeechRecognition` with `lang` = the target tag,
   `interimResults = true`, `maxAlternatives = 3`.
3. Player speaks. Show the live/interim transcript so it feels responsive.
4. On result (or after a ~6s timeout), stop and **score**:
   - **Accuracy (0–100):** compare the best recognized alternative to the target, after
     normalizing (lowercase, strip punctuation/tone marks for the compare, trim spaces).
     Use a character-level similarity (Levenshtein ratio) for logographic languages
     (Mandarin) and a word-level token-overlap for the rest. Take the best of the 3
     alternatives.
   - **Speed bonus (0–30):** faster correct answers score more; near-zero if accuracy is low.
   - **Round score = accuracy + speed bonus.**
5. Show: what it heard, the score, and a ✅/➖/❌ verdict. "Next" to continue.

**Self-judge fallback (no mic / iOS):** instead of scoring speech, show the phrase, let the
player practice, then they tap one of **Nailed it (100) / Close (60) / Missed (20)** — on
the honor system — or type what they said and score that against the target. Clearly label
the game "practice / honor mode" when running this way so scores aren't compared as if
they were mic-verified (optionally tag those scores so the scoreboard can show them apart).

---

## Modes (match Pinned's existing Games)

- **Solo:** pick a language + difficulty, play 5 rounds, total score saved to the board's
  scoreboard (game id `speak`). Personal best + "beat your score" like the other games.
- **Contest (turn-based, like tic-tac-toe / Crazy 8s):** challenger picks language, length
  and the seed so **both players get the same prompts.** Each plays their 5 rounds whenever
  they want; when both are done, compare totals, declare a winner, keep a win record.
  (Turn-based beats live here because speaking out loud at the same time is awkward and the
  mic needs quiet.)
- Optionally a **live race** later, but turn-based first.

---

## Fitting Pinned's plumbing

- **Front end:** a new `games/polyglot.html` using the existing `games/bridge.js`
  (`window.PB`): `embed`, `mode`, `seed`, `name`, `color`. Use `PB.rng(seed)` to pick the
  same prompts for everyone. Report the final total with `PB.send("over", { score })`.
  For a turn-based contest, store each player's run the way Crazy 8s stores state (a
  `speak_games` table + a per-player results row), or simplest: store each finished run as
  a `game_scores` row tagged with a shared `round_id`, and the card compares the two totals
  for that round.
- **Scoreboard / notify:** add `speak` to the `game_scores` game CHECK (a `upgrade-v9.sql`)
  and to the notify function's `GAMES` map, plus a mutable `speak` notify type for "your
  turn / they finished / you were beaten."
- **Mute:** add a "Speaking contest" mute like the others.
- **Permissions:** request mic only when the player taps 🎤 (not on load). Handle "denied"
  with a clear message and the self-judge fallback. Stop recognition on background/visibility
  change so it doesn't hang.
- **No external calls** in the free version — everything runs in the browser.

---

## Scoring detail (so it feels fair)

- Normalize both strings: lowercase; strip punctuation; for Mandarin compare on characters
  and **ignore tone marks in the romanization path** (recognition rarely returns tones).
- `accuracy = round(100 * similarity)`, where similarity is
  `1 - levenshtein(a,b) / max(len(a), len(b))` (char-level) or
  `overlap(tokens_a, tokens_b)` (word-level), whichever fits the language.
- Treat ≥85 as ✅, 60–84 as ➖ "close", <60 as ❌.
- Speed bonus only applies when accuracy ≥ 60, scaled by how fast within the time window.
- Cap a round at 130 points. Clamp everything; never send a negative or absurd score (same
  discipline as Type Race's WPM cap).

---

## Nice-to-haves (after v1)

- A "listen" button that speaks the target with `SpeechSynthesis` (text-to-speech, which
  *is* well supported on iOS) so you can hear it before you try — this makes the iPhone a
  great **practice** device even when its mic scoring is weak.
- Streak bonuses, per-language best, a "daily phrase."
- Difficulty that adapts to your accuracy.

---

## The paid/robust alternative (only if the free mic path isn't good enough on iPhone)

If reliable iPhone scoring becomes a must-have, move scoring server-side: record a short
audio clip in the browser (works on iOS), send it to a speech service that returns a
transcript or a pronunciation score (e.g. a cloud speech-to-text, or a dedicated
pronunciation-assessment API). This needs a backend endpoint and has per-use cost, so it's
a deliberate upgrade, not the default. Flag cost and privacy (audio leaving the device)
before taking it.
