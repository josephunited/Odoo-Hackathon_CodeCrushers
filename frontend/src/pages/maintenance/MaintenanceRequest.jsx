import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { api } from '../../services/api';
import { Wrench, AlertTriangle, ArrowLeft, Layers, Tag } from 'lucide-react';

export default function MaintenanceRequest({ onSave, onCancel }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    issue: '',
    maintenanceType: 'CORRECTIVE'
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const list = await api.assets.list();
      setAssets(list);
    } catch (e) {
      console.error('Error fetching assets inventory', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.assetId || !formData.issue) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await maintenanceService.create({
        assetId: parseInt(formData.assetId),
        issue: formData.issue,
        maintenanceType: formData.maintenanceType
      });
      onSave();
    } catch (err) {
      setError('Failed to log maintenance request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      {/* Form wrapper */}
      <div className="glass-panel p-6 rounded-2xl border border-cardborder shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Request Asset Maintenance</h2>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 mb-6 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary-400" />
              Target Inventory Asset *
            </label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select an asset to report...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.assetTag}) - Status: {a.status}</option>
              ))}
            </select>
          </div>

          {/* Maintenance Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              Maintenance Type *
            </label>
            <select
              value={formData.maintenanceType}
              onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
              className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500"
            >
              <option value="CORRECTIVE">Corrective (Fix issues, damages, breaks)</option>
              <option value="PREVENTIVE">Preventive (Routine checkup, cleanup, servicing)</option>
              <option value="UPGRADE">Upgrade (Hardware replacement, storage/speed upgrades)</option>
            </select>
          </div>

          {/* Issue description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Issue & Defect Description *
            </label>
            <textarea
              rows={4}
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="Describe what is wrong or needs maintenance in detail (e.g. keyboard keys not working, battery draining fast, OS crash)..."
              className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/10 transition-all flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
