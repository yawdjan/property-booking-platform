import React, { useState, useEffect } from 'react';
import { getDaysInMonth } from '../../utils/helpers';
import { propertiesAPI, bookingsAPI } from '../../services/api';

export default function CalendarManagement() {
  const [availableDates, setAvailableDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
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
      if (!selectedProperty && propId) {
        setSelectedProperty(propId);
      }

      if (propId) {
        // Build month window (first day -> last day)
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const calResponse = await bookingsAPI.getUnavailableDates(propId, firstDay, lastDay);
        // API returns { success, propertyId, bookedDates }
        const booked = calResponse?.unavailableDates ?? calResponse?.data ?? [];
        setAvailableDates(booked);
      } else {
        setAvailableDates([]);
      }

      const bookingsResponse = await bookingsAPI.getAll();
      setBookings(bookingsResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  };

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

  // ✅ Updated function to check if date falls within any booking range
  const getBookingStatus = (dateStr, bookedEntry) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    // const checkoutDate = bookedEntry.checkoutDate || bookedEntry.checkOut || bookedEntry.checkout;

    if (!bookedEntry) {
      if (date < today) {
        return 'past-available';
      }
      return 'available';
    }

    if (date < today) return 'completed';

    // Check against bookings array to determine status
    const booking = bookings.find(b => {
      const checkinDate = new Date(b.checkinDate || b.checkIn || b.checkin);
      const checkoutDate = new Date(b.checkoutDate || b.checkOut || b.checkout);
      checkinDate.setHours(0, 0, 0, 0);
      checkoutDate.setHours(0, 0, 0, 0);
      const dateToCheck = new Date(dateStr);
      dateToCheck.setHours(0, 0, 0, 0);

      // Handle same-day bookings (0 nights)
      const isSameDayBooking = checkinDate.getTime() === checkoutDate.getTime();
      const isInRange = isSameDayBooking
        ? dateToCheck.getTime() === checkinDate.getTime()
        : dateToCheck >= checkinDate && dateToCheck < checkoutDate;

      return isInRange && b.propertyId === selectedProperty;
    });

    if (booking) {
      if (booking.status === 'Pending Payment') return 'pending';
      if (booking.status === 'Cancelled') return 'cancelled';
      return 'booked';
    }

    return 'available';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Master Calendar</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Property</label>
        <select
          value={selectedProperty ?? ''}
          onChange={(e) => setSelectedProperty(e.target.value)}
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

        {/* Emoji banner when calendar has no data */}
        {showEmptyEmoji && (
          <div className="text-center mb-4 text-2xl" aria-hidden>
            📅 No bookings yet — your calendar is ready!
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Loading calendar...
          </div>
        )}

        {/* Calendar grid */}
        {!loading && (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold py-2">{day}</div>
            ))}

            {days.map((day, idx) => {
              if (!day) return (
                <div key={idx} className="aspect-square flex items-center justify-center border rounded-lg bg-gray-50" />
              );

              const dateStr = day.toISOString().split('T')[0];
              const status = getBookingStatus(dateStr, availableDates.some(d => d === dateStr));

              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPastDate = day < today;

              // ✅ Define status styles with correct colors
              const statusStyles = {
                available: 'bg-white hover:bg-blue-50 border-gray-200 cursor-pointer',
                'past-available': 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60',
                booked: 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed',
                pending: 'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed',
                cancelled: 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed',
                completed: 'bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed'
              };

              return (
                <div
                  key={idx}
                  onClick={() => !isPastDate && status === 'available'}
                  className={`
                    aspect-square flex flex-col items-center justify-center border rounded-lg 
                    transition-all duration-200
                    ${statusStyles[status]}
                  `}
                >
                  <span className="font-medium">{day.getDate()}</span>
                  {status !== 'available' && status !== 'past-available' && (
                    <span className="text-xs mt-0.5 capitalize">
                      {status === 'completed' ? '✓' : status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ Updated Legend with correct colors matching the calendar */}
        <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm text-gray-700">Pending Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
            <span className="text-sm text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-700">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span className="text-sm text-gray-700">Past</span>
          </div>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
} 