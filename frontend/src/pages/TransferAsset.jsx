import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Send, Check, X, RefreshCw, AlertCircle, ArrowLeftRight, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function TransferAsset() {
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Form State
  const [assetId, setAssetId] = useState('');
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [remarks, setRemarks] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allAssets = await api.assets.list();
      const allocated = allAssets.filter(a => a.status === 'ALLOCATED');
      setAllocatedAssets(allocated);
      if (allocated.length > 0) setAssetId(allocated[0].id.toString());

      const emps = await api.employees.list();
      setEmployees(emps);
      if (emps.length > 0) setToEmployeeId(emps[0].id.toString());

      const tList = await api.assets.listTransfers();
      // Sort so pending are at the top
      setTransfers(tList.sort((a,b) => (a.status === 'PENDING' ? -1 : 1)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    if (!assetId || !toEmployeeId) {
      setErrorMsg('Select both an asset and a target employee.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const emp = employees.find(x => x.id === parseInt(toEmployeeId));
      await api.assets.requestTransfer({
        assetId: parseInt(assetId),
        toEmployeeId: parseInt(toEmployeeId),
        toEmployeeName: emp?.name,
        requestedBy: 'Sooraj S',
        remarks: remarks
      });

      setSuccessMsg('Transfer request submitted successfully!');
      
      setTimeout(() => {
        setRemarks('');
        loadData();
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit transfer request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessTransfer = async (transferId, approved) => {
    setActioningId(transferId);
    let reason = '';
    if (!approved) {
      reason = window.prompt("Please enter rejection reason:", "Transfer request rejected.");
      if (reason === null) {
        setActioningId(null);
        return; // cancel action
      }
    }
    
    try {
      await api.assets.processTransfer(transferId, approved, reason, 'Sooraj S');
      loadData();
    } catch (err) {
      alert(err.message || "Failed to process transfer request.");
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
        <p className="text-xs text-gray-400">Loading transfer board...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
      
      {/* Transfer Request Column */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Request Asset Transfer</h2>
          <p className="text-gray-400 text-sm">Initiate asset migration workflows from one employee to another.</p>
        </div>

        <form onSubmit={handleRequestTransfer} className="glass-panel p-6 rounded-2xl space-y-5">
          
          {errorMsg && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Select Asset */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Select Allocated Asset</label>
              <select
                value={assetId}
                onChange={e => setAssetId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                required
              >
                {allocatedAssets.length === 0 ? (
                  <option value="">No assets currently allocated</option>
                ) : (
                  allocatedAssets.map(a => (
                    <option key={a.id} value={a.id}>{a.assetTag} - {a.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Select Target Employee */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Transfer To Employee</label>
              <select
                value={toEmployeeId}
                onChange={e => setToEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                required
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} - {e.department}</option>
                ))}
              </select>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Justification / Reason</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                rows="3"
                placeholder="Why is this transfer being processed..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || allocatedAssets.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all font-medium text-sm disabled:opacity-50"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Transfer Request
          </button>

        </form>
      </div>

      {/* Transfer Requests List Column */}
      <div className="lg:col-span-3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Transfer Board Workflow</h2>
          <p className="text-gray-400 text-sm">Approve or reject pending asset migration workflows.</p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-gray-950/20 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="p-4">Asset</th>
                  <th className="p-4">From</th>
                  <th className="p-4">To</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transfers.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-gray-300">{t.asset.assetTag}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{t.asset.name}</div>
                    </td>
                    <td className="p-4 text-gray-300 font-semibold">{t.fromEmployeeName}</td>
                    <td className="p-4 text-gray-300 font-semibold">{t.toEmployeeName}</td>
                    <td className="p-4">
                      {t.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                      {t.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                          <ShieldCheck className="w-3 h-3" /> APPROVED
                        </span>
                      )}
                      {t.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-[10px]">
                          <ShieldAlert className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {t.status === 'PENDING' ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleProcessTransfer(t.id, true)}
                            disabled={actioningId === t.id}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleProcessTransfer(t.id, false)}
                            disabled={actioningId === t.id}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-colors"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}

                {transfers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No transfer workflows logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
