import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase.js";

// Keeps profile/bodyLogs/foodLogs/exerciseLogs/customFoods in sync with a
// single Firestore document per signed-in user. Remote changes (from
// another device) flow down via onSnapshot; local changes flow up via a
// debounced setDoc. localStorage stays the source of truth when signed out.
export function useCloudSync(user, state) {
  const {
    profile, bodyLogs, foodLogs, exerciseLogs, customFoods, stepLogs,
    setProfile, setBodyLogs, setFoodLogs, setExerciseLogs, setCustomFoods, setStepLogs,
  } = state;

  const [status, setStatus] = useState("offline"); // offline | syncing | synced | error
  const skipNextWrite = useRef(false);
  const ready = useRef(false);
  const debounceRef = useRef(null);

  // Subscribe to the remote doc whenever the signed-in user changes.
  useEffect(() => {
    ready.current = false;
    if (!firebaseEnabled || !user) {
      setStatus("offline");
      return;
    }
    setStatus("syncing");
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          skipNextWrite.current = true;
          if (d.profile) setProfile(d.profile);
          setBodyLogs(d.bodyLogs || []);
          setFoodLogs(d.foodLogs || []);
          setExerciseLogs(d.exerciseLogs || []);
          setCustomFoods(d.customFoods || []);
          setStepLogs(d.stepLogs || []);
        } else {
          // First sign-in on this account: push whatever's local up.
          setDoc(ref, {
            profile, bodyLogs, foodLogs, exerciseLogs, customFoods, stepLogs,
            updatedAt: Date.now(),
          });
        }
        ready.current = true;
        setStatus("synced");
      },
      (err) => {
        console.error("Firestore sync error", err);
        setStatus("error");
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Push local changes up (debounced), skipping the echo from a remote update.
  useEffect(() => {
    if (!firebaseEnabled || !user || !ready.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    setStatus("syncing");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const ref = doc(db, "users", user.uid);
        await setDoc(
          ref,
          { profile, bodyLogs, foodLogs, exerciseLogs, customFoods, stepLogs, updatedAt: Date.now() },
          { merge: true }
        );
        setStatus("synced");
      } catch (e) {
        console.error("Firestore write failed", e);
        setStatus("error");
      }
    }, 800);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, bodyLogs, foodLogs, exerciseLogs, customFoods, stepLogs, user]);

  return status;
}
