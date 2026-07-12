import React from 'react';
import StatCard from '../../components/StatCard';
import { Package, DollarSign, CheckCircle2, AlertTriangle, ArrowLeftRight, Calendar } from 'lucide-react';

export default function DashboardCards({ data }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const cards = [
    {
      title: 'Total Assets Registered',
      value: data?.totalAssets || 0,
      subtext: `${data?.totalCategories || 0} Categories configured`,
      icon: Package,
      colorClass: 'text-violet-400',
      glowColor: 'rgba(139, 92, 246, 0.15)'
    },
    {
      title: 'Total Value Valuation',
      value: formatCurrency(data?.totalAssetValue),
      subtext: 'Accumulated initial cost',
      icon: DollarSign,
      colorClass: 'text-emerald-400',
      glowColor: 'rgba(52, 211, 153, 0.15)'
    },
    {
      title: 'Allocated Assets',
      value: data?.allocatedAssets || 0,
      subtext: `Allocated to ${data?.totalEmployees || 0} employees`,
      icon: CheckCircle2,
      colorClass: 'text-sky-400',
      glowColor: 'rgba(56, 189, 248, 0.15)'
    },
    {
      title: 'Under Maintenance',
      value: data?.underMaintenanceAssets || 0,
      subtext: 'Assets in repair or service',
      icon: AlertTriangle,
      colorClass: 'text-amber-400',
      glowColor: 'rgba(251, 191, 36, 0.15)'
    },
    {
      title: 'Active Bookings',
      value: data?.activeBookings || 0,
      subtext: 'Shared bookable assets',
      icon: Calendar,
      colorClass: 'text-rose-400',
      glowColor: 'rgba(251, 113, 133, 0.15)'
    },
    {
      title: 'Pending Transfer Requests',
      value: data?.pendingTransfers || 0,
      subtext: 'Awaiting administrator approval',
      icon: ArrowLeftRight,
      colorClass: 'text-indigo-400',
      glowColor: 'rgba(99, 102, 241, 0.15)'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <StatCard
          key={idx}
          title={card.title}
          value={card.value}
          subtext={card.subtext}
          icon={card.icon}
          colorClass={card.colorClass}
          glowColor={card.glowColor}
        />
      ))}
    </div>
  );
}
