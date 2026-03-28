import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { generateLessonPlan, generateSessionSummary } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useSessionChat } from "@/hooks/useSessionChat";
import { useAITutorChat } from "@/hooks/useAITutorChat";
import MarkdownContent from "@/components/MarkdownContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video, Mic, MicOff, VideoOff, FileText, Send, Loader2,
  MonitorUp, Star, MessageSquare, ClipboardList, Bot, Users
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const [chatInput, setChatInput] = useState("");
  const [aiInput, setAiInput] = useState("");
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
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // Real-time chat
  const { messages: chatMessages, sendMessage: sendChatMessage } = useSessionChat(sessionId);

  // AI tutor chat
  const { messages: aiMessages, isLoading: aiLoading, send: sendAiMessage } = useAITutorChat(
    session?.subject || undefined,
    user?.grade
  );

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

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);
  useEffect(() => { aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleSendAi = () => {
    if (!aiInput.trim() || aiLoading) return;
    sendAiMessage(aiInput);
    setAiInput("");
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const subject = session?.subject || "General";
      const plan = await generateLessonPlan(subject);
      setLessonPlan(plan);
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

  // Profiles lookup for sender names
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!session) return;
    const ids = [session.tutor_id, session.learner_id];
    supabase.from("profiles").select("user_id, name").in("user_id", ids).then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => { map[p.user_id] = p.name; });
      setProfileNames(map);
    });
  }, [session]);

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
            <>
              <Button variant="secondary" size="sm" className="gap-1.5" onClick={handleGenerateSummary} disabled={generatingSummary}>
                {generatingSummary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5" />}
                Summary
              </Button>
              <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setShowReview(true)}>
                <Star className="h-3.5 w-3.5" />Review
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video + AI area */}
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
              <div className="bg-muted rounded-xl p-4"><MarkdownContent content={lessonPlan} /></div>
            ) : (
              <p className="text-sm text-muted-foreground">Click "Generate" to create an AI-powered lesson plan.</p>
            )}
          </div>

          {sessionSummary && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><ClipboardList className="h-4 w-4 text-primary" />Session Summary</h3>
              <div className="bg-muted rounded-xl p-4"><MarkdownContent content={sessionSummary} /></div>
            </motion.div>
          )}

          <AnimatePresence>
            {showReview && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="bg-card rounded-2xl p-5 border border-border">
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

        {/* Chat panel with tabs */}
        <div className="bg-card rounded-2xl border border-border flex flex-col h-[540px] lg:h-auto">
          <Tabs defaultValue="chat" className="flex flex-col h-full">
            <TabsList className="mx-3 mt-3 grid grid-cols-2">
              <TabsTrigger value="chat" className="gap-1.5 text-xs">
                <Users className="h-3.5 w-3.5" />Chat
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5 text-xs">
                <Bot className="h-3.5 w-3.5" />AI Tutor
              </TabsTrigger>
            </TabsList>

            {/* Peer Chat */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-8">Send a message to start chatting...</p>
                )}
                {chatMessages.map((msg) => {
                  const fromMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${fromMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {!fromMe && (
                          <p className="text-[10px] font-semibold mb-0.5 opacity-70">{profileNames[msg.sender_id] || "User"}</p>
                        )}
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${fromMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..."
                  onKeyDown={e => e.key === "Enter" && handleSendChat()} className="flex-1" />
                <Button size="icon" onClick={handleSendChat}><Send className="h-4 w-4" /></Button>
              </div>
            </TabsContent>

            {/* AI Tutor Chat */}
            <TabsContent value="ai" className="flex-1 flex flex-col overflow-hidden m-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.length === 0 && (
                  <div className="text-center mt-8 space-y-2">
                    <Bot className="h-8 w-8 text-primary/40 mx-auto" />
                    <p className="text-xs text-muted-foreground">Ask the AI tutor anything about {session?.subject || "your subject"}!</p>
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/50 border border-border"}`}>
                      {msg.role === "assistant" && (
                        <p className="text-[10px] font-semibold mb-0.5 text-primary flex items-center gap-1"><Bot className="h-3 w-3" />AI Tutor</p>
                      )}
                      <MarkdownContent content={msg.content} />
                    </div>
                  </div>
                ))}
                {aiLoading && aiMessages[aiMessages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="bg-accent/50 border border-border px-3 py-2 rounded-2xl">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={aiChatEndRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Ask the AI tutor..."
                  onKeyDown={e => e.key === "Enter" && handleSendAi()} className="flex-1" disabled={aiLoading} />
                <Button size="icon" onClick={handleSendAi} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
