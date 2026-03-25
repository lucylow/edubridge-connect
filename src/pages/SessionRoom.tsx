import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { generateLessonPlan, generateSessionSummary } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video, Mic, MicOff, VideoOff, FileText, Send, Loader2, MonitorUp, Star, MessageSquare, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMsg {
  text: string;
  fromMe: boolean;
  time: string;
}

interface SessionData {
  id: string;
  subject: string | null;
  status: string;
  tutor_id: string;
  learner_id: string;
  ai_lesson_plan: string | null;
  tutor?: { name: string } | null;
  learner?: { name: string } | null;
}

const SessionRoom = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sessionSummary, setSessionSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return;
    supabase
      .from("sessions")
      .select("id, subject, status, tutor_id, learner_id, ai_lesson_plan, tutor:profiles!sessions_tutor_id_fkey(name), learner:profiles!sessions_learner_id_fkey(name)")
      .eq("id", sessionId)
      .single()
      .then(({ data }) => {
        if (data) {
          const s = data as unknown as SessionData;
          setSession(s);
          if (s.ai_lesson_plan) setLessonPlan(s.ai_lesson_plan);
        }
      });
  }, [sessionId]);

  // Realtime session updates
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` }, (payload) => {
        const updated = payload.new as Record<string, unknown>;
        setSession(prev => prev ? { ...prev, ...updated } : prev);
        if (updated.ai_lesson_plan && typeof updated.ai_lesson_plan === "string") {
          setLessonPlan(updated.ai_lesson_plan);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { text: input, fromMe: true, time: now }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Got it! Let me think about that...", fromMe: false, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const subject = session?.subject || "General";
      const plan = await generateLessonPlan(subject);
      setLessonPlan(plan);
      // Save to database
      if (sessionId) {
        await supabase.from("sessions").update({ ai_lesson_plan: plan }).eq("id", sessionId);
        toast.success("Lesson plan generated & saved!");
      }
    } catch {
      toast.error("Failed to generate lesson plan");
    }
    setGenerating(false);
  };

  const handleSubmitReview = async () => {
    if (!user || !session || !sessionId) return;
    setSubmittingReview(true);
    try {
      const revieweeId = user.id === session.tutor_id ? session.learner_id : session.tutor_id;
      const { error } = await supabase.from("reviews").insert({
        session_id: sessionId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating: reviewRating,
        comment: reviewComment || null,
      });
      if (error) throw error;
      toast.success("Review submitted!");
      setShowReview(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!session || !sessionId) return;
    setGeneratingSummary(true);
    try {
      const summary = await generateSessionSummary({
        sessionId,
        subject: session.subject || undefined,
        tutorName: (session.tutor as { name: string } | null)?.name,
        learnerName: (session.learner as { name: string } | null)?.name,
      });
      setSessionSummary(summary);
      toast.success("Session summary generated!");
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const otherName = user?.id === session?.tutor_id
    ? (session?.learner as { name: string } | null)?.name || "Learner"
    : (session?.tutor as { name: string } | null)?.name || "Tutor";

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-bold">{session?.subject || "Session"} with {otherName}</h1>
          <p className="text-xs text-muted-foreground capitalize">Status: {session?.status || "loading..."}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={micOn ? "default" : "destructive"} size="icon" onClick={() => setMicOn(!micOn)}>
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button variant={camOn ? "default" : "destructive"} size="icon" onClick={() => setCamOn(!camOn)}>
            {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          {session?.status === "completed" && (
            <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setShowReview(true)}>
              <Star className="h-3.5 w-3.5" />Review
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-foreground/5 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <MonitorUp className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Video call area</p>
              <p className="text-xs text-muted-foreground/60">Connect to a video provider to go live</p>
            </div>
            {!camOn && (
              <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* AI Lesson Plan */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />AI Lesson Plan</h3>
              <Button size="sm" variant="secondary" onClick={handleGeneratePlan} disabled={generating} className="gap-1.5">
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
            {lessonPlan ? (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted rounded-xl p-4 font-sans">{lessonPlan}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">Click "Generate" to create an AI-powered lesson plan for this session.</p>
            )}
          </div>

          {/* Review Modal */}
          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="bg-card rounded-2xl p-5 border border-border"
              >
                <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-primary" />Leave a Review
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setReviewRating(n)} className="focus:outline-none">
                          <Star className={`h-6 w-6 transition-colors ${n <= reviewRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Comment (optional)</label>
                    <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2} placeholder="How was the session?" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitReview} disabled={submittingReview} className="gap-1.5">
                      {submittingReview ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
                      Submit Review
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowReview(false)}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat */}
        <div className="bg-card rounded-2xl border border-border flex flex-col h-[500px] lg:h-auto">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-sm">Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-8">Send a message to start chatting...</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.fromMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.fromMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
              onKeyDown={e => e.key === "Enter" && sendMessage()} className="flex-1" />
            <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
