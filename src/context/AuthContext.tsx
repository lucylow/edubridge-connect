import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, getCurrentUser, type User } from "@/services/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem("edubridge_token"));

  useEffect(() => {
    if (token) {
      getCurrentUser(token)
        .then(setUser)
        .catch(() => { localStorage.removeItem("edubridge_token"); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem("edubridge_token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { name: string; email: string; password: string; role: "tutor" | "learner"; subjects: string[]; grade?: number }) => {
    const res = await apiRegister(data);
    localStorage.setItem("edubridge_token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("edubridge_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
