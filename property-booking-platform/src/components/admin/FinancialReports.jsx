import React, { useState, useEffect} from 'react';
import { bookingsAPI, agentsAPI } from '../../services/api';

export default function FinancialReports() {
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, agentsRes] = await Promise.all([
        bookingsAPI.getAll(),
        agentsAPI.getAll()
      ]);
      setBookings(bookingsRes.data);
      setAgents(agentsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading financial reports...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);
    
  const totalCommissions = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.commission, 0);
    
  const pendingPayouts = bookings
    .filter(b => b.paymentStatus === 'Pending Payout')
    .reduce((sum, b) => sum + b.commission, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Financial Reports</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Commissions Paid</h3>
          <p className="text-3xl font-bold text-blue-600">
            ${(totalCommissions - pendingPayouts).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pending Payouts</h3>
          <p className="text-3xl font-bold text-orange-600">${pendingPayouts.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Commission Details</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4">Booking ID</th>
                <th className="text-left py-3 px-4">Agent</th>
                <th className="text-left py-3 px-4">Total Amount</th>
                <th className="text-left py-3 px-4">Commission</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.status === 'Confirmed').map(booking => {
                const agent = agents.find(a => a.id === booking.agentId);
                return (
                  <tr key={booking.id} className="border-b">
                    <td className="py-3 px-4">#{booking.id}</td>
                    <td className="py-3 px-4">{agent?.name}</td>
                    <td className="py-3 px-4">${booking.totalAmount}</td>
                    <td className="py-3 px-4">${booking.commission}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.paymentStatus.includes('Paid') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus}
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