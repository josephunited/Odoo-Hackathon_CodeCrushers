// Employee Service - API calls backed by real backend with localStorage fallback
const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('af_token') ? { 'Authorization': `Bearer ${localStorage.getItem('af_token')}` } : {})
});

const mockEmps = () => JSON.parse(localStorage.getItem('af_employees') || '[]');

export const employeeService = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Server error');
      return await res.json();
    } catch { return mockEmps(); }
  },
  getById: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Employee not found');
    return await res.json();
  },
  create: async (dto) => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(dto)
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
    return await res.json();
  },
  update: async (id, dto) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(dto)
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
    return await res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
  }
};
