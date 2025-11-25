import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 min-h-screen transition-all duration-300">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
