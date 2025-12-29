import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { getStatusColor } from '../../constants/statusColors';

export default function MiniCalendar({ propertyId }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookingDates, setBookingDates] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadBookingDates = useCallback(async () => {
        try {
            setLoading(true);
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
            const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const response = await bookingsAPI.getUnavailableDates(propertyId, firstDay, lastDay);
            const dates = response?.unavailableDates ?? response?.data ?? [];

            console.log('📅 Fetched booking dates for', firstDay, '->', lastDay, dates);
            setBookingDates(dates);
        } catch (error) {
            console.error('Failed to load booking dates:', error);
        } finally {
            setLoading(false);
        }
    }, [propertyId, currentMonth]);

    useEffect(() => {
        loadBookingDates();
    }, [loadBookingDates]);

    const getDateStatus = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        // Check if date has a booking
        const booking = bookingDates.find(b => {
            if (typeof b === 'string') {
                return b === dateStr;
            }
            return b.date === dateStr;
        });

        if (!booking) {
            return date < today ? 'past-available' : 'available';
        }

        // If booking is just a string (old API format), treat as booked
        if (typeof booking === 'string') {
            return date < today ? 'completed' : 'booked';
        }

        // New format with status
        const { status, checkOut } = booking;
        const checkOutDate = new Date(checkOut);
        checkOutDate.setHours(0, 0, 0, 0);

        // Auto-complete bookings that have passed checkout
        if (status === 'Booked' && checkOutDate < today) {
            return 'completed';
        }

        if (status === 'Cancelled') return 'cancelled';
        if (status === 'Pending Payment') return 'pending';
        if (status === 'Booked') return 'booked';
        if (status === 'Completed') return 'completed';

        return 'available';
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
            const status = getDateStatus(dateStr);
            const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);

            days.push({
                day,
                dateStr,
                status,
                isPast
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

    // Status styling configuration
    const statusStyles = {
        'available': {
            bg: 'bg-white hover:bg-gray-50',
            text: 'text-gray-900',
            border: 'border border-gray-200'
        },
        'past-available': {
            bg: 'bg-gray-50',
            text: 'text-gray-400',
            border: 'border border-gray-100'
        },
        'booked': {
            bg: 'bg-green-100',
            text: 'text-green-900',
            border: 'border border-green-300'
        },
        'pending': {
            bg: 'bg-yellow-100',
            text: 'text-yellow-900',
            border: 'border border-yellow-300'
        },
        'completed': {
            bg: 'bg-amber-100',
            text: 'text-amber-900',
            border: 'border border-amber-300'
        },
        'cancelled': {
            bg: 'bg-red-100',
            text: 'text-red-900',
            border: 'border border-red-300'
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            {/* Header */}
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
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            if (!day) {
                                return <div key={index} className="invisible" />;
                            }

                            const style = statusStyles[day.status] || statusStyles.available;

                            return (
                                <div
                                    key={index}
                                    className={`
                                        aspect-square flex items-center justify-center text-sm rounded
                                        ${style.bg} ${style.text} ${style.border}
                                        transition-colors duration-150
                                    `}
                                    title={day.status.replace('-', ' ')}
                                >
                                    <span className="font-medium">{day.day}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                                <span className="text-gray-600">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                <span className="text-gray-600">Booked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                                <span className="text-gray-600">Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
                                <span className="text-gray-600">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                <span className="text-gray-600">Cancelled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-50 border border-gray-100 rounded"></div>
                                <span className="text-gray-600">Past</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}