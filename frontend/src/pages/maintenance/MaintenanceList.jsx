import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { Wrench, PlusCircle, Calendar, CheckCircle2, ChevronRight, Ban, Eye, DollarSign } from 'lucide-react';

export default function MaintenanceList({ onSelect, onNew, setCurrentPage }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const all = await maintenanceService.list();
      setRequests(all);
    } catch (e) {
      console.error('Error fetching maintenance logs', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  const formatDate = (isoString) => {
    if (!isoString) return 'Not Scheduled';
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Maintenance & Service Log</h2>
          <p className="text-gray-400 text-sm">Submit, track, and record maintenance actions on enterprise assets.</p>
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-primary-500/20 font-medium text-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Request Maintenance
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cardborder flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-300">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary-500 w-full sm:w-48"
        >
          <option value="all">All States</option>
          <option value="REQUESTED">Requested</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Requests Log */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-cardborder">
          <Wrench className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Maintenance Requests</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">There are no maintenance or resolution logs matching the current criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map(r => (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="glass-panel p-5 rounded-2xl border border-cardborder flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center text-primary-400 group-hover:scale-105 transition-transform shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-white group-hover:text-primary-400 transition-colors">
                      {r.assetName}
                    </h4>
                    <span className="text-xs text-gray-500 font-mono">({r.assetTag})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      r.maintenanceType === 'PREVENTIVE' ? 'bg-indigo-500/10 text-indigo-400' :
                      r.maintenanceType === 'CORRECTIVE' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {r.maintenanceType}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs line-clamp-1 mb-2">"{r.issue}"</p>
                  
                  {/* Timeline info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Requested: {formatDate(r.requestDate)}
                    </span>
                    {r.scheduledDate && (
                      <span className="flex items-center gap-1 text-indigo-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Scheduled: {formatDate(r.scheduledDate)}
                      </span>
                    )}
                    {r.completionDate && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved: {formatDate(r.completionDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Action Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="flex flex-col items-start md:items-end gap-1">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    r.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    r.status === 'REQUESTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    r.status === 'IN_PROGRESS' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                    r.status === 'SCHEDULED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {r.status}
                  </span>
                  {r.status === 'COMPLETED' && (
                    <span className="text-[10px] font-mono text-gray-500 flex items-center">
                      <DollarSign className="w-3 h-3 text-emerald-500" />Cost: {r.cost.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-400 font-semibold md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center gap-1">
                    Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
