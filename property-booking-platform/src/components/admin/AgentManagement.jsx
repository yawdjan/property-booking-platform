import React, { useEffect, useState } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { websocket } from '../../services/websocket';
import { agentsAPI } from '../../services/api.js';

export default function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAgent, setEditingAgent] = useState(null);
  const [editCommissionRate, setEditCommissionRate] = useState('');

  useEffect(() => {
    // Load data 
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const response = await agentsAPI.getAll();
      setAgents(response.data);
    } catch (err) {
      setError('Failed to load agents '+ err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const approveAgent = (agentId) => {
    setAgents(agents.map(a => a.id === agentId ? { ...a, status: 'Active' } : a));
    try {
      agentsAPI.approve(agentId);
      websocket.emit('notification', {
        id: Date.now(),
        type: 'success',
        message: `Agent approved successfully`,
        time: new Date().toISOString()
      });
    } catch (error) {
      websocket.emit('notification', {
        id: Date.now(),
        type: 'Error',
        message: `Agent approval failed: ${error.message}`,
        time: new Date().toISOString()
      });
    }
  };

  const saveCommissionRate = () => {
    setAgents(agents.map(a => 
      a.id === editingAgent.id 
        ? { ...a, commissionRate: editCommissionRate ? parseFloat(editCommissionRate) : null } 
        : a
    ));
    setEditingAgent(null);
    setEditCommissionRate('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agent Management</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-4 px-6">Name</th>
              <th className="text-left py-4 px-6">Email</th>
              <th className="text-left py-4 px-6">Company</th>
              <th className="text-left py-4 px-6">Status</th>
              <th className="text-left py-4 px-6">Commission Rate</th>
              <th className="text-left py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">{agent.name}</td>
                <td className="py-4 px-6">{agent.email}</td>
                <td className="py-4 px-6">{agent.company || 'N/A'}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'Active' ? 'bg-green-100 text-green-800' :
                    agent.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agent.status}
                  </span>
                </td>
                <td className="py-4 px-6">{agent.commissionRate ? `${agent.commissionRate}%` : 'Default'}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    {agent.status === 'Pending' && (
                      <button 
                        onClick={() => approveAgent(agent.id)} 
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => { 
                        setEditingAgent(agent); 
                        setEditCommissionRate(agent.commissionRate || ''); 
                      }} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Agent Commission</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Custom Commission Rate (%)</label>
              <input 
                type="number" 
                value={editCommissionRate}
                onChange={(e) => setEditCommissionRate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg" 
                placeholder="Leave empty for default" 
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditingAgent(null)} 
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={saveCommissionRate} 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}