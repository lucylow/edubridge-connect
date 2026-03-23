import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentProfile, type User } from "@/services/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: "tutor" | "learner"; subjects: string[]; grade?: number }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase auth
        setTimeout(async () => {
          const profile = await getCurrentProfile();
          setUser(profile);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getCurrentProfile();
        setUser(profile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Profile not found");
    setUser(profile);
    return profile;
  };

  const register = async (data: { name: string; email: string; password: string; role: "tutor" | "learner"; subjects: string[]; grade?: number }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, role: data.role },
      },
    });
    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error("Signup failed");

    // Wait briefly for the trigger to create the profile
    await new Promise(r => setTimeout(r, 500));

    // Update profile with grade if learner
    if (data.grade) {
      await supabase.from("profiles").update({ grade_level: data.grade }).eq("user_id", authData.user.id);
    }

    // Insert user subjects
    if (data.subjects.length > 0) {
      const { data: subjectRows } = await supabase.from("subjects").select("id, name").in("name", data.subjects);
      if (subjectRows && subjectRows.length > 0) {
        await supabase.from("user_subjects").insert(
          subjectRows.map(s => ({ user_id: authData.user!.id, subject_id: s.id }))
        );
      }
    }

    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Profile not found after registration");
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
