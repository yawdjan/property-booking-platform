import React from 'react';

export default function StatCard({ title, value, icon: Icon, color }) {
  // Update color classes
  const colorClasses = {
    green: 'bg-green-50 text-primary-400',  // ✅
    blue: 'bg-blue-50 text-secondary-500',  // ✅
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    // Clean white card with subtle shadow
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}