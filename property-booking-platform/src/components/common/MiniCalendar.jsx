import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingsAPI } from '../../services/api';

export default function MiniCalendar({ propertyId }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);


    const loadBookings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await bookingsAPI.getAll();
            const allBookings = response.data || [];

            const filtered = allBookings.filter(
                b => b.propertyId === propertyId
            );

            setBookings(filtered);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    }, [propertyId]);
    
    useEffect(() => {
        if (propertyId) {
            loadBookings();
        }
    }, [propertyId, currentMonth, loadBookings]);

    const getBookingStatus = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        const booking = bookings.find(b => {
            const checkin = new Date(b.checkinDate || b.checkIn || b.checkin);
            const checkout = new Date(b.checkoutDate || b.checkOut || b.checkout);

            checkin.setHours(0, 0, 0, 0);
            checkout.setHours(0, 0, 0, 0);

            const sameDay = checkin.getTime() === checkout.getTime();

            return sameDay
                ? date.getTime() === checkin.getTime()
                : date >= checkin && date < checkout;
        });

        if (!booking) {
            return date < today ? 'past-available' : 'available';
        }

        if (date < today) return 'completed';

        if (booking.status === 'Pending Payment') return 'pending';
        if (booking.status === 'Cancelled') return 'cancelled';

        return 'booked';
    };

    const statusStyles = {
        available: 'hover:bg-gray-100',
        'past-available': 'bg-gray-100 text-gray-400',
        booked: 'bg-red-300 text-red-900 font-semibold',
        pending: 'bg-yellow-200 text-yellow-900 font-semibold',
        cancelled: 'bg-red-100 text-red-500 line-through',
        completed: 'bg-amber-300 text-amber-800 font-semibold'
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the 1st
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = getBookingStatus(dateStr);

            days.push({
                day,
                dateStr,
                status
            });

        }

        return days;
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthYear = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = getDaysInMonth();

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={previousMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-semibold">{monthYear}</h3>

                <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Next month"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`aspect-square flex flex-col items-center justify-center text-sm rounded
                                ${!day ? 'invisible' : statusStyles[day.status]}`}
                                title={day?.status}
                            >
                                <span>{day?.day}</span>

                                {day?.status === 'completed' && (
                                    <span className="text-xs">✓</span>
                                )}

                                {['booked', 'pending', 'cancelled'].includes(day?.status) && (
                                    <span className="text-xs capitalize">
                                        {day.status}
                                    </span>
                                )}
                            </div>

                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                            <span className="text-sm text-gray-700">Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                            <span className="text-sm text-gray-700">Past</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
                            <span className="text-sm text-gray-700">Completed</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}