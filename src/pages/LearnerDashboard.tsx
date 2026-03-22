import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserSessions, type Session } from "@/services/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Loader from "@/components/app/Loader";
import { Search, Calendar, BookOpen, Video } from "lucide-react";

const LearnerDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) getUserSessions(user.id).then(setSessions).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loader />;

  const upcoming = sessions.filter(s => s.status === "scheduled");

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Hi, {user?.name} 📚</h1>
          <p className="text-muted-foreground">Ready to learn something new?</p>
        </div>
        <Link to="/matching">
          <Button variant="hero" className="gap-2"><Search className="h-4 w-4" />Find a Tutor</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: BookOpen, label: "Sessions completed", value: user?.sessionsCompleted || 0 },
          { icon: Calendar, label: "Upcoming", value: upcoming.length },
          { icon: Search, label: "Subjects", value: user?.subjects.length || 0 },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="bg-card rounded-3xl p-6 border border-border">
        <h2 className="font-bold text-lg mb-4">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No sessions yet. Find a tutor to get started!</p>
            <Link to="/matching"><Button>Find a Tutor</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-muted rounded-2xl p-4">
                <div>
                  <p className="font-medium text-sm">With {s.tutorName || `Tutor #${s.tutorId}`}</p>
                  <p className="text-xs text-muted-foreground">{s.subject} · {new Date(s.scheduledStart).toLocaleString()}</p>
                </div>
                <Link to={`/session/${s.id}`}>
                  <Button size="sm" className="gap-1.5"><Video className="h-3.5 w-3.5" />Join</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;
