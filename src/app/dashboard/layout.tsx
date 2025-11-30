'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthReady } = useAppStore();

    useEffect(() => {
        if (isAuthReady) {
            if (!user || !user.isAuthenticated) {
                router.push('/login');
            } else if (!user.onboardingComplete && pathname !== '/onboarding') {
                router.push('/onboarding');
            } else if (user.onboardingComplete && pathname === '/onboarding') {
                router.push('/lacqr-lens');
            }
        }
    }, [isAuthReady, user, pathname, router]);

    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user || !user.isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 md:ml-64 pt-16 md:pt-0">
                {children}
            </div>
        </div>
    );
}
