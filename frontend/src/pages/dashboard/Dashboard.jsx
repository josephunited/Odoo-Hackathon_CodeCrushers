import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import DashboardCards from './DashboardCards';
import DashboardCharts from './DashboardCharts';
import { Activity, Clock, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (e) {
      console.error('[Dashboard fetch error]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getActionBadgeColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'REGISTRATION':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'ALLOCATION':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'RETURN':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'TRANSFER_REQUEST':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'TRANSFER_APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'TRANSFER_REJECTED':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'UPDATE':
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  const formatActivityTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Loading Dashboard Summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            System Dashboard
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">
            Real-time operations, asset utilization, and lifecycle tracking.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 font-semibold text-xs transition-all tracking-wider uppercase active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* KPI Stats Cards */}
      <DashboardCards data={data} />

      {/* Recharts Analytics Charts */}
      <DashboardCharts statusData={data?.assetsByStatus} categoryData={data?.assetsByCategory} />

      {/* Recent Activities Section */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity Feed</h3>
              <p className="text-[11px] text-gray-500 font-medium">Latest asset audit events & actions</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="pb-3 pl-2">Asset Tag</th>
                <th className="pb-3">Asset Name</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Performed By</th>
                <th className="pb-3">Details</th>
                <th className="pb-3 pr-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.map((act) => (
                  <tr key={act.id} className="text-xs hover:bg-white/[0.01] transition-colors group">
                    <td className="py-4 pl-2 font-bold text-primary-400 group-hover:text-primary-300 transition-colors">
                      {act.assetTag}
                    </td>
                    <td className="py-4 font-semibold text-white truncate max-w-[150px]">
                      {act.assetName}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getActionBadgeColor(act.actionType)}`}>
                        {act.actionType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 text-gray-300 font-medium">
                      {act.performedBy || 'System'}
                    </td>
                    <td className="py-4 text-gray-400 font-medium max-w-[280px] truncate" title={act.details}>
                      {act.details}
                    </td>
                    <td className="py-4 pr-2 text-right text-gray-500 font-medium flex items-center justify-end gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatActivityTime(act.actionDate)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                    No recent activities recorded in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
