import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

export const firebaseEnabled = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app, auth, db;

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  // Best-effort offline cache; fails silently in unsupported browsers or
  // when multiple tabs are open, which is fine — the app still works.
  enableIndexedDbPersistence(db).catch(() => {});
}

export { auth, db };
