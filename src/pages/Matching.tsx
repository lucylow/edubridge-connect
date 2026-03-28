import { useState, useEffect, useRef } from "react";
import { getMatches, getSmartMatchScore, type MatchResult, type SmartMatchResult } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Calendar, Loader2, Sparkles, UserCheck, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const quickSubjects = ["Algebra", "AP Biology", "English Essay", "Python", "Calculus", "Chemistry", "JavaScript", "Physics"];

const Matching = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [smartScores, setSmartScores] = useState<Record<string, SmartMatchResult>>({});
  const [scoringId, setScoringId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = async (s?: string) => {
    const query = s || subject;
    if (!query.trim()) return;
    setSubject(query);
    setLoading(true);
    setSearched(true);
    try {
      const results = await getMatches(query);
      setMatches(results);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSmartScore = async (tutorUser: MatchResult["user"]) => {
    if (!user || smartScores[tutorUser.id]) {
      setExpandedMatch(expandedMatch === tutorUser.id ? null : tutorUser.id);
      return;
    }
    setScoringId(tutorUser.id);
    setExpandedMatch(tutorUser.id);
    try {
      const result = await getSmartMatchScore(
        { name: user.name, subjects: user.subjects, grade: user.grade },
        { name: tutorUser.name, subjects: tutorUser.subjects, rating: tutorUser.rating }
      );
      setSmartScores(prev => ({ ...prev, [tutorUser.id]: result }));
    } catch {
      toast.error("Failed to get AI match analysis");
    } finally {
      setScoringId(null);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!subject.trim() || subject.length < 2) return;
    debounceRef.current = setTimeout(() => handleSearch(), 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  const roleLabel = user?.role === "tutor" ? "Learner" : "Tutor";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Find a {roleLabel}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Our AI matches you with the best-fit {roleLabel.toLowerCase()}s for your subject.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Search by subject (e.g., Algebra)"
            className="pl-10"
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={() => handleSearch()} disabled={loading || !subject.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {quickSubjects.map(s => (
          <button
            key={s}
            onClick={() => { setSubject(s); handleSearch(s); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              subject === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Finding best matches...</span>
        </div>
      )}

      <AnimatePresence>
        {!loading && searched && matches.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {matches.length} match{matches.length !== 1 ? "es" : ""} found, ranked by relevance
            </p>
            {matches.map((m, i) => (
              <motion.div
                key={m.user.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {m.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold flex items-center gap-2">
                        {m.user.name}
                        {m.score >= 85 && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Top Match</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{m.user.rating?.toFixed(1) || "—"}</span>
                        <span><UserCheck className="h-3 w-3 inline" /> {m.user.sessionsCompleted} sessions</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{m.user.bio || "No bio available"}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.user.subjects.map(s => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div>
                      <div className="text-2xl font-bold text-primary">{m.score}%</div>
                      <div className="text-[10px] text-muted-foreground">match score</div>
                    </div>
                    {/* Score breakdown */}
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${m.breakdown.subject}%` }} />
                        </div>
                        <span>Subject</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${m.breakdown.availability}%` }} />
                        </div>
                        <span>Avail.</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => handleGetSmartScore(m.user)} className="gap-1 text-xs">
                        {scoringId === m.user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                        AI Analysis
                        {expandedMatch === m.user.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                      <Link to={`/schedule/${m.user.id}`}>
                        <Button size="sm" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />Schedule</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* AI Smart Match Expanded */}
                <AnimatePresence>
                  {expandedMatch === m.user.id && smartScores[m.user.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
                          <Bot className="h-3.5 w-3.5" />AI Compatibility Analysis
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-muted rounded-xl p-2 text-center">
                            <div className="text-lg font-bold text-primary">{smartScores[m.user.id].overallScore}%</div>
                            <div className="text-[10px] text-muted-foreground">Overall</div>
                          </div>
                          <div className="bg-muted rounded-xl p-2 text-center">
                            <div className="text-lg font-bold text-primary">{smartScores[m.user.id].subjectMatch}%</div>
                            <div className="text-[10px] text-muted-foreground">Subject</div>
                          </div>
                          <div className="bg-muted rounded-xl p-2 text-center">
                            <div className="text-lg font-bold text-primary">{smartScores[m.user.id].gradeMatch}%</div>
                            <div className="text-[10px] text-muted-foreground">Grade</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-emerald-600 mb-1">✅ Strengths</p>
                            <ul className="space-y-0.5 text-muted-foreground">
                              {smartScores[m.user.id].strengths.map((s, i) => <li key={i}>• {s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-amber-600 mb-1">⚠️ Challenges</p>
                            <ul className="space-y-0.5 text-muted-foreground">
                              {smartScores[m.user.id].challenges.map((c, i) => <li key={i}>• {c}</li>)}
                            </ul>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 bg-muted rounded-lg p-2 italic">
                          💡 {smartScores[m.user.id].recommendation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {!loading && searched && matches.length === 0 && (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No {roleLabel.toLowerCase()}s found for "{subject}"</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try a different subject or broaden your search.</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-20">
          <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">Search a subject to find your perfect match</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Or click one of the quick tags above</p>
        </div>
      )}
    </div>
  );
};

export default Matching;
