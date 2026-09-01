import { googleFitClientId } from "./googleFitConfig.js";

export const googleFitEnabled = googleFitClientId !== "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com";

const SCOPE = "https://www.googleapis.com/auth/fitness.activity.read";
const TOKEN_STORAGE_KEY = "chittrack:googleFitToken";

let tokenClient = null;
let gisLoadPromise = null;

// Loads Google Identity Services script (already tagged in index.html;
// this just waits for it to be ready).
function waitForGis() {
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    const check = () => {
      if (window.google?.accounts?.oauth2) resolve();
      else setTimeout(check, 100);
    };
    check();
    setTimeout(() => reject(new Error("Google Identity Services failed to load")), 10000);
  });
  return gisLoadPromise;
}

function saveToken(tokenInfo) {
  const record = { accessToken: tokenInfo.access_token, expiresAt: Date.now() + (tokenInfo.expires_in || 3600) * 1000 };
  try { window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(record)); } catch {}
  return record;
}

export function getStoredToken() {
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (record.expiresAt < Date.now() + 30000) return null; // treat as expired
    return record;
  } catch {
    return null;
  }
}

export function clearStoredToken() {
  try { window.localStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
}

// Requests an access token. `interactive: false` tries a silent refresh
// (works if the user already granted access and is signed into Google in
// this browser, via a hidden background request to Google — no UI shown);
// `interactive: true` shows the consent popup.
export async function requestGoogleFitToken({ interactive } = { interactive: true }) {
  await waitForGis();
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleFitClientId,
        scope: SCOPE,
        callback: () => {}, // overridden per-call below
      });
    }
    tokenClient.callback = (resp) => {
      if (resp.error) { reject(new Error(resp.error)); return; }
      resolve(saveToken(resp));
    };
    tokenClient.error_callback = (err) => reject(err);
    // "none" explicitly guarantees no popup/UI for a silent refresh
    // attempt (an empty string leaves the choice up to Google, which is
    // less predictable); "consent" always shows the picker/approval screen.
    tokenClient.requestAccessToken({ prompt: interactive ? "consent" : "none" });
  });
}

// Silent refresh can fail for transient reasons (a slow network blip while
// the hidden background request runs, a brief hiccup in the browser's
// session check) as well as for a real reason (session actually gone). We
// retry once before giving up, so a one-off glitch doesn't force a manual
// reconnect.
export async function requestGoogleFitTokenSilentWithRetry() {
  try {
    return await requestGoogleFitToken({ interactive: false });
  } catch (e) {
    await new Promise((r) => setTimeout(r, 1500));
    return await requestGoogleFitToken({ interactive: false });
  }
}

export function revokeGoogleFitToken() {
  const stored = getStoredToken();
  clearStoredToken();
  if (stored?.accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(stored.accessToken, () => {});
  }
}

// Fetches per-day step counts between two Date objects (inclusive of
// startDate's day, exclusive of endDate's day boundary handling is done
// by the caller passing midnight-aligned bounds).
export async function fetchDailySteps(accessToken, startDate, endDate) {
  const body = {
    aggregateBy: [{
      dataTypeName: "com.google.step_count.delta",
      dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
    }],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startDate.getTime(),
    endTimeMillis: endDate.getTime(),
  };

  const res = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Fit API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const results = [];
  for (const bucket of data.bucket || []) {
    // Use local calendar date, not toISOString (UTC) — the bucket boundary
    // is local midnight, so converting to UTC shifts the date backwards
    // for any timezone ahead of UTC (e.g. always one day early for SGT).
    const bd = new Date(Number(bucket.startTimeMillis));
    const dateStr = `${bd.getFullYear()}-${String(bd.getMonth() + 1).padStart(2, "0")}-${String(bd.getDate()).padStart(2, "0")}`;
    let steps = 0;
    for (const dataset of bucket.dataset || []) {
      for (const point of dataset.point || []) {
        for (const val of point.value || []) {
          steps += val.intVal || 0;
        }
      }
    }
    results.push({ date: dateStr, steps });
  }
  return results;
}
