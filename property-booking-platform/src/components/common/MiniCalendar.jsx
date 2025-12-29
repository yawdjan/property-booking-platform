import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingsAPI } from '../../services/api';

const MiniCalendar = ({ propertyId }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookingRanges, setBookingRanges] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch booking ranges when month changes
    useEffect(() => {
        if (!propertyId) return;

        const fetchBookingRanges = async () => {
            setLoading(true);
            try {
                // Use the unavailableBookingRanges endpoint which includes status
                const response = await bookingsAPI.getUnavailableRanges(propertyId);
                const ranges = response?.unavailableRanges ?? response?.data?.unavailableRanges ?? [];
                
                console.log('📅 Fetched booking ranges with status:', ranges);
                setBookingRanges(ranges);
            } catch (error) {
                console.error('Error fetching booking ranges:', error);
                setBookingRanges([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingRanges();
    }, [propertyId, currentMonth]); // Re-fetch when month changes (optional optimization)

    const getDateStatus = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        // Check if this date falls within any booking range
        const matchingRange = bookingRanges.find(range => {
            const start = new Date(range.start);
            const end = new Date(range.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            
            return date >= start && date <= end;
        });

        // If no booking, it's available or past
        if (!matchingRange) {
            return date < today ? 'past-available' : 'available';
        }

        // We have a booking - determine status
        const { status, end } = matchingRange;
        const checkOutDate = new Date(end);
        checkOutDate.setHours(0, 0, 0, 0);

        // Auto-complete bookings that have passed checkout
        if (status === 'Booked' && checkOutDate < today) {
            return 'completed';
        }

        // Map status to display status
        const statusMap = {
            'Cancelled': 'cancelled',
            'Pending Payment': 'pending',
            'Booked': 'booked',
            'Completed': 'completed'
        };

        return statusMap[status] || 'available';
    };

    const statusStyles = {
        available: {
            bg: 'bg-white hover:bg-gray-50',
            text: 'text-gray-900',
            border: 'border-gray-200'
        },
        'past-available': {
            bg: 'bg-gray-50',
            text: 'text-gray-400',
            border: 'border-gray-100'
        },
        booked: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300'
        },
        pending: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300'
        },
        completed: {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-300'
        },
        cancelled: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300'
        }
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

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthYear = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={loading}
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="font-semibold text-gray-900">{monthYear}</h3>
                <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={loading}
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8 text-gray-500 text-sm">
                    Loading...
                </div>
            )}

            {/* Calendar Grid */}
            {!loading && (
                <>
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-gray-600 py-1"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((dayObj, index) => {
                            if (!dayObj) {
                                return <div key={`empty-${index}`} className="aspect-square" />;
                            }

                            const { day, dateStr, status, isPast } = dayObj;
                            const styles = statusStyles[status] || statusStyles.available;

                            return (
                                <div
                                    key={dateStr}
                                    className={`
                                        aspect-square flex items-center justify-center
                                        text-xs font-medium rounded-lg border transition-colors
                                        ${styles.bg} ${styles.text} ${styles.border}
                                        ${isPast && status === 'available' ? 'cursor-not-allowed' : ''}
                                    `}
                                    title={`${dateStr} - ${status.replace('-', ' ')}`}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-white border border-gray-200"></div>
                        <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
                        <span className="text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
                        <span className="text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div>
                        <span className="text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                        <span className="text-gray-600">Cancelled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-50 border border-gray-100"></div>
                        <span className="text-gray-600">Past</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiniCalendar;