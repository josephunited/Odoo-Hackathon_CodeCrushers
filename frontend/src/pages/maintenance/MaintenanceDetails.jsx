import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { Wrench, Calendar, DollarSign, Check, Play, Ban, FileText, ArrowLeft, Clock } from 'lucide-react';

export default function MaintenanceDetails({ recordId, currentUser, onSave, onCancel }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dynamic form states
  const [schedDate, setSchedDate] = useState('');
  const [resolution, setResolution] = useState('');
  const [cost, setCost] = useState('0');

  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.get(recordId);
      setRecord(data);
      if (data.scheduledDate) setSchedDate(data.scheduledDate);
      if (data.resolutionDetails) setResolution(data.resolutionDetails);
      if (data.cost) setCost(data.cost.toString());
    } catch (e) {
      console.error('Error fetching maintenance record details', e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.roles?.includes('ADMIN') || false;

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!schedDate) return;
    try {
      await maintenanceService.schedule(recordId, schedDate);
      fetchRecord();
    } catch (e) {
      alert('Error scheduling: ' + e.message);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolution || cost === '') return;
    try {
      await maintenanceService.resolve(recordId, resolution, parseFloat(cost));
      fetchRecord();
    } catch (e) {
      alert('Error resolving maintenance: ' + e.message);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await maintenanceService.updateStatus(recordId, status);
      fetchRecord();
    } catch (e) {
      alert('Error updating status: ' + e.message);
    }
  };

  const formatLocalDate = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="glass-panel p-6 text-center rounded-2xl border border-cardborder">
        <p className="text-red-400">Maintenance record not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header / Nav */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Record details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cardborder space-y-5">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                record.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                record.status === 'REQUESTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                record.status === 'IN_PROGRESS' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                record.status === 'SCHEDULED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              }`}>
                {record.status}
              </span>
              <div className="text-xs text-gray-400 font-mono">{record.assetTag}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary-400 font-bold">Target Asset</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{record.assetName}</h3>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Issue Description</span>
                <p className="text-sm text-gray-300 mt-1 bg-gray-900/50 border border-white/5 p-3 rounded-xl">
                  {record.issue}
                </p>
              </div>

              {record.resolutionDetails && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Resolution & Fix Details</span>
                  <p className="text-sm text-emerald-400/90 mt-1 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                    {record.resolutionDetails}
                  </p>
                </div>
              )}
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs text-gray-400">
              <div className="space-y-0.5">
                <span className="text-gray-500">Requested</span>
                <div className="font-semibold text-gray-300">{formatLocalDate(record.requestDate)}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-500">Scheduled</span>
                <div className="font-semibold text-gray-300">{formatLocalDate(record.scheduledDate)}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-500">Completed</span>
                <div className="font-semibold text-gray-300">{formatLocalDate(record.completionDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        {isAdmin && (
          <div className="space-y-6">
            {/* Status Flow panel */}
            <div className="glass-panel p-5 rounded-2xl border border-cardborder space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" />
                Workflow Actions
              </h4>

              {record.status === 'REQUESTED' && (
                <form onSubmit={handleSchedule} className="space-y-3">
                  <span className="text-xs text-gray-400">Schedule this maintenance task:</span>
                  <input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full bg-gray-900 border border-cardborder text-white text-xs rounded-lg p-2 focus:ring-1 focus:ring-primary-500 [color-scheme:dark]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Schedule Job
                  </button>
                </form>
              )}

              {record.status === 'SCHEDULED' && (
                <button
                  onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Maintenance (In Progress)
                </button>
              )}

              {record.status === 'IN_PROGRESS' && (
                <form onSubmit={handleResolve} className="space-y-3.5">
                  <span className="text-xs text-gray-400">Log Resolution & cost:</span>
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="What was fixed/done? e.g. Replaced batteries..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full bg-gray-900 border border-cardborder text-white text-xs rounded-lg p-2 focus:ring-1 focus:ring-primary-500 resize-none"
                    />
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                      <input
                        type="number"
                        placeholder="Cost of parts/repair..."
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="w-full bg-gray-900 border border-cardborder text-white text-xs rounded-lg pl-8 p-2 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Resolved & Close
                  </button>
                </form>
              )}

              {record.status !== 'COMPLETED' && record.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-rose-400 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Cancel Maintenance Request
                </button>
              )}

              {(record.status === 'COMPLETED' || record.status === 'CANCELLED') && (
                <div className="text-center p-4 border border-white/5 rounded-xl bg-white/[0.01]">
                  <p className="text-xs text-gray-500 font-medium">This maintenance ticket has been closed.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
