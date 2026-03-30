
-- Gamification stats per user
CREATE TABLE public.gamification_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_days integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  quizzes_taken integer NOT NULL DEFAULT 0,
  flashcards_studied integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Achievements/badges
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  xp_reward integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general'
);

-- User earned achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- RLS
ALTER TABLE public.gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Gamification stats policies
CREATE POLICY "Users can view all stats" ON public.gamification_stats FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert own stats" ON public.gamification_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.gamification_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Achievements viewable by all" ON public.achievements FOR SELECT TO public USING (true);

-- User achievements policies
CREATE POLICY "User achievements viewable by all" ON public.user_achievements FOR SELECT TO public USING (true);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed default achievements
INSERT INTO public.achievements (key, title, description, icon, xp_reward, category) VALUES
  ('first_session', 'First Session', 'Complete your first tutoring session', 'star', 50, 'sessions'),
  ('five_sessions', 'Dedicated Learner', 'Complete 5 tutoring sessions', 'award', 150, 'sessions'),
  ('ten_sessions', 'Session Pro', 'Complete 10 tutoring sessions', 'trophy', 300, 'sessions'),
  ('first_quiz', 'Quiz Starter', 'Take your first AI quiz', 'brain', 30, 'quizzes'),
  ('five_quizzes', 'Quiz Master', 'Complete 5 AI quizzes', 'zap', 100, 'quizzes'),
  ('perfect_quiz', 'Perfect Score', 'Get 100% on any quiz', 'crown', 200, 'quizzes'),
  ('first_flashcard', 'Card Collector', 'Study your first flashcard deck', 'layers', 30, 'study'),
  ('streak_3', 'On Fire', 'Maintain a 3-day learning streak', 'flame', 75, 'streaks'),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day learning streak', 'flame', 200, 'streaks'),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day learning streak', 'flame', 500, 'streaks'),
  ('level_5', 'Rising Star', 'Reach level 5', 'trending-up', 100, 'levels'),
  ('level_10', 'Scholar', 'Reach level 10', 'graduation-cap', 250, 'levels');

-- Auto-create gamification stats for new users via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.gamification_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_gamification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_gamification();
