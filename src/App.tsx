import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { Dashboard } from './pages/Dashboard';
import { Competitors } from './pages/Competitors';
import { ContentIdeas } from './pages/ContentIdeas';
import { Calendar } from './pages/Calendar';
import { Trends } from './pages/Trends';
import { Settings } from './pages/Settings';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { AuthGuard } from './components/Auth/AuthGuard';
import { SubscriptionGuard } from './components/Auth/SubscriptionGuard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { preferences } = useUserStore();
  const { user } = useAuthStore();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  if (!preferences.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const setSession = useAuthStore((state) => state.setSession);
  const { user } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/auth/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginForm />
          } 
        />
        <Route 
          path="/auth/register" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterForm />
          } 
        />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <OnboardingFlow />
            </AuthGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </AuthGuard>
          }
        />
        <Route
          path="/competitors"
          element={
            <AuthGuard>
              <ProtectedRoute>
                <Competitors />
              </ProtectedRoute>
            </AuthGuard>
          }
        />
        <Route
          path="/content-ideas"
          element={
            <AuthGuard>
              <ProtectedRoute>
                <SubscriptionGuard>
                  <ContentIdeas />
                </SubscriptionGuard>
              </ProtectedRoute>
            </AuthGuard>
          }
        />
        <Route
          path="/calendar"
          element={
            <AuthGuard>
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            </AuthGuard>
          }
        />
        <Route
          path="/trends"
          element={
            <AuthGuard>
              <ProtectedRoute>
                <Trends />
              </ProtectedRoute>
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </AuthGuard>
          }
        />
        
        {/* Redirect root to dashboard or login */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;