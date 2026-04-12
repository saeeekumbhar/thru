import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TripPlanner from './pages/TripPlanner';
import TripDetails from './pages/TripDetails';
import Passport from './pages/Passport';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div></div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<TripPlanner />} />
              <Route path="/trips" element={<Dashboard />} />
              <Route path="/trips/:id" element={<TripDetails />} />
              <Route path="/planner" element={<TripPlanner />} />
              <Route path="/passport" element={<Passport />} />
              <Route path="/map" element={<div className="p-8 text-center font-serif text-xl">Interactive Map Coming Soon</div>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
