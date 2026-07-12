import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', departmentId: '', designation: '' });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    departmentService.getAll().then(setDepartments);
    if (employee) {
      setForm({
        name: employee.name || '',
        email: employee.email || '',
        departmentId: employee.departmentId || '',
        designation: employee.designation || ''
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, departmentId: Number(form.departmentId) };
      const saved = employee?.id
        ? await employeeService.update(employee.id, payload)
        : await employeeService.create(payload);
      onSave(saved);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: '14px', outline: 'none'
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>
          {employee?.id ? 'Edit Employee' : 'New Employee'}
        </h1>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '32px', maxWidth: '520px'
      }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px', padding: '12px', marginBottom: '20px', color: '#fca5a5', fontSize: '13px'
          }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. Jane Doe', id: 'emp-name' },
            { label: 'Email *', key: 'email', type: 'email', placeholder: 'e.g. jane@company.com', id: 'emp-email' },
            { label: 'Designation', key: 'designation', type: 'text', placeholder: 'e.g. Senior Engineer', id: 'emp-designation' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px' }}>{f.label}</label>
              <input id={f.id} type={f.type} value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required={f.label.includes('*')} placeholder={f.placeholder} style={inputStyle} />
            </div>
          ))}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px' }}>Department *</label>
            <select id="emp-dept" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} required
              style={{ ...inputStyle, appearance: 'none' }}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button id="emp-save-btn" type="submit" disabled={loading} style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '14px'
            }}>{loading ? 'Saving...' : 'Save Employee'}</button>
            <button type="button" onClick={onCancel} style={{
              padding: '12px 20px', borderRadius: '10px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', fontSize: '14px'
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
