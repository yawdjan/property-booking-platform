import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const { login, setCurrentView } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      await login(response.data);
    } catch (error) {
      setError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={() => setCurrentView('register')} 
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}