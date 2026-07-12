const API_BASE = 'http://localhost:8080/api/maintenance';

// Mock DB Initializer
const initMockMaintenance = () => {
  if (!localStorage.getItem('af_maintenance')) {
    const defaultMaintenance = [
      {
        id: 1,
        assetId: 3,
        assetName: 'iPad Pro 11" 256GB',
        assetTag: 'AF-0003',
        issue: 'Screen flickering issue',
        resolutionDetails: 'Screen panel replaced under warranty',
        requestDate: '2026-07-01',
        scheduledDate: '2026-07-02',
        completionDate: '2026-07-05',
        cost: 150.00,
        status: 'COMPLETED',
        maintenanceType: 'CORRECTIVE'
      }
    ];
    localStorage.setItem('af_maintenance', JSON.stringify(defaultMaintenance));
  }
};

initMockMaintenance();

const getMockAssets = () => JSON.parse(localStorage.getItem('af_assets') || '[]');

const mock = {
  list: async (filters = {}) => {
    let list = JSON.parse(localStorage.getItem('af_maintenance') || '[]');
    if (filters.assetId) {
      list = list.filter(m => m.assetId === parseInt(filters.assetId));
    }
    return list;
  },
  get: async (id) => {
    const list = JSON.parse(localStorage.getItem('af_maintenance') || '[]');
    const record = list.find(m => m.id === parseInt(id));
    if (!record) throw new Error('Maintenance record not found');
    return record;
  },
  create: async (data) => {
    const list = JSON.parse(localStorage.getItem('af_maintenance') || '[]');
    const assets = getMockAssets();
    const asset = assets.find(a => a.id === parseInt(data.assetId));
    if (!asset) throw new Error('Asset not found');

    const nextId = list.length > 0 ? Math.max(...list.map(m => m.id)) + 1 : 1;
    const newRecord = {
      id: nextId,
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.assetTag,
      issue: data.issue,
      resolutionDetails: null,
      requestDate: new Date().toISOString().split('T')[0],
      scheduledDate: null,
      completionDate: null,
      cost: 0.0,
      status: 'REQUESTED',
      maintenanceType: data.maintenanceType
    };

    list.push(newRecord);
    localStorage.setItem('af_maintenance', JSON.stringify(list));

    // Log asset history
    try {
      const history = JSON.parse(localStorage.getItem('af_history') || '[]');
      history.push({
        id: history.length + 1,
        assetId: asset.id,
        actionType: 'MAINTENANCE_REQUEST',
        actionDate: new Date().toISOString(),
        performedBy: 'System',
        details: `Maintenance requested: ${data.issue} (${data.maintenanceType})`
      });
      localStorage.setItem('af_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }

    return newRecord;
  },
  schedule: async (id, date) => {
    const list = JSON.parse(localStorage.getItem('af_maintenance') || '[]');
    const idx = list.findIndex(m => m.id === parseInt(id));
    if (idx === -1) throw new Error('Maintenance record not found');

    list[idx].scheduledDate = date;
    list[idx].status = 'SCHEDULED';
    localStorage.setItem('af_maintenance', JSON.stringify(list));

    // Log history
    try {
      const history = JSON.parse(localStorage.getItem('af_history') || '[]');
      history.push({
        id: history.length + 1,
        assetId: list[idx].assetId,
        actionType: 'MAINTENANCE_SCHEDULED',
        actionDate: new Date().toISOString(),
        performedBy: 'System',
        details: `Maintenance scheduled for: ${date}`
      });
      localStorage.setItem('af_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }

    return list[idx];
  },
  resolve: async (id, resolution, cost) => {
    const list = JSON.parse(localStorage.getItem('af_maintenance') || '[]');
    const idx = list.findIndex(m => m.id === parseInt(id));
    if (idx === -1) throw new Error('Maintenance record not found');

    list[idx].resolutionDetails = resolution;
    list[idx].cost = parseFloat(cost);
    list[idx].completionDate = new Date().toISOString().split('T')[0];
    list[idx].status = 'COMPLETED';
    localStorage.setItem('af_maintenance', JSON.stringify(list));

    // Update asset status to AVAILABLE
    try {
      const assets = getMockAssets();
      const assetIdx = assets.findIndex(a => a.id === list[idx].assetId);
      if (assetIdx !== -1) {
        assets[assetIdx].status = 'AVAILABLE';
        localStorage.setItem('af_assets', JSON.stringify(assets));
      }

      // Log history
      const history = JSON.parse(localStorage.getItem('af_history') || '[]');
      history.push({
        id: history.length + 1,
        assetId: list[idx].assetId,
        actionType: 'MAINTENANCE_COMPLETED',
        actionDate: new Date().toISOString(),
        performedBy: 'System',
        details: `Maintenance completed. Resolution: ${resolution}, Cost: $${cost}`
      });
      localStorage.setItem('af_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }

    return list[idx];
  },
  updateStatus: async (id, status) => {
    const list = JSON.parse(localStorage.getItem('af_maintenance') || '[]');
    const idx = list.findIndex(m => m.id === parseInt(id));
    if (idx === -1) throw new Error('Maintenance record not found');

    list[idx].status = status;
    localStorage.setItem('af_maintenance', JSON.stringify(list));

    // Update asset status accordingly
    try {
      const assets = getMockAssets();
      const assetIdx = assets.findIndex(a => a.id === list[idx].assetId);
      if (assetIdx !== -1) {
        if (status === 'IN_PROGRESS') {
          assets[assetIdx].status = 'UNDER_MAINTENANCE';
        } else if (status === 'CANCELLED') {
          assets[assetIdx].status = 'AVAILABLE';
        }
        localStorage.setItem('af_assets', JSON.stringify(assets));
      }

      // Log history
      const history = JSON.parse(localStorage.getItem('af_history') || '[]');
      history.push({
        id: history.length + 1,
        assetId: list[idx].assetId,
        actionType: 'MAINTENANCE_STATUS_UPDATE',
        actionDate: new Date().toISOString(),
        performedBy: 'System',
        details: `Maintenance status updated to: ${status}`
      });
      localStorage.setItem('af_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }

    return list[idx];
  },
  delete: async (id) => {
    let list = JSON.parse(localStorage.getItem('af_maintenance') || '[]');
    list = list.filter(m => m.id !== parseInt(id));
    localStorage.setItem('af_maintenance', JSON.stringify(list));
  }
};

export const maintenanceService = {
  async list(filters = {}) {
    try {
      let url = API_BASE;
      if (filters.assetId) url += `?assetId=${filters.assetId}`;
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
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.create(data);
    }
  },
  async schedule(id, date) {
    try {
      const res = await fetch(`${API_BASE}/${id}/schedule?date=${date}`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.schedule(id, date);
    }
  },
  async resolve(id, resolution, cost) {
    try {
      const res = await fetch(`${API_BASE}/${id}/resolve?resolution=${encodeURIComponent(resolution)}&cost=${cost}`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      return await mock.resolve(id, resolution, cost);
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
