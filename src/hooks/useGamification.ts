import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { showAchievementToast } from "@/components/AchievementToast";

export interface GamificationStats {
  xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date: string | null;
  quizzes_taken: number;
  flashcards_studied: number;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: string;
  earned_at?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  xp: number;
  level: number;
  streak_days: number;
  avatar_url: string | null;
}

const XP_PER_LEVEL = 100;

export function xpForLevel(level: number) {
  return level * XP_PER_LEVEL;
}

export function xpProgress(xp: number, level: number) {
  const base = ((level - 1) * level / 2) * XP_PER_LEVEL;
  const current = xp - base;
  const needed = xpForLevel(level);
  return { current: Math.max(0, current), needed, percent: Math.min(100, Math.round((current / needed) * 100)) };
}

export function useGamification() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [statsRes, achievementsRes, earnedRes, leaderRes] = await Promise.all([
      supabase.from("gamification_stats" as any).select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("achievements" as any).select("*").order("category"),
      supabase.from("user_achievements" as any).select("*, achievements(*)").eq("user_id", user.id),
      supabase.from("gamification_stats" as any).select("user_id, xp, level, streak_days").order("xp", { ascending: false }).limit(10),
    ]);

    if (statsRes.data) {
      setStats(statsRes.data as any);
    } else {
      // Auto-create if missing
      await supabase.from("gamification_stats" as any).insert({ user_id: user.id });
      setStats({ xp: 0, level: 1, streak_days: 0, longest_streak: 0, last_activity_date: null, quizzes_taken: 0, flashcards_studied: 0 });
    }

    setAchievements((achievementsRes.data as any) || []);

    const earned = new Set<string>();
    const enriched: Achievement[] = [];
    if (earnedRes.data) {
      for (const ua of earnedRes.data as any[]) {
        if (ua.achievements) {
          earned.add(ua.achievements.key);
          enriched.push({ ...ua.achievements, earned_at: ua.earned_at });
        }
      }
    }
    setEarnedKeys(earned);

    // Fetch leaderboard with profile names
    if (leaderRes.data) {
      const userIds = (leaderRes.data as any[]).map((e: any) => e.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setLeaderboard((leaderRes.data as any[]).map((e: any) => ({
        ...e,
        name: profileMap.get(e.user_id)?.name || "Unknown",
        avatar_url: profileMap.get(e.user_id)?.avatar_url || null,
      })));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addXP = useCallback(async (amount: number) => {
    if (!user || !stats) return;
    const newXP = stats.xp + amount;
    let newLevel = stats.level;
    while (newXP >= ((newLevel * (newLevel + 1)) / 2) * XP_PER_LEVEL) {
      newLevel++;
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = stats.streak_days;
    if (stats.last_activity_date !== today) {
      newStreak = stats.last_activity_date === yesterday ? stats.streak_days + 1 : 1;
    }
    const longestStreak = Math.max(stats.longest_streak, newStreak);

    await supabase.from("gamification_stats" as any).update({
      xp: newXP,
      level: newLevel,
      streak_days: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    } as any).eq("user_id", user.id);

    setStats(prev => prev ? { ...prev, xp: newXP, level: newLevel, streak_days: newStreak, longest_streak: longestStreak, last_activity_date: today } : prev);
    return { newXP, newLevel, newStreak };
  }, [user, stats]);

  const recordQuiz = useCallback(async (perfect: boolean) => {
    if (!user || !stats) return;
    const newCount = stats.quizzes_taken + 1;
    await supabase.from("gamification_stats" as any).update({ quizzes_taken: newCount } as any).eq("user_id", user.id);
    setStats(prev => prev ? { ...prev, quizzes_taken: newCount } : prev);
    await addXP(25);

    // Check achievements
    if (newCount === 1) await tryEarnAchievement("first_quiz");
    if (newCount >= 5) await tryEarnAchievement("five_quizzes");
    if (perfect) await tryEarnAchievement("perfect_quiz");
  }, [user, stats, addXP]);

  const recordFlashcards = useCallback(async () => {
    if (!user || !stats) return;
    const newCount = stats.flashcards_studied + 1;
    await supabase.from("gamification_stats" as any).update({ flashcards_studied: newCount } as any).eq("user_id", user.id);
    setStats(prev => prev ? { ...prev, flashcards_studied: newCount } : prev);
    await addXP(15);
    if (newCount === 1) await tryEarnAchievement("first_flashcard");
  }, [user, stats, addXP]);

  const tryEarnAchievement = useCallback(async (key: string) => {
    if (!user || earnedKeys.has(key)) return false;
    const achievement = achievements.find(a => a.key === key);
    if (!achievement) return false;

    const { error } = await supabase.from("user_achievements" as any).insert({
      user_id: user.id,
      achievement_id: achievement.id,
    } as any);

    if (!error) {
      setEarnedKeys(prev => new Set([...prev, key]));
      if (achievement.xp_reward > 0) await addXP(achievement.xp_reward);
      return true;
    }
    return false;
  }, [user, earnedKeys, achievements, addXP]);

  const checkStreakAchievements = useCallback(async () => {
    if (!stats) return;
    if (stats.streak_days >= 3) await tryEarnAchievement("streak_3");
    if (stats.streak_days >= 7) await tryEarnAchievement("streak_7");
    if (stats.streak_days >= 30) await tryEarnAchievement("streak_30");
    if (stats.level >= 5) await tryEarnAchievement("level_5");
    if (stats.level >= 10) await tryEarnAchievement("level_10");
  }, [stats, tryEarnAchievement]);

  useEffect(() => {
    if (stats) checkStreakAchievements();
  }, [stats?.streak_days, stats?.level]);

  return { stats, achievements, earnedKeys, leaderboard, loading, addXP, recordQuiz, recordFlashcards, tryEarnAchievement, refresh: fetchAll };
}
