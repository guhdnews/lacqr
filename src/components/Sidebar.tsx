'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, MessageSquare, FileText, Users, Settings, LogOut, Menu as MenuIcon, X, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, setUser } = useAppStore();
    const { initialize } = useNotificationStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Initialize notifications when user is authenticated
    useEffect(() => {
        if (user?.id) {
            const unsubscribe = initialize(user.id);
            return () => unsubscribe();
        }
    }, [user?.id, initialize]);

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            const { auth } = await import('../lib/firebase');
            await auth.signOut();
            setUser({
                id: null,
                name: null,
                email: null,
                isAuthenticated: false,
                onboardingComplete: false
            });
            router.push('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/bookings', label: 'Inbox', icon: MessageSquare },
        { path: '/dashboard/lacqr-lens', label: 'Lacqr Lens', icon: Camera },
        { path: '/dashboard/smart-quote', label: 'Smart Quote', icon: MessageSquare },
        { path: '/dashboard/service-menu', label: 'Service Menu', icon: FileText },
        { path: '/dashboard/crm', label: 'CRM', icon: Users },
        { path: '/dashboard/portfolio', label: 'Portfolio', icon: Camera, comingSoon: true },
        { path: '/dashboard/analytics', label: 'Analytics', icon: LayoutDashboard, comingSoon: true },
        { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-pink-50 z-50 flex items-center px-4 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isMobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
                    </button>
                    <span className="text-xl font-serif font-bold text-charcoal">Lacqr</span>
                </div>
                {/* Mobile Notification Center */}
                <NotificationCenter />
            </div>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-pink-50 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo & Notifications */}
                <div className="p-6 border-b border-pink-50 flex justify-between items-center">
                    <Link href="/dashboard" className="text-2xl font-serif font-bold tracking-tight text-charcoal">
                        Lacqr
                    </Link>
                    {/* Desktop Notification Center */}
                    <div className="hidden md:block">
                        <NotificationCenter />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                href={item.comingSoon ? '#' : item.path}
                                onClick={(e) => {
                                    if (item.comingSoon) e.preventDefault();
                                    else setIsMobileOpen(false);
                                }}
                                className={`
                                    flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path) && !item.comingSoon
                                        ? 'bg-pink-50 text-pink-600 font-medium shadow-sm'
                                        : item.comingSoon
                                            ? 'text-gray-400 cursor-not-allowed hover:bg-gray-50'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <ItemIcon size={20} className={isActive(item.path) && !item.comingSoon ? 'text-pink-500' : 'text-gray-400'} />
                                    <span>{item.label}</span>
                                </div>
                                {item.comingSoon && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                        Soon
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Logout */}
                <div className="p-4 border-t border-pink-50 space-y-1">
                    <a
                        href="https://lacqr.io"
                        className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-500 hover:bg-gray-50 hover:text-charcoal rounded-xl transition-colors"
                    >
                        <LogOut size={20} className="rotate-180" />
                        <span>Back to Website</span>
                    </a>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
