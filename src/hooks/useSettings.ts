"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { StoreSettings } from "@/types";

// Real-time subscription to store settings — updates all consumers instantly
export function useSettings() {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const settingsRef = doc(db, "settings", "store-config");

        const unsubscribe = onSnapshot(
            settingsRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setSettings({ id: snapshot.id, ...snapshot.data() } as StoreSettings);
                } else {
                    setSettings(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Settings subscription error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // No-op kept for API compatibility with existing consumers
    const refreshSettings = async () => { };

    return { settings, loading, error, refreshSettings };
}
