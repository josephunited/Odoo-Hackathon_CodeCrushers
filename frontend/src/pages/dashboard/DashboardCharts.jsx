import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export default function DashboardCharts({ statusData = {}, categoryData = {} }) {
  
  // Transform status data
  const statusColors = {
    AVAILABLE: '#34d399',          // Emerald
    ALLOCATED: '#38bdf8',          // Sky
    RESERVED: '#fb7185',           // Rose
    UNDER_MAINTENANCE: '#fbbf24',  // Amber
    LOST: '#f87171',               // Red
    RETIRED: '#9ca3af',            // Gray
    DISPOSED: '#6b7280'            // Dark Gray
  };

  const statusChartData = Object.keys(statusData).map(key => ({
    name: key.replace('_', ' '),
    value: statusData[key],
    color: statusColors[key] || '#818cf8'
  })).filter(item => item.value > 0);

  // Transform category data
  const categoryChartData = Object.keys(categoryData).map((key, idx) => ({
    name: key,
    value: categoryData[key],
    fill: `url(#colorCat-${idx})`
  }));

  // Define gradients for categories
  const catGradientColors = [
    { start: '#8b5cf6', end: '#6366f1' }, // Violet-Indigo
    { start: '#10b981', end: '#059669' }, // Emerald-Green
    { start: '#0ea5e9', end: '#0284c7' }, // Sky-Blue
    { start: '#f59e0b', end: '#d97706' }, // Amber-Orange
    { start: '#ec4899', end: '#be185d' }, // Pink-Rose
    { start: '#6366f1', end: '#4f46e5' }  // Indigo-Dark
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-950/90 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-gray-300">{payload[0].name}</p>
          <p className="text-sm font-extrabold text-white mt-1">
            {payload[0].value} {payload[0].value === 1 ? 'Asset' : 'Assets'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Status Donut Chart */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '380px' }}>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Asset Status Distribution</h3>
          <p className="text-[11px] text-gray-500 font-medium">Real-time status breakdown</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {statusChartData.length === 0 ? (
            <span className="text-sm text-gray-500">No data available</span>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <defs>
                  {statusChartData.map((entry, idx) => (
                    <filter key={`glow-${idx}`} id={`glow-filter-${idx}`}>
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      style={{ filter: `url(#glow-filter-${index})`, opacity: 0.9 }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '380px' }}>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assets By Category</h3>
          <p className="text-[11px] text-gray-500 font-medium">Distribution by asset classification</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {categoryChartData.length === 0 ? (
            <span className="text-sm text-gray-500">No data available</span>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  {categoryChartData.map((entry, idx) => {
                    const colors = catGradientColors[idx % catGradientColors.length];
                    return (
                      <linearGradient key={`grad-${idx}`} id={`colorCat-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.start} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors.end} stopOpacity={0.3}/>
                      </linearGradient>
                    );
                  })}
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
