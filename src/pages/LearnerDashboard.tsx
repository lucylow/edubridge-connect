import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserSessions, generateStudyTips, type Session } from "@/services/api";
import { useRealtimeSessions } from "@/hooks/useRealtimeSessions";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Loader from "@/components/app/Loader";
import MarkdownContent from "@/components/MarkdownContent";
import { Search, Calendar, BookOpen, Video, TrendingUp, Lightbulb, Loader2, BrainCircuit, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const LearnerDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(() => {
    if (user) getUserSessions(user.id).then(setSessions).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useRealtimeSessions(user?.id, fetchSessions);

  if (loading) return <Loader />;

  const upcoming = sessions.filter(s => s.status === "scheduled");
  const completed = sessions.filter(s => s.status === "completed");

  const stats = [
    { icon: BookOpen, label: "Sessions completed", value: completed.length, color: "text-emerald-500" },
    { icon: Calendar, label: "Upcoming", value: upcoming.length, color: "text-primary" },
    { icon: TrendingUp, label: "Subjects", value: user?.subjects.length || 0, color: "text-amber-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Hi, {user?.name} 📚</h1>
          <p className="text-muted-foreground text-sm">Ready to learn something new?</p>
        </div>
        <Link to="/matching">
          <Button className="gap-2"><Search className="h-4 w-4" />Find a Tutor</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-card rounded-2xl p-4 border border-border">
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {user?.subjects && user.subjects.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground mb-2">My Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {user.subjects.map(s => (
              <span key={s} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base">Upcoming Sessions</h2>
          {sessions.length > 0 && <Link to="/sessions" className="text-xs text-primary font-medium hover:underline">View all</Link>}
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm mb-4">No sessions yet. Find a tutor to get started!</p>
            <Link to="/matching"><Button size="sm">Find a Tutor</Button></Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{s.subject || "Session"} with {s.tutorName || "Tutor"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.scheduledStart).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {new Date(s.scheduledStart).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Link to={`/session/${s.id}`}>
                  <Button size="sm" variant="secondary" className="gap-1.5 shrink-0"><Video className="h-3.5 w-3.5" />Join</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Study Tips & Quiz */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <StudyTipsCard subjects={user?.subjects || []} grade={user?.grade} />
        <Link to="/quiz" className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="font-bold text-sm">Take a Practice Quiz</span>
          <span className="text-xs text-muted-foreground">AI-generated quizzes on any subject</span>
        </Link>
      </div>
    </div>
  );
};

function StudyTipsCard({ subjects, grade }: { subjects: string[]; grade?: number }) {
  const [tips, setTips] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const subject = subjects[0] || "General";
    setLoading(true);
    try {
      const result = await generateStudyTips(subject, grade);
      setTips(result);
    } catch {
      toast.error("Failed to generate study tips");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />Study Tips</h3>
        <Button size="sm" variant="secondary" onClick={handleGenerate} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
          {loading ? "Loading..." : tips ? "Refresh" : "Get Tips"}
        </Button>
      </div>
      {tips ? (
        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted rounded-xl p-3 max-h-48 overflow-y-auto">{tips}</pre>
      ) : (
        <p className="text-sm text-muted-foreground">Get personalized AI study tips for your subjects.</p>
      )}
    </div>
  );
}

export default LearnerDashboard;
