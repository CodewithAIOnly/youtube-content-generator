import React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
  onSchedule: () => void;
}

export function DatePicker({ selectedDate, onDateChange, onClose, onSchedule }: DatePickerProps) {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = nextMonth.getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const handleDateClick = (day: number) => {
    const newDate = new Date(today.getFullYear(), today.getMonth(), day);
    onDateChange(newDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Content</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(today.getFullYear(), today.getMonth(), day);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={day}
                  onClick={() => !isPast && handleDateClick(day)}
                  disabled={isPast}
                  className={`h-10 rounded-lg flex items-center justify-center text-sm
                    ${isPast ? 'text-gray-300 cursor-not-allowed' :
                    isSelected ? 'bg-indigo-600 text-white' :
                    'hover:bg-gray-100 text-gray-700'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSchedule}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}