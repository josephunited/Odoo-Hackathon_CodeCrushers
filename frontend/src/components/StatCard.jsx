import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, colorClass = 'text-primary-400', glowColor = 'rgba(139, 92, 246, 0.15)' }) {
  return (
    <div 
      className="glass-card p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group"
      style={{
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Glow Effect */}
      <div 
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:scale-150"
        style={{ backgroundColor: glowColor }}
      />
      
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        </div>
        {subtext && <p className="text-[11px] text-gray-500 font-medium">{subtext}</p>}
      </div>

      <div className={`p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all duration-300 ${colorClass}`}>
        <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
      </div>
    </div>
  );
}
