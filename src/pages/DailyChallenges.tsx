import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import Loader from "@/components/app/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Trophy, Star, Award, Brain, Zap, Crown, Layers, Flame,
  Target, GraduationCap, Sparkles, Bot, BookmarkCheck,
  MessageCircle, Sunrise, CheckCircle2,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy, star: Star, award: Award, brain: Brain, zap: Zap,
  crown: Crown, layers: Layers, flame: Flame, target: Target,
  "graduation-cap": GraduationCap, sparkles: Sparkles, bot: Bot,
  bookmark: BookmarkCheck, "message-circle": MessageCircle, sunrise: Sunrise,
};

export default function DailyChallenges() {
  const { challenges, completedIds, loading, completeChallenge, allCompleted, challengeStreak, multiplier, multiplierLabel, nextTier } = useDailyChallenges();

  if (loading) return <Loader />;

  const completedCount = challenges.filter(c => completedIds.has(c.id)).length;
  const percent = challenges.length > 0 ? Math.round((completedCount / challenges.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" /> Daily Challenges
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete today's challenges to earn bonus XP. New challenges every day!
        </p>
      </div>

      {/* Progress summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">Today's Progress</span>
          <Badge variant={allCompleted ? "default" : "secondary"}>
            {completedCount}/{challenges.length} Complete
          </Badge>
        </div>
        <Progress value={percent} className="h-3" />
        {allCompleted && (
          <p className="text-xs text-primary font-semibold mt-2 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> All challenges completed! Come back tomorrow for more.
          </p>
        )}
      </motion.div>

      {/* Streak Multiplier Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <div className="font-bold text-sm">Challenge Streak: {challengeStreak} day{challengeStreak !== 1 ? "s" : ""}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Current bonus: <span className="font-semibold text-primary">{multiplierLabel}</span>
                {multiplier > 1 && ` — all XP rewards ×${multiplier}`}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-bold">
            {multiplier > 1 ? `×${multiplier}` : "No bonus"}
          </Badge>
        </div>
        {nextTier && (
          <div className="mt-3 bg-muted rounded-xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                🎯 {nextTier.needed - challengeStreak} more day{nextTier.needed - challengeStreak !== 1 ? "s" : ""} to unlock <span className="font-semibold text-foreground">{nextTier.label}</span>
              </span>
              <span className="text-muted-foreground">{challengeStreak}/{nextTier.needed}</span>
            </div>
            <Progress value={Math.round((challengeStreak / nextTier.needed) * 100)} className="h-1.5 mt-1.5" />
          </div>
        )}
        {!nextTier && challengeStreak >= 30 && (
          <p className="text-xs text-primary font-semibold mt-2 flex items-center gap-1">
            <Crown className="h-3.5 w-3.5" /> Maximum multiplier reached! You're a legend!
          </p>
        )}
      </motion.div>

      {/* Challenge cards */}
      <div className="space-y-3">
        {challenges.map((challenge, i) => {
          const completed = completedIds.has(challenge.id);
          const Icon = iconMap[challenge.icon] || Target;
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-5 border transition-all ${
                completed
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card border-border hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                  completed ? "bg-primary/10" : "bg-muted"
                }`}>
                  {completed ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${completed ? "line-through text-muted-foreground" : ""}`}>
                      {challenge.title}
                    </span>
                    {completed && <Badge className="text-[10px] px-1.5 py-0">Done</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
                  <span className="text-xs font-semibold text-primary">+{challenge.xp_reward} XP</span>
                </div>
                <Button
                  size="sm"
                  variant={completed ? "outline" : "default"}
                  disabled={completed}
                  onClick={() => completeChallenge(challenge.id)}
                  className="shrink-0"
                >
                  {completed ? "Completed" : "Complete"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No challenges available. Check back soon!
        </div>
      )}
    </div>
  );
}
