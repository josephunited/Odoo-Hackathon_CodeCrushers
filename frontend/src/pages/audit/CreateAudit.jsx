import React, { useEffect, useState } from 'react';
import { auditService } from '../../services/auditService';
import { employeeService } from '../../services/employeeService';
import { Calendar, User, Clipboard, ArrowLeft } from 'lucide-react';

export default function CreateAudit({ onSave, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    auditorId: '',
    auditorName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    employeeService.getAll().then(setEmployees).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'auditorId') {
      const emp = employees.find(emp => emp.id === Number(value));
      setFormData(prev => ({
        ...prev,
        auditorId: value,
        auditorName: emp ? emp.name : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.auditorId) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await auditService.create({
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        auditorId: formData.auditorId,
        auditorName: formData.auditorName
      });
      onSave();
    } catch (err) {
      setError(err.message || 'Failed to start audit cycle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Audit Cycle</h1>
          <p className="text-xs text-gray-400 font-medium">Initiate a new physical asset verification cycle.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Audit Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5 text-primary-400" />
              Audit Cycle Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Q3 2026 Asset Inventory Audit"
              className="w-full bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-400" />
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-400" />
                Expected End Date *
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Auditor Assignment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary-400" />
              Assign Auditor *
            </label>
            <select
              name="auditorId"
              required
              value={formData.auditorId}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="" disabled>-- Select Employee as Auditor --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation || 'Staff'} - {emp.department?.name || emp.department || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Starting Cycle...' : 'Start Audit Cycle'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
