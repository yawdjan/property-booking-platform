import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, Calendar, Home, Clock, Sparkles, Shield, Info } from 'lucide-react';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await bookingsAPI.getById(bookingId);
      const bookingData = response.data || response;

      if (!bookingData) {
        setError('Booking not found');
        return;
      }

      setBooking(bookingData);
      const paymentUrl = bookingData.paymentUrl;

      if (!paymentUrl) {
        setError('Payment link not found. Please contact support.');
        return;
      }

      setPaymentLink(paymentUrl);

      if (bookingData.status === 'Booked') {
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
    if (!paymentLink) {
      alert('Payment link not found. Please try again or contact support.');
      return;
    }
    window.location.href = paymentLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-primary-400 mx-auto mb-4"></div>
            <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400" size={24} />
          </div>
          <p className="text-gray-700 font-medium">Loading booking details...</p>
          <p className="text-sm text-gray-500 mt-1">Booking #{bookingId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Info className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Unable to Load Booking</h2>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <p className="text-sm text-gray-400 mb-6 text-center">Booking ID: {bookingId || 'Not provided'}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchBookingDetails}
              className="flex-1 py-3 bg-primary-400 text-white rounded-xl hover:bg-secondary-500 font-medium transition-all"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="text-gray-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find a booking with this ID.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-400 text-white rounded-xl hover:bg-secondary-500 font-medium transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <Shield className="text-green-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Secure Checkout</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-primary-400 via-primary-400 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Lock size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Complete Your Booking</h1>
                  <p className="text-blue-100 text-sm">Booking #{bookingId}</p>
                </div>
              </div>
              <Sparkles className="text-blue-200 hidden sm:block" size={24} />
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left Column - Property Info & Gallery */}
              <div className="lg:col-span-3 space-y-6">
                {/* Property Image Gallery */}
                <PropertyGallery booking={booking} />

                {/* Property Details Card */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Home className="text-primary-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {booking.propertyName || 'Property'}
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-blue-500" />
                          <span>Check-in: <strong className="text-gray-900">
                            {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-blue-500" />
                          <span>Check-out: <strong className="text-gray-900">
                            {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} className="text-blue-500" />
                          <span><strong className="text-gray-900">{booking.numberOfNights} nights</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Summary */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-8 space-y-6">
                  {/* Price Breakdown */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                      <CreditCard size={20} className="text-primary-400" />
                      Price Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">
                          ${Number(booking.nightlyRate).toFixed(2)} × {booking.numberOfNights} nights
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${(Number(booking.nightlyRate) * booking.numberOfNights).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Cleaning fee</span>
                        <span className="font-semibold text-gray-900">
                          ${Number(booking.cleaningFee).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-bold text-base">Total</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-indigo-600 bg-clip-text text-transparent">
                            ${Number(booking.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayNow}
                    disabled={!paymentLink}
                    className="w-full py-4 bg-gradient-to-r from-primary-400 to-indigo-600 text-white rounded-xl font-bold text-base hover:from-secondary-500 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    <Lock size={20} className="group-hover:scale-110 transition-transform" />
                    Proceed to Payment
                  </button>

                  {/* Security Badges */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="font-medium">Powered by Paystack</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Shield size={14} className="text-blue-500" />
                        <span>256-bit SSL</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Lock size={14} className="text-blue-500" />
                        <span>PCI Compliant</span>
                      </div>
                    </div>
                  </div>

                  {!paymentLink && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="mt-0.5 flex-shrink-0" />
                        <span>Payment link not found. Please contact support.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertyGallery({ booking }) {
  const images = booking?.property?.images ?? booking?.images ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-72 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200">
        <div className="text-center">
          <Home size={48} className="text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-500">No images available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-72 sm:h-80 lg:h-96 group">
        <img
          src={images[selectedIndex]}
          alt={`Property image ${selectedIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((src, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`h-20 rounded-xl overflow-hidden border-2 transition-all ${
                idx === selectedIndex 
                  ? 'border-primary-400 ring-2 ring-primary-400 ring-offset-2' 
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none`}
              aria-label={`Show image ${idx + 1}`}
            >
              <img 
                src={src} 
                alt={`thumbnail ${idx + 1}`} 
                className="w-full h-full object-cover hover:scale-110 transition-transform" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}