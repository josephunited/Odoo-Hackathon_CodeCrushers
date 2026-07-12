// Authentication Service
const API_BASE = 'http://localhost:8080';

export const authService = {
  // Register a new user
  register: async (username, email, password, roles = ['EMPLOYEE']) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, roles })
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Registration failed');
    }
    const data = await response.json();
    localStorage.setItem('af_token', data.token);
    localStorage.setItem('af_user', JSON.stringify({ username: data.username, email: data.email, roles: data.roles }));
    return data;
  },

  // Login an existing user
  login: async (username, password) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Login failed. Check your credentials.');
    }
    const data = await response.json();
    localStorage.setItem('af_token', data.token);
    localStorage.setItem('af_user', JSON.stringify({ username: data.username, email: data.email, roles: data.roles }));
    return data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('af_token');
    localStorage.removeItem('af_user');
  },

  // Get current logged-in user info
  getCurrentUser: () => {
    const userStr = localStorage.getItem('af_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('af_token');
  },

  // Get the stored JWT token
  getToken: () => localStorage.getItem('af_token'),
};
