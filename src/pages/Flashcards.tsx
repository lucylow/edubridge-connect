import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, RotateCcw, ChevronLeft, ChevronRight, Lightbulb, Shuffle,
  Check, X, Eye, Layers, Sparkles,
} from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  mastered?: boolean;
}

interface Deck {
  title: string;
  cards: Flashcard[];
}

export default function Flashcards() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState("10");
  const [difficulty, setDifficulty] = useState("medium");
  const [generating, setGenerating] = useState(false);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  const generate = useCallback(async () => {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("generate-flashcards", {
        body: {
          topic: topic.trim(),
          numCards: parseInt(numCards),
          difficulty,
          gradeLevel: user?.grade,
        },
      });
      if (error) throw error;
      if (data?.deck?.cards?.length) {
        setDeck(data.deck);
        setCurrentIndex(0);
        setFlipped(false);
        setShowHint(false);
        setMasteredCards(new Set());
        toast.success(`Generated ${data.deck.cards.length} flashcards!`);
      } else {
        toast.error("No flashcards generated. Try a different topic.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  }, [topic, numCards, difficulty, user?.grade]);

  const navigate = (dir: -1 | 1) => {
    if (!deck) return;
    setFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + dir + deck.cards.length) % deck.cards.length);
  };

  const toggleMastered = () => {
    setMasteredCards(prev => {
      const next = new Set(prev);
      next.has(currentIndex) ? next.delete(currentIndex) : next.add(currentIndex);
      return next;
    });
  };

  const shuffleDeck = () => {
    if (!deck) return;
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck({ ...deck, cards: shuffled });
    setCurrentIndex(0);
    setFlipped(false);
    setShowHint(false);
    setMasteredCards(new Set());
    toast.success("Deck shuffled!");
  };

  const studyUnmastered = () => {
    if (!deck) return;
    const unmasteredIdx = deck.cards.findIndex((_, i) => !masteredCards.has(i));
    if (unmasteredIdx === -1) { toast.success("All cards mastered! 🎉"); return; }
    setCurrentIndex(unmasteredIdx);
    setFlipped(false);
    setShowHint(false);
  };

  const card = deck?.cards[currentIndex];
  const progress = deck ? (masteredCards.size / deck.cards.length) * 100 : 0;
  const diffColors = { easy: "text-emerald-500 bg-emerald-500/10", medium: "text-amber-500 bg-amber-500/10", hard: "text-red-500 bg-red-500/10" };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">AI Flashcards</h1>
          <p className="text-sm text-muted-foreground">Generate flashcards on any topic for spaced repetition</p>
        </div>
      </div>

      {/* Generator */}
      <div className="bg-card rounded-2xl p-5 border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Enter a topic (e.g. Photosynthesis, WW2, Algebra)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            className="flex-1"
          />
          <Select value={numCards} onValueChange={setNumCards}>
            <SelectTrigger className="w-24 shrink-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 10, 15, 20].map(n => <SelectItem key={n} value={String(n)}>{n} cards</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-28 shrink-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={generating} className="gap-2 shrink-0">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      {/* Flashcard viewer */}
      {deck && card && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{masteredCards.size} / {deck.cards.length} mastered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Card */}
          <div
            className="relative cursor-pointer perspective-1000 mb-4"
            style={{ minHeight: 280 }}
            onClick={() => setFlipped(!flipped)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${flipped}`}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`bg-card rounded-2xl border-2 p-8 flex flex-col items-center justify-center text-center min-h-[280px] ${
                  masteredCards.has(currentIndex)
                    ? "border-emerald-500/50"
                    : flipped ? "border-primary/50" : "border-border"
                }`}
              >
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffColors[card.difficulty]}`}>
                    {card.difficulty}
                  </span>
                  {masteredCards.has(currentIndex) && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-500 bg-emerald-500/10">
                      ✓ mastered
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 text-xs text-muted-foreground">
                  {currentIndex + 1} / {deck.cards.length}
                </div>

                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  {flipped ? "Answer" : "Question"}
                </p>
                <p className={`text-lg font-medium leading-relaxed ${flipped ? "text-primary" : "text-foreground"}`}>
                  {flipped ? card.back : card.front}
                </p>

                {!flipped && (
                  <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-amber-500/10 rounded-xl p-3 mb-4 overflow-hidden"
              >
                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                  {card.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate(1)} className="gap-1">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="ghost" onClick={() => setShowHint(!showHint)} className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />{showHint ? "Hide Hint" : "Hint"}
              </Button>
              <Button size="sm" variant="ghost" onClick={toggleMastered} className="gap-1.5">
                {masteredCards.has(currentIndex)
                  ? <><X className="h-3.5 w-3.5" />Unmark</>
                  : <><Check className="h-3.5 w-3.5" />Mastered</>
                }
              </Button>
              <Button size="sm" variant="ghost" onClick={shuffleDeck} className="gap-1.5">
                <Shuffle className="h-3.5 w-3.5" />Shuffle
              </Button>
              <Button size="sm" variant="ghost" onClick={studyUnmastered} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />Review
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
