import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { bookingsAPI } from '../services/api';

export default function PaymentPage() {
  const { paymentId: bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId || bookingId === 'undefined') {
      setError('Invalid booking ID');
      setLoading(false);
      return;
    }
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await bookingsAPI.getById(bookingId);
      const bookingData = response.data || response;

      console.log('Booking data:', bookingData);

      if (!bookingData) {
        setError('Booking not found');
        return;
      }

      setBooking(bookingData);

      // ✅ Get payment URL from booking record
      const paymentUrl = bookingData.paymentUrl;

      console.log('Payment URL:', paymentUrl);

      if (!paymentUrl) {
        setError('Payment link not found. Please contact support.');
        return;
      }

      setPaymentLink(paymentUrl);

      // Check if already paid
      if (bookingData.status === 'Confirmed') {
        setError('This booking has already been paid.');
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };


  const handlePayNow = () => {
    console.log('Pay Now clicked. Payment link:', paymentLink);

    if (!paymentLink) {
      alert('Payment link not found. Please try again or contact support.');
      return;
    }

    // Redirect to Paystack
    window.location.href = paymentLink;
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
          <p className="text-sm text-gray-500 mt-2">Booking ID: {bookingId}</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Booking ID: {bookingId || 'Not provided'}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchBookingDetails}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NO BOOKING STATE
  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find a booking with this ID.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // MAIN PAYMENT UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={24} />
            <h2 className="text-2xl font-bold">Secure Payment</h2>
          </div>
          <p className="text-blue-100 text-sm">Booking ID: #{bookingId}</p>
        </div>

        <div className="p-8">
          {/* Booking Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
            <h3 className="font-bold text-lg mb-3 text-gray-800">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Property:</span>
                <span className="font-semibold">{booking.propertyName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-semibold">
                  {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-semibold">
                  {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nights:</span>
                <span className="font-semibold">{booking.numberOfNights} nights</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nightly Rate:</span>
                <span className="font-semibold">${Number(booking.nightlyRate).toFixed(2)}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cleaning Fee:</span>
                <span className="font-semibold">${Number(booking.cleaningFee).toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-blue-200 mt-4 pt-4 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total Amount:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${Number(booking.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Debug info (remove in production) */}
          {!paymentLink && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Payment link not found. Check console for details.
            </div>
          )}

          {/* Pay Now Button */}
          <button
            onClick={handlePayNow}
            disabled={!paymentLink}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            Proceed to Paystack Payment
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle size={16} className="text-green-500" />
            <span>Secure payment powered by Paystack</span>
          </div>
        </div>
      </div>
    </div>
  );
}