"use client";

import { useEffect, useState } from "react";
import { getStoreSettings } from "@/lib/firestore";
import type { StoreSettings } from "@/types";

let cachedSettings: StoreSettings | null = null;
let settingsPromise: Promise<StoreSettings | null> | null = null;

export function useSettings() {
    const [settings, setSettings] = useState<StoreSettings | null>(cachedSettings);
    const [loading, setLoading] = useState(!cachedSettings);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // If we already have cached settings, use them
        if (cachedSettings) {
            setSettings(cachedSettings);
            setLoading(false);
            return;
        }

        // If there's already a fetch in progress, wait for it
        if (settingsPromise) {
            settingsPromise
                .then((data) => {
                    setSettings(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err);
                    setLoading(false);
                });
            return;
        }

        // Start a new fetch
        setLoading(true);
        settingsPromise = getStoreSettings()
            .then((data) => {
                cachedSettings = data as StoreSettings;
                setSettings(cachedSettings);
                setLoading(false);
                return cachedSettings;
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
                throw err;
            })
            .finally(() => {
                settingsPromise = null;
            });
    }, []);

    const refreshSettings = async () => {
        setLoading(true);
        try {
            const data = await getStoreSettings();
            cachedSettings = data as StoreSettings;
            setSettings(cachedSettings);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { settings, loading, error, refreshSettings };
}
