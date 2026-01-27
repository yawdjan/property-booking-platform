import React, { useState, useEffect } from 'react';
import { getDaysInMonth } from '../../utils/helpers';
import { propertiesAPI, bookingsAPI, calendarAPI } from '../../services/api';

export default function CalendarManagement() {
  const [availableDates, setAvailableDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Date selection state for blocking
  const [selectedDates, setSelectedDates] = useState([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty, currentMonth]);

  // Clear selected dates when property changes
  useEffect(() => {
    setSelectedDates([]);
    setBlockSuccess(null);
  }, [selectedProperty]);

  const loadData = async () => {
    try {
      setLoading(true);
      const responseProperties = await propertiesAPI.getAll();
      const props = responseProperties.data || [];
      setProperties(props);

      const propId = selectedProperty ?? props[0]?.id ?? null;
      if (!selectedProperty && propId) {
        setSelectedProperty(propId);
      }

      if (propId) {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const calResponse = await bookingsAPI.getUnavailableDates(propId, firstDay, lastDay);
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

  const showEmptyEmoji = !loading && !error && bookings.length === 0 && availableDates.length === 0;

  const getBookingStatus = (dateStr, bookedEntry) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    if (!bookedEntry) {
      if (date < today) {
        return 'past-available';
      }
      return 'available';
    }

    if (date < today) return 'completed';

    const booking = bookings.find(b => {
      const checkinDate = new Date(b.checkinDate || b.checkIn || b.checkin);
      const checkoutDate = new Date(b.checkoutDate || b.checkOut || b.checkout);
      checkinDate.setHours(0, 0, 0, 0);
      checkoutDate.setHours(0, 0, 0, 0);
      const dateToCheck = new Date(dateStr);
      dateToCheck.setHours(0, 0, 0, 0);

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

  // Toggle date selection for blocking
  const toggleDateSelection = (dateStr) => {
    setBlockSuccess(null);
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr].sort();
      }
    });
  };

  // Check if a date is selected
  const isDateSelected = (dateStr) => selectedDates.includes(dateStr);

  // Block selected dates
  const handleBlockDates = async () => {
    if (selectedDates.length === 0 || !selectedProperty) return;

    try {
      setIsBlocking(true);
      setError(null);
      
      await calendarAPI.blockDates(selectedProperty, selectedDates);
      
      setBlockSuccess(`Successfully blocked ${selectedDates.length} date(s)`);
      setSelectedDates([]);
      
      // Reload calendar data to show blocked dates
      await loadData();
    } catch (err) {
      console.error('Error blocking dates:', err);
      setError('Failed to block dates. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  // Clear all selected dates
  const clearSelection = () => {
    setSelectedDates([]);
    setBlockSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Master Calendar</h2>

        {/* Property Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">Select Property</label>
          <select
            value={selectedProperty ?? ''}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
          >
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.name}</option>
            ))}
          </select>
        </div>

        {/* Selected Dates Panel */}
        {selectedDates.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">
                Selected Dates ({selectedDates.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={handleBlockDates}
                  disabled={isBlocking}
                  className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isBlocking ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Blocking...
                    </>
                  ) : (
                    <>
                      🚫 Block Selected Dates
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedDates.map(date => (
                <span
                  key={date}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  <button
                    onClick={() => toggleDateSelection(date)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {blockSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
            ✓ {blockSuccess}
          </div>
        )}

        {/* Calendar Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all hover:shadow-md"
            >
              ← Previous
            </button>
            <h3 className="text-xl font-semibold text-gray-800">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all hover:shadow-md"
            >
              Next →
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800">
            💡 Click on available dates to select them for blocking. Selected dates will appear in blue.
          </div>

          {/* Empty State Banner */}
          {showEmptyEmoji && (
            <div className="text-center mb-4 text-2xl" aria-hidden>
              📅 No bookings yet — your calendar is ready!
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 text-gray-500">
              <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-amber-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Loading calendar...
            </div>
          )}

          {/* Calendar Grid */}
          {!loading && (
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold py-2 text-gray-600">{day}</div>
              ))}

              {/* Calendar Days */}
              {days.map((day, idx) => {
                if (!day) return (
                  <div key={idx} className="aspect-square flex items-center justify-center border rounded-xl bg-gray-50" />
                );

                const dateStr = day.toISOString().split('T')[0];
                const status = getBookingStatus(dateStr, availableDates.includes(dateStr));

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPastDate = day < today;
                const isSelected = isDateSelected(dateStr);
                const isClickable = !isPastDate && status === 'available';

                // Status styles
                const statusStyles = {
                  available: 'bg-white hover:bg-blue-50 border-gray-200 cursor-pointer',
                  'past-available': 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60',
                  booked: 'bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed',
                  pending: 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed',
                  cancelled: 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed',
                  completed: 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed'
                };

                // Selected state override
                const selectedStyle = isSelected 
                  ? 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600 ring-2 ring-blue-300' 
                  : statusStyles[status];

                const bookingForDate = bookings.find(b => {
                  const checkinDate = new Date(b.checkinDate || b.checkIn || b.checkin);
                  const checkoutDate = new Date(b.checkoutDate || b.checkOut || b.checkout);
                  checkinDate.setHours(0, 0, 0, 0);
                  checkoutDate.setHours(0, 0, 0, 0);
                  const dateToCheck = new Date(day);
                  dateToCheck.setHours(0, 0, 0, 0);

                  const isSameDayBooking = checkinDate.getTime() === checkoutDate.getTime();
                  const isInRange = isSameDayBooking
                    ? dateToCheck.getTime() === checkinDate.getTime()
                    : dateToCheck >= checkinDate && dateToCheck < checkoutDate;

                  return isInRange && b.propertyId === selectedProperty;
                });

                const agentName = bookingForDate?.agentName || bookingForDate?.agent?.name || bookingForDate?.agentNameFull || '';
                const validStatuses = ['completed', 'pending', 'booked'];

                return (
                  <div
                    key={idx}
                    onClick={() => isClickable && toggleDateSelection(dateStr)}
                    className={`
                      aspect-square flex flex-col items-center justify-center border rounded-xl 
                      transition-all duration-200
                      ${selectedStyle}
                      ${isClickable ? 'hover:scale-105 hover:shadow-md' : ''}
                    `}
                  >
                    <span className={`font-medium ${isSelected ? 'text-white' : ''}`}>
                      {day.getDate()}
                    </span>

                    {isSelected && (
                      <span className="text-xs mt-0.5">✓</span>
                    )}

                    {!isSelected && status !== 'available' && status !== 'past-available' && (
                      <span className="text-xs mt-0.5 capitalize">
                        {status === 'completed' ? '✓' : status}
                      </span>
                    )}

                    {!isSelected && bookingForDate && agentName && validStatuses.includes(status) && (
                      <span className="text-xs mt-0.5 text-gray-600 truncate max-w-full px-1">
                        {agentName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
              <span className="text-sm text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
              <span className="text-sm text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm text-gray-700">Pending Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span className="text-sm text-gray-700">Past</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}