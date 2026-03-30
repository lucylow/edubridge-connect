import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { generateQuiz, type Quiz, type QuizQuestion } from "@/services/api";
import { useGamification } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, Loader2, CheckCircle2, XCircle, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Quiz = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(user?.subjects?.[0] || "");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const { recordQuiz } = useGamification();

  const handleGenerate = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const result = await generateQuiz({ subject, topic: topic || undefined, gradeLevel: user?.grade, numQuestions, difficulty });
      setQuiz(result);
      toast.success("Quiz generated!");
    } catch {
      toast.error("Failed to generate quiz. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setSubmitted(true);
  };

  const score = quiz
    ? quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          AI Quiz Generator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Generate practice quizzes powered by AI to test your knowledge.</p>
      </div>

      {/* Generator form */}
      <div className="bg-card rounded-2xl p-5 border border-border mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Subject *</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Algebra" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Topic (optional)</label>
            <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Quadratic equations" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Difficulty</label>
            <Select value={difficulty} onValueChange={v => setDifficulty(v as "easy" | "medium" | "hard")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Questions</label>
            <Select value={String(numQuestions)} onValueChange={v => setNumQuestions(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading || !subject.trim()} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate Quiz"}
        </Button>
      </div>

      {/* Quiz */}
      <AnimatePresence>
        {quiz && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-lg font-bold">{quiz.title}</h2>

            {quiz.questions.map((q, qi) => (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border"
              >
                <p className="font-medium mb-3">
                  <span className="text-primary mr-2">Q{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const isCorrect = q.correctIndex === oi;
                    let cls = "border border-border bg-muted/50 hover:bg-accent";
                    if (submitted && isCorrect) cls = "border-emerald-500 bg-emerald-500/10";
                    else if (submitted && selected && !isCorrect) cls = "border-destructive bg-destructive/10";
                    else if (selected) cls = "border-primary bg-primary/10";

                    return (
                      <button
                        key={oi}
                        onClick={() => selectAnswer(qi, oi)}
                        className={`p-3 rounded-xl text-left text-sm transition-all ${cls}`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                        {submitted && isCorrect && <CheckCircle2 className="inline h-4 w-4 ml-2 text-emerald-500" />}
                        {submitted && selected && !isCorrect && <XCircle className="inline h-4 w-4 ml-2 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground mt-3 bg-muted rounded-xl p-3">
                    💡 {q.explanation}
                  </motion.p>
                )}
              </motion.div>
            ))}

            {!submitted ? (
              <Button onClick={handleSubmit} size="lg" className="w-full gap-2">
                <CheckCircle2 className="h-4 w-4" />Submit Answers
              </Button>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-6 border border-border text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  {score}/{quiz.questions.length}
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {score === quiz.questions.length ? "Perfect score! 🎉" : score >= quiz.questions.length * 0.7 ? "Great job! 🌟" : "Keep practicing! 💪"}
                </p>
                <Button variant="secondary" onClick={handleGenerate} className="gap-2">
                  <RotateCcw className="h-4 w-4" />New Quiz
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
