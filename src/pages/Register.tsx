import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, AlertCircle, GraduationCap, BookMarked, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const subjectOptions = ["Algebra", "Calculus", "AP Biology", "Chemistry", "English Essay", "History", "Python", "JavaScript", "Spanish", "Physics", "Geometry", "Web Development"];

const steps = [
  { title: "Choose your role", description: "How will you use EduBridge?" },
  { title: "Your details", description: "Let's set up your account" },
  { title: "Subjects", description: "What are you interested in?" },
];

const Register = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as "tutor" | "learner" | "",
    subjects: [] as string[],
    grade: undefined as number | undefined,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleSubject = (s: string) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s],
    }));
  };

  const canProceed = () => {
    if (step === 0) return form.role !== "";
    if (step === 1) return form.name && form.email && form.password.length >= 4;
    if (step === 2) return form.subjects.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < 2) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (form.subjects.length === 0) {
      setError("Select at least one subject");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role as "tutor" | "learner",
        subjects: form.subjects,
        grade: form.grade,
      });
      navigate(user.role === "tutor" ? "/tutor/dashboard" : "/learner/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 }),
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Join EduBridge</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your free account</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-6 px-4">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded transition-all ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
          <div className="mb-6">
            <h2 className="font-bold text-lg">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground">{steps[step].description}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl p-3 mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {/* Step 0: Role selection */}
              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {([
                    { role: "learner" as const, icon: BookMarked, title: "I'm a Learner", desc: "Find tutors and get help with subjects" },
                    { role: "tutor" as const, icon: GraduationCap, title: "I'm a Tutor", desc: "Volunteer to teach and share knowledge" },
                  ]).map(opt => (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: opt.role }))}
                      className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.98] ${
                        form.role === opt.role
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <opt.icon className={`h-10 w-10 mb-3 ${form.role === opt.role ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-bold text-sm">{opt.title}</span>
                      <span className="text-xs text-muted-foreground mt-1">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Account details */}
              {step === 1 && (
                <div className="space-y-4">
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
                  {form.role === "learner" && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Grade level (optional)</label>
                      <Input type="number" min={1} max={12} value={form.grade || ""} onChange={e => setForm(f => ({ ...f, grade: parseInt(e.target.value) || undefined }))} placeholder="e.g. 10" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Subjects */}
              {step === 2 && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    {form.role === "tutor" ? "Subjects I can teach" : "Subjects I need help with"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subjectOptions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject(s)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                          form.subjects.includes(s)
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        {form.subjects.includes(s) && <Check className="h-3 w-3 inline mr-1" />}
                        {s}
                      </button>
                    ))}
                  </div>
                  {form.subjects.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-3">{form.subjects.length} subject{form.subjects.length !== 1 ? "s" : ""} selected</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-1.5">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !canProceed()} size="lg" className="gap-1.5">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-center text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
