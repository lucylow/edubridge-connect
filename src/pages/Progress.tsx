import { useGamification, xpProgress, type Achievement } from "@/hooks/useGamification";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/app/Loader";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Trophy, Star, Award, Brain, Zap, Crown, Layers, Flame,
  TrendingUp, GraduationCap, Medal, Target, Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy, star: Star, award: Award, brain: Brain, zap: Zap,
  crown: Crown, layers: Layers, flame: Flame, "trending-up": TrendingUp,
  "graduation-cap": GraduationCap,
};

export default function ProgressPage() {
  const { user } = useAuth();
  const { stats, achievements, earnedKeys, leaderboard, loading } = useGamification();

  if (loading) return <Loader />;
  if (!stats) return <div className="text-center py-10 text-muted-foreground">No progress data yet.</div>;

  const { current, needed, percent } = xpProgress(stats.xp, stats.level);
  const earnedCount = earnedKeys.size;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" /> My Progress
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Track your learning journey and achievements.</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Level", value: stats.level, icon: Star, color: "text-amber-500" },
          { label: "Total XP", value: stats.xp, icon: Sparkles, color: "text-primary" },
          { label: "Streak", value: `${stats.streak_days}d`, icon: Flame, color: "text-orange-500" },
          { label: "Best Streak", value: `${stats.longest_streak}d`, icon: Target, color: "text-emerald-500" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card rounded-2xl p-4 border border-border text-center">
            <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* XP Progress bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">Level {stats.level}</span>
          <span className="text-xs text-muted-foreground">{current} / {needed} XP</span>
        </div>
        <Progress value={percent} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {needed - current} XP until Level {stats.level + 1}
        </p>
      </motion.div>

      {/* Activity stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <Brain className="h-5 w-5 text-primary mb-1" />
          <div className="text-2xl font-bold">{stats.quizzes_taken}</div>
          <div className="text-xs text-muted-foreground">Quizzes Taken</div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <Layers className="h-5 w-5 text-primary mb-1" />
          <div className="text-2xl font-bold">{stats.flashcards_studied}</div>
          <div className="text-xs text-muted-foreground">Flashcard Decks</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Medal className="h-5 w-5 text-amber-500" /> Achievements
          </h2>
          <Badge variant="secondary">{earnedCount}/{totalCount}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((a, i) => {
            const earned = earnedKeys.has(a.key);
            const Icon = iconMap[a.icon] || Trophy;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                className={`rounded-2xl p-4 border transition-all ${
                  earned ? "bg-primary/5 border-primary/30" : "bg-card border-border opacity-50"
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${earned ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`h-5 w-5 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{a.title}</span>
                      {earned && <Badge className="text-[10px] px-1.5 py-0">Earned</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                    <span className="text-[10px] text-primary font-medium">+{a.xp_reward} XP</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="font-bold text-base flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-emerald-500" /> Leaderboard
        </h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No data yet. Start learning to appear on the leaderboard!</p>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((entry, i) => {
                const isMe = entry.user_id === user?.id;
                return (
                  <motion.div key={entry.user_id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 ${isMe ? "bg-primary/5" : ""}`}>
                    <span className={`font-bold text-lg w-8 text-center ${i < 3 ? "text-amber-500" : "text-muted-foreground"}`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium text-sm truncate block ${isMe ? "text-primary" : ""}`}>
                        {entry.name} {isMe && "(You)"}
                      </span>
                      <span className="text-xs text-muted-foreground">Level {entry.level} · {entry.streak_days}d streak</span>
                    </div>
                    <span className="font-bold text-sm text-primary">{entry.xp} XP</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
