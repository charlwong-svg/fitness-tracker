# ChitTrack

A food, exercise and body-stats tracker with a daily calorie target calculator
and progress charts. Data is cached in your browser's `localStorage` for
instant loading, and — if you set up Firebase — synced across your devices
via your own Firebase project. If you skip the Firebase setup, the app still
works fully offline using `localStorage` only.

## Setting up Firebase (for cross-device sync)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and create a project (or use an existing one).
2. **Add a web app**: project ⚙️ → Project settings → General → "Your apps" →
   click the `</>` icon → give it a nickname → it'll show you a
   `firebaseConfig` object. Copy those values into `src/firebaseConfig.js`
   in this project, replacing the placeholders.
3. **Enable Authentication**: in the console, go to Build → Authentication →
   Get started → Sign-in method → enable **Email/Password**.
4. **Enable Firestore**: Build → Firestore Database → Create database →
   start in production mode, pick a region close to you.
5. **Apply the security rules**: in Firestore → Rules tab, paste in the
   contents of `firestore.rules` from this project (it restricts every user
   to reading/writing only their own data) and click Publish.
   - If you have the Firebase CLI installed, you can instead run:
     ```bash
     firebase deploy --only firestore:rules
     ```
6. Rebuild and redeploy the site (see below). Open it on your phone and
   laptop, sign in with the same email on both, and your log will sync.

If you'd rather not set this up right now, just tap **"Continue without an
account"** on first load — everything works locally, and you can come back
and sign in later from the **Me** tab.

## Setting up automatic step tracking (Google Fit)

Browsers can't read a phone's step sensor directly or sync silently in the
background, so this works by pulling your recent step history from Google
Fit — which *does* track continuously in the background using your phone's
sensors — every time you open the app.

**On your phone:** install the free **Google Fit** app (Play Store), open
it once, and grant it Activity Recognition / motion permission. It'll start
logging steps in the background automatically, independent of any other
health app your phone came with.

**In Google Cloud (free):**

1. Go to [console.cloud.google.com](https://console.cloud.google.com),
   create or pick a project.
2. APIs & Services → Library → search **Fitness API** → Enable.
3. APIs & Services → OAuth consent screen → set it up. "External" is fine
   for personal use — it can stay in "Testing" mode, just add your own
   Google account under **Test users**. Add the scope
   `https://www.googleapis.com/auth/fitness.activity.read`.
4. APIs & Services → Credentials → Create credentials → **OAuth client ID**
   → Application type **Web application**. Under "Authorized JavaScript
   origins" add the URL(s) you'll load the app from, e.g.
   `https://your-site.netlify.app` and `http://localhost:5173` for local
   testing. No redirect URI is needed.
5. Copy the generated Client ID into `src/googleFitConfig.js`.
6. Rebuild and redeploy. In the app's **Me** tab, tap **Connect Google
   Fit** and sign in with the same Google account Fit is tracking on your
   phone.

Once connected, steps for the last 30 days sync automatically whenever you
open the app or switch back to its tab. You can also just log steps
manually from the Home tab any time — useful if you'd rather skip the
Google Fit setup, or on a day it doesn't catch everything.

**Note for Honor/Huawei-origin phones:** some China-market models ship
without Google Play Services, in which case Google Fit won't be available
and you'd be limited to manual step entry. Most global Honor models sold
outside mainland China do include it.

## Deploy to Netlify — easiest way (drag & drop, no account setup needed on your machine)

1. Install dependencies and build the site locally:
   ```bash
   npm install
   npm run build
   ```
   This creates a `dist` folder containing the finished static site.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the `dist` folder onto the page. Netlify will publish it instantly
   and give you a live URL.

## Deploy to Netlify — via Git (recommended if you'll keep editing it)

1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build settings are already set via `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy**. Netlify will rebuild automatically on every push.

## Deploy to Netlify — via CLI

```bash
npm install
npm run build
npx netlify-cli deploy --prod --dir=dist
```

## Local development

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Notes

- **Signed in**: data (food log, exercise log, body stats, profile) is
  stored in Firestore under your account, and mirrored to `localStorage`
  as an instant-load cache. Editing on one device syncs to your other
  signed-in devices within about a second.
- **Not signed in / Firebase not configured**: everything lives only in
  `localStorage` on that specific browser/device — no sync, no server.
- The `src/firebaseConfig.js` values are not secret and are fine to ship in
  your deployed site; access is controlled entirely by the Firestore
  security rules in `firestore.rules`, not by hiding the config.
- **Steps**: auto-synced from Google Fit if connected (see setup above), or
  logged manually from the Home tab. Stored and synced the same way as your
  other logs.
- Add this site to your phone's home screen (Safari/Chrome → Share/Menu →
  "Add to Home Screen") for an app-like icon and full-screen feel.
