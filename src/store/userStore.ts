import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UserStore {
    user: User | null;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User) => void;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) => {
                set({ user, isAuthenticated: true });
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            updateProfile: (data) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null,
                }));
            },
        }),
        {
            name: 'user-storage',
        }
    )
);
