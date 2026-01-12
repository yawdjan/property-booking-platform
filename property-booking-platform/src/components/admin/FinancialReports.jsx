import React, { useState, useEffect} from 'react';
import { bookingsAPI, agentsAPI, commissionsAPI } from '../../services/api';
import StatusBadge from '../common/Statusbage';

// Lightweight vertical bar chart built with divs (no external lib needed)
function VerticalBarChart({ title, labels = [], values = [], currency = false }) {
  if (!labels.length) return null;
  const numericValues = values.map(v => Number(v) || 0);
  const max = Math.max(...numericValues, 1);
  const maxPx = 160; // pixel height used for chart area
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <div className="flex items-end gap-3 h-44 md:h-56">
        {labels.map((label, idx) => {
          const value = numericValues[idx] || 0;
          // compute pixel height; ensure minimum for zero values so bars are visible
          const rawPx = Math.round((value / max) * maxPx);
          const barPx = value === 0 ? Math.max(8, Math.round(maxPx * 0.04)) : Math.max(8, rawPx);
          return (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-700 mb-1" title={`${label}: ${currency ? '¢' + value.toFixed(2) : value}`}>
                {currency ? '¢' + value.toFixed(2) : value}
              </div>
              <div className="w-full flex items-end justify-center">
                <div
                  className="w-4 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t transition-all"
                  style={{ height: `${barPx}px`, minHeight: '8px' }}
                  title={`${label}: ${currency ? '¢' + value.toFixed(2) : value}`}
                />
              </div>
              <div className="text-xs mt-2 text-center truncate w-full" title={label}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----- Helper chart components ----- */
function buildAgentStats(bookings, agents) {
  const map = new Map();
  agents.forEach(a => map.set(a.id, { id: a.id, name: a.name || a.email || a.id, amount: 0, count: 0 }));

  bookings.filter(b => b.status === 'Completed').forEach(b => {
    const agentId = b.agentId || b.agent?.id;
    if (!agentId) return;
    const amt = Number(b.totalAmount ?? 0) || 0;
    const entry = map.get(agentId) ?? { id: agentId, name: b.agent?.name || 'Unknown', amount: 0, count: 0 };
    entry.amount += amt;
    entry.count += 1;
    map.set(agentId, entry);
  });

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function AgentAmountChart({ bookings, agents, stats }) {
  // Use server-provided stats if present, otherwise build from bookings + agents
  const dataStats = buildAgentStats(bookings, agents);
  const labels = dataStats.map(s => s.name);
  const values = dataStats.map(s => Number(s.totalAmount ?? s.amount ?? 0));
  return <VerticalBarChart title="Agents — Booking Amounts" labels={labels} values={values} currency />;
}

function AgentCountChart({ bookings, agents, stats }) {
  const dataStats = buildAgentStats(bookings, agents);
  const labels = dataStats.map(s => s.name);
  const values = dataStats.map(s => s.bookingCount ?? s.count ?? 0);
  return <VerticalBarChart title="Agents — Number of Bookings" labels={labels} values={values} currency={false} />;
}

export default function FinancialReports() {
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentStats, setAgentStats] = useState([]);
  const [payoutStats, setPayoutStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all'); // Default to 'all' to show everything

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      // derive start and end from selected month (format YYYY-MM)
      let startDate = null;
      let endDate = null;
      
      if (selectedMonth && selectedMonth !== 'all') {
        const [year, month] = selectedMonth.split('-');
        if (year && month) {
          const first = new Date(Number(year), Number(month) - 1, 1);
          const last = new Date(Number(year), Number(month), 0);
          startDate = first.toISOString().split('T')[0];
          endDate = last.toISOString().split('T')[0];
        }
      }

      const [bookingsRes, commissionsRes, agentsRes, statsRes] = await Promise.all([
        bookingsAPI.getAll(),
        commissionsAPI.getAllPayouts(),
        agentsAPI.getAll(),
        // Only pass dates if not 'all'
        selectedMonth !== 'all' ? agentsAPI.getStats(startDate, endDate) : agentsAPI.getStats()
      ]);
      
      setBookings(bookingsRes.data);
      setPayoutStats(commissionsRes.data);
      setAgents(agentsRes.data);
      setAgentStats(statsRes.data || statsRes);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a booking falls within the selected month
  const isBookingInSelectedMonth = (booking) => {
    if (selectedMonth === 'all') return true;
    
    const [year, month] = selectedMonth.split('-');
    if (!year || !month) return true;
    
    // Check check-in date
    const checkInDate = new Date(booking.checkIn || booking.check_in);
    const bookingYear = checkInDate.getFullYear();
    const bookingMonth = checkInDate.getMonth() + 1;
    
    return bookingYear === Number(year) && bookingMonth === Number(month);
  };

  // Filter bookings based on selected month
  const filteredBookings = bookings.filter(isBookingInSelectedMonth);

  const exportReportCSV = async () => {
    try {
      // Use current agentStats if available; if not fetch for selected month
      let stats = agentStats;
      if (!stats || !stats.length) {
        // derive start/end and fetch
        let startDate = null;
        let endDate = null;
        
        if (selectedMonth && selectedMonth !== 'all') {
          const [year, month] = selectedMonth.split('-');
          if (year && month) {
            const first = new Date(Number(year), Number(month) - 1, 1);
            const last = new Date(Number(year), Number(month), 0);
            startDate = first.toISOString().split('T')[0];
            endDate = last.toISOString().split('T')[0];
          }
        }
        
        const res = selectedMonth !== 'all' 
          ? await agentsAPI.getStats(startDate, endDate)
          : await agentsAPI.getStats();
        stats = res.data || res;
      }

      if (!stats || !stats.length) {
        alert('No data available to export for the selected period');
        return;
      }

      // Build CSV
      const header = ['Agent ID', 'Agent Name', 'Booking Count', 'Total Amount'];
      const rows = stats.map(s => [s.agentId, s.name, s.bookingCount ?? s.count ?? 0, s.totalAmount ?? s.amount ?? 0]);
      const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `agent-stats-${selectedMonth === 'all' ? 'all-time' : selectedMonth}.csv`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export CSV');
    }
  };

  if (loading) {
    return <div>Loading financial reports...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  // Calculate metrics using filtered bookings
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'Booked' || b.status === 'Completed')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
    
  const totalCommissions = filteredBookings
    .filter(b => b.status === 'Booked' || b.status === 'Completed')
    .reduce((sum, b) => sum + parseFloat(b.commission ?? b.commissionAmount ?? 0), 0);
    
  const pendingPayouts = payoutStats
    .filter(b => b.paymentStatus === 'pending')
    .reduce((sum, b) => sum + parseFloat(b.commission ?? b.commissionAmount ?? 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium">Filter by:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Time</option>
            {/* Generate last 12 months */}
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              const label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
              return <option key={value} value={value}>{label}</option>;
            })}
          </select>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-primary-400">¢{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {selectedMonth === 'all' ? 'All time' : new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Commissions</h3>
          <p className="text-3xl font-bold text-primary-400">
            ¢{totalCommissions.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {selectedMonth === 'all' ? 'All time' : new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pending Payouts</h3>
          <p className="text-3xl font-bold text-orange-600">¢{pendingPayouts.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Current outstanding</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <AgentAmountChart bookings={filteredBookings} agents={agents} stats={agentStats} />
        </div>
        <div>
          <AgentCountChart bookings={filteredBookings} agents={agents} stats={agentStats} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Commission Details</h3>
          <button 
            onClick={exportReportCSV} 
            className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-secondary-500"
          >
            Export CSV
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
                <th className="text-left py-3 px-4">Check-in</th>
                <th className="text-left py-3 px-4">Check-out</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings
                .filter(b => b.status === 'Booked' || b.status === 'Completed')
                .map(booking => {
                  const agent = agents.find(a => a.id === booking.agentId);
                  return (
                    <tr key={booking.id} className="border-b">
                      <td className="py-3 px-4">#{booking.id}</td>
                      <td className="py-3 px-4">{agent?.name || 'N/A'}</td>
                      <td className="py-3 px-4">¢{parseFloat(booking.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">¢{parseFloat(booking.commission ?? booking.commissionAmount ?? 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={booking.status || booking.booking_status} />
                      </td>
                      <td className="py-3 px-4">{new Date(booking.checkIn || booking.check_in).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(booking.checkOut || booking.check_out).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {filteredBookings.filter(b => b.status === 'Booked' || b.status === 'Completed').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings found for the selected period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}