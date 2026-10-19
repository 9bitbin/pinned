# Stuck on You: setup guide

A shared sticky-note board for two phones (iPhone + Android). It installs from the browser to the home screen, so no app store is needed.

Total time: about 30 minutes, once. Everything here is on free plans with **no credit card**.

---

## What's in this folder

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `config.js` | **The only file you edit**: your Supabase keys go here |
| `sw.js`, `manifest.webmanifest`, `icons/` | What makes it installable and lets it get notifications |
| `keys.html` | Makes your notification keys (runs in your browser) |
| `supabase/schema.sql` | Database setup: paste into Supabase once |
| `supabase/notify/index.ts` | The function that sends "New note from ___" |

**Try it first (optional):** put the folder online (Step 5) before touching Supabase. With `config.js` unchanged it runs in **demo mode**: everything works on one device, and opening a second tab with `?as=2` at the end of the address lets you play the other person.

---

## Step 1: Create a Supabase project

1. Go to **supabase.com** and sign up (GitHub sign-in is easiest).
2. **New project**. Name it `stuck-on-you`, set a database password (save it somewhere), pick the region closest to you (East US).
3. Wait about 2 minutes for it to finish.

## Step 2: Set up the database

1. Left sidebar: **SQL Editor** > **New query**.
2. Open `supabase/schema.sql`, copy everything, paste it in, press **Run**.
3. You should see "Success. No rows returned."

## Step 3: Turn on code-based sign-in

The app signs each phone in without email or password. Your pairing code is what links you.

1. Left sidebar: **Authentication** > **Sign In / Providers** (on some dashboards it's under **Settings**).
2. Turn on **Allow anonymous sign-ins** and save.

## Step 4: Notifications

**4a. Make your keys.** Open `keys.html` in a browser (double-click it, or visit it after Step 5 at `.../stuck-on-you/keys.html`). Press **Generate keys** and keep the page open.

**4b. Add the notify function.**
1. Left sidebar: **Edge Functions** > **Deploy a new function** > **Via Editor**.
2. Name it exactly `notify`.
3. Delete the sample code, paste all of `supabase/notify/index.ts`, press **Deploy**.

**4c. Add the secrets.** Edge Functions > **Secrets** (or Project Settings > Edge Functions). Add three:

| Name | Value |
|---|---|
| `VAPID_PUBLIC_KEY` | the public key from keys.html |
| `VAPID_PRIVATE_KEY` | the private key from keys.html |
| `VAPID_SUBJECT` | `mailto:` followed by your email, e.g. `mailto:you@example.com` |

## Step 5: Fill in config.js and put it online

**5a. config.js.** In Supabase: **Project Settings** > **API** (or **API Keys**). Copy:
- **Project URL** → `supabaseUrl`
- **anon public** key (or **publishable** key) → `supabaseAnonKey`
- Your VAPID **public** key from keys.html → `vapidPublicKey`

Never put the private key or the `service_role` / secret key in config.js.

**5b. GitHub Pages.**
1. On github.com (signed in as 9bitbin): **New repository** named `stuck-on-you`, Public, create.
2. **Add file** > **Upload files**, drag in *everything inside this folder* (including the `icons` and `supabase` folders), **Commit**.
3. Repo **Settings** > **Pages** > Source: **Deploy from a branch**, Branch: `main`, folder `/ (root)`, **Save**.
4. After a minute or two, it's live at **https://9bitbin.github.io/stuck-on-you/**

## Step 6: Install on both phones

**iPhone (needs iOS 16.4 or newer):**
1. Open the link in **Safari** (not Chrome; iPhone only allows installing from Safari).
2. Share button > **Add to Home Screen** > Add.
3. Open **Stuck on You from the home screen icon** (notifications only work from the icon, not the Safari tab).
4. Enter your name and color > **Start a new board**. You'll see your 8-character code.
5. Gear icon > Notifications > **Turn on** > Allow.

**Android:**
1. Open the link in **Chrome**.
2. Menu (⋮) > **Add to Home screen** or **Install app**.
3. Open it from the icon, enter name and color, then type the code under **Got a code?** > **Join board**.
4. Gear icon > Notifications > **Turn on** > Allow.

Test it: post a note from one phone while the other is locked.

---

## How it works

- **Board:** one shared board. Long-press a note (about a quarter second) then drag to move it; a quick swipe still scrolls. On a computer, just click and drag.
- **Tap a note** to see it bigger, bring it to the front, or remove it (removes it for both of you).
- **Composer (+):** Note (6 paper colors), Emoji (grid or type any), Photo (shrunk to ~1280px before upload), Draw (8 inks, 3 brush sizes, eraser, undo, clear, paper color).
- **Themes:** each phone picks its own in Settings. Cozy corkboard, Pastel, Dark & minimal, Liminal & dreamy.
- **Privacy:** only the two people on a board can read its notes and pictures (enforced in the database, not just the app). A board holds two people max, so once you're both in, the code stops working for anyone else.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Anonymous sign-ins are off" | Step 3 |
| Notifications say "Add to Home Screen first" on iPhone | Open it from the home-screen icon, not Safari |
| No notification arrives | Check the other phone turned notifications on. Supabase > Edge Functions > notify > **Logs** shows errors. Re-check the three secrets. |
| Android notifications late | Settings > Apps > Chrome (or Stuck on You) > Battery > **Unrestricted** |
| New version not showing | Close the app fully and reopen it twice |
| Lost a phone or reset it | On the other phone: Settings > On this board > **Remove** the old one, then rejoin with the code |
| Supabase says the project is paused | Free projects pause after about a week with no use. Press **Restore** in the dashboard. |

Free-tier limits that matter here: 500 MB database and 1 GB file storage. That's thousands of photos.
