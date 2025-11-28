import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SmartQuote from './pages/SmartQuote';
import LacqrLens from './pages/LacqrLens';
import Settings from './pages/Settings';
import ServiceMenu from './pages/ServiceMenu';
import PublicBooking from './pages/PublicBooking';
import ClientList from './pages/ClientList';
import ClientProfile from './pages/ClientProfile';
import { AdminPage } from './pages/AdminPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Onboarding from './pages/Onboarding';
import Help from './pages/Help';
import PublicQuote from './pages/PublicQuote';
import LacqrTrainer from './pages/LacqrTrainer';
import PublicSmartQuote from './pages/public/PublicSmartQuote';
import EmbedSmartQuote from './pages/public/EmbedSmartQuote';

import Dashboard from './pages/Dashboard';
import Drafts from './pages/Drafts';

import ProtectedRoute from './components/ProtectedRoute';
import { useAppStore } from './store/useAppStore';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

import ScrollToTop from './components/ScrollToTop';

function App() {
  const { theme, setUser } = useAppStore(); // Combined destructuring

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      const { auth } = await import('./lib/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Fetch additional user data from Firestore
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('./lib/firebase');
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
        useAppStore.getState().setAuthReady(true);
      });

      return () => unsubscribe();
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

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Embed Route (No Layout) */}
        <Route path="/embed/:userId" element={<EmbedSmartQuote />} />

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/book" element={<PublicBooking />} />
          <Route path="/book/:userId" element={<PublicSmartQuote />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/q/:id" element={<PublicQuote />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/help" element={<Help />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/lacqr-lens" element={<LacqrLens />} />

          <Route path="/smart-quote" element={<SmartQuote />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/menu" element={<ServiceMenu />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/trainer" element={<LacqrTrainer />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
