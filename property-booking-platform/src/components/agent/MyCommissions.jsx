import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { bookingsAPI, commissionsAPI, propertiesAPI } from '../../services/api.js';
import StatusBadge from '../common/Statusbage.jsx';

export default function MyCommissions() {
  const { currentUser } = useApp();
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agentBookings = bookings.filter(b =>
    b.agentId === currentUser.id && b.status === 'Completed'
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getByAgent(currentUser.id);
      setBookings(response.data);
      const propResponse = await propertiesAPI.getAll();
      setProperties(propResponse.data);
      const payoutResponse = await commissionsAPI.getMyPayouts();
      setPayoutRequests(payoutResponse.data);
    } catch (err) {
      setError('Failed to load bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = () => {
    // Handle payout request submission
    // Add API call here
    try {
      // Example API call
      commissionsAPI.requestPayout(
        currentUser.id,
        requestAmount,
        requestDescription
      );
      alert('Payout request submitted!');
    } catch (err) {
      alert('Failed to submit payout request: ' + err.message);
    } finally {
      setShowRequestModal(false);
      setRequestAmount('');
      setRequestDescription('');
      loadData();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-primary-50 text-amber-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'denied':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const totalEarned = agentBookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + parseFloat(b.commissionAmount || 0), 0);
  // TODO: add this logic to both front and backend
  const paid = Array.isArray(payoutRequests)
    ? payoutRequests
      .filter(b => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.approvedAmount), 0)
    : 0;
  const pendingPayout = totalEarned - paid;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Commissions</h2>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-amber-700">Track your earnings and request payouts</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-secondary-500 text-white rounded-xl font-semibold hover:bg-primary-400 transition-all shadow-lg"
        >
          <Send className="w-5 h-5" />
          Request Payout
        </button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Earned</h3>
          <p className="text-3xl font-bold text-primary-400">${totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Paid Out</h3>
          <p className="text-3xl font-bold text-primary-400">${paid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pending Payout</h3>
          <p className="text-3xl font-bold text-orange-600">${pendingPayout.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Booking History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4">Booking ID</th>
                <th className="text-left py-3 px-4">Property</th>
                <th className="text-left py-3 px-4">Total Amount</th>
                <th className="text-left py-3 px-4">Commission Rate</th>
                <th className="text-left py-3 px-4">Commission Earned</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {agentBookings.map(booking => {
                const property = properties.find(p => p.id === booking.propertyId);
                return (
                  <tr key={booking.id} className="border-b">
                    <td className="py-3 px-4">#{booking.id}</td>
                    <td className="py-3 px-4">{property?.name}</td>
                    <td className="py-3 px-4">${booking.totalAmount}</td>
                    <td className="py-3 px-4">{booking.commissionRate}%</td>
                    <td className="py-3 px-4 font-semibold">${booking.commissionAmount}</td>
                    <td className="py-3 px-4">
                      < StatusBadge status={booking.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Commission History */}
          <div className="bg-white rounded-2xl mt-10 shadow-lg border-2 border-primary-50 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-4 border-b-2 border-amber-200">
              <h2 className="text-xl font-bold text-amber-950">Commission History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-amber-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Comission ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Earned Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Note</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Last Updated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {payoutRequests.map(c => {
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-amber-950">#{c.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-secondary-500">${c.requestedAmount}</td>
                        <td className="px-6 py-4 text-sm text-amber-700">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(c.status)}`}>
                            {getStatusIcon(c.status)}
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-secondary-500">${c.notes}</td>
                        <td className="px-6 py-4 text-sm text-amber-700">
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Request Payout Modal */}
          {showRequestModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-secondary-500 to-primary-400 px-6 py-4 rounded-t-2xl">
                  <h3 className="text-xl font-bold text-white">Request Payout</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-2">
                      Available Balance
                    </label>
                    <p className="text-3xl font-bold text-secondary-500">${pendingPayout.toFixed(2)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-2">
                      Request Amount
                    </label>
                    <input
                      type="number"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-primary-400 outline-none"
                      max={pendingPayout}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-2">
                      Description
                    </label>
                    <textarea
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      placeholder="Enter mobile money number, service provider and name as appears on your account. (required)/n Add a note about this payout request... (optional)"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-primary-400 outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-amber-300 text-amber-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestPayout}
                      className="flex-1 px-4 py-3 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition-colors"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}