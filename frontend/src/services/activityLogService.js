// activityLogService.js
// Handles activity log API calls with localStorage simulation fallback.

import { api } from './api';

const STORAGE_KEY = 'af_activity_logs';

// ── Seed helpers ──────────────────────────────────────────────────────────────

function seedLogs() {
  const now = new Date();
  const ts = (offsetMinutes) => {
    const d = new Date(now.getTime() - offsetMinutes * 60 * 1000);
    return d.toISOString();
  };

  return [
    { id: 1,  module: 'ASSET',       actionType: 'ASSET_CREATED',      description: 'Asset "Dell Latitude 5540" (AST-0023) was registered.',         actorUsername: 'sooraj',  entityType: 'Asset',   entityId: 23, entityName: 'AST-0023', timestamp: ts(2)   },
    { id: 2,  module: 'ASSET',       actionType: 'ASSET_ALLOCATED',     description: 'Asset "Dell Latitude 5540" allocated to Riya Sharma.',           actorUsername: 'sooraj',  entityType: 'Asset',   entityId: 23, entityName: 'AST-0023', timestamp: ts(5)   },
    { id: 3,  module: 'BOOKING',     actionType: 'BOOKING_CREATED',     description: 'Booking created for Conference Room A (2026-07-15).',            actorUsername: 'anna',    entityType: 'Booking', entityId: 7,  entityName: 'BK-007',   timestamp: ts(12)  },
    { id: 4,  module: 'AUDIT',       actionType: 'AUDIT_CREATED',       description: 'Audit cycle "Q3 2026 Physical Audit" started.',                  actorUsername: 'joseph',  entityType: 'Audit',   entityId: 1,  entityName: 'Q3 2026',  timestamp: ts(30)  },
    { id: 5,  module: 'AUDIT',       actionType: 'AUDIT_VERIFIED',      description: 'Asset AST-0012 verified in audit cycle "Q3 2026".',              actorUsername: 'joseph',  entityType: 'Asset',   entityId: 12, entityName: 'AST-0012', timestamp: ts(35)  },
    { id: 6,  module: 'MAINTENANCE', actionType: 'MAINTENANCE_OPENED',  description: 'Maintenance ticket opened for HP ProBook 450 (AST-0008).',       actorUsername: 'anna',    entityType: 'Asset',   entityId: 8,  entityName: 'AST-0008', timestamp: ts(60)  },
    { id: 7,  module: 'ASSET',       actionType: 'ASSET_TRANSFERRED',   description: 'Asset AST-0017 transferred from IT Dept to Finance Dept.',       actorUsername: 'sooraj',  entityType: 'Asset',   entityId: 17, entityName: 'AST-0017', timestamp: ts(90)  },
    { id: 8,  module: 'AUTH',        actionType: 'USER_LOGIN',          description: 'User "aparna" logged in.',                                        actorUsername: 'aparna',  entityType: 'User',    entityId: 2,  entityName: 'aparna',   timestamp: ts(120) },
    { id: 9,  module: 'BOOKING',     actionType: 'BOOKING_APPROVED',    description: 'Booking BK-007 approved by admin.',                              actorUsername: 'joseph',  entityType: 'Booking', entityId: 7,  entityName: 'BK-007',   timestamp: ts(150) },
    { id: 10, module: 'ASSET',       actionType: 'ASSET_RETURNED',      description: 'Asset AST-0021 returned from Vikram Nair.',                      actorUsername: 'sooraj',  entityType: 'Asset',   entityId: 21, entityName: 'AST-0021', timestamp: ts(180) },
    { id: 11, module: 'AUDIT',       actionType: 'AUDIT_MISSING',       description: 'Asset AST-0005 marked MISSING in audit cycle "Q3 2026".',        actorUsername: 'joseph',  entityType: 'Asset',   entityId: 5,  entityName: 'AST-0005', timestamp: ts(200) },
    { id: 12, module: 'MAINTENANCE', actionType: 'MAINTENANCE_CLOSED',  description: 'Maintenance ticket closed for AST-0008. Resolution: Repaired.',  actorUsername: 'anna',    entityType: 'Asset',   entityId: 8,  entityName: 'AST-0008', timestamp: ts(240) },
    { id: 13, module: 'ASSET',       actionType: 'ASSET_RETIRED',       description: 'Asset "Canon Printer MF3010" (AST-0003) retired from service.',  actorUsername: 'sooraj',  entityType: 'Asset',   entityId: 3,  entityName: 'AST-0003', timestamp: ts(300) },
    { id: 14, module: 'AUTH',        actionType: 'USER_CREATED',        description: 'New user account "sooraj" created by admin.',                    actorUsername: 'aparna',  entityType: 'User',    entityId: 3,  entityName: 'sooraj',   timestamp: ts(360) },
    { id: 15, module: 'AUDIT',       actionType: 'AUDIT_CLOSED',        description: 'Audit cycle "Q2 2026 Verification" closed. 98% assets verified.', actorUsername: 'joseph', entityType: 'Audit',   entityId: 0,  entityName: 'Q2 2026',  timestamp: ts(600) },
  ];
}

function getLocalLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  const seeded = seedLogs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

// ── API layer ─────────────────────────────────────────────────────────────────

export const activityLogService = {

  /**
   * Fetch recent 20 logs (for dashboard feed).
   */
  async getRecentActivity() {
    try {
      const resp = await api.get('/activity-logs/recent');
      return resp;   // api.exec() returns parsed JSON directly, not { data }
    } catch (_) {
      const logs = getLocalLogs();
      return [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
    }
  },

  /**
   * Fetch paginated, filtered activity logs.
   * @param {Object} filters - { module, actorUsername, actionType, from, to, search, page, size }
   * @returns {{ content: Array, totalElements: number, totalPages: number, number: number }}
   */
  async getLogs({ module = '', actorUsername = '', actionType = '', from = '', to = '', search = '', page = 0, size = 25 } = {}) {
    try {
      const params = {};
      if (module)       params.module = module;
      if (actorUsername) params.actorUsername = actorUsername;
      if (actionType)   params.actionType = actionType;
      if (from)         params.from = from;
      if (to)           params.to = to;
      if (search)       params.search = search;
      params.page = page;
      params.size = size;

      const resp = await api.get('/activity-logs', { params });
      return resp;   // api.exec() returns parsed JSON directly
    } catch (_) {
      // Simulate server-side filtering/pagination in localStorage
      let logs = getLocalLogs();

      if (module)       logs = logs.filter(l => l.module === module);
      if (actorUsername) logs = logs.filter(l => l.actorUsername === actorUsername);
      if (actionType)   logs = logs.filter(l => l.actionType === actionType);
      if (from)         logs = logs.filter(l => new Date(l.timestamp) >= new Date(from));
      if (to)           logs = logs.filter(l => new Date(l.timestamp) <= new Date(to));
      if (search) {
        const q = search.toLowerCase();
        logs = logs.filter(l =>
          l.description.toLowerCase().includes(q) ||
          (l.entityName || '').toLowerCase().includes(q) ||
          (l.actorUsername || '').toLowerCase().includes(q)
        );
      }

      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const totalElements = logs.length;
      const totalPages    = Math.max(1, Math.ceil(totalElements / size));
      const start         = page * size;
      const content       = logs.slice(start, start + size);

      return { content, totalElements, totalPages, number: page, size };
    }
  },

  /**
   * Fetch distinct actors and modules for filter dropdowns.
   * @returns {{ actors: string[], modules: string[] }}
   */
  async getMeta() {
    try {
      const resp = await api.get('/activity-logs/meta');
      return resp;   // api.exec() returns parsed JSON directly
    } catch (_) {
      const logs = getLocalLogs();
      const actors  = [...new Set(logs.map(l => l.actorUsername).filter(Boolean))].sort();
      const modules = [...new Set(logs.map(l => l.module).filter(Boolean))].sort();
      return { actors, modules };
    }
  },
};
