'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { theme, setUser } = useAppStore();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Validation Effect: Check for corrupted state
    useEffect(() => {
        const { user, logout } = useAppStore.getState();
        if (user && (typeof user.isAuthenticated === 'undefined' || user.isAuthenticated === null)) {
            console.warn("Corrupted user state detected, resetting.");
            logout();
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { auth } = await import('@/lib/firebase');
                const { onAuthStateChanged } = await import('firebase/auth');

                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    try {
                        if (user) {
                            // Fetch additional user data from Firestore
                            const { doc, getDoc } = await import('firebase/firestore');
                            const { db } = await import('@/lib/firebase');
                            const userDoc = await getDoc(doc(db, 'users', user.uid));
                            const userData = userDoc.data();

                            setUser({
                                id: user.uid,
                                name: user.displayName || userData?.salonName || 'User',
                                email: user.email,
                                isAuthenticated: true,
                                onboardingComplete: userData?.onboardingComplete || false
                            });
                        } else {
                            setUser({
                                id: null,
                                name: null,
                                email: null,
                                isAuthenticated: false,
                                onboardingComplete: false
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                        // Fallback to basic auth state if firestore fails
                        setUser({
                            id: user?.uid || null,
                            name: user?.displayName || 'User',
                            email: user?.email || null,
                            isAuthenticated: !!user,
                            onboardingComplete: false // Safer default
                        });
                    } finally {
                        useAppStore.getState().setAuthReady(true);
                    }
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Firebase Auth Init Failed:", error);
                // Force ready state so app doesn't hang
                useAppStore.getState().setAuthReady(true);
            }
        };

        initAuth();

        // Safety timeout: If auth doesn't initialize within 3 seconds, force ready to avoid infinite loading
        const timer = setTimeout(() => {
            if (!useAppStore.getState().isAuthReady) {
                console.warn("Auth initialization timed out, forcing ready state.");
                useAppStore.getState().setAuthReady(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [setUser]);

    return <>{children}</>;
}
