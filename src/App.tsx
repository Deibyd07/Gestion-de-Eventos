import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './core/stores/authStore';
import { Layout } from './shared/components/layout/Layout';
import { EventsPage } from './features/events/pages/EventsPage';
import { EventDetailPage } from './features/events/pages/EventDetailPage';
import { OrganizerDashboard } from './features/organizer/pages/OrganizerDashboard';
import { CheckoutPage } from './features/events/pages/CheckoutPage';
import { ProfilePage } from './features/users/pages/ProfilePage';
import { TicketsPage } from './features/events/pages/TicketsPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { AdminPage } from './features/admin/pages/AdminPage';
import { HomePage } from './features/events/pages/HomePage';
import { AdminGuard } from './features/auth/components/AdminGuard';
import { AdminRedirect } from './features/auth/components/AdminRedirect';
import { AdminRouteGuard } from './features/auth/components/AdminRouteGuard';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <AdminRouteGuard>
              <HomePage />
            </AdminRouteGuard>
          } />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/dashboard' : '/events'} /> : <Navigate to="/" />} 
          />
          
          {/* Protected Routes */}
          <Route path="/events" element={
            <AdminRedirect>
              <Layout>
                <EventsPage />
              </Layout>
            </AdminRedirect>
          } />
          
          <Route path="/events/:id" element={
            <AdminRedirect>
              <Layout>
                <EventDetailPage />
              </Layout>
            </AdminRedirect>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AdminRedirect>
                <OrganizerDashboard />
              </AdminRedirect>
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <AdminRedirect>
                <Layout>
                  <CheckoutPage />
                </Layout>
              </AdminRedirect>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <AdminRedirect>
                <Layout>
                  <ProfilePage />
                </Layout>
              </AdminRedirect>
            </ProtectedRoute>
          } />
          
          <Route path="/tickets" element={
            <ProtectedRoute>
              <AdminRedirect>
                <Layout>
                  <TicketsPage />
                </Layout>
              </AdminRedirect>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;