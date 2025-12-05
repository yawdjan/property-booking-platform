import React, { useState, useEffect} from 'react';
import { bookingsAPI, agentsAPI } from '../../services/api';

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
              <div className="text-xs text-gray-700 mb-1" title={`${label}: ${currency ? '$' + value.toFixed(2) : value}`}>
                {currency ? '$' + value.toFixed(2) : value}
              </div>
              <div className="w-full flex items-end justify-center">
                <div
                  className="w-4 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t transition-all"
                  style={{ height: `${barPx}px`, minHeight: '8px' }}
                  title={`${label}: ${currency ? '$' + value.toFixed(2) : value}`}
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

  bookings.filter(b => b.status === 'Confirmed').forEach(b => {
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
  const dataStats = stats && stats.length ? stats : buildAgentStats(bookings, agents);
  const labels = dataStats.map(s => s.name);
  const values = dataStats.map(s => Number(s.totalAmount ?? s.amount ?? 0));
  return <VerticalBarChart title="Agents — Booking Amounts" labels={labels} values={values} currency />;
}

function AgentCountChart({ bookings, agents, stats }) {
  const dataStats = stats && stats.length ? stats : buildAgentStats(bookings, agents);
  const labels = dataStats.map(s => s.name);
  const values = dataStats.map(s => s.bookingCount ?? s.count ?? 0);
  return <VerticalBarChart title="Agents — Number of Bookings" labels={labels} values={values} currency={false} />;
}

export default function FinancialReports() {
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentStats, setAgentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // default to current month in YYYY-MM format for <input type="month">
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  useEffect(() => {
    loadData();
  }, [selectedMonth]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      // derive start and end from selected month (format YYYY-MM)
      const [year, month] = (selectedMonth || '').split('-');
      let startDate = null;
      let endDate = null;
      if (year && month) {
        const first = new Date(Number(year), Number(month) - 1, 1);
        const last = new Date(Number(year), Number(month), 0);
        startDate = first.toISOString().split('T')[0];
        endDate = last.toISOString().split('T')[0];
      }

      const [bookingsRes, agentsRes, statsRes] = await Promise.all([
        bookingsAPI.getAll(),
        agentsAPI.getAll(),
        agentsAPI.getStats(startDate, endDate)
      ]);
      setBookings(bookingsRes.data);
      setAgents(agentsRes.data);
      setAgentStats(statsRes.data || statsRes);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const exportReportCSV = async () => {
    try {
      // Use current agentStats if available; if not fetch for selected month
      let stats = agentStats;
      if (!stats || !stats.length) {
        // derive start/end and fetch
        const [year, month] = (selectedMonth || '').split('-');
        let startDate = null;
        let endDate = null;
        if (year && month) {
          const first = new Date(Number(year), Number(month) - 1, 1);
          const last = new Date(Number(year), Number(month), 0);
          startDate = first.toISOString().split('T')[0];
          endDate = last.toISOString().split('T')[0];
        }
        const res = await agentsAPI.getStats(startDate, endDate);
        stats = res.data || res;
      }

      if (!stats || !stats.length) {
        alert('No data available to export for the selected month');
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
      const fileName = `agent-stats-${selectedMonth || 'all'}.csv`;
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

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
    
  const totalCommissions = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + parseFloat(b.commission ?? b.commissionAmount ?? 0), 0);
    
  const pendingPayouts = bookings
    .filter(b => b.paymentStatus === 'Pending Payout')
    .reduce((sum, b) => sum + parseFloat(b.commission ?? b.commissionAmount ?? 0), 0);

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

      <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <AgentAmountChart bookings={bookings} agents={agents} stats={agentStats} />
            </div>
            <div>
              <AgentCountChart bookings={bookings} agents={agents} stats={agentStats} />
            </div>
          </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Commission Details</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2 py-1 border rounded"
            />
            <button onClick={exportReportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Export CSV
            </button>
          </div>
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
                    <td className="py-3 px-4">${(booking.commission ?? booking.commissionAmount ?? 0)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.paymentStatus?.includes('Confirmed') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus || booking.status}
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