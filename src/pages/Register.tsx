import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, AlertCircle } from "lucide-react";

const subjectOptions = ["Algebra", "Calculus", "AP Biology", "Chemistry", "English Essay", "History", "Python", "JavaScript", "Spanish"];

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "learner" as "tutor" | "learner", subjects: [] as string[], grade: undefined as number | undefined });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleSubject = (s: string) => {
    setForm(f => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.subjects.length === 0) { setError("Select at least one subject"); return; }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "tutor" ? "/tutor/dashboard" : "/learner/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Join EduBridge</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your free account</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl p-3 mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full name</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required minLength={4} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">I am a...</label>
              <div className="flex gap-3">
                {(["tutor", "learner"] as const).map(r => (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all active:scale-95 ${form.role === r ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"}`}>
                    {r === "tutor" ? "🎓 Tutor" : "📚 Learner"}
                  </button>
                ))}
              </div>
            </div>

            {form.role === "learner" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Grade level</label>
                <Input type="number" min={1} max={12} value={form.grade || ""} onChange={e => setForm(f => ({ ...f, grade: parseInt(e.target.value) || undefined }))} placeholder="e.g. 10" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">{form.role === "tutor" ? "Subjects I teach" : "Subjects I need help with"}</label>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map(s => (
                  <button key={s} type="button" onClick={() => toggleSubject(s)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${form.subjects.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
