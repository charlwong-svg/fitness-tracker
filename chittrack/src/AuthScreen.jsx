import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Cloud, CloudOff } from "lucide-react";
import { auth, firebaseEnabled } from "./firebase.js";

const C = {
  bg: "#F2F5F1", surface: "#FFFFFF", ink: "#1B2B27", muted: "#6B7D77",
  jade: "#1F6F5C", jadeTint: "#E4EFEB", chili: "#C2482B", line: "#DEE5E0",
};
const F = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
};

export default function AuthScreen({ onSkip }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) { setError("Enter your email above first."); return; }
    setError(""); setInfo(""); setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Password reset email sent — check your inbox.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <span style={styles.brand}>ChitTrack</span>
          <span style={styles.sub}>your daily food chit</span>
        </div>

        {!firebaseEnabled ? (
          <div style={styles.warnBox}>
            <CloudOff size={16} color={C.chili} />
            <span style={{ fontSize: 12.5, color: C.ink }}>
              Firebase isn't configured yet — fill in <code>src/firebaseConfig.js</code> with
              your project's config to enable sign-in and cross-device sync.
            </span>
          </div>
        ) : (
          <div style={styles.introBox}>
            <Cloud size={16} color={C.jade} />
            <span style={{ fontSize: 12.5, color: C.ink }}>
              Sign in to sync your log across your phone, tablet and laptop.
            </span>
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input} type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            disabled={!firebaseEnabled}
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input} type="password" required minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            disabled={!firebaseEnabled}
          />

          {error && <div style={styles.errorText}>{error}</div>}
          {info && <div style={styles.infoText}>{info}</div>}

          <button type="submit" style={styles.primaryBtn} disabled={busy || !firebaseEnabled}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={styles.rowBetween}>
          <button
            style={styles.linkBtn}
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}
          >
            {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
          </button>
          {mode === "signin" && firebaseEnabled && (
            <button style={styles.linkBtn} onClick={reset}>Forgot password?</button>
          )}
        </div>

        <div style={styles.divider}><span>or</span></div>

        <button style={styles.ghostBtn} onClick={onSkip}>
          Continue without an account
        </button>
        <div style={{ fontSize: 11.5, color: C.muted, textAlign: "center", lineHeight: 1.5 }}>
          Your data stays on this device only, and won't sync anywhere else.
        </div>
      </div>
    </div>
  );
}

function friendlyError(err) {
  const code = err?.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Incorrect email or password.";
  if (code.includes("user-not-found")) return "No account found with that email.";
  if (code.includes("email-already-in-use")) return "An account with that email already exists — try signing in instead.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "That doesn't look like a valid email address.";
  if (code.includes("network-request-failed")) return "Network error — check your connection and try again.";
  return "Something went wrong. Please try again.";
}

const styles = {
  wrap: { fontFamily: F.body, background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: 22, width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 10 },
  brandRow: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 },
  brand: { fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.ink },
  sub: { fontSize: 12, color: C.muted, fontStyle: "italic" },
  introBox: { background: C.jadeTint, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 },
  warnBox: { background: "#FBEAE5", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 },
  label: { fontSize: 11.5, fontWeight: 700, color: C.muted },
  input: { border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", color: C.ink, fontFamily: F.body },
  primaryBtn: { background: C.jade, color: "#fff", border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  ghostBtn: { background: "none", border: `1px solid ${C.line}`, color: C.ink, borderRadius: 10, padding: "11px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  linkBtn: { background: "none", border: "none", color: C.jade, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 2px" },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  errorText: { fontSize: 12, color: C.chili },
  infoText: { fontSize: 12, color: C.jade },
  divider: { display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 11, margin: "2px 0" },
};
