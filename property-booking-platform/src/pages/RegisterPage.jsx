import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
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
      navigate('/');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Agent Registration</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name *</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number *</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Company (Optional)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" 
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password *</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-lg hover:from-primary-500 hover:to-secondary-600 disabled:from-gray-400 disabled:to-gray-500 font-semibold transition-all shadow-lg"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-primary-400 hover:text-primary-500 font-semibold"
            disabled={loading}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}