// Owner: Karen (rankings agent implements). Shared sign-in surface; keep these names and types stable.
// Stub until implemented: no Firebase config means no sign-in, and callers must work signed out.
export interface SignedInUser { uid: string; name: string | null; email: string | null; anonymous: boolean }

/** Google sign-in (popup). Resolves null when Firebase isn't configured or the user cancels. */
export async function signInWithGoogle(): Promise<SignedInUser | null> {
  return null;
}

/** The current user, signing in anonymously first if needed (for one-vote-per-device). Null when Firebase isn't configured. */
export async function ensureUser(): Promise<SignedInUser | null> {
  return null;
}
