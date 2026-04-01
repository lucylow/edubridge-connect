
-- Daily challenges definition table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  icon TEXT NOT NULL DEFAULT 'target',
  day_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily challenges viewable by all"
ON public.daily_challenges FOR SELECT
USING (true);

-- User completions tracking
CREATE TABLE public.user_daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, completed_date)
);

ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all completions"
ON public.user_daily_challenges FOR SELECT
USING (true);

CREATE POLICY "Users can complete challenges"
ON public.user_daily_challenges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Seed 14 rotating challenges
INSERT INTO public.daily_challenges (title, description, challenge_type, xp_reward, icon, day_index) VALUES
('Quiz Master', 'Complete 1 quiz on any subject', 'quiz', 50, 'brain', 0),
('Flashcard Sprint', 'Study 1 flashcard deck', 'flashcard', 40, 'layers', 1),
('Double Down', 'Complete 2 quizzes today', 'quiz', 75, 'zap', 2),
('Study Buddy', 'Send a message in a session', 'session', 40, 'message-circle', 3),
('Knowledge Seeker', 'Generate study tips with AI', 'ai', 35, 'sparkles', 4),
('Perfect Score', 'Score 100% on any quiz', 'quiz_perfect', 100, 'trophy', 5),
('Card Collector', 'Generate flashcards on a new topic', 'flashcard', 45, 'bookmark', 6),
('Early Bird', 'Complete any learning activity before noon', 'general', 30, 'sunrise', 7),
('Deep Dive', 'Take a quiz with 10+ questions', 'quiz', 60, 'target', 8),
('AI Explorer', 'Ask the AI assistant 3 questions', 'ai', 50, 'bot', 9),
('Review Time', 'Leave a review for a tutor', 'review', 35, 'star', 10),
('Streak Builder', 'Maintain your daily streak', 'streak', 40, 'flame', 11),
('Lesson Planner', 'Generate an AI lesson plan', 'ai', 45, 'graduation-cap', 12),
('Marathon Learner', 'Complete 3 different activities', 'general', 80, 'award', 13);
