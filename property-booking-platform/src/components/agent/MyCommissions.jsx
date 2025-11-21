import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { websocket } from '../../services/websocket';
import { bookingsAPI, propertiesAPI } from '../../services/api.js';

export default function MyCommissions() {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agentBookings = bookings.filter(b =>
    b.agentId === currentUser.id && b.status === 'Confirmed'
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getByAgent(currentUser.id);
      setBookings(response.data);
      const propResponse = await propertiesAPI.getAll();
      setProperties(propResponse.data);
    } catch (err) {
      setError('Failed to load bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const totalEarned = agentBookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + parseFloat(b.commissionAmount || 0), 0);
  // TODO: add this logic to both front and backend
  const pendingPayout = agentBookings
    .filter(b => b.paymentStatus === 'Pending Payout')
    .reduce((sum, b) => sum + b.commission, 0);
  const paid = totalEarned - pendingPayout;

  const requestPayout = () => {
    websocket.emit('notification', {
      id: Date.now(),
      type: 'info',
      message: `Commission payout requested by ${currentUser.name} - $${pendingPayout}`,
      time: new Date().toISOString()
    });
    alert('Payout request submitted! Admin will process it shortly.');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Commissions</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Earned</h3>
          <p className="text-3xl font-bold text-blue-600">${totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Paid Out</h3>
          <p className="text-3xl font-bold text-green-600">${paid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pending Payout</h3>
          <p className="text-3xl font-bold text-orange-600">${pendingPayout.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Commission History</h3>
          {pendingPayout > 0 && (
            <button
              onClick={requestPayout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Request Payout
            </button>
          )}
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
                <th className="text-left py-3 px-4">Payment Status</th>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'Pending Payment'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}