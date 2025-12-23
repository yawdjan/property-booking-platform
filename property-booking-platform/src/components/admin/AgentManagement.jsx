import React, { useState, useEffect } from 'react';
import './AgentManagement.css';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState(''); // 'activate' or 'suspend'

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAgents(data.agents || data);
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
      const endpoint = `/api/admin/agents/${selectedAgent._id}/suspend`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          suspended: actionType === 'suspend' // true to suspend, false to activate
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the agents list
        setAgents(agents.map(agent => 
          agent._id === selectedAgent._id 
            ? { ...agent, isActive: actionType === 'activate' }
            : agent
        ));

        // Show success message
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
    return <div className="loading">Loading agents...</div>;
  }

  return (
    <div className="agent-management-container">
      <div className="page-header">
        <h2>Agent Management</h2>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({agents.length})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({agents.filter(a => a.isActive).length})
          </button>
          <button
            className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Suspended ({agents.filter(a => !a.isActive).length})
          </button>
        </div>
      </div>

      <div className="agents-table-container">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map(agent => (
              <tr key={agent._id} className={!agent.isActive ? 'inactive-row' : ''}>
                <td>
                  <div className="agent-name">
                    {agent.name}
                    {!agent.isActive && <span className="inactive-badge">Suspended</span>}
                  </div>
                </td>
                <td>{agent.email}</td>
                <td>{agent.phoneNumber || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${agent.isActive ? 'status-active' : 'status-inactive'}`}>
                    {agent.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td>
                  {agent.createdAt 
                    ? new Date(agent.createdAt).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td>
                  <button
                    className={`toggle-btn ${agent.isActive ? 'btn-deactivate' : 'btn-activate'}`}
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
          <div className="no-results">
            No agents found matching your criteria.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Action</h3>
            <p>
              Are you sure you want to <strong>{actionType}</strong> the account for{' '}
              <strong>{selectedAgent?.name}</strong>?
            </p>
            {actionType === 'suspend' && (
              <p className="warning-text">
                ⚠️ Suspending this agent will prevent them from logging in and making new bookings.
              </p>
            )}
            <div className="modal-actions">
              <button onClick={cancelToggleStatus} className="btn-cancel">
                Cancel
              </button>
              <button 
                onClick={confirmToggleStatus} 
                className={`btn-confirm ${actionType === 'suspend' ? 'btn-danger' : 'btn-success'}`}
              >
                {actionType === 'suspend' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;