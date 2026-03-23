
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('tutor', 'learner');

-- Create session_status enum
CREATE TYPE public.session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'learner',
  grade_level INT,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  sessions_completed INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subjects table
CREATE TABLE public.subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- User-subject join table
CREATE TABLE public.user_subjects (
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  subject_id INT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, subject_id)
);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  subject TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  status session_status NOT NULL DEFAULT 'scheduled',
  ai_lesson_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, reviewer_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subjects policies
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT USING (true);

-- User subjects policies
CREATE POLICY "User subjects are viewable by everyone" ON public.user_subjects FOR SELECT USING (true);
CREATE POLICY "Users can manage their own subjects" ON public.user_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subjects" ON public.user_subjects FOR DELETE USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON public.sessions FOR SELECT USING (auth.uid() = tutor_id OR auth.uid() = learner_id);
CREATE POLICY "Authenticated users can create sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Session participants can update" ON public.sessions FOR UPDATE USING (auth.uid() = tutor_id OR auth.uid() = learner_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their sessions" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'learner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed subjects
INSERT INTO public.subjects (name) VALUES
  ('Algebra'), ('Calculus'), ('AP Biology'), ('Chemistry'),
  ('English Essay'), ('History'), ('Python'), ('JavaScript'), ('Spanish');
