import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  role: "tutor" | "learner";
  name: string;
  subjects: string[];
  grade?: number;
  bio?: string;
  avatar?: string;
  rating?: number;
  sessionsCompleted?: number;
}

export interface Session {
  id: string;
  tutorId: string;
  tutorName?: string;
  learnerId: string;
  learnerName?: string;
  subject?: string;
  scheduledStart: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface MatchResult {
  user: User;
  score: number;
  breakdown: { subject: number; availability: number; rating: number };
}

// Helper to convert profile row + subjects to User
function profileToUser(profile: any, subjects: string[] = []): User {
  return {
    id: profile.user_id,
    email: profile.email || "",
    role: profile.role,
    name: profile.name,
    subjects,
    grade: profile.grade_level ?? undefined,
    bio: profile.bio ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    rating: profile.rating ? parseFloat(profile.rating) : undefined,
    sessionsCompleted: profile.sessions_completed ?? 0,
  };
}

export async function getCurrentProfile(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", authUser.id)
    .single();
  if (!profile) return null;

  const { data: userSubjects } = await supabase
    .from("user_subjects")
    .select("subject_id, subjects(name)")
    .eq("user_id", authUser.id);

  const subjects = (userSubjects || []).map((us: any) => us.subjects?.name).filter(Boolean);

  return profileToUser({ ...profile, email: authUser.email }, subjects);
}

export async function getMatches(subject: string): Promise<MatchResult[]> {
  // Get all tutors
  const { data: tutors } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "tutor");
  if (!tutors || tutors.length === 0) return [];

  // Get their subjects
  const tutorIds = tutors.map(t => t.user_id);
  const { data: allUserSubjects } = await supabase
    .from("user_subjects")
    .select("user_id, subjects(name)")
    .in("user_id", tutorIds as string[]);

  const subjectsByUser: Record<string, string[]> = {};
  (allUserSubjects || []).forEach((us: any) => {
    if (!subjectsByUser[us.user_id]) subjectsByUser[us.user_id] = [];
    if (us.subjects?.name) subjectsByUser[us.user_id].push(us.subjects.name);
  });

  return tutors
    .map(t => {
      const tutorSubjects = subjectsByUser[t.user_id] || [];
      const subjectScore = tutorSubjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))
        ? 0.9 + Math.random() * 0.1
        : 0.2 + Math.random() * 0.3;
      const availScore = 0.6 + Math.random() * 0.4;
      const ratingScore = (Number(t.rating) || 4.5) / 5;
      const total = subjectScore * 0.6 + availScore * 0.3 + ratingScore * 0.1;

      return {
        user: profileToUser(t, tutorSubjects),
        score: Math.round(total * 100),
        breakdown: {
          subject: Math.round(subjectScore * 100),
          availability: Math.round(availScore * 100),
          rating: Math.round(ratingScore * 100),
        },
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const { data } = await supabase
    .from("sessions")
    .select(`
      id, tutor_id, learner_id, subject, scheduled_start, status,
      tutor:profiles!sessions_tutor_id_fkey(name),
      learner:profiles!sessions_learner_id_fkey(name)
    `)
    .or(`tutor_id.eq.${userId},learner_id.eq.${userId}`)
    .order("scheduled_start", { ascending: true });

  return (data || []).map((s: any) => ({
    id: s.id,
    tutorId: s.tutor_id,
    tutorName: s.tutor?.name,
    learnerId: s.learner_id,
    learnerName: s.learner?.name,
    subject: s.subject,
    scheduledStart: s.scheduled_start,
    status: s.status,
  }));
}

export async function createSession(data: {
  tutorId: string;
  learnerId: string;
  subject: string;
  scheduledStart: string;
}): Promise<Session> {
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      tutor_id: data.tutorId,
      learner_id: data.learnerId,
      subject: data.subject,
      scheduled_start: data.scheduledStart,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: session.id,
    tutorId: session.tutor_id,
    learnerId: session.learner_id,
    subject: session.subject,
    scheduledStart: session.scheduled_start,
    status: session.status as Session["status"],
  };
}

export async function generateLessonPlan(subject: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-lesson-plan", {
    body: { subject },
  });
  if (error) throw new Error(error.message);
  return data.lessonPlan;
}
