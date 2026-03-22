const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface User {
  id: number;
  email: string;
  password?: string;
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
  id: number;
  tutorId: number;
  tutorName?: string;
  learnerId: number;
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

const mockUsers: User[] = [
  { id: 1, email: "tutor@example.com", password: "pass", role: "tutor", name: "Alex Chen", subjects: ["Algebra", "Python", "Calculus"], bio: "CS major with 3 years tutoring experience", rating: 4.9, sessionsCompleted: 47 },
  { id: 2, email: "learner@example.com", password: "pass", role: "learner", name: "Jamie Smith", subjects: ["Algebra"], grade: 10, bio: "10th grader looking for math help", rating: 4.7, sessionsCompleted: 12 },
  { id: 3, email: "priya@example.com", password: "pass", role: "tutor", name: "Priya Mehta", subjects: ["Algebra", "AP Biology", "Chemistry"], bio: "Pre-med student, specializes in AP Bio", rating: 4.8, sessionsCompleted: 34 },
  { id: 4, email: "carlos@example.com", password: "pass", role: "tutor", name: "Carlos Rivera", subjects: ["English Essay", "History", "Spanish"], bio: "English Lit major, published writer", rating: 4.6, sessionsCompleted: 28 },
  { id: 5, email: "maria@example.com", password: "pass", role: "tutor", name: "Maria Santos", subjects: ["Python", "JavaScript", "Algebra"], bio: "CS sophomore, teaches beginners with patience", rating: 4.95, sessionsCompleted: 52 },
];

const sessions: Session[] = [
  { id: 101, tutorId: 1, tutorName: "Alex Chen", learnerId: 2, learnerName: "Jamie Smith", subject: "Algebra", scheduledStart: new Date(Date.now() + 86400000).toISOString(), status: "scheduled" },
  { id: 102, tutorId: 3, tutorName: "Priya Mehta", learnerId: 2, learnerName: "Jamie Smith", subject: "AP Biology", scheduledStart: new Date(Date.now() + 172800000).toISOString(), status: "scheduled" },
];

export async function login(email: string, password: string) {
  await delay(600);
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid email or password");
  const { password: _, ...safeUser } = user;
  return { token: `mock-jwt-${user.id}`, user: safeUser as User };
}

export async function register(data: { name: string; email: string; password: string; role: "tutor" | "learner"; subjects: string[]; grade?: number }) {
  await delay(600);
  if (mockUsers.find(u => u.email === data.email)) throw new Error("Email already registered");
  const newUser: User = { id: Date.now(), ...data, bio: "", rating: 5.0, sessionsCompleted: 0 };
  mockUsers.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return { token: `mock-jwt-${newUser.id}`, user: safeUser as User };
}

export async function getCurrentUser(token: string): Promise<User> {
  await delay(300);
  const id = parseInt(token.split("-").pop() || "1");
  const user = mockUsers.find(u => u.id === id);
  if (!user) throw new Error("User not found");
  const { password: _, ...safeUser } = user;
  return safeUser as User;
}

export async function getMatches(subject: string): Promise<MatchResult[]> {
  await delay(800);
  const tutors = mockUsers.filter(u => u.role === "tutor");
  return tutors
    .map(t => {
      const subjectScore = t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase())) ? 0.9 + Math.random() * 0.1 : 0.2 + Math.random() * 0.3;
      const availScore = 0.6 + Math.random() * 0.4;
      const ratingScore = (t.rating || 4.5) / 5;
      const total = subjectScore * 0.6 + availScore * 0.3 + ratingScore * 0.1;
      return {
        user: { ...t, password: undefined } as User,
        score: Math.round(total * 100),
        breakdown: { subject: Math.round(subjectScore * 100), availability: Math.round(availScore * 100), rating: Math.round(ratingScore * 100) },
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function getUserSessions(userId: number): Promise<Session[]> {
  await delay(400);
  return sessions.filter(s => s.tutorId === userId || s.learnerId === userId);
}

export async function createSession(data: { tutorId: number; learnerId: number; subject: string; scheduledStart: string }): Promise<Session> {
  await delay(500);
  const tutor = mockUsers.find(u => u.id === data.tutorId);
  const learner = mockUsers.find(u => u.id === data.learnerId);
  const newSession: Session = {
    id: Date.now(),
    ...data,
    tutorName: tutor?.name,
    learnerName: learner?.name,
    status: "scheduled",
  };
  sessions.push(newSession);
  return newSession;
}

export async function generateLessonPlan(subject: string): Promise<string> {
  await delay(1200);
  const plans: Record<string, string> = {
    default: `📘 Lesson Plan: ${subject}\n\n1. Warm-up (5 min)\n   • Review previous concepts\n   • Quick knowledge check\n\n2. Core Lesson (20 min)\n   • Introduce new topic with examples\n   • Guided practice problems\n\n3. Independent Practice (15 min)\n   • Worksheet with 5 problems\n   • Apply concepts to real-world scenarios\n\n4. Wrap-up (5 min)\n   • Summarize key takeaways\n   • Assign practice for next session`,
  };
  return plans.default;
}
