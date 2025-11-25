import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-white">
            <ScrollToTop />
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
