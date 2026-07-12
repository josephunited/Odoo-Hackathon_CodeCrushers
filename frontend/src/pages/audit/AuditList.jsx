import React, { useEffect, useState } from 'react';
import { auditService } from '../../services/auditService';
import { ClipboardCheck, Plus, Calendar, User, Eye, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuditList({ onSelectAudit, onNewAudit }) {
  const [activeAudit, setActiveAudit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    try {
      const active = await auditService.getActive();
      const list = await auditService.getHistory();
      setActiveAudit(active);
      // Filter history to completed audits for the completed list
      setHistory(list.filter(a => a.status === 'COMPLETED'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase">Loading Audits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Asset Audits
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">
            Conduct inventory compliance verification cycles and track historical audits.
          </p>
        </div>
        {!activeAudit && (
          <button
            onClick={onNewAudit}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl border border-white/5 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-primary-500/10"
          >
            <Plus className="w-4 h-4" />
            New Audit Cycle
          </button>
        )}
      </div>

      {/* Active Audit Session */}
      {activeAudit ? (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-primary-500/20 bg-primary-950/5">
          {/* Subtle design elements */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-primary-500/5 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">Active Audit Cycle</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{activeAudit.name}</h2>
              <p className="text-xs text-gray-400 font-medium flex flex-wrap gap-4">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start: {activeAudit.startDate} • Expected End: {activeAudit.endDate}</span>
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Auditor: {activeAudit.auditorName}</span>
              </p>

              {/* Progress Bar */}
              <div className="pt-2 w-full max-w-md">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <span>Audit Progress</span>
                  <span>{activeAudit.totalAssets - activeAudit.pendingAssets} / {activeAudit.totalAssets} Assets Verified</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
                    style={{ width: `${((activeAudit.totalAssets - activeAudit.pendingAssets) / activeAudit.totalAssets) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 border border-white/5 p-4 rounded-xl">
              {[
                { title: 'Verified', val: activeAudit.verifiedAssets, color: 'text-emerald-400' },
                { title: 'Missing', val: activeAudit.missingAssets, color: 'text-red-400' },
                { title: 'Damaged', val: activeAudit.damagedAssets, color: 'text-amber-400' },
                { title: 'Pending', val: activeAudit.pendingAssets, color: 'text-gray-400' }
              ].map((c, idx) => (
                <div key={idx} className="text-center px-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{c.title}</span>
                  <span className={`text-base font-extrabold mt-0.5 block ${c.color}`}>{c.val}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => onSelectAudit(activeAudit.id)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md self-start lg:self-center"
            >
              Continue Auditing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-2xl text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">No Active Audit Cycle</h3>
            <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto mt-1.5">
              There is currently no running audit. Start a new cycle to verify and reconcile assets across the system.
            </p>
          </div>
          <button
            onClick={onNewAudit}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl border border-white/5 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-primary-500/10"
          >
            <Plus className="w-4 h-4" />
            Start New Audit Cycle
          </button>
        </div>
      )}

      {/* Completed Audits History */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Audit History Log</h3>
            <p className="text-[11px] text-gray-500 font-medium">Past completed physical compliance logs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="pb-3 pl-2">Audit Name</th>
                <th className="pb-3">Auditor</th>
                <th className="pb-3">Started Date</th>
                <th className="pb-3">Closed Date</th>
                <th className="pb-3 text-center">Total Assets</th>
                <th className="pb-3 text-center">Verified OK</th>
                <th className="pb-3 text-center">Discrepancy (M/D)</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {history.length > 0 ? (
                history.map((audit) => (
                  <tr key={audit.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 pl-2 font-bold text-white">{audit.name}</td>
                    <td className="py-4 text-gray-300 font-medium">{audit.auditorName}</td>
                    <td className="py-4 text-gray-400">{audit.startDate}</td>
                    <td className="py-4 text-gray-400">{audit.completedDate || '—'}</td>
                    <td className="py-4 text-center font-bold text-gray-300">{audit.totalAssets}</td>
                    <td className="py-4 text-center font-semibold text-emerald-400">{audit.verifiedAssets}</td>
                    <td className="py-4 text-center font-medium">
                      <span className={`${audit.missingAssets > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                        {audit.missingAssets} Missing
                      </span>
                      <span className="text-gray-500 mx-1.5">•</span>
                      <span className={`${audit.damagedAssets > 0 ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                        {audit.damagedAssets} Damaged
                      </span>
                    </td>
                    <td className="py-4 pr-2 text-right">
                      <button
                        onClick={() => onSelectAudit(audit.id)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/5 transition-all inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                    No completed audit history records found.
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
