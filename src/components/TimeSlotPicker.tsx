import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, parse, isAfter, isBefore } from 'date-fns';

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  available: boolean;
}

interface TimeSlotPickerProps {
  tutorId: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null;
}

export default function TimeSlotPicker({ tutorId, onSlotSelect, selectedSlot }: TimeSlotPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'week' | 'day'>('week');

  // Generate week days
  useEffect(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    setWeekDays(days);
  }, [currentDate]);

  // Fetch available slots (mock data for now)
  useEffect(() => {
    setLoading(true);
    // Mock available slots
    const mockSlots: TimeSlot[] = [];
    weekDays.forEach((day) => {
      // Add slots from 9 AM to 5 PM
      for (let hour = 9; hour <= 17; hour++) {
        const start = new Date(day);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(day);
        end.setHours(hour + 1, 0, 0, 0);

        // Randomly make some slots unavailable for demo
        const available = Math.random() > 0.3 && isAfter(start, new Date());

        mockSlots.push({
          id: `${day.toISOString()}-${hour}`,
          start,
          end,
          available,
        });
      }
    });
    setSlots(mockSlots);
    setLoading(false);
  }, [weekDays, tutorId]);

  const handlePreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getSlotsForDay = (day: Date) => {
    return slots.filter((slot) => isSameDay(slot.start, day));
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlot?.id === slot.id;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handlePreviousWeek}
            className="px-3 py-1 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Today
          </button>
          <button
            onClick={handleNextWeek}
            className="px-3 py-1 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Next →
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded transition ${
              view === 'week'
                ? 'bg-primary text-white'
                : 'border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1 rounded transition ${
              view === 'day'
                ? 'bg-primary text-white'
                : 'border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {/* Week View */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const daySlots = getSlotsForDay(day);
            const availableCount = daySlots.filter((s) => s.available).length;
            const isToday = isSameDay(day, new Date());
            const isPast = isBefore(day, new Date()) && !isToday;

            return (
              <div
                key={day.toISOString()}
                className={`border dark:border-gray-700 rounded-lg p-2 ${
                  isPast ? 'bg-gray-100 dark:bg-gray-800 opacity-50' : 'bg-white dark:bg-gray-800'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                  <div className="text-xs text-gray-500">{format(day, 'MMM')}</div>
                </div>

                {!isPast && (
                  <div className="space-y-1">
                    {daySlots.slice(0, 3).map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && onSlotSelect(slot)}
                        disabled={!slot.available}
                        className={`w-full text-xs py-1 px-1 rounded transition ${
                          isSlotSelected(slot)
                            ? 'bg-primary text-white'
                            : slot.available
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {format(slot.start, 'HH:mm')}
                      </button>
                    ))}
                    {availableCount > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{availableCount - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {getSlotsForDay(currentDate).map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && onSlotSelect(slot)}
                disabled={!slot.available}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition ${
                  isSlotSelected(slot)
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : slot.available
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 border-2 border-green-300 dark:border-green-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div>{format(slot.start, 'HH:mm')}</div>
                <div className="text-xs">{format(slot.end, 'HH:mm')}</div>
              </button>
            ))}
          </div>

          {getSlotsForDay(currentDate).filter((s) => s.available).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No available slots for this day
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs mt-4 pt-4 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
