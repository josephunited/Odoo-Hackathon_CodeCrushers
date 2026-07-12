import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { api } from '../../services/api';
import { Calendar, Clock, User, FileText, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function BookingForm({ bookingId, onSave, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    assetId: '',
    employeeId: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  useEffect(() => {
    fetchMetadata();
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const fetchMetadata = async () => {
    try {
      const allAssets = await api.assets.list();
      setAssets(allAssets.filter(a => a.sharedBookable));
      
      const empList = await api.employees.list();
      setEmployees(empList);
    } catch (e) {
      console.error('Error loading form metadata', e);
    }
  };

  const loadBooking = async () => {
    try {
      const data = await bookingService.get(bookingId);
      // Format LocalDateTime for input field (YYYY-MM-DDTHH:MM)
      const start = data.startTime.slice(0, 16);
      const end = data.endTime.slice(0, 16);
      setFormData({
        assetId: data.assetId,
        employeeId: data.employeeId,
        startTime: start,
        endTime: end,
        purpose: data.purpose || ''
      });
    } catch (e) {
      setError('Failed to load booking details.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.assetId || !formData.employeeId || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start < new Date()) {
      setError('Booking start time must be in the future.');
      return;
    }
    if (start >= end) {
      setError('Booking start time must be before end time.');
      return;
    }

    setLoading(true);
    try {
      if (bookingId) {
        await bookingService.update(bookingId, {
          assetId: parseInt(formData.assetId),
          employeeId: parseInt(formData.employeeId),
          startTime: formData.startTime + ':00', // ensure ISO pattern
          endTime: formData.endTime + ':00',
          purpose: formData.purpose
        });
      } else {
        await bookingService.create({
          assetId: parseInt(formData.assetId),
          employeeId: parseInt(formData.employeeId),
          startTime: formData.startTime + ':00',
          endTime: formData.endTime + ':00',
          purpose: formData.purpose
        });
      }
      onSave();
    } catch (err) {
      setError(err.message || 'An error occurred during booking validation.');
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

      {/* Card Wrapper */}
      <div className="glass-panel p-6 rounded-2xl border border-cardborder shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">
          {bookingId ? 'Edit Booking Reservation' : 'Request Resource Booking'}
        </h2>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 mb-6 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Asset selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary-400" />
              Shared Resource *
            </label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500"
              disabled={bookingId}
            >
              <option value="">Select a bookable asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
              ))}
            </select>
          </div>

          {/* Employee selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Employee *
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select requesting employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
              ))}
            </select>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Purpose
            </label>
            <textarea
              rows={3}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Training session, client demo, offsite support..."
              className="w-full bg-gray-900 border border-cardborder text-white text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
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
                bookingId ? 'Update Reservation' : 'Request Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
