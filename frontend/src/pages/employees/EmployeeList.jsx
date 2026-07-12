import React, { useEffect, useState } from 'react';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';

export default function EmployeeList({ onEdit, onNew }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([employeeService.getAll(), departmentService.getAll()])
      .then(([emps, depts]) => { setEmployees(emps); setDepartments(depts); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await employeeService.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) { alert(err.message); }
  };

  const getDeptName = (emp) => emp.departmentName || departments.find(d => d.id === emp.departmentId)?.name || '-';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Employees</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>Manage employee records</p>
        </div>
        <button id="new-employee-btn" onClick={onNew} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '14px'
        }}>+ New Employee</button>
      </div>
      {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {employees.map(emp => (
            <div key={emp.id} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '16px'
                }}>{(emp.name || '?')[0].toUpperCase()}</div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>{emp.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0' }}>
                    {emp.email} · {getDeptName(emp)}{emp.designation ? ` · ${emp.designation}` : ''}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => onEdit(emp)} style={{
                  padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.4)',
                  background: 'rgba(99,102,241,0.12)', color: '#818cf8', cursor: 'pointer', fontSize: '13px'
                }}>Edit</button>
                <button onClick={() => handleDelete(emp.id)} style={{
                  padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: '13px'
                }}>Delete</button>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.4)'
            }}>No employees yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
