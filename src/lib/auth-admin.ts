"use client";

import { useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

// ─── Role helpers ─────────────────────────────────────────────────────────────

/** Returns true if the given email belongs to a Firestore customer with role "admin". */
export async function checkAdminRole(email: string): Promise<boolean> {
    try {
        const snap = await getDocs(
            query(collection(db, "customers"), where("email", "==", email))
        );
        if (snap.empty) return false;
        return snap.docs[0].data().role === "admin";
    } catch {
        return false;
    }
}

/** Returns the full admin customer document, or null if not found / not admin. */
export async function getAdminUser(email: string) {
    try {
        const snap = await getDocs(
            query(collection(db, "customers"), where("email", "==", email))
        );
        if (snap.empty) return null;
        const data = snap.docs[0].data();
        if (data.role !== "admin") return null;
        return { id: snap.docs[0].id, ...data };
    } catch {
        return null;
    }
}

// ─── Login / Logout ───────────────────────────────────────────────────────────

/**
 * Sign in with Firebase, verify admin role, then call /api/auth/session
 * to set the HttpOnly session cookie.
 */
export async function adminLogin(
    email: string,
    password: string
): Promise<{ success: true; user: User } | { success: false; error: string }> {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const { user } = credential;

        const isAdmin = await checkAdminRole(user.email ?? email);
        if (!isAdmin) {
            await signOut(auth);
            return { success: false, error: "You do not have admin privileges." };
        }

        const idToken = await user.getIdToken();
        const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        });

        if (!res.ok) {
            await signOut(auth);
            return { success: false, error: "Failed to establish secure session." };
        }

        return { success: true, user };
    } catch (err: any) {
        return { success: false, error: err.message ?? "Login failed." };
    }
}

/**
 * Clear the server-side session cookie and sign out of Firebase client.
 */
export async function adminLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut(auth);
}

// ─── Session deduplication ────────────────────────────────────────────────────

// Prevents multiple simultaneous /api/auth/session calls when several
// components mount at the same time. The HttpOnly cookie is invisible to
// document.cookie so we track the in-flight promise at module level.
let _sessionPromise: Promise<void> | null = null;

async function ensureSessionCookie(firebaseUser: User): Promise<void> {
    if (_sessionPromise) return _sessionPromise;

    _sessionPromise = (async () => {
        try {
            const idToken = await firebaseUser.getIdToken(/* forceRefresh */ true);
            const res = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });
            if (!res.ok) {
                console.warn("[auth-admin] Session cookie refresh failed:", res.status);
            }
        } catch (err) {
            console.warn("[auth-admin] Session cookie refresh error:", err);
        } finally {
            _sessionPromise = null;
        }
    })();

    return _sessionPromise;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface AdminAuthState {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    adminData: any | null;
}

/**
 * React hook for admin authentication state.
 * - Listens to Firebase auth state changes
 * - Verifies admin role via Firestore
 * - Ensures the HttpOnly session cookie stays fresh (deduplicated)
 */
export function useAdminAuth(): AdminAuthState {
    const [state, setState] = useState<AdminAuthState>({
        user: null,
        isAdmin: false,
        loading: true,
        adminData: null,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setState({ user: null, isAdmin: false, loading: false, adminData: null });
                return;
            }

            const isAdmin = await checkAdminRole(firebaseUser.email ?? "");

            if (!isAdmin) {
                setState({ user: null, isAdmin: false, loading: false, adminData: null });
                return;
            }

            const adminData = await getAdminUser(firebaseUser.email ?? "");

            // Refresh the server-side session cookie (deduplicated)
            await ensureSessionCookie(firebaseUser);

            setState({ user: firebaseUser, isAdmin: true, loading: false, adminData });
        });

        return unsubscribe;
    }, []);

    return state;
}
