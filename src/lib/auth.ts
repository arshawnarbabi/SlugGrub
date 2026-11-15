// Owner: Karen. Shared sign-in surface; keep these names and types stable.
// No Firebase config means no sign-in: both functions resolve null and callers work signed out (the vote fallback then identifies
// the device with a random id kept in localStorage, see src/lib/rankClient.ts).
import { signInAnonymously, signInWithPopup, linkWithPopup, type User } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "./firebase";

export interface SignedInUser { uid: string; name: string | null; email: string | null; anonymous: boolean }

const toUser = (u: User): SignedInUser => ({ uid: u.uid, name: u.displayName, email: u.email, anonymous: u.isAnonymous });

const CANCELLED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"];
const codeOf = (err: unknown) => (typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "");

let pending: Promise<SignedInUser | null> | null = null;

/** Google sign-in (popup). Resolves null when Firebase isn't configured or the user cancels.
 *  An anonymous user is upgraded in place (linkWithPopup), so the votes this device already cast keep their owner. */
export async function signInWithGoogle(): Promise<SignedInUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  await auth.authStateReady();
  try {
    const current = auth.currentUser;
    if (current?.isAnonymous) {
      try {
        return toUser((await linkWithPopup(current, googleProvider)).user);
      } catch (err) {
        // this Google account already has a SlugGrub user: sign in as that one instead
        if (codeOf(err) !== "auth/credential-already-in-use") throw err;
      }
    }
    return toUser((await signInWithPopup(auth, googleProvider)).user);
  } catch (err) {
    if (CANCELLED.includes(codeOf(err))) return null;
    throw err;
  }
}

/** The current user, signing in anonymously first if needed (for one-vote-per-device). Null when Firebase isn't configured. */
export async function ensureUser(): Promise<SignedInUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  if (!pending) {
    pending = (async () => {
      await auth.authStateReady();
      const u = auth.currentUser ?? (await signInAnonymously(auth)).user;
      return toUser(u);
    })().finally(() => { pending = null; });
  }
  return pending;
}
