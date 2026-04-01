import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/hooks/useGamification";
import { showAchievementToast } from "@/components/AchievementToast";

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  xp_reward: number;
  icon: string;
  day_index: number;
}

export function useDailyChallenges() {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get 3 challenges for today based on day of year rotation
    const { data: allChallenges } = await supabase
      .from("daily_challenges" as any)
      .select("*")
      .order("day_index");

    if (!allChallenges || allChallenges.length === 0) {
      setLoading(false);
      return;
    }

    // Pick 3 rotating challenges
    const total = allChallenges.length;
    const indices = [
      dayOfYear % total,
      (dayOfYear + 1) % total,
      (dayOfYear + 2) % total,
    ];
    const todayChallenges = indices.map(i => allChallenges[i] as any as DailyChallenge);
    setChallenges(todayChallenges);

    // Check completions
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
    setLoading(false);
  }, [user, today, dayOfYear]);

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
      setCompletedIds(prev => new Set([...prev, challengeId]));
      await addXP(challenge.xp_reward);
      showAchievementToast(
        challenge.title,
        `Daily challenge completed!`,
        challenge.icon,
        challenge.xp_reward
      );
      return true;
    }
    return false;
  }, [user, completedIds, challenges, today, addXP]);

  const allCompleted = challenges.length > 0 && challenges.every(c => completedIds.has(c.id));

  return { challenges, completedIds, loading, completeChallenge, allCompleted, refresh: fetchChallenges };
}
