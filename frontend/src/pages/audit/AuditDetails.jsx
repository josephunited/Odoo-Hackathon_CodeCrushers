import React, { useState } from 'react';
import { auditService } from '../../services/auditService';
import { ArrowLeft, CheckCircle, AlertOctagon, HelpCircle, FileText, CheckCircle2, ShieldAlert, AlertTriangle, Calendar, User, Search, RefreshCw, Lock } from 'lucide-react';

export default function AuditDetails({ auditId, onBack }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'VERIFIED' | 'MISSING' | 'DAMAGED'
  const [search, setSearch] = useState('');
  
  // Verification dialog state
  const [verifyingItem, setVerifyingItem] = useState(null);
  const [notes, setNotes] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED'); // 'VERIFIED' | 'MISSING' | 'DAMAGED'
  const [submitting, setSubmitting] = useState(false);

  const fetchAuditDetails = async () => {
    try {
      const data = await auditService.getDetails(auditId);
      setAudit(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load audit details: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAuditDetails();
  }, [auditId]);

  const openVerifyModal = (item, status) => {
    setVerifyingItem(item);
    setVerifyStatus(status);
    setNotes('');
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyingItem) return;
    
    setSubmitting(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('af_user') || '{}');
      const auditorName = currentUser.username || 'System Auditor';

      const updated = await auditService.verifyAsset(
        audit.id,
        verifyingItem.assetId,
        verifyStatus,
        notes,
        auditorName
      );
      setAudit(updated);
      setVerifyingItem(null);
    } catch (err) {
      alert('Verification failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAudit = async () => {
    if (!window.confirm('Are you sure you want to close this audit cycle? This will lock all verifications and cannot be undone.')) return;
    
    try {
      const updated = await auditService.closeCycle(audit.id);
      setAudit(updated);
      alert('Audit cycle closed successfully.');
    } catch (err) {
      alert('Failed to close audit cycle: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase">Loading Audit Details...</p>
      </div>
    );
  }

  // Filter items
  const filteredItems = audit.items.filter(item => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch = 
      item.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      item.assetName.toLowerCase().includes(search.toLowerCase()) ||
      item.assetSerialNumber.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">VERIFIED</span>;
      case 'MISSING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">MISSING</span>;
      case 'DAMAGED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">DAMAGED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">PENDING</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {audit.name}
              {audit.status === 'COMPLETED' && (
                <Lock className="w-4 h-4 text-gray-500" title="Locked / Completed" />
              )}
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {audit.startDate} to {audit.endDate}</span>
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Auditor: {audit.auditorName}</span>
            </p>
          </div>
        </div>

        {audit.status === 'ACTIVE' && (
          <button
            onClick={handleCloseAudit}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl border border-white/5 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-red-500/10"
          >
            Close Audit Cycle
          </button>
        )}
      </div>

      {/* Audit Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: 'Total Assets', val: audit.totalAssets, icon: FileText, color: 'text-indigo-400', bg: 'rgba(99, 102, 241, 0.05)' },
          { title: 'Verified OK', val: audit.verifiedAssets, icon: CheckCircle2, color: 'text-emerald-400', bg: 'rgba(16, 185, 129, 0.05)' },
          { title: 'Missing/Lost', val: audit.missingAssets, icon: ShieldAlert, color: 'text-red-400', bg: 'rgba(239, 68, 68, 0.05)' },
          { title: 'Damaged', val: audit.damagedAssets, icon: AlertTriangle, color: 'text-amber-400', bg: 'rgba(245, 158, 11, 0.05)' },
          { title: 'Remaining', val: audit.pendingAssets, icon: HelpCircle, color: 'text-gray-400', bg: 'rgba(156, 163, 175, 0.05)' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-4 rounded-xl flex items-center justify-between" style={{ background: stat.bg }}>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.title}</span>
              <p className="text-xl font-extrabold text-white mt-1">{stat.val}</p>
            </div>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by tag, name, or serial number..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'VERIFIED', 'MISSING', 'DAMAGED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === status
                  ? 'bg-primary-600/25 text-white border border-primary-500/30'
                  : 'text-gray-400 hover:text-white bg-white/5 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Items Table */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="pb-3 pl-2">Asset Tag</th>
                <th className="pb-3">Asset Name</th>
                <th className="pb-3">Serial Number</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Verification</th>
                <th className="pb-3">Notes</th>
                {audit.status === 'ACTIVE' && <th className="pb-3 pr-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 pl-2 font-bold text-primary-400">{item.assetTag}</td>
                    <td className="py-4 font-semibold text-white truncate max-w-[150px]">{item.assetName}</td>
                    <td className="py-4 font-mono text-gray-300">{item.assetSerialNumber}</td>
                    <td className="py-4 text-gray-400">{item.assetLocation}</td>
                    <td className="py-4 text-gray-400 uppercase">{item.assetStatus}</td>
                    <td className="py-4">{getVerificationBadge(item.status)}</td>
                    <td className="py-4 text-gray-400 italic max-w-[180px] truncate" title={item.notes}>
                      {item.notes || '—'}
                    </td>
                    {audit.status === 'ACTIVE' && (
                      <td className="py-4 pr-2 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openVerifyModal(item, 'VERIFIED')}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all"
                            title="Verify OK"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openVerifyModal(item, 'MISSING')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all"
                            title="Mark Missing/Lost"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openVerifyModal(item, 'DAMAGED')}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/20 transition-all"
                            title="Mark Damaged"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={audit.status === 'ACTIVE' ? 8 : 7} className="py-8 text-center text-gray-500 font-medium">
                    No assets matching filter and search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Dialog Modal */}
      {verifyingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative overflow-hidden border border-white/10 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
              Verify Asset: {verifyingItem.assetTag}
            </h3>
            <p className="text-xs text-gray-400 font-medium mb-4">
              Marking as <span className="font-extrabold text-white">{verifyStatus}</span>: {verifyingItem.assetName}
            </p>
            
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Audit Notes / Remarks
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Enter condition notes, reason for discrepancy, or serial matching remarks..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting ? 'Verifying...' : 'Submit Verification'}
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyingItem(null)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
