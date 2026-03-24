import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserSessions, type Session } from "@/services/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Video, BookOpen, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  scheduled: { label: "Upcoming", icon: Clock, className: "bg-primary/10 text-primary" },
  ongoing: { label: "Ongoing", icon: Video, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  completed: { label: "Completed", icon: CheckCircle, className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

const tabs = ["all", "scheduled", "completed", "cancelled"] as const;

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.id) getUserSessions(user.id).then(setSessions).finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = sessions.filter(s => filter === "all" || s.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading sessions...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" /> My Sessions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{sessions.length} total session{sessions.length !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/matching">
          <Button className="gap-1.5"><BookOpen className="h-4 w-4" />Find a {user?.role === "tutor" ? "Learner" : "Tutor"}</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "all" ? "All" : statusConfig[tab]?.label || tab}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No sessions found</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
            {filter === "all" ? "Book your first session to get started!" : `No ${filter} sessions.`}
          </p>
          <Link to="/matching"><Button variant="outline">Find a {user?.role === "tutor" ? "Learner" : "Tutor"}</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session, i) => {
            const cfg = statusConfig[session.status] || statusConfig.scheduled;
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold truncate">{session.subject || "General Session"}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {user?.role === "tutor" ? "Learner" : "Tutor"}: {" "}
                        <span className="font-medium text-foreground">
                          {user?.role === "tutor" ? session.learnerName || "Unknown" : session.tutorName || "Unknown"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(session.scheduledStart).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        {" · "}
                        {new Date(session.scheduledStart).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {session.status === "scheduled" && (
                      <Link to={`/session/${session.id}`}>
                        <Button size="sm" className="gap-1.5">
                          <Video className="h-3.5 w-3.5" /> Join
                        </Button>
                      </Link>
                    )}
                    {session.status === "completed" && (
                      <Link to={`/session/${session.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
