import { useState } from 'react';

export default function CalendarPicker({ onSelect }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    updateSelection(e.target.value, selectedTime);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    updateSelection(selectedDate, e.target.value);
  };

  const updateSelection = (date, time) => {
    if (date && time) {
      const datetime = new Date(`${date}T${time}`);
      onSelect(datetime.toISOString());
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={today}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <select
          value={selectedTime}
          onChange={handleTimeChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a time</option>
          {timeSlots.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </div>

      {selectedDate && selectedTime && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Selected: {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
