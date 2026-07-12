import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, RefreshCw, Undo, Eye, Tag, AlertCircle, Sparkles } from 'lucide-react';

const conditionOptions = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];

const imagePresets = [
  { label: 'MacBook / Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Dell Monitor', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80' },
  { label: 'iPad / Tablet', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80' },
  { label: 'Office Chair', url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80' },
  { label: 'iPhone / Phone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Server Equipment', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80' }
];

export default function AssetRegistration({ editAssetId, setEditAssetId, setCurrentPage }) {
  const isEditMode = !!editAssetId;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '',
    assetCondition: 'NEW',
    location: '',
    sharedBookable: false,
    imageUrl: imagePresets[0].url,
    status: 'AVAILABLE'
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchMetadata();
    if (isEditMode) {
      loadAssetToEdit();
    }
  }, [editAssetId]);

  const fetchMetadata = async () => {
    try {
      const cats = await api.categories.list();
      setCategories(cats);
      if (!isEditMode && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAssetToEdit = async () => {
    setFetching(true);
    try {
      const asset = await api.assets.get(editAssetId);
      setFormData({
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        purchaseCost: asset.purchaseCost,
        assetCondition: asset.assetCondition,
        location: asset.location,
        sharedBookable: asset.sharedBookable,
        imageUrl: asset.imageUrl || imagePresets[0].url,
        status: asset.status
      });
    } catch (e) {
      setErrorMsg('Failed to load asset data for editing.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        ...formData,
        purchaseCost: parseFloat(formData.purchaseCost) || 0
      };

      if (isEditMode) {
        await api.assets.update(editAssetId, payload);
        setSuccessMsg('Asset profile updated successfully!');
      } else {
        const result = await api.assets.create(payload);
        setSuccessMsg(`Asset registered successfully! Tag generated: ${result.assetTag}`);
        
        // Reset form if registering another
        setFormData({
          name: '',
          category: categories[0] || '',
          serialNumber: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          purchaseCost: '',
          assetCondition: 'NEW',
          location: '',
          sharedBookable: false,
          imageUrl: imagePresets[0].url,
          status: 'AVAILABLE'
        });
      }
      
      // Navigate to directory after short delay
      setTimeout(() => {
        setEditAssetId(null);
        setCurrentPage('directory');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'Error occurred. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditAssetId(null);
    setCurrentPage('directory');
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
        <p className="text-xs text-gray-400">Fetching asset details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {isEditMode ? 'Modify Asset Profile' : 'Register Enterprise Asset'}
        </h2>
        <p className="text-gray-400 text-sm">
          {isEditMode ? 'Edit structural metadata and placement configurations for this asset.' : 'Add new technology resources, devices, or furniture into the database.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          
          {errorMsg && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Asset Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-gray-400 font-semibold uppercase">Asset Name</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro 16-inch M3"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Category</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Serial Number */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Serial Number (S/N)</label>
              <input
                type="text"
                required
                placeholder="e.g. C02F784KMN9L"
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Purchase Date</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Purchase Cost */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Purchase Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 1499.00"
                value={formData.purchaseCost}
                onChange={e => setFormData({ ...formData, purchaseCost: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Condition</label>
              <select
                value={formData.assetCondition}
                onChange={e => setFormData({ ...formData, assetCondition: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                {conditionOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Storage / Office Location</label>
              <input
                type="text"
                required
                placeholder="e.g. HQ - Floor 3 (Room 304)"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Image Preset selection */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-gray-400 font-semibold uppercase">Device Image Template</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {imagePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all bg-gray-950/20 ${
                      formData.imageUrl === preset.url
                        ? 'border-primary-500 bg-primary-500/10 text-white'
                        : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] leading-tight font-medium truncate w-full">{preset.label.split(' / ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image URL Option */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-gray-400 font-semibold uppercase">Or Custom Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Shared/Bookable flag */}
            <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div>
                <h4 className="text-sm font-semibold text-white">Shared & Bookable Asset</h4>
                <p className="text-xs text-gray-400 mt-0.5">Allow other departments or staff members to reserve this resource.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sharedBookable}
                  onChange={e => setFormData({ ...formData, sharedBookable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

          </div>

          {/* Form Actions */}
          <div className="border-t border-white/5 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-medium text-sm"
            >
              <Undo className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition-all font-medium text-sm disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditMode ? 'Apply Updates' : 'Complete Registration'}
            </button>
          </div>

        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
            <Eye className="w-4 h-4 text-primary-400" />
            Live Card Preview
          </div>

          <div className="glass-card rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 hover:translate-y-0 hover:border-white/10">
            {/* Tag overlay */}
            <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-10 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary-400" />
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {isEditMode ? 'AF-XXXX' : 'AF-XXXX'}
              </span>
            </div>

            {/* Status Pill Overlay */}
            <div className="absolute top-4 right-4 z-10 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
              {formData.status}
            </div>

            {/* Asset Image */}
            <div className="h-56 bg-gray-950 flex items-center justify-center relative overflow-hidden">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900/60 flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">No Preset Selected</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">
                  {formData.category || 'CATEGORY'}
                </span>
                <h3 className="text-xl font-bold text-white truncate">
                  {formData.name || 'Device Title Mock'}
                </h3>
                <p className="text-xs text-gray-400">
                  S/N: <span className="font-semibold text-gray-300">{formData.serialNumber || 'N/A'}</span>
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Location</span>
                  <span className="font-medium text-white truncate block">{formData.location || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Condition</span>
                  <span className="font-semibold text-primary-400 block">{formData.assetCondition}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-gray-400">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Purchase Cost</span>
                  <span className="text-lg font-bold text-white">
                    ${(parseFloat(formData.purchaseCost) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {formData.sharedBookable && (
                  <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold text-[10px] uppercase">
                    Bookable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
