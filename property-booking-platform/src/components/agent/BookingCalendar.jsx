/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { websocket } from '../../services/websocket';
import { calculateNights } from '../../utils/helpers';
import { propertiesAPI, bookingsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import MiniCalendar from '../common/MiniCalendar';

export default function BookingCalendar() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const { currentUser } = useApp(); // ← Make sure this is imported

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0]);
    }
  }, [properties]);

  // Load unavailable dates when property changes
  useEffect(() => {
    if (selectedProperty) {
      loadUnavailableDates();
    }
  }, [selectedProperty]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getAll();
      setProperties(response.data);
    } catch (err) {
      setError('Failed to load properties: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  // Add keyboard navigation for the gallery modal
  useEffect(() => {
    if (!showGallery) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowGallery(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery]);

  const loadUnavailableDates = async () => {
    if (!selectedProperty) return;

    try {
      // Fetch per-day unavailable dates instead of ranges.
      // Request a reasonable booking horizon (next 6 months) so conflict checks work.
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const sixMonthsLater = new Date(today.getFullYear(), today.getMonth() + 6, 0);
      const lastDay = sixMonthsLater.toISOString().split('T')[0];

      const response = await bookingsAPI.getUnavailableDates(selectedProperty.id, firstDay, lastDay);

      // bookingsAPI client usually unwraps axios response.data already.
      const dates = response?.unavailableDates ?? response?.data ?? [];

      // Make sure dates are deduplicated and in YYYY-MM-DD format
      const uniqueDates = [...new Set(dates.map(d => (d.includes('T') ? d.split('T')[0] : d)))];

      setUnavailableDates(uniqueDates);

    } catch (error) {
      console.error('Failed to load unavailable dates:', error);
    }
  };

  // Check if selected dates conflict with existing bookings
  const hasDateConflict = () => {
    if (!checkIn || !checkOut) return false;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // Exclude the checkout date (move checkout back by one day)
    end.setDate(end.getDate() - 1);

    if (start > end) return false;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      if (unavailableDates.includes(dateStr)) {
        return true;
      }
    }
    return false;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !selectedProperty) return 0;
    const nights = calculateNights(checkIn, checkOut);
    const nightlyRate = parseFloat(selectedProperty.nightlyRate) || 0;
    const cleaningFee = parseFloat(selectedProperty.cleaningFee) || 0;
    return (nightlyRate * nights) + cleaningFee;
  };

  const generatePaymentLink = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        alert('User not logged in. Please log in first.');
        return;
      }
      const total = calculateTotal().toFixed(2);
      const nights = calculateNights(checkIn, checkOut);

      const bookingData = {
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        checkIn,
        checkOut,
        clientEmail,
        nights,
        nightlyRate: selectedProperty.nightlyRate,
        cleaningFee: selectedProperty.cleaningFee,
        total,
        status: 'pending_payment',
        paymentStatus: 'pending'
      };

      const response = await bookingsAPI.create(bookingData);

      // Handle different response structures
      let bookingId;

      // Check different possible response structures
      if (response.data && response.data.id) {
        bookingId = response.data.id;
      } else if (response.id) {
        bookingId = response.id;
      } else if (response.data && response.data.booking && response.data.booking.id) {
        bookingId = response.data.booking.id;
      } else {
        console.error('Could not find booking ID in response:', response);
        alert('Error: Booking created but ID not returned. Check console.');
        return;
      }

      if (!bookingId) {
        alert('Error: Booking ID is missing. Please check your backend response.');
        return;
      }

      // Generate payment link with the booking ID
      const link = `${window.location.origin}/pay/${bookingId}`;
      setPaymentLink(link);
      setShowPaymentLink(true);

      websocket.emit('notification', {
        id: Date.now(),
        type: 'success',
        message: `Payment link generated for ${selectedProperty.name}`,
        time: new Date().toISOString()
      });
    } catch (err) {
      console.error('Full error:', err.response?.data || err); // DEBUG
      alert('Failed to create booking: ' + (err.message || JSON.stringify(err)));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    alert('Link copied to clipboard!');
  };

  const getMinCheckInDate = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // If it's before 2 PM (14:00), allow today's date
    if (currentHour < 14) {
      return now.toISOString().split('T')[0];
    }

    // Otherwise, minimum is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const minCheckIn = getMinCheckInDate();

  // ✅ ALL GUARD CLAUSES BEFORE THE MAIN RETURN
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (properties.length === 0) {
    return <div className="text-gray-600">No properties available</div>;
  }
  if (!selectedProperty) {
    return <div>Loading property details...</div>;
  }

  const dateConflict = hasDateConflict();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create Booking</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Property Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Property Details</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Property</label>
            <select
              value={selectedProperty?.id || ''}
              onChange={(e) => {
                const property = properties.find(p => p.id === e.target.value);
                setSelectedProperty(property);
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>
                  {prop.name} - ${prop.nightlyRate}/night
                </option>
              ))}
            </select>
          </div>

          {/* Main Image */}
          {selectedProperty.images && selectedProperty.images.length > 0 && (
            <>
              <div
                className="relative mb-3 group focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-lg"
                tabIndex={0}
                onKeyDown={(e) => {
                  const imgs = selectedProperty.images || [];
                  if (imgs.length === 0) return;
                  const imgEl = document.getElementById('booking-carousel-img');
                  const counter = document.getElementById('booking-carousel-counter');
                  if (!imgEl) return;
                  const cur = parseInt(imgEl.getAttribute('data-index') || '0', 10);
                  if (e.key === 'ArrowLeft') {
                    const next = (cur - 1 + imgs.length) % imgs.length;
                    imgEl.src = imgs[next];
                    imgEl.setAttribute('data-index', String(next));
                    if (counter) counter.textContent = next + 1;
                  } else if (e.key === 'ArrowRight') {
                    const next = (cur + 1) % imgs.length;
                    imgEl.src = imgs[next];
                    imgEl.setAttribute('data-index', String(next));
                    if (counter) counter.textContent = next + 1;
                  }
                }}
              >
                <img
                  id="booking-carousel-img"
                  data-index="0"
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.name}
                  className="w-full h-64 object-cover rounded-lg transition-opacity duration-300 cursor-pointer"
                  onClick={() => setShowGallery(true)}
                />

                {selectedProperty.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => {
                        const imgs = selectedProperty.images || [];
                        const imgEl = document.getElementById('booking-carousel-img');
                        const counter = document.getElementById('booking-carousel-counter');
                        if (!imgEl || imgs.length === 0) return;
                        const cur = parseInt(imgEl.getAttribute('data-index') || '0', 10);
                        const next = (cur - 1 + imgs.length) % imgs.length;
                        imgEl.src = imgs[next];
                        imgEl.setAttribute('data-index', String(next));
                        if (counter) counter.textContent = next + 1;
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 
                       bg-white/90 hover:bg-white shadow-lg
                       rounded-full p-2.5 
                       opacity-0 group-hover:opacity-100 
                       transition-all duration-200
                       hover:scale-110 active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => {
                        const imgs = selectedProperty.images || [];
                        const imgEl = document.getElementById('booking-carousel-img');
                        const counter = document.getElementById('booking-carousel-counter');
                        if (!imgEl || imgs.length === 0) return;
                        const cur = parseInt(imgEl.getAttribute('data-index') || '0', 10);
                        const next = (cur + 1) % imgs.length;
                        imgEl.src = imgs[next];
                        imgEl.setAttribute('data-index', String(next));
                        if (counter) counter.textContent = next + 1;
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 
                       bg-white/90 hover:bg-white shadow-lg
                       rounded-full p-2.5 
                       opacity-0 group-hover:opacity-100 
                       transition-all duration-200
                       hover:scale-110 active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-3 right-3 
                         bg-black/60 backdrop-blur-sm 
                         text-white text-sm font-medium 
                         px-3 py-1.5 rounded-full">
                      <span id="booking-carousel-counter">1</span> / {selectedProperty.images.length}
                    </div>

                    {/* View All Photos Button */}
                    <button
                      type="button"
                      onClick={() => setShowGallery(true)}
                      className="absolute bottom-3 left-3 
                       px-3 py-1.5 
                       bg-white/90 backdrop-blur-sm 
                       rounded-full 
                       text-sm font-semibold text-gray-800 
                       hover:bg-white 
                       transition-all shadow-lg
                       opacity-0 group-hover:opacity-100"
                    >
                      View All Photos
                    </button>
                  </>
                )}
              </div>

              {/* Full Screen Gallery Modal */}
              {showGallery && (
                <div
                  className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                  onClick={() => setShowGallery(false)} // Close when clicking backdrop
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      setShowGallery(false);
                    }}
                    className="absolute z-50 top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      const imgs = selectedProperty.images || [];
                      if (imgs.length === 0) return;
                      const imgEl = document.getElementById('booking-carousel-img');
                      const counter = document.getElementById('booking-carousel-counter');
                      const galleryImg = document.getElementById('booking-gallery-img');
                      const galleryCounter = document.getElementById('booking-gallery-counter');

                      if (!imgEl) return;
                      const cur = parseInt(imgEl.getAttribute('data-index') || '0', 10);

                      if (e.key === 'ArrowLeft') {
                        const next = (cur - 1 + imgs.length) % imgs.length;
                        imgEl.src = imgs[next];
                        imgEl.setAttribute('data-index', String(next));
                        if (counter) counter.textContent = next + 1;
                        if (galleryImg) galleryImg.src = imgs[next];
                        if (galleryCounter) galleryCounter.textContent = next + 1;
                      } else if (e.key === 'ArrowRight') {
                        const next = (cur + 1) % imgs.length;
                        imgEl.src = imgs[next];
                        imgEl.setAttribute('data-index', String(next));
                        if (counter) counter.textContent = next + 1;
                        if (galleryImg) galleryImg.src = imgs[next];
                        if (galleryCounter) galleryCounter.textContent = next + 1;
                      }
                    }}
                  >
                    <img
                      id="booking-gallery-img"
                      src={selectedProperty.images[parseInt(document.getElementById('booking-carousel-img')?.getAttribute('data-index') || '0', 10)]}
                      alt={selectedProperty.name}
                      className="max-w-full max-h-full object-contain"
                    />

                    {selectedProperty.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const imgs = selectedProperty.images || [];
                            const imgEl = document.getElementById('booking-carousel-img');
                            const counter = document.getElementById('booking-carousel-counter');
                            const galleryImg = document.getElementById('booking-gallery-img');
                            const galleryCounter = document.getElementById('booking-gallery-counter');

                            if (!imgEl || imgs.length === 0) return;
                            const cur = parseInt(imgEl.getAttribute('data-index') || '0', 10);
                            const next = (cur - 1 + imgs.length) % imgs.length;
                            imgEl.src = imgs[next];
                            imgEl.setAttribute('data-index', String(next));
                            if (counter) counter.textContent = next + 1;
                            if (galleryImg) galleryImg.src = imgs[next];
                            if (galleryCounter) galleryCounter.textContent = next + 1;
                          }}
                          className="absolute left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <button
                          onClick={() => {
                            const imgs = selectedProperty.images || [];
                            const imgEl = document.getElementById('booking-carousel-img');
                            const counter = document.getElementById('booking-carousel-counter');
                            const galleryImg = document.getElementById('booking-gallery-img');
                            const galleryCounter = document.getElementById('booking-gallery-counter');

                            if (!imgEl || imgs.length === 0) return;
                            const cur = parseInt(imgEl.getAttribute('data-index') || '0', 10);
                            const next = (cur + 1) % imgs.length;
                            imgEl.src = imgs[next];
                            imgEl.setAttribute('data-index', String(next));
                            if (counter) counter.textContent = next + 1;
                            if (galleryImg) galleryImg.src = imgs[next];
                            if (galleryCounter) galleryCounter.textContent = next + 1;
                          }}
                          className="absolute right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <p className="text-white font-semibold">
                            <span id="booking-gallery-counter">{parseInt(document.getElementById('booking-carousel-img')?.getAttribute('data-index') || '0', 10) + 1}</span> / {selectedProperty.images.length}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Address:</span> {selectedProperty.address}</p>
            <p><span className="font-medium">Nightly Rate:</span> ${selectedProperty.nightlyRate}</p>
            <p><span className="font-medium">Cleaning Fee:</span> ${selectedProperty.cleaningFee}</p>
          </div>
          {/* Mini Calendar */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Availability Calendar</h4>
            <MiniCalendar propertyId={selectedProperty.id} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Booking Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Check-in Date</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={minCheckIn}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Check-out Date</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || minCheckIn}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@email.com"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {checkIn && checkOut && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Booking Summary</p>
                <p className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {calculateNights(checkIn, checkOut)} nights × ${selectedProperty.nightlyRate} + ${parseFloat(selectedProperty.cleaningFee)} cleaning fee
                </p>
              </div>
            )}

            <button
              onClick={generatePaymentLink}
              disabled={!checkIn || !checkOut || !clientEmail}
              className="w-full px-4 py-3 bg-primary-400 text-white rounded-lg hover:bg-secondary-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generate Payment Link
            </button>
          </div>
        </div>
      </div>

      {showPaymentLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-2 text-primary-400 mb-4">
              <Check className="w-6 h-6" />
              <h3 className="text-xl font-bold">Payment Link Generated!</h3>
            </div>
            <p className="text-gray-600 mb-4">Share this link with your client:</p>
            <div className="p-3 bg-gray-100 rounded-lg mb-4 break-all text-sm">
              {paymentLink}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              This link will expire in 24 hours if payment is not completed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-secondary-500"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowPaymentLink(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}