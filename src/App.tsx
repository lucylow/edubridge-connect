import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as HotToast } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Loader from "@/components/app/Loader";
import Layout from "@/components/Layout";
import DashboardLayout from "@/components/DashboardLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import TutorDashboard from "./pages/TutorDashboard";
import LearnerDashboard from "./pages/LearnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Matching from "./pages/Matching";
import Schedule from "./pages/Schedule";
import SessionRoom from "./pages/SessionRoom";
import Sessions from "./pages/Sessions";
import Availability from "./pages/Availability";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import Reports from "./pages/Reports";
import FlaggedReviews from "./pages/FlaggedReviews";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) {
    const dashboard = user.role === 'tutor' ? '/tutor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/learner/dashboard';
    return <Navigate to={dashboard} />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Authenticated Routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/session/:sessionId" element={<PrivateRoute><SessionRoom /></PrivateRoute>} />
      </Route>

      {/* Dashboard Layout (with sidebar) */}
      <Route element={<DashboardLayout />}>
        <Route path="/tutor/dashboard" element={<PrivateRoute allowedRoles={['tutor']}><TutorDashboard /></PrivateRoute>} />
        <Route path="/learner/dashboard" element={<PrivateRoute allowedRoles={['learner']}><LearnerDashboard /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/matching" element={<PrivateRoute><Matching /></PrivateRoute>} />
        <Route path="/schedule/:tutorId" element={<PrivateRoute><Schedule /></PrivateRoute>} />
        <Route path="/availability" element={<PrivateRoute allowedRoles={['tutor']}><Availability /></PrivateRoute>} />
        <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />
        <Route path="/admin/flagged-reviews" element={<PrivateRoute allowedRoles={['admin']}><FlaggedReviews /></PrivateRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToast
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
