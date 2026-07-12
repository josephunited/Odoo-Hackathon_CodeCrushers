import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserPlus, RefreshCw, AlertCircle, CheckCircle, Package, User } from 'lucide-react';

export default function AllocateAsset({ setCurrentPage }) {
  const [availableAssets, setAvailableAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeAllocations, setActiveAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [assetId, setAssetId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allAssets = await api.assets.list();
      const avail = allAssets.filter(a => a.status === 'AVAILABLE');
      setAvailableAssets(avail);
      if (avail.length > 0) setAssetId(avail[0].id.toString());

      const emps = await api.employees.list();
      setEmployees(emps);
      if (emps.length > 0) setEmployeeId(emps[0].id.toString());

      const allocs = JSON.parse(localStorage.getItem('af_allocations') || '[]');
      const active = allocs.filter(al => al.status === 'ACTIVE');
      setActiveAllocations(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!assetId || !employeeId) {
      setErrorMsg('Please select both an asset and an employee.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const emp = employees.find(x => x.id === parseInt(employeeId));
      await api.assets.allocate({
        assetId: parseInt(assetId),
        employeeId: parseInt(employeeId),
        employeeName: emp?.name,
        allocatedBy: 'Sooraj S',
        expectedReturnDate: expectedReturnDate || null
      });

      setSuccessMsg('Asset allocated successfully!');
      
      // Reload lists
      setTimeout(() => {
        setExpectedReturnDate('');
        loadData();
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'Failed to allocate asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickReturn = async (aId) => {
    if (window.confirm("Return this asset back to the available inventory?")) {
      try {
        await api.assets.return({
          assetId: aId,
          returnConditionNotes: 'Returned via quick allocation manager',
          performedBy: 'Sooraj S'
        });
        loadData();
      } catch (err) {
        alert(err.message || "Failed to return asset.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
        <p className="text-xs text-gray-400">Loading allocation board...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
      
      {/* Allocate Form Column */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Allocate Assets</h2>
          <p className="text-gray-400 text-sm">Assign available corporate hardware to staff profiles.</p>
        </div>

        <form onSubmit={handleAllocate} className="glass-panel p-6 rounded-2xl space-y-5">
          
          {errorMsg && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Select Asset */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Select Available Asset</label>
              <select
                value={assetId}
                onChange={e => setAssetId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                required
              >
                {availableAssets.length === 0 ? (
                  <option value="">No assets available to allocate</option>
                ) : (
                  availableAssets.map(a => (
                    <option key={a.id} value={a.id}>{a.assetTag} - {a.name} ({a.category})</option>
                  ))
                )}
              </select>
            </div>

            {/* Select Employee */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Select Employee</label>
              <select
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                required
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} - {e.department}</option>
                ))}
              </select>
            </div>

            {/* Expected Return Date */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Expected Return Date (Optional)</label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={e => setExpectedReturnDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || availableAssets.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all font-medium text-sm disabled:opacity-50"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Confirm Assignment
          </button>

        </form>
      </div>

      {/* Active Allocations List Column */}
      <div className="lg:col-span-3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Active Assignments</h2>
          <p className="text-gray-400 text-sm">Overview of devices currently in possession of employees.</p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-gray-950/20 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="p-4">Asset Tag</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeAllocations.map(al => (
                  <tr key={al.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-300">{al.asset.assetTag}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-primary-400" />
                        <span className="font-semibold text-white truncate max-w-[120px]">{al.asset.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-gray-300 font-semibold">{al.employeeName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{al.expectedReturnDate || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleQuickReturn(al.asset.id)}
                        className="text-xs px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/10 transition-colors font-semibold"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}

                {activeAllocations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No active allocations recorded.
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
