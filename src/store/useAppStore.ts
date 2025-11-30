import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    user: {
        id: string | null;
        name: string | null;
        email: string | null;
        salonName?: string | null;
        isAuthenticated: boolean;
        onboardingComplete: boolean;
    };
    isAuthReady: boolean;
    setAuthReady: (ready: boolean) => void;
    setUser: (user: AppState['user']) => void;
    logout: () => void;
    notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>;
    addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
    removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
            user: {
                id: null,
                name: null,
                email: null,
                salonName: null,
                isAuthenticated: false,
                onboardingComplete: false,
            },
            isAuthReady: false,
            setAuthReady: (ready) => set({ isAuthReady: ready }),
            setUser: (user) => set({ user }),
            logout: () => set({
                user: {
                    id: null,
                    name: null,
                    email: null,
                    salonName: null,
                    isAuthenticated: false,
                    onboardingComplete: false
                }
            }),
            notifications: [],
            addNotification: (message, type) => set((state) => ({
                notifications: [...state.notifications, { id: Date.now().toString(), message, type }]
            })),
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            })),
        }),
        {
            name: 'lacqr-storage', // unique name for localStorage key
            partialize: (state) => ({ theme: state.theme, user: state.user }), // Only persist theme and user
        }
    )
);
