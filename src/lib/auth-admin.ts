import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Check if a user has admin role by email
 */
export async function checkAdminRole(userEmail: string): Promise<boolean> {
    try {
        const customersRef = collection(db, "customers");

        // Query by email (most reliable method)
        const q = query(customersRef, where("email", "==", userEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("User not found in customers collection:", userEmail);
            return false;
        }

        const userData = snapshot.docs[0].data();
        console.log("Found user with email:", userEmail, "role:", userData.role);
        return userData.role === "admin";
    } catch (error) {
        console.error("Error checking admin role:", error);
        return false;
    }
}

/**
 * Get admin user data by email
 */
export async function getAdminUser(userEmail: string) {
    try {
        const customersRef = collection(db, "customers");

        // Query by email
        const q = query(customersRef, where("email", "==", userEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const userData = snapshot.docs[0].data();
        if (userData.role !== "admin") return null;

        return {
            id: snapshot.docs[0].id,
            ...userData,
        };
    } catch (error) {
        console.error("Error getting admin user:", error);
        return null;
    }
}

/**
 * Admin login with email and password
 */
export async function adminLogin(email: string, password: string) {
    try {
        console.log("🔐 Starting admin login for:", email);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("✅ Firebase Auth successful, user ID:", user.uid);
        console.log("📧 User email:", user.email);

        // Check if user has admin role (using email, not uid)
        console.log("🔍 Checking admin role for email:", user.email || email);
        const isAdmin = await checkAdminRole(user.email || email);

        console.log("👤 Admin status:", isAdmin);

        if (!isAdmin) {
            console.log("❌ User is not admin, signing out");
            await signOut(auth);
            throw new Error("You do not have admin privileges");
        }

        console.log("✅ Admin login successful!");
        return { success: true, user };
    } catch (error: any) {
        console.error("❌ Admin login error:", error);
        return {
            success: false,
            error: error.message || "Login failed",
        };
    }
}

/**
 * Admin logout
 */
export async function adminLogout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        console.error("Admin logout error:", error);
        return {
            success: false,
            error: error.message || "Logout failed",
        };
    }
}

/**
 * Hook to manage admin authentication state
 */
export function useAdminAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Check if user is admin (using email)
                const adminStatus = await checkAdminRole(firebaseUser.email || "");
                setIsAdmin(adminStatus);

                if (adminStatus) {
                    const userData = await getAdminUser(firebaseUser.email || "");
                    setAdminData(userData);
                    setUser(firebaseUser);
                } else {
                    setUser(null);
                    setAdminData(null);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setAdminData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return {
        user,
        isAdmin,
        loading,
        adminData,
    };
}


