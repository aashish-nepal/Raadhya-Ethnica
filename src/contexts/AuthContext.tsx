"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

/**
 * Ensures a complete customer document exists for the given Firebase user.
 * - Creates a new document if one doesn't exist
 * - Fills in missing fields if the document is incomplete (e.g. from old wishlist sync)
 * - NEVER overwrites existing fields like `role` — admin is safe
 */
async function ensureCustomerDocument(user: User) {
    const customerRef = doc(db, "customers", user.uid);
    const snapshot = await getDoc(customerRef);

    if (!snapshot.exists()) {
        // New user — create a complete document
        await setDoc(customerRef, {
            userId: user.uid,
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            role: "user",
            status: "active",
            orders: 0,
            totalSpent: 0,
            wishlist: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return;
    }

    // Document exists — only patch fields that are missing
    const data = snapshot.data();
    const missing: Record<string, any> = {};

    if (!data.userId) missing.userId = user.uid;
    if (!data.email) missing.email = user.email || "";
    if (!data.name) missing.name = user.displayName || "";
    if (!data.phone && data.phone !== "") missing.phone = "";
    if (!data.role) missing.role = "user";
    if (!data.status) missing.status = "active";
    if (data.orders === undefined) missing.orders = 0;
    if (data.totalSpent === undefined) missing.totalSpent = 0;
    if (!data.wishlist) missing.wishlist = [];
    if (!data.createdAt) missing.createdAt = Timestamp.now();

    if (Object.keys(missing).length > 0) {
        missing.updatedAt = Timestamp.now();
        await updateDoc(customerRef, missing);
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                // Ensure customer document is complete — non-blocking
                ensureCustomerDocument(firebaseUser).catch((err) => {
                    console.error("Failed to ensure customer document:", err);
                });
            }
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name immediately so ensureCustomerDocument picks it up
        await updateProfile(newUser, { displayName: name });
        // Manually trigger customer creation with the name (since onAuthStateChanged
        // may have already fired before updateProfile completed)
        await ensureCustomerDocument({ ...newUser, displayName: name } as User);

        // Send welcome email (fire-and-forget — never block sign-up)
        fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name }),
        }).catch(console.error);
    };


    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // onAuthStateChanged handles customer document creation
        } catch (err: any) {
            if (err.code === "auth/account-exists-with-different-credential") {
                // The email is registered with a different provider (e.g. email/password).
                // Find out which sign-in methods exist for this email.
                const email = err.customData?.email;
                const methods = email
                    ? await fetchSignInMethodsForEmail(auth, email).catch(() => [])
                    : [];

                const usesPassword = methods.includes("password");
                const hint = usesPassword
                    ? "This email is already registered with a password. Please sign in with your email and password instead."
                    : "This email is already registered with a different sign-in method. Please use that method to sign in.";

                throw new Error(hint);
            }
            // Re-throw any other errors as-is
            throw err;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
