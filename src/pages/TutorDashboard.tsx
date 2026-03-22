import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserSessions, type Session } from "@/services/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Loader from "@/components/app/Loader";
import { Calendar, Clock, Users, Star, Video } from "lucide-react";

const TutorDashboard = () => {
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name} 👋</h1>
        <p className="text-muted-foreground">Here's your tutoring overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Sessions", value: user?.sessionsCompleted || 0 },
          { icon: Star, label: "Rating", value: user?.rating?.toFixed(1) || "—" },
          { icon: Calendar, label: "Upcoming", value: upcoming.length },
          { icon: Clock, label: "Subjects", value: user?.subjects.length || 0 },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card rounded-3xl p-6 border border-border mb-6">
        <h2 className="font-bold text-lg mb-4">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sessions scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-muted rounded-2xl p-4">
                <div>
                  <p className="font-medium text-sm">With {s.learnerName || `Learner #${s.learnerId}`}</p>
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

      <div className="bg-card rounded-3xl p-6 border border-border">
        <h2 className="font-bold text-lg mb-2">Your Subjects</h2>
        <div className="flex flex-wrap gap-2">
          {user?.subjects.map(s => (
            <span key={s} className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
