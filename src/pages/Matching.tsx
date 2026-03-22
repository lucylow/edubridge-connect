import { useState } from "react";
import { getMatches, type MatchResult } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const quickSubjects = ["Algebra", "AP Biology", "English Essay", "Python", "Calculus", "Chemistry"];

const Matching = () => {
  const [subject, setSubject] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Find a Tutor</h1>
      <p className="text-muted-foreground mb-6">Our AI matches you with the best-fit tutors for your subject.</p>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter a subject (e.g., Algebra)" className="flex-1"
          onKeyDown={e => e.key === "Enter" && handleSearch()} />
        <Button onClick={() => handleSearch()} className="gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {quickSubjects.map(s => (
          <button key={s} onClick={() => handleSearch(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${subject === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Finding best matches...</span>
        </div>
      )}

      {!loading && searched && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map(m => (
            <div key={m.user.id} className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {m.user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-bold">{m.user.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{m.user.rating}</span>
                        <span>{m.user.sessionsCompleted} sessions</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{m.user.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.user.subjects.map(s => (
                      <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-primary">{m.score}%</div>
                  <div className="text-xs text-muted-foreground mb-3">match score</div>
                  <Link to={`/schedule/${m.user.id}`}>
                    <Button size="sm" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />Schedule</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && matches.length === 0 && (
        <p className="text-center text-muted-foreground py-16">No tutors found for "{subject}". Try a different subject.</p>
      )}
    </div>
  );
};

export default Matching;
