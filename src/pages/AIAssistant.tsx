import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAITutorChat } from "@/hooks/useAITutorChat";
import { generateStudyTips, generateLessonPlan } from "@/services/api";
import MarkdownContent from "@/components/MarkdownContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Send, Loader2, Lightbulb, FileText, Sparkles, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const suggestedPrompts = [
  "Explain photosynthesis simply",
  "Help me solve quadratic equations",
  "What are Newton's 3 laws?",
  "Tips for writing an essay",
  "Explain the Pythagorean theorem",
  "How does DNA replication work?",
];

const AIAssistant = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(user?.subjects?.[0] || "");
  const { messages, isLoading, send, clearChat } = useAITutorChat(subject || undefined, user?.grade);
  const [input, setInput] = useState("");

  // Study tips state
  const [tips, setTips] = useState("");
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsSubject, setTipsSubject] = useState(user?.subjects?.[0] || "");

  // Lesson plan state
  const [plan, setPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planSubject, setPlanSubject] = useState(user?.subjects?.[0] || "");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput("");
  };

  const handleSuggestion = (prompt: string) => {
    send(prompt);
  };

  const handleGenerateTips = async () => {
    if (!tipsSubject.trim()) return;
    setTipsLoading(true);
    try {
      const result = await generateStudyTips(tipsSubject, user?.grade);
      setTips(result);
    } catch {
      toast.error("Failed to generate study tips");
    } finally {
      setTipsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!planSubject.trim()) return;
    setPlanLoading(true);
    try {
      const result = await generateLessonPlan(planSubject);
      setPlan(result);
    } catch {
      toast.error("Failed to generate lesson plan");
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI Study Assistant
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chat with AI, generate study tips, and create lesson plans — all powered by AI.
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="chat" className="gap-1.5 text-xs">
            <Bot className="h-3.5 w-3.5" />Chat
          </TabsTrigger>
          <TabsTrigger value="tips" className="gap-1.5 text-xs">
            <Lightbulb className="h-3.5 w-3.5" />Study Tips
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />Lesson Plan
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject context (e.g., Biology)"
              className="max-w-xs"
            />
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1.5 text-muted-foreground">
                <Trash2 className="h-3.5 w-3.5" />Clear
              </Button>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <Bot className="h-12 w-12 text-primary/30 mx-auto" />
                  <div>
                    <p className="font-medium text-muted-foreground">Ask me anything!</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">I can help with homework, explain concepts, and quiz you.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    {suggestedPrompts.map(p => (
                      <button
                        key={p}
                        onClick={() => handleSuggestion(p)}
                        className="px-3 py-1.5 rounded-full text-xs bg-muted text-muted-foreground hover:bg-accent transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 border border-border"
                  }`}>
                    {msg.role === "assistant" && (
                      <p className="text-[10px] font-semibold mb-1 text-primary flex items-center gap-1">
                        <Bot className="h-3 w-3" />AI Tutor
                      </p>
                    )}
                    {msg.role === "assistant" ? (
                      <MarkdownContent content={msg.content} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-accent/50 border border-border px-4 py-3 rounded-2xl">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask the AI tutor..."
                onKeyDown={e => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Study Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex gap-2 items-end mb-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input value={tipsSubject} onChange={e => setTipsSubject(e.target.value)} placeholder="e.g., Chemistry" />
              </div>
              <Button onClick={handleGenerateTips} disabled={tipsLoading || !tipsSubject.trim()} className="gap-1.5">
                {tipsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {tipsLoading ? "Generating..." : "Generate Tips"}
              </Button>
            </div>
            {tips ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-muted rounded-xl p-4">
                <MarkdownContent content={tips} />
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Enter a subject and click "Generate Tips" to get personalized AI study advice.
              </p>
            )}
          </div>
        </TabsContent>

        {/* Lesson Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex gap-2 items-end mb-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input value={planSubject} onChange={e => setPlanSubject(e.target.value)} placeholder="e.g., World History" />
              </div>
              <Button onClick={handleGeneratePlan} disabled={planLoading || !planSubject.trim()} className="gap-1.5">
                {planLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {planLoading ? "Generating..." : "Generate Plan"}
              </Button>
            </div>
            {plan ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-muted rounded-xl p-4">
                <MarkdownContent content={plan} />
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Enter a subject and click "Generate Plan" to create an AI-powered lesson plan.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;
