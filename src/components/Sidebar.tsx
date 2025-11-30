import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, MessageSquare, FileText, Users, Settings, LogOut, Menu as MenuIcon, X, HelpCircle, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useState } from 'react';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAppStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

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
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/lacqr-lens', label: 'Lacqr Lens', icon: Camera },
        { path: '/smart-quote', label: 'Smart Quote', icon: MessageSquare },
        { path: '/service-menu', label: 'Service Menu', icon: FileText },
        { path: '/crm', label: 'CRM', icon: Users },
        { path: '/settings', label: 'Settings', icon: Settings },
        { path: '/help', label: 'Help & Support', icon: HelpCircle },
    ];

    return (
        <>
            {/* Mobile Toggle - Floating Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={`md:hidden fixed bottom-6 right-6 z-[60] p-4 bg-charcoal text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <MenuIcon size={24} />
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-pink-50 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex flex-col h-full relative">
                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-charcoal"
                    >
                        <X size={24} />
                    </button>

                    {/* Logo */}
                    <div className="p-6 border-b border-pink-50">
                        <Link to="/dashboard" className="text-2xl font-serif font-bold tracking-tight text-charcoal">
                            Lacqr
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive(item.path)
                                        ? 'bg-pink-50 text-pink-600 font-medium shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                                    }
                                `}
                            >
                                <item.icon size={20} className={isActive(item.path) ? 'text-pink-500' : 'text-gray-400'} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-pink-50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
