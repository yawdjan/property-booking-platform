import React, { useEffect, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { bookingsAPI, propertiesAPI } from '../../services/api.js';

export default function MyBookings() {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
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

  const handleEdit = (booking) => {
    // TODO: Implement edit functionality
    console.log('Edit booking:', booking);
    // You might want to open a modal or navigate to an edit page
  };

  const copyPaymentLink = (booking) => {
    const url = `${window.location.origin}/pay/${booking.id}`;
    navigator.clipboard.writeText(url);
    alert("Payment link copied to clipboard!");
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      // Refresh the bookings list
      await loadData();
    } catch (err) {
      setError('Failed to delete booking: ' + err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;

  // Filter bookings after data is loaded
  const agentBookings = bookings.filter(b => b.agentId === currentUser.id);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

      {agentBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 mt-2">Your bookings will appear here once you create them</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-4 px-6">Property</th>
                <th className="text-left py-4 px-6">Client Email</th>
                <th className="text-left py-4 px-6">Check-in</th>
                <th className="text-left py-4 px-6">Check-out</th>
                <th className="text-left py-4 px-6">Status</th>
                <th className="text-left py-4 px-6">Amount</th>
                <th className="text-left py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agentBookings.map(booking => {
                const property = properties.find(p => p.id === booking.propertyId);
                return (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">{property?.name || 'N/A'}</td>
                    <td className="py-4 px-6">{booking.clientEmail}</td>
                    <td className="py-4 px-6">{booking.checkIn}</td>
                    <td className="py-4 px-6">{booking.checkOut}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'Booked' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Pending Payment' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">${booking.totalAmount}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {/* Edit → Copy Payment Link */}
                        <button
                          onClick={() => copyPaymentLink(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Copy payment link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete only if NOT Booked */}
                        {booking.status !== 'Booked' && (
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}