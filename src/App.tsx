/**
 * Main Application Component
 * 
 * Punto de entrada principal de la aplicación EventHub.
 * Maneja el enrutamiento y la estructura general de la aplicación.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Authentication
import { useAuthStore } from './modules/authentication/infrastructure/store/Auth.store';
import { ProtectedRoute } from './modules/authentication/presentation/guards/ProtectedRoute.guard';
import { AdminGuard } from './modules/authentication/presentation/guards/AdminGuard.guard';
import { AdminRedirect } from './modules/authentication/presentation/guards/AdminRedirect.guard';
import { AdminRouteGuard } from './modules/authentication/presentation/guards/AdminRouteGuard.guard';

// Layout
import { Layout } from './shared/ui/layouts/Layout.layout';

// Pages - Events
import { HomePage } from './modules/events/presentation/pages/Home.page';
import { EventsPage } from './modules/events/presentation/pages/Events.page';
import { EventDetailPage } from './modules/events/presentation/pages/EventDetail.page';
import { CreateEventPage } from './modules/events/presentation/pages/CreateEvent.page';

// Pages - Payments
import { CheckoutPage } from './modules/payments/presentation/pages/Checkout.page';
import { TicketsPage } from './modules/payments/presentation/pages/Tickets.page';

// Pages - Users
import { ProfilePage } from './modules/users/presentation/pages/Profile.page';

// Pages - Organizers
import { OrganizerDashboard } from './modules/organizers/presentation/pages/OrganizerDashboard.page';

// Pages - Administration
import { AdminPage } from './modules/administration/presentation/pages/Admin.page';

// Pages - Notifications
import { NotificationsPage } from './modules/notifications/presentation/pages/Notifications.page';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    // La sesión se verifica automáticamente con Zustand persist
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* ========== Public Routes ========== */}
          
          {/* Home Page */}
          <Route 
            path="/" 
            element={
              <AdminRouteGuard>
                <HomePage />
              </AdminRouteGuard>
            } 
          />
          
          {/* Login Redirect */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate 
                  to={
                    user?.role === 'admin' 
                      ? '/admin' 
                      : user?.role === 'organizer' 
                      ? '/organizer/dashboard' 
                      : '/events'
                  } 
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          
          {/* Events (Public with optional auth) */}
          <Route 
            path="/events" 
            element={
              <AdminRedirect>
                <Layout>
                  <EventsPage />
                </Layout>
              </AdminRedirect>
            } 
          />
          
          <Route 
            path="/events/:id" 
            element={
              <AdminRedirect>
                <Layout>
                  <EventDetailPage />
                </Layout>
              </AdminRedirect>
            } 
          />
          
          {/* ========== Protected Routes ========== */}
          
          {/* User Profile */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AdminRedirect>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </AdminRedirect>
              </ProtectedRoute>
            } 
          />
          
          {/* Checkout */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <AdminRedirect>
                  <Layout>
                    <CheckoutPage />
                  </Layout>
                </AdminRedirect>
              </ProtectedRoute>
            } 
          />
          
          {/* User Tickets */}
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute>
                <AdminRedirect>
                  <Layout>
                    <TicketsPage />
                  </Layout>
                </AdminRedirect>
              </ProtectedRoute>
            } 
          />
          
          {/* Notifications */}
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <AdminRedirect>
                  <Layout>
                    <NotificationsPage />
                  </Layout>
                </AdminRedirect>
              </ProtectedRoute>
            } 
          />
          
          {/* ========== Organizer Routes ========== */}
          
          <Route 
            path="/organizer/*" 
            element={
              <ProtectedRoute requiredRole="organizer">
                <AdminRedirect>
                  <Routes>
                    <Route path="dashboard" element={<OrganizerDashboard />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="events/create" element={<CreateEventPage />} />
                    <Route path="events/:id/edit" element={<CreateEventPage />} />
                    <Route path="analytics" element={<div>Analytics Page</div>} />
                    <Route path="attendees" element={<div>Attendees Page</div>} />
                    <Route path="promotions" element={<div>Promotions Page</div>} />
                  </Routes>
                </AdminRedirect>
              </ProtectedRoute>
            }
          />
          
          {/* Legacy dashboard route redirect */}
          <Route 
            path="/dashboard" 
            element={<Navigate to="/organizer/dashboard" replace />} 
          />
          
          {/* ========== Admin Routes ========== */}
          
          <Route 
            path="/admin/*" 
            element={
              <AdminGuard>
                <Routes>
                  <Route index element={<AdminPage />} />
                  <Route path="dashboard" element={<AdminPage />} />
                  <Route path="users" element={<div>User Management</div>} />
                  <Route path="events" element={<div>Event Management</div>} />
                  <Route path="payments" element={<div>Payment Management</div>} />
                  <Route path="analytics" element={<div>System Analytics</div>} />
                  <Route path="settings" element={<div>System Settings</div>} />
                  <Route path="notifications" element={<div>Notification Management</div>} />
                </Routes>
              </AdminGuard>
            }
          />
          
          {/* ========== Error Routes ========== */}
          
          {/* 404 - Not Found */}
          <Route 
            path="/404" 
            element={
              <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
                  <Navigate to="/" replace />
                </div>
              </Layout>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;