import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppNavbar from "@/components/app/AppNavbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  LayoutDashboard, Calendar, Search, Clock, User, Settings,
  ChevronLeft, ChevronRight, Menu, X, BrainCircuit,
} from "lucide-react";

const menuConfig = {
  tutor: [
    { name: "Dashboard", icon: LayoutDashboard, href: "/tutor/dashboard" },
    { name: "My Sessions", icon: Calendar, href: "/sessions" },
    { name: "Find Learners", icon: Search, href: "/matching" },
    { name: "Availability", icon: Clock, href: "/availability" },
    { name: "Quiz", icon: BrainCircuit, href: "/quiz" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ],
  learner: [
    { name: "Dashboard", icon: LayoutDashboard, href: "/learner/dashboard" },
    { name: "My Sessions", icon: Calendar, href: "/sessions" },
    { name: "Find Tutors", icon: Search, href: "/matching" },
    { name: "Quiz", icon: BrainCircuit, href: "/quiz" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ],
};

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = user ? menuConfig[user.role] || [] : [];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar – desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-border shrink-0">
          {!collapsed && (
            <span className="text-sm font-bold text-gradient truncate">EduBridge</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {items.map(item => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {user && !collapsed && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <span className="text-sm font-bold text-gradient">EduBridge</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
              {items.map(item => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-14 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-accent mr-2"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <AppNavbar />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
