import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { bookingsAPI, propertiesAPI, agentsAPI } from '../../services/api';
import StatusBadge from '../common/Statusbage';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [bookingsRes, propertiesRes, agentsRes] = await Promise.all([
        bookingsAPI.getAll(),
        propertiesAPI.getAll(),
        agentsAPI.getAll()
      ]);
      
      // Handle different response structures
      setBookings(bookingsRes.data || bookingsRes || []);
      setProperties(propertiesRes.data || propertiesRes || []);
      setAgents(agentsRes.data || agentsRes || []);
      
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">All Bookings</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No bookings found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Bookings</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-4 px-6">ID</th>
              <th className="text-left py-4 px-6">Property</th>
              <th className="text-left py-4 px-6">Agent</th>
              <th className="text-left py-4 px-6">Client Email</th>
              <th className="text-left py-4 px-6">No of Nights</th>
              <th className="text-left py-4 px-6">Check-in</th>
              <th className="text-left py-4 px-6">Check-out</th>
              <th className="text-left py-4 px-6">Status</th>
              <th className="text-left py-4 px-6">Amount</th>
              <th className="text-left py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => {
              // Find property and agent from their respective arrays
              const property = properties?.find(p => 
                p.id === booking.propertyId || p.id === booking.property_id
              );
              const agent = agents?.find(a => 
                a.id === booking.agentId || a.id === booking.agent_id
              );
              
              return (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">#{booking.id}</td>
                  <td className="py-4 px-6">
                    {property?.name || booking.propertyName || booking.property_name || 'Unknown'}
                  </td>
                  <td className="py-4 px-6">
                    {agent?.name || agent?.email || 'Unknown Agent'}
                  </td>
                  <td className="py-4 px-6">
                    {booking.clientEmail || booking.client_email}
                  </td>
                  <td className="py-4 px-6">
                    {booking.numberOfNights || booking.number_of_nights}
                  </td>
                  <td className="py-4 px-6">
                    {new Date(booking.checkIn || booking.check_in).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    {new Date(booking.checkOut || booking.check_out).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    < StatusBadge 
                      status={booking.status || booking.booking_status} 
                      size="sm" 
                      showDot={true} 
                    />
                  </td>
                  <td className="py-4 px-6 font-semibold">
                  ¢{Number(booking.total || booking.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      className="p-2 text-primary-400 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}