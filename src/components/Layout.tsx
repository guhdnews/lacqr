import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Search, Menu } from 'lucide-react';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLanding = location.pathname === '/';

    if (isLanding) {
        return <Outlet />;
    }

    return (
        <div className="flex flex-col h-screen bg-pink-50 font-sans text-charcoal">
            {/* Header */}
            <header className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <h1 className="text-lg font-bold tracking-tight">Lacqr</h1>
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Menu size={24} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-around items-center pb-8">
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
            </nav>
        </div>
    );
}
