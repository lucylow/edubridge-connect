import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  tutor: "Tutor",
  learner: "Learner",
  admin: "Admin",
  dashboard: "Dashboard",
  matching: "Find Tutors",
  sessions: "Sessions",
  session: "Session Room",
  schedule: "Schedule",
  availability: "Availability",
  profile: "Profile",
  settings: "Settings",
  users: "Users",
  reports: "Reports",
  "flagged-reviews": "Flagged Reviews",
};

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    path: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link to="/" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map(c => (
        <span key={c.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {c.isLast ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link to={c.path} className="hover:text-foreground transition-colors">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
