import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import { Search, SlidersHorizontal, PlusCircle, Monitor, CheckCircle, AlertTriangle, Layers, MapPin, Tag } from 'lucide-react';

export default function AssetDirectory({ setCurrentPage, setSelectedAssetId }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search & Filter state
  const [filters, setFilters] = useState({
    tag: '',
    serial: '',
    category: '',
    status: '',
    location: '',
    department: ''
  });

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    allocated: 0,
    maintenance: 0
  });

  useEffect(() => {
    fetchMetadata();
    fetchAssets();
  }, [filters]);

  const fetchMetadata = async () => {
    try {
      const cats = await api.categories.list();
      const depts = await api.departments.list();
      setCategories(cats);
      setDepartments(depts);
    } catch (e) {
      console.error("Error loading categories/departments", e);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const list = await api.assets.list(filters);
      setAssets(list);
      
      // Calculate Stats based on unfiltered default assets
      const allAssets = await api.assets.list();
      setStats({
        total: allAssets.length,
        available: allAssets.filter(a => a.status === 'AVAILABLE').length,
        allocated: allAssets.filter(a => a.status === 'ALLOCATED').length,
        maintenance: allAssets.filter(a => a.status === 'UNDER_MAINTENANCE').length
      });
    } catch (e) {
      console.error("Error loading assets", e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      tag: '',
      serial: '',
      category: '',
      status: '',
      location: '',
      department: ''
    });
  };

  const viewAssetDetails = (id) => {
    setSelectedAssetId(id);
    setCurrentPage('details');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Asset Inventory Directory</h2>
          <p className="text-gray-400 text-sm">Monitor, assign, and audit enterprise hardware and IT equipment.</p>
        </div>
        <button
          onClick={() => setCurrentPage('register')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-primary-500/20 font-medium text-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Asset
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={stats.total} icon={Layers} colorClass="text-indigo-400" glowColor="rgba(99, 102, 241, 0.15)" />
        <StatCard title="Available" value={stats.available} icon={CheckCircle} colorClass="text-emerald-400" glowColor="rgba(16, 185, 129, 0.15)" />
        <StatCard title="Allocated" value={stats.allocated} icon={Monitor} colorClass="text-blue-400" glowColor="rgba(59, 130, 246, 0.15)" />
        <StatCard title="Maintenance" value={stats.maintenance} icon={AlertTriangle} colorClass="text-amber-400" glowColor="rgba(245, 158, 11, 0.15)" />
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Asset Tag (e.g. AF-0001)..."
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Serial Number..."
              value={filters.serial}
              onChange={(e) => setFilters({ ...filters, serial: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium transition-all ${
              showFilters ? 'bg-primary-600/25 text-white border-primary-500/30' : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters Drawer */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-white/5 animate-fade-in">
            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Lifecycle Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="RESERVED">Reserved</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="LOST">Lost</option>
                <option value="RETIRED">Retired</option>
                <option value="DISPOSED">Disposed</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Location</label>
              <input
                type="text"
                placeholder="HQ, London..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Department Filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">Department</label>
              <input
                type="text"
                placeholder="Engineering, IT..."
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          <p className="text-xs text-gray-400">Loading asset inventory...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-dashed border-white/10">
          <Tag className="w-10 h-10 mx-auto text-gray-500 mb-3" />
          <h3 className="font-bold text-lg text-white">No Assets Found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or register a new asset inside this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {assets.map((asset, idx) => (
            <div
              key={asset.id}
              onClick={() => viewAssetDetails(asset.id)}
              className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group hover:scale-[1.01] animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              
              {/* Asset Header Image or Mock */}
              <div className="h-40 bg-gray-900 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                {asset.imageUrl ? (
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 flex items-center justify-center">
                    <Monitor className="w-12 h-12 text-indigo-500/35" />
                  </div>
                )}
                
                {/* Badge Tag Overlay */}
                <div className="absolute top-3 left-3 bg-gray-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="font-mono text-xs font-bold text-white tracking-wider">{asset.assetTag}</span>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={asset.status} />
                </div>
              </div>

              {/* Asset Body Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary-400">{asset.category}</p>
                  <h4 className="font-bold text-white truncate text-base group-hover:text-primary-300 transition-colors">{asset.name}</h4>
                  <p className="text-xs text-gray-400 truncate">Serial: {asset.serialNumber}</p>
                </div>

                <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span className="truncate max-w-[120px]">{asset.location}</span>
                  </div>
                  <div className="font-semibold text-white">
                    ${asset.purchaseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
