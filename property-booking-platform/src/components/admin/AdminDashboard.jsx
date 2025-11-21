import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Clock } from 'lucide-react';
import StatCard from '../common/StatCard';
import { bookingsAPI, agentsAPI } from '../../services/api';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, agentsRes] = await Promise.all([
        bookingsAPI.getAll(),
        agentsAPI.getAll()
      ]);
      setBookings(bookingsRes.data);
      setAgents(agentsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
    
  const totalCommissions = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + parseFloat(b.commissionAmount), 0);
    
  const activeAgents = agents.filter(a => a.status === 'Active').length;
  const pendingAgents = agents.filter(a => a.status === 'Pending').length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="green" 
        />
        <StatCard 
          title="Total Commissions" 
          value={`$${totalCommissions.toLocaleString()}`} 
          icon={DollarSign} 
          color="blue" 
        />
        <StatCard 
          title="Active Agents" 
          value={activeAgents} 
          icon={Users} 
          color="purple" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={pendingAgents} 
          icon={Clock} 
          color="orange" 
        />
      </div>
      
      {/* Rest of your component... */}
    </div>
  );
}