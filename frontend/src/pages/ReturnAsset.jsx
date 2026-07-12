import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserMinus, RefreshCw, AlertCircle, CheckCircle, Package } from 'lucide-react';

const conditionOptions = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];

export default function ReturnAsset() {
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [assetId, setAssetId] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');

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
      const allocated = allAssets.filter(a => a.status === 'ALLOCATED');
      setAllocatedAssets(allocated);
      if (allocated.length > 0) {
        setAssetId(allocated[0].id.toString());
        setReturnCondition(allocated[0].assetCondition);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!assetId) {
      setErrorMsg('Please select an asset to return.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.assets.return({
        assetId: parseInt(assetId),
        returnConditionNotes: returnNotes,
        actualCondition: returnCondition,
        performedBy: 'Sooraj S'
      });

      setSuccessMsg('Asset returned successfully! Restored to AVAILABLE status.');
      
      setTimeout(() => {
        setReturnNotes('');
        loadData();
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
        <p className="text-xs text-gray-400">Loading return manager...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Return Asset</h2>
        <p className="text-gray-400 text-sm">Process physical resource returns, log condition audits, and release holdings.</p>
      </div>

      <form onSubmit={handleReturn} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-5">
        
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
          
          {/* Select Allocated Asset */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase">Select Allocated Asset</label>
            <select
              value={assetId}
              onChange={e => {
                setAssetId(e.target.value);
                const selected = allocatedAssets.find(a => a.id === parseInt(e.target.value));
                if (selected) setReturnCondition(selected.assetCondition);
              }}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              required
            >
              {allocatedAssets.length === 0 ? (
                <option value="">No assets currently allocated / out-of-storage</option>
              ) : (
                allocatedAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.assetTag} - {a.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase">Return Physical Condition</label>
            <select
              value={returnCondition}
              onChange={e => setReturnCondition(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              required
            >
              {conditionOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Condition Notes */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase">Condition Audit Notes</label>
            <textarea
              value={returnNotes}
              onChange={e => setReturnNotes(e.target.value)}
              rows="4"
              placeholder="Describe physical condition, screen pixels, accessory presence..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
              required
            />
          </div>

        </div>

        <button
          type="submit"
          disabled={submitting || allocatedAssets.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-medium text-sm disabled:opacity-50"
        >
          {submitting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <UserMinus className="w-4 h-4" />
          )}
          Confirm Return & Release Holding
        </button>

      </form>
    </div>
  );
}
