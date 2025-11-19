import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Camera, Search, Menu, Settings, Users, DollarSign, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLanding = location.pathname === '/';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (isLanding) {
        return <Outlet />;
    }

    const navItems = [
        { path: '/app/quote', label: 'QuoteCam', icon: Camera },
        { path: '/app/sort', label: 'Service Sorter', icon: Search },
        { path: '/app/clients', label: 'Clients', icon: Users },
        { path: '/app/prices', label: 'Price List', icon: DollarSign },
        { path: '/app/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-pink-50 font-sans text-charcoal">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-pink-100 p-6">
                <div className="mb-10 px-2">
                    <h1 className="text-2xl font-serif font-bold tracking-tight text-charcoal">Lacqr</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-pink-50 text-pink-600 font-bold shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-charcoal font-medium'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-gray-100">
                    <button className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-500 transition-colors w-full text-left font-medium">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden p-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-pink-50 sticky top-0 z-20">
                    <h1 className="text-lg font-bold tracking-tight font-serif">Lacqr</h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-white p-6 animate-in slide-in-from-right">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-serif font-bold">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full">
                                <Menu size={24} />
                            </button>
                        </div>
                        <nav className="space-y-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50 text-lg font-medium"
                                    >
                                        <Icon size={24} className="text-pink-500" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                    <div className="max-w-5xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Nav (Only for core tools) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-around items-center pb-8 z-10">
                    <button
                        onClick={() => navigate('/app/quote')}
                        className={`flex flex-col items-center space-y-1 ${location.pathname.includes('quote') ? 'text-pink-500' : 'text-gray-400'}`}
                    >
                        <Camera size={24} />
                        <span className="text-[10px] font-medium uppercase tracking-wide">Quote</span>
                    </button>

                    <button
                        onClick={() => navigate('/app/sort')}
                        className={`flex flex-col items-center space-y-1 ${location.pathname.includes('sort') ? 'text-pink-500' : 'text-gray-400'}`}
                    >
                        <Search size={24} />
                        <span className="text-[10px] font-medium uppercase tracking-wide">Sort</span>
                    </button>

                    <button
                        onClick={() => navigate('/app/settings')}
                        className={`flex flex-col items-center space-y-1 ${location.pathname.includes('settings') ? 'text-pink-500' : 'text-gray-400'}`}
                    >
                        <Settings size={24} />
                        <span className="text-[10px] font-medium uppercase tracking-wide">Settings</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
