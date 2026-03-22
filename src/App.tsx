import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppNavbar from "@/components/app/AppNavbar";
import Loader from "@/components/app/Loader";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TutorDashboard from "./pages/TutorDashboard";
import LearnerDashboard from "./pages/LearnerDashboard";
import Matching from "./pages/Matching";
import Schedule from "./pages/Schedule";
import SessionRoom from "./pages/SessionRoom";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppLayout() {
  const { user } = useAuth();
  const isLanding = window.location.pathname === "/";
  return (
    <>
      {(!isLanding || user) && <AppNavbar />}
      <AppRoutes />
    </>
  );
}

  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={user ? <Navigate to={user.role === "tutor" ? "/tutor/dashboard" : "/learner/dashboard"} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === "tutor" ? "/tutor/dashboard" : "/learner/dashboard"} /> : <Register />} />
      <Route path="/tutor/dashboard" element={<PrivateRoute allowedRoles={["tutor"]}><TutorDashboard /></PrivateRoute>} />
      <Route path="/learner/dashboard" element={<PrivateRoute allowedRoles={["learner"]}><LearnerDashboard /></PrivateRoute>} />
      <Route path="/matching" element={<PrivateRoute><Matching /></PrivateRoute>} />
      <Route path="/schedule/:tutorId" element={<PrivateRoute><Schedule /></PrivateRoute>} />
      <Route path="/session/:sessionId" element={<PrivateRoute><SessionRoom /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppNavbar />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
