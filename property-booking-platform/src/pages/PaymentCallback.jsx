import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { paymentAPI } from '../services/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    verifyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');

      if (!reference && !trxref) {
        setStatus('failed');
        setMessage('Payment reference not found');
        return;
      }

      const refToUse = reference || trxref;
      const response = await paymentAPI.verifyPayment(refToUse);

      // ✅ Check response.data.success instead of response.success
      console.log('Full response:', response);
      console.log('Response.data:', response.data);

      if (response.data && response.data.success) {
        setStatus('success');
        setMessage('Payment successful! Your booking is confirmed.');
        setTimeout(() => navigate('/agent/bookings'), 3000);
      } else {
        setStatus('failed');
        setMessage('Payment verification failed. Please contact support.');
      }

    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
      setMessage('Failed to verify payment: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader className="w-16 h-16 text-primary-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/agent/bookings')}
              className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-secondary-500"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}