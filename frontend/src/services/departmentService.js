// Department Service - API calls backed by real backend with localStorage fallback
const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('af_token') ? { 'Authorization': `Bearer ${localStorage.getItem('af_token')}` } : {})
});

// localStorage mock helpers
const mockDepts = () => JSON.parse(localStorage.getItem('af_departments') || '[]')
  .map((name, idx) => ({ id: idx + 1, name, description: '' }));

export const departmentService = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/departments`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Server error');
      return await res.json();
    } catch { return mockDepts(); }
  },
  getById: async (id) => {
    const res = await fetch(`${API_BASE}/departments/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Department not found');
    return await res.json();
  },
  create: async (dto) => {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(dto)
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
    return await res.json();
  },
  update: async (id, dto) => {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(dto)
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
    return await res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
  }
};
