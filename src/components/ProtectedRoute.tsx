import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isAuthReady } = useAppStore();
    const location = useLocation();

    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user.isAuthenticated) {
        // Redirect to login page but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is authenticated but hasn't completed onboarding, force them to /onboarding
    if (!user.onboardingComplete && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    // If user has completed onboarding and tries to access /onboarding, redirect to dashboard
    if (user.onboardingComplete && location.pathname === '/onboarding') {
        return <Navigate to="/lacqr-lens" replace />;
    }

    return <>{children}</>;
}
