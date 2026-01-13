import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import StatCard from '../common/StatCard';
import { useApp } from '../../context/AppContext';
import { bookingsAPI, propertiesAPI } from '../../services/api.js';
import StatusBadge from '../common/Statusbage.jsx';

export default function AgentDashboard({ setActiveTab }) {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const quickActions = [
    { label: 'Create New Booking', tab: 'calendar', style: 'primary' },
    { label: 'View My Bookings', tab: 'my-bookings', style: 'secondary' },
    { label: 'Check Commissions', tab: 'commissions', style: 'secondary' }
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const agentBookings = bookings.filter(b => b.agentId === currentUser.id);
  const totalEarnings = agentBookings
    .filter(b => b.status === 'Completed'  )
    .reduce((sum, b) => sum + parseFloat(b.commissionAmount || 0), 0);
  const pendingEarnings = agentBookings
    .filter(b => b.status === 'Pending Payment')
    .reduce((sum, b) => sum + parseFloat(b.commissionAmount || 0), 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Welcome back, {currentUser.name}!</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Completed Bookings"
          value={agentBookings.length}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Total Earnings"
          value={`¢${totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Pending Payouts"
          value={`¢${pendingEarnings.toLocaleString()}`}
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => setActiveTab(action.tab)}
                className={`w-full px-4 py-3 rounded-lg text-left ${action.style === 'primary'
                    ? 'bg-primary-400 text-white hover:bg-secondary-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {action.label}
              </button>
            ))}
          </div>
          {/* <div className="mt-6 space-y-3">
            <button className="w-full px-4 py-3 bg-primary-400 text-white rounded-lg hover:bg-secondary-500 text-left">
              Create New Booking
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left">
              View My Bookings
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left">
              Check Commissions
            </button>
          </div> */}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {agentBookings.slice(0, 3).map(booking => {
              const property = properties.find(p => p.id === booking.propertyId);
              return (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{property?.name}</p>
                  <p className="text-sm text-gray-600">Check-in: {booking.checkIn}</p>
                  <StatusBadge status={booking.status} showDot={true} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}