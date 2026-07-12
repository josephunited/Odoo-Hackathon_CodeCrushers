const API_BASE = 'http://localhost:8080/api/notifications';

// Mock DB Initializer
const initMockNotifications = () => {
  if (!localStorage.getItem('af_notifications')) {
    const defaultNotifications = [
      {
        id: 1,
        employeeId: 101,
        message: 'Your booking for Dell UltraSharp 32" 4K Monitor has been approved.',
        timestamp: '2026-07-12T10:00:00',
        isRead: false
      }
    ];
    localStorage.setItem('af_notifications', JSON.stringify(defaultNotifications));
  }
};

initMockNotifications();

const mock = {
  list: async (employeeId) => {
    const notifications = JSON.parse(localStorage.getItem('af_notifications') || '[]');
    return notifications.filter(n => n.employeeId === parseInt(employeeId)).sort((a,b) => b.id - a.id);
  },
  listUnread: async (employeeId) => {
    const notifications = JSON.parse(localStorage.getItem('af_notifications') || '[]');
    return notifications.filter(n => n.employeeId === parseInt(employeeId) && !n.isRead).sort((a,b) => b.id - a.id);
  },
  markAsRead: async (id) => {
    const notifications = JSON.parse(localStorage.getItem('af_notifications') || '[]');
    const idx = notifications.findIndex(n => n.id === parseInt(id));
    if (idx === -1) throw new Error('Notification not found');
    notifications[idx].isRead = true;
    localStorage.setItem('af_notifications', JSON.stringify(notifications));
    return notifications[idx];
  },
  markAllAsRead: async (employeeId) => {
    const notifications = JSON.parse(localStorage.getItem('af_notifications') || '[]');
    notifications.forEach(n => {
      if (n.employeeId === parseInt(employeeId)) n.isRead = true;
    });
    localStorage.setItem('af_notifications', JSON.stringify(notifications));
  },
  delete: async (id) => {
    let notifications = JSON.parse(localStorage.getItem('af_notifications') || '[]');
    notifications = notifications.filter(n => n.id !== parseInt(id));
    localStorage.setItem('af_notifications', JSON.stringify(notifications));
  }
};

export const notificationService = {
  async list(employeeId) {
    try {
      const res = await fetch(`${API_BASE}/employee/${employeeId}`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.list(employeeId);
    }
  },
  async listUnread(employeeId) {
    try {
      const res = await fetch(`${API_BASE}/employee/${employeeId}/unread`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.listUnread(employeeId);
    }
  },
  async markAsRead(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}/read`, { method: 'PUT' });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.markAsRead(id);
    }
  },
  async markAllAsRead(employeeId) {
    try {
      const res = await fetch(`${API_BASE}/employee/${employeeId}/read-all`, { method: 'PUT' });
      if (!res.ok) throw new Error('API failed');
    } catch (e) {
      await mock.markAllAsRead(employeeId);
    }
  },
  async delete(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('API failed');
    } catch (e) {
      await mock.delete(id);
    }
  }
};
