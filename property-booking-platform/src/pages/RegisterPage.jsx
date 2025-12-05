import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';

export default function RegisterPage() {
  const { setCurrentView } = useApp();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.register(formData);
      alert('Registration submitted! You will receive an email once approved by an administrator.');
      setCurrentView('landing');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6">Agent Registration</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company (Optional)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={() => setCurrentView('login')} 
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}