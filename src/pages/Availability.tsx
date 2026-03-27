import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Loader2, CalendarDays } from 'lucide-react';

interface TimeSlot {
  start: Date;
  end: Date;
  duration: number;
}

interface SavedSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function Availability() {
  const { user } = useAuth();
  const [pendingSlots, setPendingSlots] = useState<TimeSlot[]>([]);
  const [savedSlots, setSavedSlots] = useState<SavedSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('tutor_id', user.id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });
    setSavedSlots((data as SavedSlot[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleAddSlot = (slot: TimeSlot) => {
    setPendingSlots([...pendingSlots, slot]);
    toast.success('Time slot added');
  };

  const handleRemovePending = (index: number) => {
    setPendingSlots(pendingSlots.filter((_, i) => i !== index));
  };

  const handleDeleteSaved = async (id: string) => {
    const { error } = await supabase.from('availability_slots').delete().eq('id', id);
    if (error) { toast.error('Failed to delete slot'); return; }
    toast.success('Slot removed');
    fetchSlots();
  };

  const handleSaveAvailability = async () => {
    if (!user || pendingSlots.length === 0) return;
    setSaving(true);
    try {
      const rows = pendingSlots.map(s => ({
        tutor_id: user.id,
        start_time: s.start.toISOString(),
        end_time: s.end.toISOString(),
      }));
      const { error } = await supabase.from('availability_slots').insert(rows);
      if (error) throw error;
      toast.success('Availability saved!');
      setPendingSlots([]);
      fetchSlots();
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Set Your Availability</h1>
        <p className="text-muted-foreground text-sm">
          Define when you're available to tutor. Learners can book during these times.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-bold mb-4">Select Available Times</h2>
            <AvailabilityCalendar onSlotAdd={handleAddSlot} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Pending slots to save */}
          {pendingSlots.length > 0 && (
            <div className="bg-card p-5 rounded-2xl border border-border">
              <h3 className="font-bold text-sm mb-3">New Slots ({pendingSlots.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {pendingSlots.map((slot, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-primary/5 rounded-xl text-sm">
                    <div>
                      <div className="font-medium">{format(slot.start, 'EEE, MMM d')}</div>
                      <div className="text-xs text-muted-foreground">{format(slot.start, 'h:mm a')} – {format(slot.end, 'h:mm a')}</div>
                    </div>
                    <button onClick={() => handleRemovePending(i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveAvailability} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Availability'}
              </Button>
            </div>
          )}

          {/* Saved slots */}
          <div className="bg-card p-5 rounded-2xl border border-border">
            <h3 className="font-bold text-sm mb-3">Your Schedule</h3>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : savedSlots.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming slots</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {savedSlots.map(slot => (
                  <div key={slot.id} className="flex justify-between items-center p-2.5 rounded-xl bg-muted/50 text-sm">
                    <div>
                      <div className="font-medium">{format(new Date(slot.start_time), 'EEE, MMM d')}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(slot.start_time), 'h:mm a')} – {format(new Date(slot.end_time), 'h:mm a')}
                        {slot.is_booked && <span className="ml-2 text-emerald-500 font-medium">Booked</span>}
                      </div>
                    </div>
                    {!slot.is_booked && (
                      <button onClick={() => handleDeleteSaved(slot.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
