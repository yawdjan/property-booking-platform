import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, gradient = "from-primary-400 to-secondary-500" }) {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-2 border-primary-100 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-amber-950">
            {value}
          </p>
        </div>
        
        {Icon && (
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
      </div>
      
      {trendValue && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-gray-100">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
          <span className="text-sm text-amber-700">vs last period</span>
        </div>
      )}
    </div>
  );
}