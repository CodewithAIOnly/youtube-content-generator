import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Video, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarStore } from '../store/calendarStore';
import { DatePicker } from '../components/DatePicker';
import type { CalendarEvent } from '../types';

export function Calendar() {
  const { events, removeEvent, updateEvent } = useCalendarStore();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Get all dates in the current month
  const getDatesInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      return new Date(year, month, i + 1);
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
  };

  const handleUpdateEvent = () => {
    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        date: selectedDate.toISOString()
      });
      setEditingEvent(null);
    }
  };

  const dates = getDatesInMonth();
  const currentMonthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-600 mt-1">
            View and manage your scheduled content
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">{currentMonthName}</h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Agenda View */}
          <div className="divide-y">
            {dates.map(date => {
              const dateEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              if (dateEvents.length === 0) return null;

              return (
                <div
                  key={date.toISOString()}
                  className={`p-4 ${isToday ? 'bg-indigo-50' : ''}`}
                >
                  <div className="flex items-center mb-3">
                    <span className={`font-medium ${
                      isToday ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {formatDate(date)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dateEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          {event.type === 'content' ? (
                            <Video className="w-5 h-5 text-green-500" />
                          ) : (
                            <Pencil className="w-5 h-5 text-blue-500" />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-gray-500">{event.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeEvent(event.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Event Modal */}
        {editingEvent && (
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onClose={() => setEditingEvent(null)}
            onSchedule={handleUpdateEvent}
          />
        )}
      </div>
    </div>
  );
}