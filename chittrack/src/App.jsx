import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Home, Utensils, Dumbbell, Ruler, TrendingUp, User, Plus, Trash2,
  ChevronLeft, ChevronRight, Search, X, Cloud, CloudOff, RefreshCw, AlertCircle, LogOut,
  Footprints, Link2, Unlink,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase.js";
import { useCloudSync } from "./useCloudSync.js";
import AuthScreen from "./AuthScreen.jsx";
import {
  googleFitEnabled, getStoredToken, requestGoogleFitToken, revokeGoogleFitToken, fetchDailySteps,
} from "./googleFit.js";

/* ---------------------------------------------------------------------- */
/* Static data                                                             */
/* ---------------------------------------------------------------------- */

const FOOD_DB = [
  // Singapore hawker & local
  { id: "sg1", name: "Chicken Rice", cat: "Singapore", serving: "1 plate", kcal: 600 },
  { id: "sg2", name: "Laksa", cat: "Singapore", serving: "1 bowl", kcal: 550 },
  { id: "sg3", name: "Char Kway Teow", cat: "Singapore", serving: "1 plate", kcal: 740 },
  { id: "sg4", name: "Nasi Lemak", cat: "Singapore", serving: "1 packet", kcal: 650 },
  { id: "sg5", name: "Roti Prata (plain)", cat: "Singapore", serving: "1 piece", kcal: 300 },
  { id: "sg6", name: "Mee Goreng", cat: "Singapore", serving: "1 plate", kcal: 600 },
  { id: "sg7", name: "Bak Kut Teh", cat: "Singapore", serving: "1 bowl", kcal: 350 },
  { id: "sg8", name: "Chilli Crab (w/ mantou)", cat: "Singapore", serving: "1 serving", kcal: 700 },
  { id: "sg9", name: "Hokkien Mee", cat: "Singapore", serving: "1 plate", kcal: 600 },
  { id: "sg10", name: "Satay", cat: "Singapore", serving: "5 sticks", kcal: 350 },
  { id: "sg11", name: "Kaya Toast Set (+2 eggs)", cat: "Singapore", serving: "1 set", kcal: 450 },
  { id: "sg12", name: "Wanton Mee", cat: "Singapore", serving: "1 bowl", kcal: 500 },
  { id: "sg13", name: "Fish Head Curry", cat: "Singapore", serving: "1 serving", kcal: 550 },
  { id: "sg14", name: "Rojak", cat: "Singapore", serving: "1 plate", kcal: 400 },
  { id: "sg15", name: "Curry Puff", cat: "Singapore", serving: "1 piece", kcal: 220 },
  { id: "sg16", name: "Popiah", cat: "Singapore", serving: "1 roll", kcal: 180 },
  { id: "sg17", name: "Chwee Kueh", cat: "Singapore", serving: "3 pieces", kcal: 200 },
  { id: "sg18", name: "Fried Carrot Cake", cat: "Singapore", serving: "1 plate", kcal: 500 },
  { id: "sg19", name: "Bee Hoon Goreng", cat: "Singapore", serving: "1 plate", kcal: 450 },
  { id: "sg20", name: "Teh Tarik", cat: "Singapore", serving: "1 cup", kcal: 150 },
  { id: "sg21", name: "Kopi O", cat: "Singapore", serving: "1 cup", kcal: 20 },
  { id: "sg22", name: "Kopi", cat: "Singapore", serving: "1 cup", kcal: 120 },
  { id: "sg23", name: "Milo Dinosaur", cat: "Singapore", serving: "1 cup", kcal: 350 },
  { id: "sg24", name: "Economic Rice (3 dishes)", cat: "Singapore", serving: "1 plate", kcal: 600 },
  { id: "sg25", name: "Chicken Curry Rice", cat: "Singapore", serving: "1 plate", kcal: 650 },
  { id: "sg26", name: "Char Siu Rice", cat: "Singapore", serving: "1 plate", kcal: 550 },
  { id: "sg27", name: "Dim Sum Basket", cat: "Singapore", serving: "3 pieces", kcal: 250 },
  // Breakfast
  { id: "bf1", name: "Froot Loops", cat: "Breakfast", serving: "1 cup (30g)", kcal: 110 },
  { id: "bf2", name: "Goat Milk", cat: "Breakfast", serving: "1 cup (240ml)", kcal: 168 },
  { id: "bf3", name: "Cow Milk (whole)", cat: "Breakfast", serving: "1 cup", kcal: 150 },
  { id: "bf4", name: "Cow Milk (skim)", cat: "Breakfast", serving: "1 cup", kcal: 90 },
  { id: "bf5", name: "Oatmeal (cooked)", cat: "Breakfast", serving: "1 cup", kcal: 150 },
  { id: "bf6", name: "Scrambled Eggs", cat: "Breakfast", serving: "2 eggs", kcal: 180 },
  { id: "bf7", name: "Boiled Egg", cat: "Breakfast", serving: "1 egg", kcal: 78 },
  { id: "bf8", name: "White Toast + Butter", cat: "Breakfast", serving: "2 slices", kcal: 250 },
  { id: "bf9", name: "Wholemeal Toast", cat: "Breakfast", serving: "2 slices", kcal: 180 },
  { id: "bf10", name: "Pancakes (plain)", cat: "Breakfast", serving: "2 pieces", kcal: 340 },
  { id: "bf11", name: "Bacon", cat: "Breakfast", serving: "2 strips", kcal: 90 },
  { id: "bf12", name: "Sausage", cat: "Breakfast", serving: "1 link", kcal: 85 },
  { id: "bf13", name: "Greek Yogurt (plain)", cat: "Breakfast", serving: "1 cup", kcal: 150 },
  { id: "bf14", name: "Banana", cat: "Breakfast", serving: "1 medium", kcal: 105 },
  { id: "bf15", name: "Cornflakes", cat: "Breakfast", serving: "1 cup", kcal: 100 },
  { id: "bf16", name: "Granola", cat: "Breakfast", serving: "1/2 cup", kcal: 300 },
  // Common / general
  { id: "c1", name: "White Rice", cat: "Common", serving: "1 cup cooked", kcal: 205 },
  { id: "c2", name: "Grilled Chicken Breast", cat: "Common", serving: "100g", kcal: 165 },
  { id: "c3", name: "Steamed Broccoli", cat: "Common", serving: "1 cup", kcal: 55 },
  { id: "c4", name: "Apple", cat: "Common", serving: "1 medium", kcal: 95 },
  { id: "c5", name: "Salmon (grilled)", cat: "Common", serving: "100g", kcal: 208 },
  { id: "c6", name: "Protein Shake", cat: "Common", serving: "1 scoop + water", kcal: 130 },
  { id: "c7", name: "Instant Noodles", cat: "Common", serving: "1 pack", kcal: 380 },
  { id: "c8", name: "Salad w/ Dressing", cat: "Common", serving: "1 bowl", kcal: 250 },
];

const EXERCISE_DB = [
  { id: "e1", name: "Walking (moderate)", met: 3.5 },
  { id: "e2", name: "Walking (brisk)", met: 4.3 },
  { id: "e3", name: "Bouldering / Indoor Climbing", met: 8.0 },
  { id: "e4", name: "Swimming (freestyle, moderate)", met: 8.3 },
  { id: "e5", name: "Swimming (freestyle, vigorous)", met: 9.8 },
  { id: "e6", name: "Rollerblading", met: 7.5 },
  { id: "e7", name: "Cycling (leisure, <16km/h)", met: 4.0 },
  { id: "e8", name: "Cycling (moderate, 16-19km/h)", met: 8.0 },
  { id: "e9", name: "Cycling (vigorous, 19-22km/h)", met: 10.0 },
  { id: "e10", name: "Running (8km/h)", met: 8.3 },
  { id: "e11", name: "Running (10km/h)", met: 9.8 },
  { id: "e12", name: "Yoga", met: 2.5 },
  { id: "e13", name: "Weight Training", met: 5.0 },
  { id: "e14", name: "HIIT", met: 8.0 },
  { id: "e15", name: "Basketball", met: 6.5 },
  { id: "e16", name: "Badminton", met: 5.5 },
  { id: "e17", name: "Dancing", met: 4.8 },
];

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary (little/no exercise)", factor: 1.2 },
  { id: "light", label: "Light (1-3 days/week)", factor: 1.375 },
  { id: "moderate", label: "Moderate (3-5 days/week)", factor: 1.55 },
  { id: "active", label: "Active (6-7 days/week)", factor: 1.725 },
  { id: "veryactive", label: "Very active (2x/day or physical job)", factor: 1.9 },
];

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const fmtDateLabel = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(todayStr() + "T00:00:00");
  const diff = Math.round((t - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff === -1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};
const uid = () => Math.random().toString(36).slice(2, 10);

const STORAGE_PREFIX = "chittrack:";

function storeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function storeSet(key, value) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("storage set failed", key, e);
  }
}

/* ---------------------------------------------------------------------- */
/* Root component                                                          */
/* ---------------------------------------------------------------------- */

export default function ChitTrack() {
  const [tab, setTab] = useState("dashboard");

  // undefined = auth state still loading, null = signed out, object = signed in
  const [authUser, setAuthUser] = useState(firebaseEnabled ? undefined : null);
  const [guestMode, setGuestMode] = useState(() => storeGet("guestMode", false));

  useEffect(() => {
    if (!firebaseEnabled) return;
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return unsub;
  }, []);

  const [profile, setProfile] = useState(() => storeGet("profile", {
    name: "", age: "", gender: "female", height: "",
    activity: "moderate", goal: "maintain", rate: 0.5, stepGoal: 8000,
  }));
  const [bodyLogs, setBodyLogs] = useState(() => storeGet("bodyLogs", []));
  const [foodLogs, setFoodLogs] = useState(() => storeGet("foodLogs", []));
  const [exerciseLogs, setExerciseLogs] = useState(() => storeGet("exerciseLogs", []));
  const [customFoods, setCustomFoods] = useState(() => storeGet("customFoods", []));
  const [stepLogs, setStepLogs] = useState(() => storeGet("stepLogs", []));

  useEffect(() => { storeSet("profile", profile); }, [profile]);
  useEffect(() => { storeSet("bodyLogs", bodyLogs); }, [bodyLogs]);
  useEffect(() => { storeSet("foodLogs", foodLogs); }, [foodLogs]);
  useEffect(() => { storeSet("exerciseLogs", exerciseLogs); }, [exerciseLogs]);
  useEffect(() => { storeSet("customFoods", customFoods); }, [customFoods]);
  useEffect(() => { storeSet("stepLogs", stepLogs); }, [stepLogs]);

  const syncStatus = useCloudSync(authUser, {
    profile, bodyLogs, foodLogs, exerciseLogs, customFoods, stepLogs,
    setProfile, setBodyLogs, setFoodLogs, setExerciseLogs, setCustomFoods, setStepLogs,
  });

  // --- Google Fit: connection state + auto-sync ---
  const [gfitConnected, setGfitConnected] = useState(!!getStoredToken());
  const [gfitStatus, setGfitStatus] = useState("idle"); // idle | syncing | error

  const mergeStepLogs = useCallback((fetched) => {
    setStepLogs((prev) => {
      const byDate = new Map(prev.map((s) => [s.date, s]));
      for (const { date, steps } of fetched) {
        byDate.set(date, { date, steps, source: "googlefit" });
      }
      return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    });
  }, []);

  const syncGoogleFit = useCallback(async ({ interactive } = { interactive: false }) => {
    setGfitStatus("syncing");
    try {
      let token = getStoredToken();
      if (!token) token = await requestGoogleFitToken({ interactive });
      const end = new Date(); end.setHours(24, 0, 0, 0);
      const start = new Date(); start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0);
      const fetched = await fetchDailySteps(token.accessToken, start, end);
      mergeStepLogs(fetched);
      setGfitConnected(true);
      setGfitStatus("idle");
    } catch (e) {
      console.error("Google Fit sync failed", e);
      setGfitStatus("error");
      if (!interactive) return; // silent attempt failing is fine, don't alarm the user
    }
  }, [mergeStepLogs]);

  // Auto-sync once on load if already connected, and again whenever the
  // tab regains focus (closest thing to "automatic" a static web app can do).
  useEffect(() => {
    if (!googleFitEnabled || !gfitConnected) return;
    syncGoogleFit({ interactive: false });
    const onFocus = () => syncGoogleFit({ interactive: false });
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gfitConnected]);

  const connectGoogleFit = () => syncGoogleFit({ interactive: true });
  const disconnectGoogleFit = () => {
    revokeGoogleFitToken();
    setGfitConnected(false);
  };

  const handleSkip = () => { setGuestMode(true); storeSet("guestMode", true); };
  const handleSignOut = async () => {
    if (firebaseEnabled) await signOut(auth);
    setGuestMode(true);
    storeSet("guestMode", true);
  };
  const handleWantsSignIn = () => { setGuestMode(false); storeSet("guestMode", false); };

  if (authUser === undefined) {
    return (
      <div style={{ ...S.app, alignItems: "center", justifyContent: "center", display: "flex", minHeight: "100vh" }}>
        <RefreshCw className="spin" size={26} color={C.jade} />
        <style>{CSS_BASE}</style>
      </div>
    );
  }

  if (!authUser && !guestMode) {
    return (
      <>
        <style>{CSS_BASE}</style>
        <AuthScreen onSkip={handleSkip} />
      </>
    );
  }

  const latestWeight = useMemo(() => {
    const sorted = [...bodyLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.length ? Number(sorted[0].weight) : null;
  }, [bodyLogs]);

  const tdee = useMemo(() => {
    const { age, gender, height, activity } = profile;
    if (!age || !height || !latestWeight) return null;
    const bmr = gender === "male"
      ? 10 * latestWeight + 6.25 * height - 5 * age + 5
      : 10 * latestWeight + 6.25 * height - 5 * age - 161;
    const factor = ACTIVITY_LEVELS.find((a) => a.id === activity)?.factor || 1.2;
    return Math.round(bmr * factor);
  }, [profile, latestWeight]);

  const targetCalories = useMemo(() => {
    if (!tdee) return null;
    const dailyAdjust = Math.round((Number(profile.rate) * 7700) / 7);
    if (profile.goal === "lose") return tdee - dailyAdjust;
    if (profile.goal === "gain") return tdee + dailyAdjust;
    return tdee;
  }, [tdee, profile]);

  const shared = {
    profile, setProfile, bodyLogs, setBodyLogs, foodLogs, setFoodLogs,
    exerciseLogs, setExerciseLogs, customFoods, setCustomFoods,
    stepLogs, setStepLogs,
    tdee, targetCalories, latestWeight,
    authUser, syncStatus, onSignOut: handleSignOut, onWantsSignIn: handleWantsSignIn,
    gfitConnected, gfitStatus, connectGoogleFit, disconnectGoogleFit, syncGoogleFit,
  };

  return (
    <div style={S.app}>
      <style>{CSS_BASE}</style>
      <header style={S.header}>
        <div style={S.headerTicket}>
          <span style={S.headerBrand}>ChitTrack</span>
          <span style={S.headerSub}>your daily food chit</span>
        </div>
        <SyncBadge status={syncStatus} authUser={authUser} />
      </header>

      <main style={S.main}>
        {tab === "dashboard" && <Dashboard {...shared} />}
        {tab === "food" && <FoodTab {...shared} />}
        {tab === "exercise" && <ExerciseTab {...shared} />}
        {tab === "body" && <BodyTab {...shared} />}
        {tab === "progress" && <ProgressTab {...shared} />}
        {tab === "profile" && <ProfileTab {...shared} />}
      </main>

      <nav style={S.tabbar}>
        <TabBtn icon={Home} label="Home" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
        <TabBtn icon={Utensils} label="Food" active={tab === "food"} onClick={() => setTab("food")} />
        <TabBtn icon={Dumbbell} label="Move" active={tab === "exercise"} onClick={() => setTab("exercise")} />
        <TabBtn icon={Ruler} label="Body" active={tab === "body"} onClick={() => setTab("body")} />
        <TabBtn icon={TrendingUp} label="Trend" active={tab === "progress"} onClick={() => setTab("progress")} />
        <TabBtn icon={User} label="Me" active={tab === "profile"} onClick={() => setTab("profile")} />
      </nav>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Sync status badge                                                       */
/* ---------------------------------------------------------------------- */

function SyncBadge({ status, authUser }) {
  if (!authUser) {
    return (
      <div style={{ ...S.syncBadge, color: C.muted }}>
        <CloudOff size={12} /> <span>Not syncing</span>
      </div>
    );
  }
  if (status === "syncing") {
    return (
      <div style={{ ...S.syncBadge, color: C.turmeric }}>
        <RefreshCw size={12} className="spin" /> <span>Syncing…</span>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div style={{ ...S.syncBadge, color: C.chili }}>
        <AlertCircle size={12} /> <span>Sync error</span>
      </div>
    );
  }
  return (
    <div style={{ ...S.syncBadge, color: C.jade }}>
      <Cloud size={12} /> <span>Synced</span>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Tab bar button                                                          */
/* ---------------------------------------------------------------------- */

function TabBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...S.tabBtn, color: active ? C.jade : C.muted }}>
      <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
      <span style={{ fontSize: 11, marginTop: 2, fontWeight: active ? 700 : 500 }}>{label}</span>
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Dashboard                                                               */
/* ---------------------------------------------------------------------- */

function Dashboard({ foodLogs, exerciseLogs, targetCalories, bodyLogs, stepLogs, setStepLogs, profile, gfitConnected }) {
  const date = todayStr();
  const todayFood = foodLogs.filter((f) => f.date === date);
  const todayEx = exerciseLogs.filter((e) => e.date === date);
  const consumed = todayFood.reduce((s, f) => s + f.kcal * f.qty, 0);
  const burned = todayEx.reduce((s, e) => s + Number(e.kcal), 0);
  const net = consumed - burned;
  const target = targetCalories;
  const remaining = target ? target - net : null;
  const pct = target ? Math.min(100, Math.max(0, (net / target) * 100)) : 0;

  const latestBody = [...bodyLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
  const todaySteps = stepLogs.find((s) => s.date === date);

  return (
    <div style={S.screen}>
      <h2 style={S.h2}>{fmtDateLabel(date)}</h2>

      <div style={S.ringCard}>
        <div style={S.ringWrap}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke={C.line} strokeWidth="12" />
            <circle
              cx="70" cy="70" r="60" fill="none" stroke={C.jade} strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
              strokeLinecap="round" transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <div style={S.ringCenter}>
            <div style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 700, color: C.ink }}>
              {target ? Math.max(0, remaining) : "–"}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>kcal left</div>
          </div>
        </div>
        <div style={S.ringStats}>
          <StatRow label="Consumed" value={consumed} />
          <StatRow label="Burned" value={burned} accent={C.turmeric} />
          <StatRow label="Net" value={net} />
          <StatRow label="Target" value={target ?? "set in Me tab"} />
        </div>
      </div>

      <StepsCard steps={todaySteps?.steps ?? 0} source={todaySteps?.source} goal={profile.stepGoal || 8000} date={date} setStepLogs={setStepLogs} gfitConnected={gfitConnected} />

      {latestBody && (
        <div style={S.miniCard}>
          <Ruler size={16} color={C.jade} />
          <span style={{ fontSize: 13, color: C.ink }}>
            Last logged: {latestBody.weight}kg
            {latestBody.bodyFat ? ` · ${latestBody.bodyFat}% BF` : ""}
            {latestBody.muscle ? ` · ${latestBody.muscle}% muscle` : ""}
            {" "}({fmtDateLabel(latestBody.date)})
          </span>
        </div>
      )}

      <SectionLabel>Today's chits</SectionLabel>
      {todayFood.length === 0 && todayEx.length === 0 && (
        <EmptyHint text="Nothing logged yet today. Add a meal or a workout to get started." />
      )}
      {todayFood.map((f) => <Chit key={f.id} title={f.name} sub={`${f.meal} · x${f.qty}`} value={`${f.kcal * f.qty} kcal`} icon={Utensils} />)}
      {todayEx.map((e) => <Chit key={e.id} title={e.name} sub={`${e.duration} min`} value={`-${e.kcal} kcal`} icon={Dumbbell} accent={C.turmeric} />)}
    </div>
  );
}

function StepsCard({ steps, source, goal, date, setStepLogs, gfitConnected }) {
  const pct = Math.min(100, Math.round((steps / goal) * 100));
  const [editing, setEditing] = useState(false);
  const [manualVal, setManualVal] = useState(steps || "");

  const saveManual = () => {
    const val = Number(manualVal) || 0;
    setStepLogs((prev) => {
      const others = prev.filter((s) => s.date !== date);
      return [...others, { date, steps: val, source: "manual" }].sort((a, b) => a.date.localeCompare(b.date));
    });
    setEditing(false);
  };

  return (
    <div style={S.miniCard}>
      <Footprints size={16} color={C.jade} style={{ flexShrink: 0 }} />
      {!editing ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 700, color: C.ink }}>{steps.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: C.muted }}> / {goal.toLocaleString()} steps</span>
            {source === "googlefit" && <span style={{ fontSize: 10.5, color: C.jade, marginLeft: 6 }}>· auto-synced</span>}
            <div style={S.stepBarTrack}>
              <div style={{ ...S.stepBarFill, width: `${pct}%` }} />
            </div>
          </div>
          <button style={S.linkBtn} onClick={() => { setManualVal(steps || ""); setEditing(true); }}>
            {gfitConnected ? "Edit" : "Log steps"}
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
          <input style={{ ...S.textInput, padding: "6px 10px" }} type="number" value={manualVal} onChange={(e) => setManualVal(e.target.value)} autoFocus />
          <button style={S.linkBtn} onClick={saveManual}>Save</button>
          <button style={S.linkBtn} onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, accent }) {
  return (
    <div style={S.statRow}>
      <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
      <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 700, color: accent || C.ink }}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={S.sectionLabel}>{children}</div>;
}

function EmptyHint({ text }) {
  return <div style={S.emptyHint}>{text}</div>;
}

function Chit({ title, sub, value, icon: Icon, accent, onDelete }) {
  return (
    <div style={S.chit}>
      <div style={S.chitPerf} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <Icon size={16} color={accent || C.jade} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: accent || C.ink }}>{value}</span>
        {onDelete && (
          <button onClick={onDelete} style={S.iconBtn}><Trash2 size={14} color={C.chili} /></button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Food Tab                                                                */
/* ---------------------------------------------------------------------- */

function FoodTab({ foodLogs, setFoodLogs, customFoods, setCustomFoods }) {
  const [date, setDate] = useState(todayStr());
  const [meal, setMeal] = useState("Breakfast");
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState(1);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");

  const allFoods = useMemo(() => [...FOOD_DB, ...customFoods], [customFoods]);
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allFoods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allFoods]);

  const dayEntries = foodLogs.filter((f) => f.date === date);
  const dayTotal = dayEntries.reduce((s, f) => s + f.kcal * f.qty, 0);

  const addFood = (food) => {
    setFoodLogs((prev) => [...prev, { id: uid(), date, meal, name: food.name, kcal: food.kcal, qty }]);
    setQuery(""); setQty(1);
  };

  const addCustom = () => {
    const kcal = Number(customKcal);
    if (!customName.trim() || !kcal) return;
    const newFood = { id: uid(), name: customName.trim(), cat: "Custom", serving: "1 serving", kcal };
    setCustomFoods((prev) => [...prev, newFood]);
    setFoodLogs((prev) => [...prev, { id: uid(), date, meal, name: newFood.name, kcal, qty }]);
    setCustomName(""); setCustomKcal(""); setCustomMode(false); setQty(1);
  };

  const removeEntry = (id) => setFoodLogs((prev) => prev.filter((f) => f.id !== id));

  return (
    <div style={S.screen}>
      <DateNav date={date} setDate={setDate} />

      <div style={S.card}>
        <div style={S.mealTabs}>
          {MEALS.map((m) => (
            <button key={m} onClick={() => setMeal(m)} style={{ ...S.mealTab, ...(meal === m ? S.mealTabActive : {}) }}>
              {m}
            </button>
          ))}
        </div>

        {!customMode ? (
          <>
            <div style={S.searchWrap}>
              <Search size={15} color={C.muted} />
              <input
                style={S.searchInput}
                placeholder="Search food (e.g. laksa, froot loops)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && <X size={15} color={C.muted} onClick={() => setQuery("")} style={{ cursor: "pointer" }} />}
            </div>

            <div style={S.qtyRow}>
              <span style={{ fontSize: 12, color: C.muted }}>Servings</span>
              <QtyStepper qty={qty} setQty={setQty} />
            </div>

            {filtered.length > 0 && (
              <div style={S.resultsList}>
                {filtered.map((f) => (
                  <button key={f.id} style={S.resultRow} onClick={() => addFood(f)}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{f.cat} · {f.serving}</div>
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: 13, color: C.jade, fontWeight: 700 }}>{f.kcal} kcal</span>
                  </button>
                ))}
              </div>
            )}
            {query && filtered.length === 0 && (
              <div style={{ fontSize: 12.5, color: C.muted, padding: "8px 2px" }}>No match. Try a custom entry below.</div>
            )}
            <button style={S.linkBtn} onClick={() => setCustomMode(true)}>+ Add a custom food</button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input style={S.textInput} placeholder="Food name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
            <input style={S.textInput} placeholder="Calories (kcal)" type="number" value={customKcal} onChange={(e) => setCustomKcal(e.target.value)} />
            <div style={S.qtyRow}>
              <span style={{ fontSize: 12, color: C.muted }}>Servings</span>
              <QtyStepper qty={qty} setQty={setQty} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.primaryBtn} onClick={addCustom}><Plus size={14} /> Add entry</button>
              <button style={S.ghostBtn} onClick={() => setCustomMode(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div style={S.totalBar}>
        <span style={{ fontSize: 12.5, color: C.muted }}>Total for {fmtDateLabel(date).toLowerCase()}</span>
        <span style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 700, color: C.jade }}>{dayTotal} kcal</span>
      </div>

      {MEALS.map((m) => {
        const entries = dayEntries.filter((f) => f.meal === m);
        if (!entries.length) return null;
        return (
          <div key={m}>
            <SectionLabel>{m}</SectionLabel>
            {entries.map((f) => (
              <Chit key={f.id} title={f.name} sub={`x${f.qty} serving${f.qty > 1 ? "s" : ""}`} value={`${f.kcal * f.qty} kcal`} icon={Utensils} onDelete={() => removeEntry(f.id)} />
            ))}
          </div>
        );
      })}
      {dayEntries.length === 0 && <EmptyHint text="No food logged for this day." />}
    </div>
  );
}

function QtyStepper({ qty, setQty }) {
  return (
    <div style={S.stepper}>
      <button style={S.stepperBtn} onClick={() => setQty((q) => Math.max(0.5, +(q - 0.5).toFixed(1)))}>−</button>
      <span style={{ fontFamily: F.mono, fontSize: 13, width: 28, textAlign: "center" }}>{qty}</span>
      <button style={S.stepperBtn} onClick={() => setQty((q) => +(q + 0.5).toFixed(1))}>+</button>
    </div>
  );
}

function DateNav({ date, setDate }) {
  return (
    <div style={S.dateNav}>
      <button style={S.iconBtn} onClick={() => setDate((d) => addDays(d, -1))}><ChevronLeft size={18} color={C.ink} /></button>
      <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{fmtDateLabel(date)}</span>
      <button style={S.iconBtn} onClick={() => setDate((d) => addDays(d, 1))}><ChevronRight size={18} color={C.ink} /></button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Exercise Tab                                                            */
/* ---------------------------------------------------------------------- */

function ExerciseTab({ exerciseLogs, setExerciseLogs, latestWeight }) {
  const [date, setDate] = useState(todayStr());
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(30);
  const [kcalOverride, setKcalOverride] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");

  const weight = latestWeight || 65;
  const estimate = useMemo(() => {
    if (!selected) return null;
    return Math.round((selected.met * 3.5 * weight / 200) * duration);
  }, [selected, duration, weight]);

  const dayEntries = exerciseLogs.filter((e) => e.date === date);
  const dayTotal = dayEntries.reduce((s, e) => s + Number(e.kcal), 0);

  const addExercise = () => {
    const name = customMode ? customName.trim() : selected?.name;
    if (!name) return;
    const kcal = kcalOverride ? Number(kcalOverride) : (estimate || 0);
    setExerciseLogs((prev) => [...prev, { id: uid(), date, name, duration: Number(duration), kcal }]);
    setSelected(null); setKcalOverride(""); setCustomName(""); setCustomMode(false); setDuration(30);
  };

  const removeEntry = (id) => setExerciseLogs((prev) => prev.filter((e) => e.id !== id));

  return (
    <div style={S.screen}>
      <DateNav date={date} setDate={setDate} />

      <div style={S.card}>
        {!customMode ? (
          <>
            <div style={S.resultsList}>
              {EXERCISE_DB.map((ex) => (
                <button
                  key={ex.id}
                  style={{ ...S.resultRow, ...(selected?.id === ex.id ? { background: C.jadeTint } : {}) }}
                  onClick={() => setSelected(ex)}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{ex.name}</div>
                  <span style={{ fontSize: 11, color: C.muted }}>MET {ex.met}</span>
                </button>
              ))}
            </div>
            <button style={S.linkBtn} onClick={() => { setCustomMode(true); setSelected(null); }}>+ Add a custom exercise</button>
          </>
        ) : (
          <input style={S.textInput} placeholder="Exercise name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
        )}

        {(selected || customMode) && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={S.fieldLabel}>Duration (minutes)</label>
            <input style={S.textInput} type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <label style={S.fieldLabel}>
              Calories burned {selected && !kcalOverride ? `(est. ${estimate})` : ""}
            </label>
            <input
              style={S.textInput}
              type="number"
              placeholder={selected ? String(estimate ?? "") : "e.g. 250"}
              value={kcalOverride}
              onChange={(e) => setKcalOverride(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.primaryBtnTurmeric} onClick={addExercise}><Plus size={14} /> Add entry</button>
              <button style={S.ghostBtn} onClick={() => { setSelected(null); setCustomMode(false); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div style={S.totalBar}>
        <span style={{ fontSize: 12.5, color: C.muted }}>Burned on {fmtDateLabel(date).toLowerCase()}</span>
        <span style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 700, color: C.turmeric }}>{dayTotal} kcal</span>
      </div>

      <SectionLabel>Logged workouts</SectionLabel>
      {dayEntries.length === 0 && <EmptyHint text="No exercise logged for this day." />}
      {dayEntries.map((e) => (
        <Chit key={e.id} title={e.name} sub={`${e.duration} min`} value={`-${e.kcal} kcal`} icon={Dumbbell} accent={C.turmeric} onDelete={() => removeEntry(e.id)} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Body Tab                                                                */
/* ---------------------------------------------------------------------- */

function BodyTab({ bodyLogs, setBodyLogs }) {
  const [date, setDate] = useState(todayStr());
  const existing = bodyLogs.find((b) => b.date === date);
  const [weight, setWeight] = useState(existing?.weight ?? "");
  const [waist, setWaist] = useState(existing?.waist ?? "");
  const [bodyFat, setBodyFat] = useState(existing?.bodyFat ?? "");
  const [muscle, setMuscle] = useState(existing?.muscle ?? "");

  useEffect(() => {
    const e = bodyLogs.find((b) => b.date === date);
    setWeight(e?.weight ?? ""); setWaist(e?.waist ?? "");
    setBodyFat(e?.bodyFat ?? ""); setMuscle(e?.muscle ?? "");
  }, [date]); // eslint-disable-line

  const save = () => {
    if (!weight) return;
    const entry = { date, weight: Number(weight), waist: waist ? Number(waist) : null, bodyFat: bodyFat ? Number(bodyFat) : null, muscle: muscle ? Number(muscle) : null };
    setBodyLogs((prev) => {
      const others = prev.filter((b) => b.date !== date);
      return [...others, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const removeEntry = (d) => setBodyLogs((prev) => prev.filter((b) => b.date !== d));
  const history = [...bodyLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  return (
    <div style={S.screen}>
      <DateNav date={date} setDate={setDate} />

      <div style={S.card}>
        <label style={S.fieldLabel}>Weight (kg) *</label>
        <input style={S.textInput} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 65.4" />
        <label style={S.fieldLabel}>Waistline (cm)</label>
        <input style={S.textInput} type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g. 80" />
        <label style={S.fieldLabel}>Body fat %</label>
        <input style={S.textInput} type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="e.g. 22.5" />
        <label style={S.fieldLabel}>Muscle %</label>
        <input style={S.textInput} type="number" value={muscle} onChange={(e) => setMuscle(e.target.value)} placeholder="e.g. 38" />
        <button style={{ ...S.primaryBtn, marginTop: 10 }} onClick={save}>Save for {fmtDateLabel(date).toLowerCase()}</button>
      </div>

      <SectionLabel>Recent entries</SectionLabel>
      {history.length === 0 && <EmptyHint text="No body measurements yet." />}
      {history.map((b) => (
        <Chit
          key={b.date}
          title={`${b.weight} kg`}
          sub={[b.waist ? `Waist ${b.waist}cm` : null, b.bodyFat ? `${b.bodyFat}% BF` : null, b.muscle ? `${b.muscle}% muscle` : null].filter(Boolean).join(" · ") || fmtDateLabel(b.date)}
          value={fmtDateLabel(b.date)}
          icon={Ruler}
          onDelete={() => removeEntry(b.date)}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Progress Tab                                                            */
/* ---------------------------------------------------------------------- */

const METRICS = [
  { id: "weight", label: "Weight", unit: "kg", color: C_JADE, source: "body" },
  { id: "bodyFat", label: "Body Fat %", unit: "%", color: "#C2482B", source: "body" },
  { id: "muscle", label: "Muscle %", unit: "%", color: "#E8A33D", source: "body" },
  { id: "waist", label: "Waist", unit: "cm", color: "#3E7CB1", source: "body" },
  { id: "steps", label: "Steps", unit: "", color: "#7A4FB5", source: "steps" },
];
const RANGES = [
  { id: "4w", label: "4 weeks", days: 28 },
  { id: "3m", label: "3 months", days: 90 },
  { id: "6m", label: "6 months", days: 180 },
  { id: "all", label: "All time", days: null },
];

function ProgressTab({ bodyLogs, stepLogs }) {
  const [metric, setMetric] = useState("weight");
  const [range, setRange] = useState("3m");

  const activeMetric = METRICS.find((m) => m.id === metric);
  const activeRange = RANGES.find((r) => r.id === range);

  const data = useMemo(() => {
    const sourceLogs = activeMetric.source === "steps" ? stepLogs : bodyLogs;
    let logs = [...sourceLogs].sort((a, b) => a.date.localeCompare(b.date));
    if (activeRange.days) {
      const cutoff = addDays(todayStr(), -activeRange.days);
      logs = logs.filter((b) => b.date >= cutoff);
    }
    const field = activeMetric.source === "steps" ? "steps" : metric;
    return logs
      .filter((b) => b[field] !== null && b[field] !== undefined && b[field] !== "")
      .map((b) => ({ date: b.date, label: new Date(b.date + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" }), value: b[field] }));
  }, [bodyLogs, stepLogs, metric, activeRange, activeMetric]);

  return (
    <div style={S.screen}>
      <h2 style={S.h2}>Progress</h2>

      <div style={S.pillRow}>
        {METRICS.map((m) => (
          <button key={m.id} style={{ ...S.pill, ...(metric === m.id ? { background: C.jade, color: "#fff", borderColor: C.jade } : {}) }} onClick={() => setMetric(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <div style={S.pillRow}>
        {RANGES.map((r) => (
          <button key={r.id} style={{ ...S.pillSmall, ...(range === r.id ? { background: C.ink, color: "#fff", borderColor: C.ink } : {}) }} onClick={() => setRange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <div style={S.card}>
        {data.length < 2 ? (
          <EmptyHint text={`Log ${activeMetric.label.toLowerCase()} on at least 2 different days to see a trend line.`} />
        ) : (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.muted }} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} domain={["auto", "auto"]} unit={activeMetric.unit} />
                <Tooltip
                  contentStyle={{ fontFamily: F.mono, fontSize: 12, borderRadius: 8, border: `1px solid ${C.line}` }}
                  formatter={(v) => [`${v} ${activeMetric.unit}`, activeMetric.label]}
                />
                <Line type="monotone" dataKey="value" stroke={activeMetric.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {data.length >= 2 && (
        <div style={S.miniCard}>
          <TrendingUp size={16} color={C.jade} />
          <span style={{ fontSize: 13, color: C.ink }}>
            {data[0].value} → {data[data.length - 1].value} {activeMetric.unit}
            {" "}({(data[data.length - 1].value - data[0].value >= 0 ? "+" : "")}{(data[data.length - 1].value - data[0].value).toFixed(1)} {activeMetric.unit} over this period)
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Profile Tab                                                             */
/* ---------------------------------------------------------------------- */

function ProfileTab({ profile, setProfile, tdee, targetCalories, latestWeight, authUser, syncStatus, onSignOut, onWantsSignIn, gfitConnected, gfitStatus, connectGoogleFit, disconnectGoogleFit }) {
  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  return (
    <div style={S.screen}>
      <h2 style={S.h2}>Me</h2>

      <div style={S.card}>
        <label style={S.fieldLabel}>Account</label>
        {authUser ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{authUser.email}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>
                  {syncStatus === "syncing" ? "Syncing…" : syncStatus === "error" ? "Sync error — check connection" : "Synced across your devices"}
                </div>
              </div>
              <Cloud size={18} color={C.jade} />
            </div>
            <button style={{ ...S.ghostBtn, marginTop: 6, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6 }} onClick={onSignOut}>
              <LogOut size={13} /> Sign out
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CloudOff size={16} color={C.muted} />
              <span style={{ fontSize: 12.5, color: C.muted }}>Not signed in — data stays on this device only.</span>
            </div>
            <button style={{ ...S.primaryBtn, marginTop: 6 }} onClick={onWantsSignIn}>Sign in to sync devices</button>
          </>
        )}
      </div>

      <div style={S.card}>
        <label style={S.fieldLabel}>Step tracking</label>
        {!googleFitEnabled ? (
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            Not set up yet — add a Google OAuth client ID to <code>src/googleFitConfig.js</code> to
            enable automatic step syncing from Google Fit. Until then, log steps manually from the Home tab.
          </div>
        ) : gfitConnected ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>Connected to Google Fit</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>
                  {gfitStatus === "syncing" ? "Syncing steps…" : gfitStatus === "error" ? "Couldn't refresh — will retry" : "Steps sync automatically when you open the app"}
                </div>
              </div>
              <Footprints size={18} color={C.jade} />
            </div>
            <button style={{ ...S.ghostBtn, marginTop: 6, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6 }} onClick={disconnectGoogleFit}>
              <Unlink size={13} /> Disconnect
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
              Connect Google Fit to auto-log your daily steps. Make sure the Google Fit app is
              installed on your phone with activity tracking turned on.
            </div>
            <button style={{ ...S.primaryBtn, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={connectGoogleFit}>
              <Link2 size={14} /> Connect Google Fit
            </button>
          </>
        )}

        <label style={{ ...S.fieldLabel, marginTop: 10 }}>Daily step goal</label>
        <input style={S.textInput} type="number" value={profile.stepGoal ?? 8000} onChange={(e) => set("stepGoal", Number(e.target.value))} />
      </div>

      <div style={S.card}>
        <label style={S.fieldLabel}>Name</label>
        <input style={S.textInput} value={profile.name} onChange={(e) => set("name", e.target.value)} placeholder="Optional" />

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={S.fieldLabel}>Age</label>
            <input style={S.textInput} type="number" value={profile.age} onChange={(e) => set("age", e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.fieldLabel}>Height (cm)</label>
            <input style={S.textInput} type="number" value={profile.height} onChange={(e) => set("height", e.target.value)} />
          </div>
        </div>

        <label style={S.fieldLabel}>Gender (for BMR calc)</label>
        <div style={S.pillRow}>
          {["female", "male"].map((g) => (
            <button key={g} style={{ ...S.pill, ...(profile.gender === g ? { background: C.jade, color: "#fff", borderColor: C.jade } : {}) }} onClick={() => set("gender", g)}>
              {g[0].toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        <label style={S.fieldLabel}>Activity level</label>
        <select style={S.select} value={profile.activity} onChange={(e) => set("activity", e.target.value)}>
          {ACTIVITY_LEVELS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>

        <label style={S.fieldLabel}>Goal</label>
        <div style={S.pillRow}>
          {[{ id: "lose", label: "Lose" }, { id: "maintain", label: "Maintain" }, { id: "gain", label: "Gain" }].map((g) => (
            <button key={g.id} style={{ ...S.pill, ...(profile.goal === g.id ? { background: C.jade, color: "#fff", borderColor: C.jade } : {}) }} onClick={() => set("goal", g.id)}>
              {g.label}
            </button>
          ))}
        </div>

        {profile.goal !== "maintain" && (
          <>
            <label style={S.fieldLabel}>Target rate ({profile.goal === "lose" ? "loss" : "gain"} per week)</label>
            <select style={S.select} value={profile.rate} onChange={(e) => set("rate", Number(e.target.value))}>
              <option value={0.25}>0.25 kg/week (gentle)</option>
              <option value={0.5}>0.5 kg/week (standard)</option>
              <option value={0.75}>0.75 kg/week (aggressive)</option>
              <option value={1}>1 kg/week (very aggressive)</option>
            </select>
          </>
        )}
      </div>

      <div style={S.card}>
        {!latestWeight ? (
          <EmptyHint text="Log a weight entry in the Body tab to calculate your calorie needs." />
        ) : !profile.age || !profile.height ? (
          <EmptyHint text="Fill in age and height above to calculate your calorie needs." />
        ) : (
          <>
            <StatRow label="Current weight" value={`${latestWeight} kg`} />
            <StatRow label="Maintenance (TDEE)" value={`${tdee} kcal/day`} />
            <StatRow label={`Target to ${profile.goal}`} value={`${targetCalories} kcal/day`} accent={C.jade} />
          </>
        )}
      </div>

      <div style={S.footNote}>
        Estimates use the Mifflin-St Jeor formula. They're a starting point — adjust based on real-world results over a few weeks.
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Style tokens                                                            */
/* ---------------------------------------------------------------------- */

const C_JADE = "#1F6F5C";
const C = {
  bg: "#F2F5F1",
  surface: "#FFFFFF",
  ink: "#1B2B27",
  muted: "#6B7D77",
  jade: C_JADE,
  jadeDark: "#175444",
  jadeTint: "#E4EFEB",
  turmeric: "#C97F1E",
  chili: "#C2482B",
  line: "#DEE5E0",
};
const F = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
};

const S = {
  app: { fontFamily: F.body, background: C.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", color: C.ink },
  header: { padding: "18px 18px 10px", background: C.bg },
  headerTicket: { display: "flex", alignItems: "baseline", gap: 8 },
  headerBrand: { fontFamily: F.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: C.ink },
  headerSub: { fontSize: 12, color: C.muted, fontStyle: "italic" },
  syncBadge: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, marginTop: 4 },
  main: { flex: 1, padding: "4px 16px 90px", overflowY: "auto" },
  screen: { display: "flex", flexDirection: "column", gap: 10 },
  h2: { fontFamily: F.display, fontSize: 19, fontWeight: 700, margin: "6px 0 2px", color: C.ink },
  tabbar: { position: "sticky", bottom: 0, background: C.surface, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "8px 4px calc(8px + env(safe-area-inset-bottom))", maxWidth: 480, margin: "0 auto", width: "100%" },
  tabBtn: { display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", padding: "4px 8px", cursor: "pointer" },

  card: { background: C.surface, borderRadius: 14, padding: 14, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 6 },
  miniCard: { background: C.jadeTint, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 },
  stepBarTrack: { height: 5, width: 140, background: "#FFFFFF", borderRadius: 3, marginTop: 5, overflow: "hidden" },
  stepBarFill: { height: "100%", background: C.jade, borderRadius: 3, transition: "width 0.3s ease" },

  ringCard: { background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 16 },
  ringWrap: { position: "relative", flexShrink: 0 },
  ringCenter: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  ringStats: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  statRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },

  sectionLabel: { fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 8 },
  emptyHint: { fontSize: 13, color: C.muted, background: C.surface, border: `1px dashed ${C.line}`, borderRadius: 12, padding: "16px 14px", textAlign: "center" },

  chit: { position: "relative", background: C.surface, border: `1px solid ${C.line}`, borderLeft: `3px dashed ${C.line}`, borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  chitPerf: { display: "none" },

  dateNav: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "4px 0" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 },

  mealTabs: { display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" },
  mealTab: { fontSize: 12, fontWeight: 600, color: C.muted, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 20, padding: "5px 12px", cursor: "pointer" },
  mealTabActive: { background: C.jade, color: "#fff", borderColor: C.jade },

  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" },
  searchInput: { border: "none", background: "none", outline: "none", fontSize: 14, flex: 1, color: C.ink, fontFamily: F.body },

  qtyRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px" },
  stepper: { display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 20, padding: "3px 6px" },
  stepperBtn: { width: 24, height: 24, borderRadius: "50%", border: "none", background: C.surface, color: C.ink, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 1px 0 ${C.line}` },

  resultsList: { display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflowY: "auto" },
  resultRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", cursor: "pointer", textAlign: "left", width: "100%" },

  linkBtn: { alignSelf: "flex-start", background: "none", border: "none", color: C.jade, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "4px 2px" },
  textInput: { border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none", color: C.ink, fontFamily: F.body, width: "100%", boxSizing: "border-box" },
  fieldLabel: { fontSize: 11.5, fontWeight: 700, color: C.muted, marginTop: 4 },
  select: { border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 13.5, outline: "none", color: C.ink, fontFamily: F.body, background: C.surface },

  primaryBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.jade, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", flex: 1 },
  primaryBtnTurmeric: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.turmeric, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", flex: 1 },
  ghostBtn: { background: "none", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },

  totalBar: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 4px" },
  pillRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  pill: { fontSize: 12.5, fontWeight: 600, color: C.ink, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, padding: "6px 13px", cursor: "pointer" },
  pillSmall: { fontSize: 11.5, fontWeight: 600, color: C.ink, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, padding: "5px 11px", cursor: "pointer" },

  footNote: { fontSize: 11.5, color: C.muted, lineHeight: 1.5, padding: "0 4px 10px" },
};

const CSS_BASE = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
* { box-sizing: border-box; }
input:focus, select:focus { border-color: ${C.jade} !important; }
::-webkit-scrollbar { width: 4px; height: 4px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
button { font-family: inherit; }
`;
