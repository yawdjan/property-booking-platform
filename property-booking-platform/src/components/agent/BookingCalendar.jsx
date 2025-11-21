import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { websocket } from '../../services/websocket';
import { calculateNights } from '../../utils/helpers';
import { propertiesAPI, bookingsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function BookingCalendar() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState({});
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const { currentUser } = useApp(); // ← Make sure this is imported

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [properties]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
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

      console.log('Creating booking with data:', bookingData); // DEBUG

      const response = await bookingsAPI.create(bookingData);

      console.log('Full response:', response); // DEBUG
      console.log('Response data:', response.data); // DEBUG

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

      console.log('Extracted booking ID:', bookingId); // DEBUG

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

  const checkPropertyAvailability = async () => {
    try {
      // Check existing bookings for this property
      const response = await bookingsAPI.getAll();

      console.log('All bookings:', response);

      const propertyBookings = response.data?.filter(
        b => b.propertyId === selectedProperty.id || b.property_id === selectedProperty.id
      ) || [];

      console.log(`Bookings for property ${selectedProperty.id}:`, propertyBookings);

      // Check for conflicts
      const conflicts = propertyBookings.filter(booking => {
        const bookingStart = new Date(booking.checkIn || booking.check_in);
        const bookingEnd = new Date(booking.checkOut || booking.check_out);
        const selectedStart = new Date(checkIn);
        const selectedEnd = new Date(checkOut);

        // Check if dates overlap
        const overlaps = (
          (selectedStart >= bookingStart && selectedStart < bookingEnd) ||
          (selectedEnd > bookingStart && selectedEnd <= bookingEnd) ||
          (selectedStart <= bookingStart && selectedEnd >= bookingEnd)
        );

        return overlaps && booking.status !== 'cancelled' && booking.status !== 'expired';
      });

      setDebugInfo({
        totalBookings: propertyBookings.length,
        conflicts: conflicts,
        propertyId: selectedProperty.id
      });

      alert(`Found ${propertyBookings.length} total bookings, ${conflicts.length} conflicts`);

    } catch (err) {
      console.error('Debug error:', err);
      alert('Failed to check: ' + err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    alert('Link copied to clipboard!');
  };

  const minCheckIn = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create Booking</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Property Details</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Property</label>
            <select
              value={selectedProperty.id}
              onChange={(e) => setSelectedProperty(properties.find(p => p.id === Number(e.target.value)))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>
                  {prop.name} - ${prop.nightlyRate}/night
                </option>
              ))}
            </select>
          </div>

          <img
            src={selectedProperty.image}
            alt={selectedProperty.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />

          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Address:</span> {selectedProperty.address}</p>
            <p><span className="font-medium">Nightly Rate:</span> ${selectedProperty.nightlyRate}</p>
            <p><span className="font-medium">Cleaning Fee:</span> ${selectedProperty.cleaningFee}</p>
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
                <p className="text-xs text-gray-600 mt-1">
                  {calculateNights(checkIn, checkOut)} nights × ${selectedProperty.nightlyRate} + ${parseFloat(selectedProperty.cleaningFee)} cleaning fee
                </p>
              </div>
            )}

            <button
              onClick={generatePaymentLink}
              disabled={!checkIn || !checkOut || !clientEmail}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generate Payment Link
            </button>
          </div>
        </div>
      </div>

      {showPaymentLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-2 text-green-600 mb-4">
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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