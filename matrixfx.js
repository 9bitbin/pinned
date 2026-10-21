// Matrix flappy birds: a board tool. Press the tool once and a flock of code-birds flies across the
// board while code rain spreads out from the button and fades away by itself. Press the tool again
// while they fly and they explode into code. Timing and physics helpers are exported for tests.

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z:.=*+-<>|";
const GREEN = "#00ff41";
const FONT = "13px 'Courier New', Courier, monospace";
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
const rand = (a, b) => a + Math.random() * (b - a);

export const TIMING = { flyMs: 6500, fadeMs: 1800, explodeMs: 1400 };

// How visible the birds and rain are, 0 to 1. Full while flying, then fades out at the end.
export function flyAlpha(elapsed, t = TIMING) {
  if (elapsed <= t.flyMs) return 1;
  return Math.max(0, 1 - (elapsed - t.flyMs) / t.fadeMs);
}
export function isFinished(elapsed, t = TIMING) { return elapsed >= t.flyMs + t.fadeMs; }

// Moves one bird: gravity, a flap hop now and then with a sideways kick, bounce off the floor,
// and wrap around the left and right edges.
export function stepBird(b, dt, width, height) {
  b.vy += 900 * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.t += dt;
  b.flap -= dt;
  if (b.flap <= 0) {
    b.vy = -rand(260, 380);
    b.vx = rand(-160, 160);
    b.flap = rand(0.5, 1.2);
  }
  const floor = height - 90;
  if (b.y > floor) { b.y = floor; b.vy = -Math.abs(b.vy) * 0.5; }
  if (b.y < 40) { b.y = 40; b.vy = Math.abs(b.vy) * 0.3; }
  if (b.x < -40) b.x = width + 40;
  if (b.x > width + 40) b.x = -40;
  return b;
}

export function makeBird(origin) {
  return {
    x: origin.x + rand(-30, 30), y: origin.y + rand(-30, 30),
    vx: rand(-120, 120), vy: rand(-300, -180),
    flap: rand(0.2, 0.9), t: 0, size: rand(13, 17), wob: rand(0, 6.28),
  };
}

// Code rain: one column every 14 px. Each column starts when the spreading wave reaches it.
export function makeRain(width, height, origin) {
  const cols = [];
  for (let x = 0; x < width; x += 14) {
    const dist = Math.hypot(x - origin.x, 0);
    cols.push({
      x, delay: dist / 520, y: -rand(0, height * 0.4),
      speed: rand(90, 210), len: 6 + ((Math.random() * 14) | 0),
      chars: Array.from({ length: 24 }, glyph),
    });
  }
  return cols;
}

export function makeParticle(x, y) {
  const a = rand(0, Math.PI * 2), s = rand(120, 420);
  return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, life: rand(0.8, 1.3), max: 1.3, ch: glyph() };
}
export function stepParticle(p, dt) {
  p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
  return p;
}

// Creates the effect on a full-screen canvas. Call release(x, y) to launch, explode() to blow up,
// or toggle(x, y) for the toolbar button (launch if idle, explode if flying).
export function createMatrixFx(canvas) {
  const ctx = canvas.getContext("2d");
  let phase = "idle";          // idle | flying | explode
  let t0 = 0, last = 0, raf = 0;
  let W = 0, H = 0, dpr = 1;
  let origin = { x: 0, y: 0 };
  let birds = [], rain = [], parts = [];

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function release(x, y) {
    if (phase !== "idle") return;
    size();
    origin = { x, y };
    t0 = last = performance.now();
    birds = Array.from({ length: 7 }, () => makeBird(origin));
    rain = makeRain(W, H, origin);
    phase = "flying";
    raf = requestAnimationFrame(frame);
  }

  function explode() {
    if (phase !== "flying") return;
    phase = "explode";
    t0 = performance.now();
    for (const b of birds) for (let i = 0; i < 26; i++) parts.push(makeParticle(b.x, b.y));
    birds = [];
  }

  function toggle(x, y) { if (phase === "flying") explode(); else if (phase === "idle") release(x, y); }
  function active() { return phase !== "idle"; }

  function finish() {
    phase = "idle"; birds = []; rain = []; parts = [];
    ctx.clearRect(0, 0, W, H);
  }

  function drawRain(alpha, elapsed, dt) {
    ctx.save();
    ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillStyle = GREEN; ctx.shadowColor = GREEN; ctx.shadowBlur = 6;
    for (const c of rain) {
      const since = elapsed / 1000 - c.delay;
      if (since < 0) continue;
      c.y += c.speed * dt;
      const head = Math.floor(c.y / 14);
      for (let k = 0; k < c.len; k++) {
        const row = head - k;
        if (row < 0 || row * 14 > H) continue;
        ctx.globalAlpha = alpha * (1 - k / c.len) * 0.6;
        ctx.fillText(c.chars[((row % 24) + 24) % 24], c.x + 7, row * 14);
      }
      if (Math.random() < 0.05) c.chars[(Math.random() * 24) | 0] = glyph();
      if (c.y - c.len * 14 > H) c.y = -rand(0, 120);
    }
    ctx.restore();
  }

  function drawBird(b, alpha) {
    const s = b.size, tilt = Math.max(-0.5, Math.min(0.9, b.vy / 700)) + Math.sin(b.t * 6 + b.wob) * 0.15;
    ctx.save();
    ctx.globalAlpha = alpha;
    // code trail behind the bird
    ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = GREEN;
    for (let k = 1; k <= 4; k++) {
      ctx.globalAlpha = alpha * (0.5 - k * 0.1);
      ctx.fillText(glyph(), b.x - k * 12 * Math.sign(b.vx || 1), b.y + Math.sin(b.t * 9 + k) * 3);
    }
    ctx.globalAlpha = alpha;
    ctx.translate(b.x, b.y); ctx.rotate(tilt);
    ctx.shadowColor = GREEN; ctx.shadowBlur = 12;
    ctx.fillStyle = "#001a0a"; ctx.strokeStyle = GREEN; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, s + 3, s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // flapping wing
    const flap = Math.sin(b.t * 18) * 4;
    ctx.fillStyle = "#00a83a";
    ctx.beginPath(); ctx.ellipse(-6, 2 + flap, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // eye and beak
    ctx.shadowBlur = 0; ctx.fillStyle = GREEN;
    ctx.beginPath(); ctx.arc(7, -4, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f05a28";
    ctx.beginPath(); ctx.moveTo(s + 3, 0); ctx.lineTo(s + 11, 3); ctx.lineTo(s + 3, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = GREEN; ctx.shadowColor = GREEN; ctx.shadowBlur = 8;
    ctx.fillText(p.ch, p.x, p.y);
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const elapsed = now - t0;
    ctx.clearRect(0, 0, W, H);

    if (phase === "flying") {
      if (isFinished(elapsed)) return finish();
      const a = flyAlpha(elapsed);
      drawRain(a, elapsed, dt);
      for (const b of birds) { stepBird(b, dt, W, H); drawBird(b, a); }
    } else if (phase === "explode") {
      for (const p of parts) stepParticle(p, dt);
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) drawParticle(p);
      if (!parts.length || elapsed > TIMING.explodeMs * 3) return finish();
    }
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => { if (phase !== "idle") size(); });
  return { release, explode, toggle, active };
}
