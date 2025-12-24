import React, { useState, useEffect } from 'react';
import { agentsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState(''); // 'activate' or 'suspend'
  const { currentUser } = useApp(); // ← Make sure this is imported

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.getAll();
      setAgents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setLoading(false);
    }
  };

  const handleToggleStatus = (agent) => {
    setSelectedAgent(agent);
    setActionType(agent.isActive ? 'suspend' : 'activate');
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedAgent) return;

    try {
      // Use the existing suspend route
      const response = await agentsAPI.suspend(currentUser.id);

      if (response.ok) {
        // Update the agents list
        setAgents(agents.map(agent => 
          agent._id === selectedAgent._id 
            ? { ...agent, isActive: actionType === 'activate' }
            : agent
        ));

        alert(`Agent ${actionType === 'suspend' ? 'suspended' : 'activated'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update agent status'}`);
      }
    } catch (error) {
      console.error('Error toggling agent status:', error);
      alert('Error updating agent status. Please try again.');
    } finally {
      setShowConfirmModal(false);
      setSelectedAgent(null);
      setActionType('');
    }
  };

  const cancelToggleStatus = () => {
    setShowConfirmModal(false);
    setSelectedAgent(null);
    setActionType('');
  };

  // Filter agents based on status and search query
  const filteredAgents = agents.filter(agent => {
    const matchesFilter = filter === 'all' 
      || (filter === 'active' && agent.isActive) 
      || (filter === 'inactive' && !agent.isActive);
    
    const matchesSearch = searchQuery === '' 
      || agent.name?.toLowerCase().includes(searchQuery.toLowerCase())
      || agent.email?.toLowerCase().includes(searchQuery.toLowerCase())
      || agent.phoneNumber?.includes(searchQuery);
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading agents...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Agent Management</h2>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow p-5 mb-5 flex flex-wrap justify-between items-center gap-4">
        {/* Search Box */}
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('all')}
          >
            All ({agents.length})
          </button>
          <button
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('active')}
          >
            Active ({agents.filter(a => a.isActive).length})
          </button>
          <button
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('inactive')}
          >
            Suspended ({agents.filter(a => !a.isActive).length})
          </button>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr 
                  key={agent._id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !agent.isActive ? 'opacity-70 bg-gray-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{agent.name}</span>
                      {!agent.isActive && (
                        <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{agent.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{agent.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      agent.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {agent.createdAt 
                      ? new Date(agent.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        agent.isActive
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      onClick={() => handleToggleStatus(agent)}
                    >
                      {agent.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No agents found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to <strong className="text-gray-800">{actionType}</strong> the account for{' '}
              <strong className="text-gray-800">{selectedAgent?.name}</strong>?
            </p>
            {actionType === 'suspend' && (
              <p className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800 rounded mb-6">
                ⚠️ Suspending this agent will prevent them from logging in and making new bookings.
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelToggleStatus} 
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmToggleStatus} 
                className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${
                  actionType === 'suspend' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {actionType === 'suspend' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}