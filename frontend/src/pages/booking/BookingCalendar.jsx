import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { api } from '../../services/api';
import { Calendar as CalendarIcon, Clock, User, Package, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';

export default function BookingCalendar({ setCurrentPage, setSelectedAssetId }) {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allAssets = await api.assets.list();
      const bookableAssets = allAssets.filter(a => a.sharedBookable);
      setAssets(bookableAssets);

      const allBookings = await bookingService.list();
      // Filter out rejected or cancelled bookings for schedule visibility
      const activeBookings = allBookings.filter(b => b.status === 'APPROVED' || b.status === 'PENDING');
      setBookings(activeBookings);
    } catch (e) {
      console.error('Error fetching calendar data', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = selectedAsset === 'all'
    ? bookings
    : bookings.filter(b => b.assetId === parseInt(selectedAsset));

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Resource Booking Schedule</h2>
          <p className="text-gray-400 text-sm">View asset reservations and scheduled shared resources.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('booking-form')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-primary-500/20 font-medium text-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Book a Resource
          </button>
        </div>
      </div>

      {/* Asset Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cardborder flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-semibold text-gray-300">Filter Resource:</span>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary-500 w-full md:w-64"
          >
            <option value="all">All Shared Bookables</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setCurrentPage('bookings')}
          className="text-xs text-primary-400 font-semibold hover:text-primary-300 transition-colors"
        >
          View My Booking History &rarr;
        </button>
      </div>

      {/* Booking Grid / List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-cardborder">
          <CalendarIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Active Reservations</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">There are no approved or pending bookings scheduled for the selected resource.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map(b => (
            <div key={b.id} className="glass-panel p-5 rounded-2xl border border-cardborder flex flex-col justify-between hover:border-primary-500/30 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {b.status}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-mono">
                    <Package className="w-3.5 h-3.5" />
                    {b.assetTag}
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">{b.assetName}</h4>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2 italic">"{b.purpose || 'No purpose listed.'}"</p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-400" />
                  <span className="font-semibold text-gray-300">{b.employeeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{formatDateTime(b.startTime)} - {formatDateTime(b.endTime)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
