import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle, Clock, Loader2, User, ArrowLeft } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface TutorProfile {
  name: string;
  bio: string | null;
  rating: number | null;
  avatar_url: string | null;
}

const Schedule = () => {
  const { tutorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [subject, setSubject] = useState("");
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tutorId) return;
    setLoading(true);

    const [profileRes, slotsRes] = await Promise.all([
      supabase.from("profiles").select("name, bio, rating, avatar_url").eq("user_id", tutorId).single(),
      supabase
        .from("availability_slots")
        .select("*")
        .eq("tutor_id", tutorId)
        .eq("is_booked", false)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true }),
    ]);

    if (profileRes.data) setTutor(profileRes.data);
    setSlots((slotsRes.data as AvailabilitySlot[]) || []);
    setLoading(false);
  }, [tutorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Get unique dates from slots
  const uniqueDates = [...new Set(slots.map(s => format(parseISO(s.start_time), "yyyy-MM-dd")))];
  const slotsForDate = selectedDate
    ? slots.filter(s => isSameDay(parseISO(s.start_time), parseISO(selectedDate)))
    : [];

  const handleBook = async () => {
    if (!selectedSlot || !user || !tutorId || !subject.trim()) return;
    setBooking(true);
    try {
      // Create session
      const { data: session, error: sessionErr } = await supabase
        .from("sessions")
        .insert({
          tutor_id: tutorId,
          learner_id: user.id,
          subject: subject.trim(),
          scheduled_start: selectedSlot.start_time,
        })
        .select()
        .single();
      if (sessionErr) throw sessionErr;

      // Mark slot as booked
      const { error: slotErr } = await supabase
        .from("availability_slots")
        .update({ is_booked: true })
        .eq("id", selectedSlot.id);
      if (slotErr) console.error("Failed to mark slot booked:", slotErr);

      toast.success("Session booked!");
      setSuccess(true);
      setTimeout(() => navigate(`/session/${session.id}`), 1800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Booking failed";
      toast.error(message);
    } finally {
      setBooking(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <CheckCircle className="h-16 w-16 text-primary" />
        </motion.div>
        <h2 className="text-xl font-bold">Session Booked!</h2>
        <p className="text-muted-foreground">Redirecting to your session room…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Tutor header */}
      {tutor && (
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {tutor.avatar_url ? (
              <img src={tutor.avatar_url} alt={tutor.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">Book with {tutor.name}</h1>
            <p className="text-sm text-muted-foreground">
              {tutor.rating ? `⭐ ${Number(tutor.rating).toFixed(1)}` : "New tutor"}
              {tutor.bio && ` · ${tutor.bio.slice(0, 60)}${tutor.bio.length > 60 ? "…" : ""}`}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
        {/* Subject */}
        <div>
          <label className="text-sm font-medium mb-1 block">Subject</label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Algebra, Biology" />
        </div>

        {/* Date picker */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> Pick a date
          </label>
          {uniqueDates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">This tutor has no available slots right now.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {uniqueDates.map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedDate === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {format(parseISO(d), "EEE, MMM d")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time slots */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div key={selectedDate} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Available times
              </label>
              {slotsForDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots on this date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsForDate.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                        selectedSlot?.id === slot.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {format(parseISO(slot.start_time), "h:mm a")}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected summary + book */}
        {selectedSlot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 rounded-xl p-4 space-y-3">
            <div className="text-sm">
              <span className="font-medium">Selected: </span>
              {format(parseISO(selectedSlot.start_time), "EEE, MMM d · h:mm a")} – {format(parseISO(selectedSlot.end_time), "h:mm a")}
            </div>
            <Button
              onClick={handleBook}
              className="w-full"
              size="lg"
              disabled={booking || !subject.trim()}
            >
              {booking ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Booking…</>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
