import React, { useState, useEffect } from 'react';
import { getDaysInMonth, isDateBooked } from '../../utils/helpers';
import { calendarAPI, propertiesAPI, bookingsAPI } from '../../services/api';

export default function CalendarManagement() {
  const [availableDates, setAvailableDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading ] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty, currentMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const responseProperties = await propertiesAPI.getAll();
      const props = responseProperties.data || [];
      setProperties(props);

      // Ensure we have a selected property (use first if none)
      const propId = selectedProperty ?? props[0]?.id ?? null;
      if (propId !== selectedProperty) {
        setSelectedProperty(propId);
      }

      if (propId) {
        const response = await calendarAPI.getAvailability(propId, currentMonth);
        setAvailableDates(response.data || []);
      } else {
        setAvailableDates([]);
      }

      const bookingsResponse = await bookingsAPI.getAll();
      setBookings(bookingsResponse.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  }

  const days = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Show an emoji banner when there are no bookings/availability yet (but still render calendar)
  const showEmptyEmoji = !loading && !error && bookings.length === 0 && availableDates.length === 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Master Calendar</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Property</label>
        <select
          value={selectedProperty ?? ''}
          onChange={(e) => setSelectedProperty(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        >
          {properties.map(prop => (
            <option key={prop.id} value={prop.id}>{prop.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Previous
          </button>
          <h3 className="text-xl font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Next
          </button>
        </div>

        {/* Emoji banner when calendar has no data (still keeps the calendar visible) */}
        {showEmptyEmoji && (
          <div className="text-center mb-4 text-2xl" aria-hidden>
            📅 No bookings yet — your calendar is ready!
          </div>
        )}

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold py-2">{day}</div>
          ))}
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square flex items-center justify-center border rounded-lg ${
                !day ? 'bg-gray-50' :
                isDateBooked(day, bookings, selectedProperty)
                  ? 'bg-red-100 border-red-300'
                  : 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer'
              }`}
            >
              {day && day.getDate()}
            </div>
          ))}
        </div>

        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
}