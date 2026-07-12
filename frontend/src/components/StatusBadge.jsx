import React from 'react';

const statusConfig = {
  AVAILABLE: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Available'
  },
  ALLOCATED: {
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
    label: 'Allocated'
  },
  RESERVED: {
    bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    dot: 'bg-violet-400',
    label: 'Reserved'
  },
  UNDER_MAINTENANCE: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Under Maintenance'
  },
  LOST: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Lost'
  },
  RETIRED: {
    bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dot: 'bg-gray-400',
    label: 'Retired'
  },
  DISPOSED: {
    bg: 'bg-zinc-600/15 text-zinc-400 border-zinc-600/30',
    dot: 'bg-zinc-500',
    label: 'Disposed'
  }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dot: 'bg-gray-400',
    label: status
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
