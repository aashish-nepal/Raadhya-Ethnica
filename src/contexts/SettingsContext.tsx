"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSettings } from "@/hooks/useSettings";
import type { StoreSettings } from "@/types";

interface SettingsContextType {
    settings: StoreSettings | null;
    loading: boolean;
    error: Error | null;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const settingsData = useSettings();

    return (
        <SettingsContext.Provider value={settingsData}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettingsContext must be used within a SettingsProvider");
    }
    return context;
}
