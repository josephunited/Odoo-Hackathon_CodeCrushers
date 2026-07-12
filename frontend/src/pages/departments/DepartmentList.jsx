import React, { useEffect, useState } from 'react';
import { departmentService } from '../../services/departmentService';

export default function DepartmentList({ onEdit, onNew }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDepartments(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await departmentService.delete(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Departments</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>Manage organization departments</p>
        </div>
        <button id="new-department-btn" onClick={onNew} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '14px'
        }}>+ New Department</button>
      </div>

      {error && <div style={{ color: '#fca5a5', marginBottom: '16px' }}>{error}</div>}
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
      ) : departments.length === 0 ? (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.4)'
        }}>
          No departments yet. Create your first department.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {departments.map(dept => (
            <div key={dept.id} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>{dept.name}</p>
                {dept.description && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0 0' }}>{dept.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => onEdit(dept)} style={{
                  padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.4)',
                  background: 'rgba(99,102,241,0.12)', color: '#818cf8', cursor: 'pointer', fontSize: '13px'
                }}>Edit</button>
                <button onClick={() => handleDelete(dept.id)} style={{
                  padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: '13px'
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
