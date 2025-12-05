import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingsAPI } from '../../services/api';

export default function MiniCalendar({ propertyId }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadUnavailableDates = useCallback(async () => {
        try {
            setLoading(true);
            // Use the API that returns individual unavailable dates for a window
            // Query param names expected by backend: startDate / endDate
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
            const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const response = await bookingsAPI.getUnavailableDates(propertyId, firstDay, lastDay);
            // The API returns { success, propertyId, unavailableDates } (axios wrapper already returns response.data)
            const dates = response?.unavailableDates ?? response?.data ?? [];

            console.log('📅 Fetched unavailable dates for', firstDay, '->', lastDay, dates);

            // Remove duplicates (safety)
            const uniqueDates = [...new Set(dates)];
            console.log('🔴 Unavailable dates:', uniqueDates); // DEBUG
            setUnavailableDates(uniqueDates);
        } catch (error) {
            console.error('Failed to load unavailable dates:', error);
        } finally {
            setLoading(false);
        }
    }, [propertyId, currentMonth]);

    useEffect(() => {
        loadUnavailableDates();
    }, [propertyId, currentMonth]);

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
            const isUnavailable = unavailableDates.includes(dateStr);

            const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);

            // DEBUG: Log a few dates to check
            if (day <= 3) {
                console.log(`Day ${day}: ${dateStr}, isUnavailable: ${isUnavailable}, in array: ${unavailableDates.includes(dateStr)}`);
            }

            days.push({
                day,
                dateStr,
                isUnavailable,
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
                                className={`
                  aspect-square flex items-center justify-center text-sm rounded
                  ${!day ? 'invisible' : ''}
                  ${day?.isPast ? 'text-gray-300' : ''}
                  ${day?.isUnavailable
                                        ? 'bg-red-300 text-red-900 font-semibold'
                                        : day?.isPast
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'hover:bg-gray-100'
                                    }
                `}
                                title={day?.isUnavailable ? 'Unavailable' : ''}
                            >
                                {day?.day}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 rounded"></div>
                            <span>Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-50 rounded"></div>
                            <span>Past</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}