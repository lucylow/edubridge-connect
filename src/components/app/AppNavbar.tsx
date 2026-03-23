import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, User, LayoutDashboard } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardPath = user?.role === "tutor" ? "/tutor/dashboard" : "/learner/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-gradient">
          <BookOpen className="h-6 w-6 text-primary" />
          EduBridge
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link to={dashboardPath}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button variant="outline-primary" size="sm">Get Started</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
