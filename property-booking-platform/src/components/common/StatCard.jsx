import React from 'react';

export default function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    green: 'bg-primary-100 text-primary-700',
    blue: 'bg-secondary-100 text-secondary-700',
    purple: 'bg-accent-100 text-accent-700',
    orange: 'bg-cream-400 text-accent-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-6 hover:shadow-md transition-all hover:border-primary-300">
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