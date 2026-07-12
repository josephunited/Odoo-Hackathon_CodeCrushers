const API_BASE = 'http://localhost:8080/api/bookings';

// Mock DB Initializer
const initMockBookings = () => {
  if (!localStorage.getItem('af_bookings')) {
    const defaultBookings = [
      {
        id: 1,
        assetId: 2,
        assetName: 'Dell UltraSharp 32" 4K Monitor',
        assetTag: 'AF-0002',
        employeeId: 101,
        employeeName: 'Sooraj S',
        startTime: '2026-07-13T09:00:00',
        endTime: '2026-07-13T17:00:00',
        purpose: 'Design work presentation',
        status: 'APPROVED'
      }
    ];
    localStorage.setItem('af_bookings', JSON.stringify(defaultBookings));
  }
};

initMockBookings();

const getMockAssets = () => JSON.parse(localStorage.getItem('af_assets') || '[]');
const getMockEmployees = () => JSON.parse(localStorage.getItem('af_employees') || '[]');

const mock = {
  list: async (filters = {}) => {
    let bookings = JSON.parse(localStorage.getItem('af_bookings') || '[]');
    if (filters.employeeId) {
      bookings = bookings.filter(b => b.employeeId === parseInt(filters.employeeId));
    }
    if (filters.assetId) {
      bookings = bookings.filter(b => b.assetId === parseInt(filters.assetId));
    }
    return bookings;
  },
  get: async (id) => {
    const bookings = JSON.parse(localStorage.getItem('af_bookings') || '[]');
    const booking = bookings.find(b => b.id === parseInt(id));
    if (!booking) throw new Error('Booking not found');
    return booking;
  },
  create: async (data) => {
    const bookings = JSON.parse(localStorage.getItem('af_bookings') || '[]');
    const assets = getMockAssets();
    const employees = getMockEmployees();

    const asset = assets.find(a => a.id === parseInt(data.assetId));
    if (!asset) throw new Error('Asset not found');
    if (!asset.sharedBookable) throw new Error('Asset is not bookable');

    const emp = employees.find(e => e.id === parseInt(data.employeeId)) || { name: 'Unknown Employee' };

    // Check overlap
    const newStart = new Date(data.startTime);
    const newEnd = new Date(data.endTime);
    const hasOverlap = bookings.some(b => {
      if (b.assetId !== parseInt(data.assetId)) return false;
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return newStart < bEnd && newEnd > bStart;
    });

    if (hasOverlap) {
      throw new Error('The asset is already booked during this time period.');
    }

    const nextId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    const newBooking = {
      id: nextId,
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.assetTag,
      employeeId: parseInt(data.employeeId),
      employeeName: emp.name,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose || '',
      status: 'PENDING'
    };

    bookings.push(newBooking);
    localStorage.setItem('af_bookings', JSON.stringify(bookings));
    return newBooking;
  },
  update: async (id, data) => {
    const bookings = JSON.parse(localStorage.getItem('af_bookings') || '[]');
    const idx = bookings.findIndex(b => b.id === parseInt(id));
    if (idx === -1) throw new Error('Booking not found');

    const assets = getMockAssets();
    const employees = getMockEmployees();

    const asset = assets.find(a => a.id === parseInt(data.assetId));
    if (!asset) throw new Error('Asset not found');

    const emp = employees.find(e => e.id === parseInt(data.employeeId)) || { name: 'Unknown Employee' };

    // Check overlap
    const newStart = new Date(data.startTime);
    const newEnd = new Date(data.endTime);
    const hasOverlap = bookings.some(b => {
      if (b.id === parseInt(id)) return false;
      if (b.assetId !== parseInt(data.assetId)) return false;
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return newStart < bEnd && newEnd > bStart;
    });

    if (hasOverlap) {
      throw new Error('The asset is already booked during this time period.');
    }

    bookings[idx] = {
      ...bookings[idx],
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.assetTag,
      employeeId: parseInt(data.employeeId),
      employeeName: emp.name,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose || ''
    };

    localStorage.setItem('af_bookings', JSON.stringify(bookings));
    return bookings[idx];
  },
  updateStatus: async (id, status) => {
    const bookings = JSON.parse(localStorage.getItem('af_bookings') || '[]');
    const idx = bookings.findIndex(b => b.id === parseInt(id));
    if (idx === -1) throw new Error('Booking not found');

    bookings[idx].status = status;
    localStorage.setItem('af_bookings', JSON.stringify(bookings));

    // Send notifications if status is approved/rejected
    if (status === 'APPROVED' || status === 'REJECTED') {
      try {
        const notifications = JSON.parse(localStorage.getItem('af_notifications') || '[]');
        notifications.push({
          id: notifications.length + 1,
          employeeId: bookings[idx].employeeId,
          message: `Your booking for ${bookings[idx].assetName} has been ${status.toLowerCase()}.`,
          timestamp: new Date().toISOString(),
          isRead: false
        });
        localStorage.setItem('af_notifications', JSON.stringify(notifications));
      } catch (e) {
        console.error(e);
      }
    }

    return bookings[idx];
  },
  delete: async (id) => {
    let bookings = JSON.parse(localStorage.getItem('af_bookings') || '[]');
    bookings = bookings.filter(b => b.id !== parseInt(id));
    localStorage.setItem('af_bookings', JSON.stringify(bookings));
  }
};

export const bookingService = {
  async list(filters = {}) {
    try {
      let url = API_BASE;
      const query = new URLSearchParams();
      if (filters.employeeId) query.append('employeeId', filters.employeeId);
      if (filters.assetId) query.append('assetId', filters.assetId);
      if (query.toString()) url += `?${query.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.list(filters);
    }
  },
  async get(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.get(id);
    }
  },
  async create(data) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Overlap/Validation error');
      }
      return await res.json();
    } catch (e) {
      if (e.message.includes('already booked') || e.message.includes('not bookable')) throw e;
      return await mock.create(data);
    }
  },
  async update(id, data) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Overlap/Validation error');
      }
      return await res.json();
    } catch (e) {
      if (e.message.includes('already booked')) throw e;
      return await mock.update(id, data);
    }
  },
  async updateStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/${id}/status?status=${status}`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.updateStatus(id, status);
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
