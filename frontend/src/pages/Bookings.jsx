import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { Calendar, Plus, XCircle, AlertCircle } from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // New booking form
  const [showModal, setShowModal] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [newBooking, setNewBooking] = useState({
    assetId: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.bookings.listByEmployee(currentUser.employeeId);
      setBookings(data);
    } catch (e) {
      setErrorMsg('Failed to load bookings: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    try {
      const allAssets = await api.assets.list();
      setAvailableAssets(allAssets.filter(a => a.sharedBookable && a.status === 'AVAILABLE'));
      setShowModal(true);
    } catch (e) {
      alert("Could not load assets");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.bookings.create({
        ...newBooking,
        employeeId: currentUser.employeeId
      });
      setShowModal(false);
      loadBookings();
    } catch (e) {
      alert('Failed to book: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.bookings.cancel(id, currentUser.employeeId);
      loadBookings();
    } catch (e) {
      alert('Failed to cancel: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-primary-400" />
            My Bookings
          </h2>
          <p className="text-gray-400 text-sm mt-1">Reserve shared assets like projectors and meeting rooms.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm text-center py-10">Loading your bookings...</div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-950/20 text-gray-400 font-semibold border-b border-white/5">
                <th className="p-4">Asset</th>
                <th className="p-4">Start Time</th>
                <th className="p-4">End Time</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">You have no upcoming bookings.</td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-medium">{b.asset.name} ({b.asset.assetTag})</td>
                    <td className="p-4 text-gray-300">{new Date(b.startTime).toLocaleString()}</td>
                    <td className="p-4 text-gray-300">{new Date(b.endTime).toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{b.purpose}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        b.status === 'CANCELLED' ? 'bg-gray-500/10 text-gray-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.status !== 'CANCELLED' && (
                        <button onClick={() => handleCancel(b.id)} className="text-rose-400 hover:text-rose-300 transition-colors" title="Cancel Booking">
                          <XCircle className="w-5 h-5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Book Shared Asset</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Select Asset</label>
                <select
                  required
                  value={newBooking.assetId}
                  onChange={e => setNewBooking({...newBooking, assetId: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="">-- Choose Asset --</option>
                  {availableAssets.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase">Start Time</label>
                  <input
                    required type="datetime-local"
                    value={newBooking.startTime}
                    onChange={e => setNewBooking({...newBooking, startTime: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase">End Time</label>
                  <input
                    required type="datetime-local"
                    value={newBooking.endTime}
                    onChange={e => setNewBooking({...newBooking, endTime: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Purpose</label>
                <input
                  required type="text"
                  placeholder="e.g. Client presentation"
                  value={newBooking.purpose}
                  onChange={e => setNewBooking({...newBooking, purpose: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all"
                >
                  Confirm Booking
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
