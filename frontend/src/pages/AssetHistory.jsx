import React, { useState, useEffect } from 'react';
import { Tag, Calendar, User, Search, Clock, FileText, Database, ShieldAlert } from 'lucide-react';

const actionTypeBadges = {
  REGISTRATION: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ALLOCATION: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  RETURN: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  TRANSFER_REQUEST: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  TRANSFER_APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  TRANSFER_REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  STATUS_CHANGE: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
};

export default function AssetHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTag, setSearchTag] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoading(true);
    try {
      const logs = JSON.parse(localStorage.getItem('af_history') || '[]');
      // Sort in reverse chronological order
      setHistory(logs.sort((a,b) => new Date(b.actionDate) - new Date(a.actionDate)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLogs = () => {
    let logs = [...history];

    if (searchTag.trim()) {
      // Find asset tags that match
      const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
      const matchingAssetIds = assets
        .filter(a => a.assetTag.toLowerCase().includes(searchTag.toLowerCase()))
        .map(a => a.id);
      
      logs = logs.filter(l => matchingAssetIds.includes(l.assetId));
    }

    if (selectedActionType) {
      logs = logs.filter(l => l.actionType === selectedActionType);
    }

    return logs;
  };

  // Helper to fetch asset tag for a log item
  const getAssetTag = (assetId) => {
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.assetTag : `ID: ${assetId}`;
  };

  const getAssetName = (assetId) => {
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : 'Unknown Device';
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Global Audit Logs</h2>
        <p className="text-gray-400 text-sm">Trace the complete operational history and chain of custody logs for all resources.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Asset Tag (e.g. AF-0001)..."
              value={searchTag}
              onChange={e => setSearchTag(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <select
            value={selectedActionType}
            onChange={e => setSelectedActionType(e.target.value)}
            className="px-4 py-2.5 rounded-xl glass-input text-sm w-full sm:w-auto"
          >
            <option value="">All Action Types</option>
            <option value="REGISTRATION">Registration</option>
            <option value="UPDATE">Update</option>
            <option value="ALLOCATION">Allocation</option>
            <option value="RETURN">Return</option>
            <option value="TRANSFER_REQUEST">Transfer Request</option>
            <option value="TRANSFER_APPROVED">Transfer Approved</option>
            <option value="TRANSFER_REJECTED">Transfer Rejected</option>
            <option value="STATUS_CHANGE">Status Change</option>
          </select>
        </div>

        <button
          onClick={loadHistory}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors self-end md:self-auto py-1 px-2 hover:bg-white/5 rounded-lg"
        >
          <Database className="w-3.5 h-3.5" />
          Refresh Database
        </button>
      </div>

      {/* Timeline Audit Logs */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          <p className="text-xs text-gray-400">Loading audit history...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-dashed border-white/10">
          <Clock className="w-10 h-10 mx-auto text-gray-500 mb-3 animate-pulse" />
          <h3 className="font-bold text-lg text-white">No Audit History Match</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1">
            No events match your criteria. Try adjusting filters or logging new asset events.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                
                <div className="flex items-start gap-4">
                  {/* Action Icon Indicator */}
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-primary-400 mt-0.5">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-gray-300 text-sm">{getAssetTag(log.assetId)}</span>
                      <span className="text-xs text-gray-500 font-semibold">•</span>
                      <span className="text-xs text-gray-400 font-semibold">{getAssetName(log.assetId)}</span>
                    </div>

                    <p className="text-sm text-gray-200 font-medium pt-1">{log.details}</p>
                    
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-500" /> {log.performedBy}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" /> {new Date(log.actionDate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 self-start sm:self-center">
                  <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold border ${actionTypeBadges[log.actionType] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {log.actionType.replace('_', ' ')}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
