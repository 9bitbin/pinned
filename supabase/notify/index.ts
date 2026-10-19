// @ts-nocheck
// Stuck on You: "notify" edge function
// Sends "New note from <name>" to the other person's phone(s) using Web Push.
// No npm packages: encryption (RFC 8291) and VAPID (RFC 8292) use built-in WebCrypto.
//
// Secrets needed (Supabase > Edge Functions > Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. mailto:you@example.com)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

const enc = new TextEncoder();

export function b64uToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64u(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, len * 8);
  return new Uint8Array(bits);
}

// RFC 8291 aes128gcm payload encryption
export async function encryptPayload(p256dh: string, authSecretB64u: string, plaintext: Uint8Array) {
  const uaPublic = b64uToBytes(p256dh);
  const authSecret = b64uToBytes(authSecretB64u);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, concat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, concat(plaintext, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // record size 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ct);
}

// RFC 8292 VAPID JWT (ES256)
export async function vapidAuth(endpoint: string, publicKey: string, privateKey: string, subject: string) {
  const pub = b64uToBytes(publicKey);
  const jwk = {
    kty: "EC", crv: "P-256", ext: true,
    x: bytesToB64u(pub.slice(1, 33)), y: bytesToB64u(pub.slice(33, 65)), d: privateKey,
  };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const header = bytesToB64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = bytesToB64u(enc.encode(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject,
  })));
  const unsigned = `${header}.${claims}`;
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(unsigned)));
  return `vapid t=${unsigned}.${bytesToB64u(sig)}, k=${publicKey}`;
}

export async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: unknown,
  vapid: { publicKey: string; privateKey: string; subject: string },
) {
  const body = await encryptPayload(sub.p256dh, sub.auth, enc.encode(JSON.stringify(payload)));
  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidAuth(sub.endpoint, vapid.publicKey, vapid.privateKey, vapid.subject),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      Urgency: "high",
    },
    body,
  });
}

// ---------------- HTTP handler ----------------

// CORS: echo back whatever headers the browser asks to send, so newer supabase-js versions aren't blocked
let cors: Record<string, string> = {};
const setCors = (req: Request) => {
  cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": req.headers.get("Access-Control-Request-Headers") ??
      "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

if (typeof Deno !== "undefined" && Deno.serve) {
  const URL_ = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const vapid = {
    publicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
    privateKey: Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
    // Apple's push service rejects the request (403 BadJwtToken) unless this is a clean mailto: or https: value
    subject: (() => {
      let v = (Deno.env.get("VAPID_SUBJECT") ?? "").replace(/\s+/g, "").replace(/^["']|["']$/g, "");
      if (!v) return "mailto:stuckonyou.app@gmail.com";
      if (!/^(mailto:|https:\/\/)/i.test(v)) v = "mailto:" + v;
      return v;
    })(),
  };
  const admin = (path: string, init: RequestInit = {}) =>
    fetch(`${URL_}${path}`, {
      ...init,
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    });

  Deno.serve(async (req) => {
    setCors(req);
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method === "GET") return json({ ok: true, function: "notify", vapidSet: !!(vapid.publicKey && vapid.privateKey) });
    try {
      if (!vapid.publicKey || !vapid.privateKey) return json({ error: "VAPID secrets missing" }, 500);

      // Who is calling?
      const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
      const ures = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: `Bearer ${token}` } });
      if (!ures.ok) return json({ error: "unauthorized" }, 401);
      const user = await ures.json();

      const { board_id, test } = await req.json();
      if (!board_id) return json({ error: "board_id required" }, 400);

      const members: { user_id: string }[] =
        await (await admin(`/rest/v1/board_members?board_id=eq.${encodeURIComponent(board_id)}&select=user_id`)).json();
      if (!members.some((m) => m.user_id === user.id)) return json({ error: "not a member" }, 403);
      // test mode sends to the caller's own phone(s), so one person can check the whole chain
      const others = test ? [user.id] : members.filter((m) => m.user_id !== user.id).map((m) => m.user_id);
      if (!others.length) return json({ sent: 0, devices: 0, note: "nobody else on the board yet" });

      const [me] = await (await admin(`/rest/v1/profiles?id=eq.${user.id}&select=name`)).json();
      const subs: { endpoint: string; p256dh: string; auth: string }[] =
        await (await admin(`/rest/v1/push_subs?user_id=in.(${others.join(",")})&select=endpoint,p256dh,auth`)).json();

      const payload = test
        ? { title: "Stuck on You", body: "Test notification: it works ✅", url: "./" }
        : { title: "Stuck on You", body: `New note from ${me?.name ?? "your person"}`, url: "./" };
      let sent = 0;
      const failures: string[] = [];
      await Promise.all(subs.map(async (s) => {
        try {
          const r = await sendPush(s, payload, vapid);
          if (r.status === 404 || r.status === 410) {
            await admin(`/rest/v1/push_subs?endpoint=eq.${encodeURIComponent(s.endpoint)}`, { method: "DELETE" });
            failures.push(`${r.status} expired subscription (removed)`);
          } else if (r.ok) sent++;
          else { const t = await r.text(); console.log("push failed", r.status, t); failures.push(`${r.status} ${t.slice(0, 120)}`); }
        } catch (e) { console.log("push error", e); failures.push(String(e)); }
      }));
      return json({ sent, devices: subs.length, failures });
    } catch (e) {
      console.log(e);
      return json({ error: String(e) }, 500);
    }
  });
}
