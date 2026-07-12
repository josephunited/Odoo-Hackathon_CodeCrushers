import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';

export default function DepartmentForm({ department, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department) setForm({ name: department.name, description: department.description || '' });
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let saved;
      if (department?.id) {
        saved = await departmentService.update(department.id, form);
      } else {
        saved = await departmentService.create(form);
      }
      onSave(saved);
    } catch (err) {
      setError(err.message || 'Failed to save department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>
          {department?.id ? 'Edit Department' : 'New Department'}
        </h1>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '32px', maxWidth: '500px'
      }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px', padding: '12px', marginBottom: '20px',
            color: '#fca5a5', fontSize: '13px'
          }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px' }}>
              Department Name *
            </label>
            <input
              id="dept-name-input"
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g., Engineering"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '14px', outline: 'none'
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              id="dept-description-input"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Short description (optional)"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button id="dept-save-btn" type="submit" disabled={loading} style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '14px'
            }}>
              {loading ? 'Saving...' : 'Save Department'}
            </button>
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
