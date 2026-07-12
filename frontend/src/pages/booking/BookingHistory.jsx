import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { Check, X, Calendar, Edit2, Trash2, CalendarRange, Trash } from 'lucide-react';

export default function BookingHistory({ currentUser, onEdit, onNew, setCurrentPage }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const all = await bookingService.list();
      setBookings(all);
    } catch (e) {
      console.error('Error fetching bookings', e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.roles?.includes('ADMIN') || false;

  const handleStatusChange = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchBookings();
    } catch (e) {
      console.error('Error updating status', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking record?')) return;
    try {
      await bookingService.delete(id);
      fetchBookings();
    } catch (e) {
      console.error('Error deleting booking', e);
    }
  };

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Booking Management Log</h2>
          <p className="text-gray-400 text-sm">Review, approve, or cancel booking requests.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage('booking-calendar')}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            <CalendarRange className="w-4 h-4 text-primary-400" />
            Calendar Grid
          </button>
          <button
            onClick={onNew}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Book Resource
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-cardborder">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Bookings Found</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">There are no resource reservation records currently logged in the database.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-cardborder overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="p-4">Resource</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{b.assetName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{b.assetTag}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-200">{b.employeeName}</td>
                    <td className="p-4 text-xs text-gray-400 space-y-0.5">
                      <div><span className="text-emerald-400 font-medium">Start:</span> {formatDateTime(b.startTime)}</div>
                      <div><span className="text-rose-400 font-medium">End:</span> {formatDateTime(b.endTime)}</div>
                    </td>
                    <td className="p-4 text-xs italic text-gray-400 max-w-xs truncate">
                      {b.purpose || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        b.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Admin status adjustments */}
                        {isAdmin && b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(b.id, 'APPROVED')}
                              title="Approve"
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'REJECTED')}
                              title="Reject"
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Employee cancel */}
                        {!isAdmin && b.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                            title="Cancel Booking"
                            className="px-2 py-1 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 text-gray-400 rounded-lg text-xs font-semibold transition-all"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Edit support for pending */}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => onEdit(b.id)}
                            title="Edit details"
                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete support */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          title="Delete record"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
