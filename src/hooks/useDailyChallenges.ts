import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/hooks/useGamification";
import { showAchievementToast } from "@/components/AchievementToast";
import { fireConfetti } from "@/components/AchievementToast";
import { toast } from "sonner";

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  xp_reward: number;
  icon: string;
  day_index: number;
}

// Streak multiplier tiers
function getMultiplier(streak: number): { multiplier: number; label: string } {
  if (streak >= 30) return { multiplier: 3.0, label: "3x Legendary" };
  if (streak >= 14) return { multiplier: 2.5, label: "2.5x Epic" };
  if (streak >= 7) return { multiplier: 2.0, label: "2x Super" };
  if (streak >= 3) return { multiplier: 1.5, label: "1.5x Hot" };
  return { multiplier: 1.0, label: "1x Base" };
}

function getNextTier(streak: number): { needed: number; label: string } | null {
  if (streak >= 30) return null;
  if (streak >= 14) return { needed: 30, label: "3x Legendary" };
  if (streak >= 7) return { needed: 14, label: "2.5x Epic" };
  if (streak >= 3) return { needed: 7, label: "2x Super" };
  return { needed: 3, label: "1.5x Hot" };
}

export { getMultiplier, getNextTier };

export function useDailyChallenges() {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [challengeStreak, setChallengeStreak] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  const computeStreak = useCallback(async (userId: string) => {
    // Get distinct completed_date values where user completed ALL 3 challenges
    const { data } = await supabase
      .from("user_daily_challenges" as any)
      .select("completed_date")
      .eq("user_id", userId)
      .order("completed_date", { ascending: false });

    if (!data || data.length === 0) return 0;

    // Count completions per day
    const countByDay = new Map<string, number>();
    for (const row of data as any[]) {
      const d = row.completed_date;
      countByDay.set(d, (countByDay.get(d) || 0) + 1);
    }

    // Walk backwards from today counting consecutive days with 3+ completions
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split("T")[0];
      if ((countByDay.get(dateStr) || 0) >= 3) {
        streak++;
      } else if (i > 0) {
        // Allow today to be incomplete (i === 0)
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, []);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: allChallenges } = await supabase
      .from("daily_challenges" as any)
      .select("*")
      .order("day_index");

    if (!allChallenges || allChallenges.length === 0) {
      setLoading(false);
      return;
    }

    const total = allChallenges.length;
    const indices = [
      dayOfYear % total,
      (dayOfYear + 1) % total,
      (dayOfYear + 2) % total,
    ];
    const todayChallenges = indices.map(i => allChallenges[i] as any as DailyChallenge);
    setChallenges(todayChallenges);

    const challengeIds = todayChallenges.map(c => c.id);
    const { data: completions } = await supabase
      .from("user_daily_challenges" as any)
      .select("challenge_id")
      .eq("user_id", user.id)
      .eq("completed_date", today)
      .in("challenge_id", challengeIds);

    const completed = new Set<string>();
    if (completions) {
      for (const c of completions as any[]) {
        completed.add(c.challenge_id);
      }
    }
    setCompletedIds(completed);

    const streak = await computeStreak(user.id);
    setChallengeStreak(streak);

    setLoading(false);
  }, [user, today, dayOfYear, computeStreak]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const completeChallenge = useCallback(async (challengeId: string) => {
    if (!user || completedIds.has(challengeId)) return false;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return false;

    const { error } = await supabase.from("user_daily_challenges" as any).insert({
      user_id: user.id,
      challenge_id: challengeId,
      completed_date: today,
    } as any);

    if (!error) {
      const newCompleted = new Set([...completedIds, challengeId]);
      setCompletedIds(newCompleted);

      const { multiplier, label } = getMultiplier(challengeStreak);
      const bonusXP = Math.round(challenge.xp_reward * multiplier);

      await addXP(bonusXP);
      showAchievementToast(
        challenge.title,
        multiplier > 1 ? `${label} streak bonus applied!` : "Daily challenge completed!",
        challenge.icon,
        bonusXP
      );

      // Check if all 3 are now complete → streak celebration
      const allDone = challenges.every(c => newCompleted.has(c.id));
      if (allDone) {
        setTimeout(() => {
          fireConfetti();
          toast.success("🔥 All daily challenges complete!", {
            description: `Challenge streak: ${challengeStreak + 1} day${challengeStreak > 0 ? "s" : ""}`,
          });
        }, 1200);
        setChallengeStreak(prev => prev + 1);
      }

      return true;
    }
    return false;
  }, [user, completedIds, challenges, today, addXP, challengeStreak]);

  const allCompleted = challenges.length > 0 && challenges.every(c => completedIds.has(c.id));
  const { multiplier, label: multiplierLabel } = getMultiplier(challengeStreak);
  const nextTier = getNextTier(challengeStreak);

  return {
    challenges, completedIds, loading, completeChallenge, allCompleted,
    challengeStreak, multiplier, multiplierLabel, nextTier,
    refresh: fetchChallenges,
  };
}
