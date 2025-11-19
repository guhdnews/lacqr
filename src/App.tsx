import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import QuoteCam from './pages/QuoteCam';
import ServiceSorter from './pages/ServiceSorter';
import Settings from './pages/Settings';
import PriceList from './pages/PriceList';
import Clients from './pages/Clients';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />

                {/* App Routes */}
                <Route path="app" element={<Layout />}>
                    <Route path="quote" element={<QuoteCam />} />
                    <Route path="sort" element={<ServiceSorter />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="prices" element={<PriceList />} />
                    <Route path="clients" element={<Clients />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
