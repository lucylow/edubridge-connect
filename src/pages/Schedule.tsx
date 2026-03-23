import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { createSession } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, CheckCircle } from "lucide-react";

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const Schedule = () => {
  const { tutorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState(user?.subjects[0] || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time || !subject) return;
    setLoading(true);
    try {
      const scheduledStart = new Date(`${date}T${time.replace(" AM", ":00").replace(" PM", ":00")}`).toISOString();
      const session = await createSession({
        tutorId: tutorId || "",
        learnerId: user!.id,
        subject,
        scheduledStart,
      });
      setSuccess(true);
      setTimeout(() => navigate(`/session/${session.id}`), 1500);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-up">
        <CheckCircle className="h-16 w-16 text-primary" />
        <h2 className="text-xl font-bold">Session Scheduled!</h2>
        <p className="text-muted-foreground">Redirecting to your session room...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Calendar className="h-6 w-6 text-primary" />Schedule a Session</h1>
      <p className="text-muted-foreground mb-8">Pick a date and time that works for you.</p>

      <div className="bg-card rounded-3xl p-6 border border-border space-y-5">
        <div>
          <label className="text-sm font-medium mb-1 block">Subject</label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Algebra" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Date</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-1.5"><Clock className="h-4 w-4" />Time slot</label>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map(t => (
              <button key={t} onClick={() => setTime(t)}
                className={`py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${time === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSchedule} className="w-full" size="lg" disabled={loading || !date || !time || !subject}>
          {loading ? "Scheduling..." : "Confirm Session"}
        </Button>
      </div>
    </div>
  );
};

export default Schedule;
