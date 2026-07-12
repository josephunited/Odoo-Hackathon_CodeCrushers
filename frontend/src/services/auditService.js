// Audit Service - API calls backed by real backend with localStorage fallback
import { api } from './api';

// Mock operations helper
const mock = {
  createAuditCycle: async (request) => {
    const audits = JSON.parse(localStorage.getItem('af_audits') || '[]');
    const active = audits.find(a => a.status === 'ACTIVE');
    if (active) throw new Error(`An active audit cycle '${active.name}' already exists. Close it first.`);

    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const activeAssets = assets.filter(a => a.status !== 'RETIRED' && a.status !== 'DISPOSED');

    const nextId = audits.length > 0 ? Math.max(...audits.map(a => a.id)) + 1 : 1;
    
    const items = activeAssets.map((asset, idx) => ({
      id: idx + 1,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      assetSerialNumber: asset.serialNumber,
      assetLocation: asset.location,
      assetStatus: asset.status,
      assetCondition: asset.assetCondition,
      status: 'PENDING',
      notes: '',
      verifiedBy: '',
      verifiedDate: null
    }));

    const newAudit = {
      id: nextId,
      name: request.name,
      startDate: request.startDate,
      endDate: request.endDate,
      status: 'ACTIVE',
      auditorId: Number(request.auditorId),
      auditorName: request.auditorName,
      createdDate: new Date().toISOString().split('T')[0],
      completedDate: null,
      totalAssets: items.length,
      verifiedAssets: 0,
      missingAssets: 0,
      damagedAssets: 0,
      pendingAssets: items.length,
      items
    };

    audits.push(newAudit);
    localStorage.setItem('af_audits', JSON.stringify(audits));
    return newAudit;
  },

  getActiveAuditCycle: async () => {
    const audits = JSON.parse(localStorage.getItem('af_audits') || '[]');
    return audits.find(a => a.status === 'ACTIVE') || null;
  },

  getAuditHistory: async () => {
    const audits = JSON.parse(localStorage.getItem('af_audits') || '[]');
    return audits.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  },

  getAuditDetails: async (id) => {
    const audits = JSON.parse(localStorage.getItem('af_audits') || '[]');
    const audit = audits.find(a => a.id === Number(id));
    if (!audit) throw new Error('Audit cycle not found');
    return audit;
  },

  verifyAsset: async (auditId, request) => {
    const audits = JSON.parse(localStorage.getItem('af_audits') || '[]');
    const auditIdx = audits.findIndex(a => a.id === Number(auditId));
    if (auditIdx === -1) throw new Error('Audit cycle not found');

    const audit = audits[auditIdx];
    if (audit.status !== 'ACTIVE') throw new Error('Cannot verify assets on a completed audit cycle.');

    const itemIdx = audit.items.findIndex(i => i.assetId === Number(request.assetId));
    if (itemIdx === -1) throw new Error('Asset not found in this audit cycle.');

    const item = audit.items[itemIdx];
    item.status = request.status;
    item.notes = request.notes;
    item.verifiedBy = request.verifiedBy;
    item.verifiedDate = new Date().toISOString().split('T')[0];

    // Update main Asset Db
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const assetIdx = assets.findIndex(a => a.id === Number(request.assetId));
    if (assetIdx !== -1) {
      const asset = assets[assetIdx];
      if (request.status === 'MISSING') {
        asset.status = 'LOST';
      } else if (request.status === 'DAMAGED') {
        asset.assetCondition = 'DAMAGED';
        asset.status = 'UNDER_MAINTENANCE';
      } else if (request.status === 'VERIFIED') {
        if (asset.status === 'LOST') {
          asset.status = 'AVAILABLE';
        }
      }
      assets[assetIdx] = asset;
      localStorage.setItem('af_assets', JSON.stringify(assets));

      // Append into history
      const history = JSON.parse(localStorage.getItem('af_history') || '[]');
      let details = `Asset audited in cycle: ${audit.name}. Verification Status: ${request.status}`;
      if (request.notes) details += `. Notes: ${request.notes}`;
      history.push({
        id: history.length + 1,
        assetId: asset.id,
        actionType: `AUDIT_${request.status}`,
        actionDate: new Date().toISOString(),
        performedBy: request.verifiedBy,
        details
      });
      localStorage.setItem('af_history', JSON.stringify(history));
    }

    // Recalculate stats
    let verified = 0, missing = 0, damaged = 0, pending = 0;
    audit.items.forEach(i => {
      if (i.status === 'VERIFIED') verified++;
      else if (i.status === 'MISSING') missing++;
      else if (i.status === 'DAMAGED') damaged++;
      else pending++;
    });

    audit.verifiedAssets = verified;
    audit.missingAssets = missing;
    audit.damagedAssets = damaged;
    audit.pendingAssets = pending;

    audits[auditIdx] = audit;
    localStorage.setItem('af_audits', JSON.stringify(audits));
    return audit;
  },

  closeAuditCycle: async (auditId) => {
    const audits = JSON.parse(localStorage.getItem('af_audits') || '[]');
    const auditIdx = audits.findIndex(a => a.id === Number(auditId));
    if (auditIdx === -1) throw new Error('Audit cycle not found');

    const audit = audits[auditIdx];
    audit.status = 'COMPLETED';
    audit.completedDate = new Date().toISOString().split('T')[0];

    audits[auditIdx] = audit;
    localStorage.setItem('af_audits', JSON.stringify(audits));
    return audit;
  }
};

export const auditService = {
  create: async (request) => {
    try {
      const res = await api.post('/audits', request);
      return res;
    } catch {
      return await mock.createAuditCycle(request);
    }
  },

  getActive: async () => {
    try {
      const res = await api.get('/audits/active');
      return res;
    } catch {
      return await mock.getActiveAuditCycle();
    }
  },

  getHistory: async () => {
    try {
      const res = await api.get('/audits/history');
      return res;
    } catch {
      return await mock.getAuditHistory();
    }
  },

  getDetails: async (id) => {
    try {
      const res = await api.get(`/audits/${id}`);
      return res;
    } catch {
      return await mock.getAuditDetails(id);
    }
  },

  verifyAsset: async (auditId, assetId, status, notes, verifiedBy) => {
    try {
      const res = await api.post(`/audits/${auditId}/verify`, { assetId, status, notes, verifiedBy });
      return res;
    } catch {
      return await mock.verifyAsset(auditId, { assetId, status, notes, verifiedBy });
    }
  },

  closeCycle: async (auditId) => {
    try {
      const res = await api.post(`/audits/${auditId}/close`, {});
      return res;
    } catch {
      return await mock.closeAuditCycle(auditId);
    }
  }
};
