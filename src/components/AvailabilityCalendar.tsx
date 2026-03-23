import { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, addHours, setHours, setMinutes } from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
  duration: number;
}

interface AvailabilityCalendarProps {
  onSlotAdd: (slot: TimeSlot) => void;
}

export default function AvailabilityCalendar({ onSlotAdd }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
    setSelectedDay(null);
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
    setSelectedDay(null);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const handleAddSlot = () => {
    if (!selectedDay) return;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const start = setMinutes(setHours(selectedDay, startHour), startMin);
    const end = setMinutes(setHours(selectedDay, endHour), endMin);

    if (start >= end) {
      alert('End time must be after start time');
      return;
    }

    const duration = (end.getTime() - start.getTime()) / (1000 * 60);

    onSlotAdd({ start, end, duration });
  };

  // Generate quick time slots
  const quickSlots = [
    { label: 'Morning (9-12)', start: '09:00', end: '12:00' },
    { label: 'Afternoon (1-5)', start: '13:00', end: '17:00' },
    { label: 'Evening (6-9)', start: '18:00', end: '21:00' },
  ];

  const handleQuickSlot = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  return (
    <div className="space-y-6">
      {/* Week Navigator */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousWeek}
          className="px-4 py-2 border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          ← Previous
        </button>
        <h3 className="font-semibold">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </h3>
        <button
          onClick={handleNextWeek}
          className="px-4 py-2 border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Next →
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());
          const isPast = day < new Date() && !isToday;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && handleDayClick(day)}
              disabled={isPast}
              className={`p-4 rounded-lg border-2 transition ${
                isSelected
                  ? 'border-primary bg-primary text-white'
                  : isPast
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
              } ${isToday && !isSelected ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''}`}
            >
              <div className="text-xs">{format(day, 'EEE')}</div>
              <div className="text-2xl font-bold">{format(day, 'd')}</div>
              <div className="text-xs">{format(day, 'MMM')}</div>
            </button>
          );
        })}
      </div>

      {/* Time Selection */}
      {selectedDay && (
        <div className="border-t dark:border-gray-700 pt-6 space-y-4 animate-fade-in">
          <h4 className="font-semibold">
            Set time for {format(selectedDay, 'EEEE, MMMM d')}
          </h4>

          {/* Quick Slots */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick slots:</p>
            <div className="flex gap-2 flex-wrap">
              {quickSlots.map((slot) => (
                <button
                  key={slot.label}
                  onClick={() => handleQuickSlot(slot.start, slot.end)}
                  className="px-3 py-1 text-sm border dark:border-gray-700 rounded-full hover:bg-primary hover:text-white hover:border-primary transition"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            onClick={handleAddSlot}
            className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition font-medium flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>Add Time Slot</span>
          </button>
        </div>
      )}

      {!selectedDay && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">👆</div>
          <p className="text-sm">Click on a day above to set availability</p>
        </div>
      )}
    </div>
  );
}
