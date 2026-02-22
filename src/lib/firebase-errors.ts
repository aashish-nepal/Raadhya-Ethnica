/**
 * Converts raw Firebase Auth error codes into human-readable messages.
 * Use this in catch blocks instead of showing err.message directly.
 */
export function getFirebaseAuthError(err: any): string {
    const code: string = err?.code ?? "";

    const messages: Record<string, string> = {
        // Registration
        "auth/email-already-in-use":
            "This email is already registered with a password. Please sign in with your email and password instead.",
        "auth/invalid-email":
            "Please enter a valid email address.",
        "auth/weak-password":
            "Password must be at least 6 characters.",
        "auth/operation-not-allowed":
            "This sign-in method is not enabled. Please contact support.",

        // Sign-in
        "auth/user-not-found":
            "No account found with this email. Please check your email or create an account.",
        "auth/wrong-password":
            "Incorrect password. Please try again or reset your password.",
        "auth/invalid-credential":
            "Incorrect email or password. Please try again.",
        "auth/too-many-requests":
            "Too many failed attempts. Please wait a few minutes and try again.",
        "auth/user-disabled":
            "This account has been disabled. Please contact support.",

        // Google / OAuth
        "auth/account-exists-with-different-credential":
            "This email is already registered with a password. Please sign in with your email and password instead.",
        "auth/popup-closed-by-user":
            "Sign-in was cancelled. Please try again.",
        "auth/popup-blocked":
            "Sign-in popup was blocked by your browser. Please allow popups for this site and try again.",
        "auth/cancelled-popup-request":
            "Sign-in was cancelled. Please try again.",

        // Network
        "auth/network-request-failed":
            "Network error. Please check your connection and try again.",
    };

    return messages[code] ?? err?.message ?? "Something went wrong. Please try again.";
}
