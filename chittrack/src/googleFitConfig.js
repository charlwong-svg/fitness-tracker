// Fill this in to enable automatic step syncing from Google Fit.
//
// How to get it:
// 1. Go to console.cloud.google.com, create (or pick) a project.
// 2. APIs & Services → Library → search "Fitness API" → Enable.
// 3. APIs & Services → OAuth consent screen → set it up (External is fine
//    for personal use; add your own Google account under "Test users" if
//    it stays in Testing mode — that's fine, no need to publish it).
//    Add the scope: https://www.googleapis.com/auth/fitness.activity.read
// 4. APIs & Services → Credentials → Create credentials → OAuth client ID
//    → Application type "Web application".
//    Under "Authorized JavaScript origins" add the URL(s) you'll load this
//    app from, e.g. https://your-site.netlify.app and
//    http://localhost:5173 for local testing. No redirect URI is needed.
// 5. Copy the generated Client ID below.

export const googleFitClientId = 573489954968-cei217i40eq3qo9akhdq0qqr2krogobg.apps.googleusercontent.com;
