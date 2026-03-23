import { useState } from 'react';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
  duration: number;
}

export default function Availability() {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAddSlot = (slot: TimeSlot) => {
    setSelectedSlots([...selectedSlots, slot]);
    toast.success('Time slot added');
  };

  const handleRemoveSlot = (index: number) => {
    setSelectedSlots(selectedSlots.filter((_, i) => i !== index));
    toast.success('Time slot removed');
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Availability saved successfully!');
      // Clear slots after saving
      setSelectedSlots([]);
    } catch (error) {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Set Your Availability</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Define when you're available to tutor. Learners will be able to book sessions during these times.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Select Available Times</h2>
              <div className="text-sm text-gray-500">
                {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} added
              </div>
            </div>

            <AvailabilityCalendar onSlotAdd={handleAddSlot} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Slots */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold mb-4">Added Time Slots</h3>

            {selectedSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-sm">No slots added yet</p>
                <p className="text-xs mt-1">Click on the calendar to add slots</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                  {selectedSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-gray-600 hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {format(slot.start, 'EEE, MMM d')}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {slot.duration} minutes
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
                        title="Remove slot"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveAvailability}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Availability</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Pro Tips</span>
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Set availability at least 24 hours in advance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Block out regular weekly time slots for consistency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Leave buffer time between sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Update your schedule regularly to avoid conflicts</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-3 text-sm">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                📋 View My Schedule
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                🔄 Copy Last Week's Schedule
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                ⚙️ Set Recurring Slots
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
