import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { generateLessonPlan } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Mic, MicOff, VideoOff, FileText, Send, Loader2, MonitorUp } from "lucide-react";

interface ChatMsg {
  text: string;
  fromMe: boolean;
  time: string;
}

const SessionRoom = () => {
  const { sessionId } = useParams();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [generating, setGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    const plan = await generateLessonPlan("Session Topic");
    setLessonPlan(plan);
    setGenerating(false);
  };

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-lg font-bold">Session #{sessionId}</h1>
        <div className="flex gap-2">
          <Button variant={micOn ? "default" : "destructive"} size="icon" onClick={() => setMicOn(!micOn)}>
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button variant={camOn ? "default" : "destructive"} size="icon" onClick={() => setCamOn(!camOn)}>
            {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
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
