// reportService.js
// Fetches report data from backend with full localStorage simulation fallback.

import { api } from './api';

// ── Simulation helpers ────────────────────────────────────────────────────────

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().slice(0, 10);
}

function mockAssetReport() {
  const statuses   = ['AVAILABLE','ALLOCATED','UNDER_MAINTENANCE','LOST','RETIRED'];
  const categories = ['Laptop','Desktop','Printer','Projector','Server','Tablet','Monitor','Network'];
  const locations  = ['Floor 1','Floor 2','Floor 3','Server Room','Warehouse','Reception'];
  const conditions = ['GOOD','FAIR','DAMAGED','EXCELLENT'];

  const rows = Array.from({ length: 28 }, (_, i) => ({
    id: i + 1,
    assetTag: `AST-${String(i + 1).padStart(4, '0')}`,
    name: `${categories[i % categories.length]} Unit ${i + 1}`,
    category: categories[i % categories.length],
    status: statuses[i % statuses.length],
    condition: conditions[i % conditions.length],
    location: locations[i % locations.length],
    purchaseDate: randomDate(new Date(2021, 0, 1), new Date(2025, 11, 31)),
    purchaseCost: (Math.random() * 90000 + 10000).toFixed(2),
  }));

  const byStatus   = {};
  const byCategory = {};
  const byLocation = {};
  const byCondition= {};
  rows.forEach(r => {
    byStatus[r.status]     = (byStatus[r.status]     || 0) + 1;
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    byLocation[r.location] = (byLocation[r.location] || 0) + 1;
    byCondition[r.condition]=(byCondition[r.condition]|| 0) + 1;
  });

  const totalValue = rows.reduce((s, r) => s + parseFloat(r.purchaseCost), 0).toFixed(2);

  return {
    reportType: 'ASSET_SUMMARY', generatedOn: new Date().toISOString().slice(0, 10),
    totalAssets: rows.length, totalAssetValue: totalValue,
    assetsByStatus: byStatus, assetsByCategory: byCategory,
    assetsByLocation: byLocation, assetsByCondition: byCondition,
    assetRows: rows,
  };
}

function mockAllocationReport() {
  const employees = ['Riya Sharma','Vikram Nair','Priya Menon','Arun Kumar','Divya Iyer','Sneha Pillai'];
  const tags = Array.from({ length: 18 }, (_, i) => `AST-${String(i + 1).padStart(4, '0')}`);
  const statuses = ['ACTIVE','RETURNED','ACTIVE','RETURNED','ACTIVE'];

  const rows = tags.map((tag, i) => {
    const alloc = randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30));
    const expected = randomDate(new Date(2025, 0, 1), new Date(2025, 11, 31));
    const status = statuses[i % statuses.length];
    const isOverdue = status === 'ACTIVE' && expected < new Date().toISOString().slice(0, 10);
    return {
      id: i + 1, assetTag: tag, assetName: `Asset ${tag}`,
      employeeId: i + 10, employeeName: employees[i % employees.length],
      allocatedBy: 'sooraj', allocationDate: alloc, expectedReturnDate: expected,
      actualReturnDate: status === 'RETURNED' ? randomDate(new Date(2025, 0, 1), new Date()) : null,
      status, overdue: isOverdue,
    };
  });

  const active   = rows.filter(r => r.status === 'ACTIVE').length;
  const returned = rows.filter(r => r.status === 'RETURNED').length;
  const overdue  = rows.filter(r => r.overdue).length;

  return {
    reportType: 'ALLOCATION', generatedOn: new Date().toISOString().slice(0, 10),
    totalAllocations: rows.length, activeAllocations: active,
    returnedAllocations: returned, overdueAllocations: overdue,
    allocationRows: rows,
  };
}

function mockAuditReport() {
  const cycles = [
    { id: 1, name: 'Q1 2026 Physical Audit', status: 'COMPLETED', auditorName: 'joseph', startDate: '2026-01-05', endDate: '2026-01-15', completedDate: '2026-01-14', totalAssets: 25, verified: 24, missing: 0, damaged: 1, pending: 0 },
    { id: 2, name: 'Q2 2026 Verification',   status: 'COMPLETED', auditorName: 'joseph', startDate: '2026-04-03', endDate: '2026-04-10', completedDate: '2026-04-09', totalAssets: 28, verified: 26, missing: 1, damaged: 1, pending: 0 },
    { id: 3, name: 'Q3 2026 Physical Audit', status: 'ACTIVE',    auditorName: 'joseph', startDate: '2026-07-01', endDate: '2026-07-20', completedDate: null,         totalAssets: 28, verified: 14, missing: 1, damaged: 2, pending: 11 },
  ].map(c => ({ ...c, verificationRate: +(c.totalAssets > 0 ? (c.verified * 100 / c.totalAssets).toFixed(1) : 0) }));

  const completed = cycles.filter(c => c.status === 'COMPLETED').length;
  const active    = cycles.filter(c => c.status === 'ACTIVE').length;
  const avgRate   = +(cycles.reduce((s, c) => s + c.verificationRate, 0) / cycles.length).toFixed(1);

  return {
    reportType: 'AUDIT_SUMMARY', generatedOn: new Date().toISOString().slice(0, 10),
    totalAuditCycles: cycles.length, completedAuditCycles: completed,
    activeAuditCycles: active, averageVerificationRate: avgRate,
    auditRows: cycles,
  };
}

function mockMaintenanceReport() {
  const rows = [
    { actionType: 'MAINTENANCE_OPENED', assetTag: 'AST-0008', assetName: 'HP ProBook 450', performedBy: 'anna',   details: 'Screen flickering, sent to repair.',        actionDate: '2026-06-12T10:30:00' },
    { actionType: 'MAINTENANCE_CLOSED', assetTag: 'AST-0008', assetName: 'HP ProBook 450', performedBy: 'anna',   details: 'Screen replaced. Unit returned to service.',  actionDate: '2026-06-18T14:00:00' },
    { actionType: 'AUDIT_DAMAGED',      assetTag: 'AST-0005', assetName: 'Canon Printer',  performedBy: 'joseph', details: 'Asset found damaged during Q2 audit.',        actionDate: '2026-04-08T09:15:00' },
    { actionType: 'MAINTENANCE_OPENED', assetTag: 'AST-0019', assetName: 'Dell Monitor',   performedBy: 'anna',   details: 'Power supply failure.',                       actionDate: '2026-05-20T11:00:00' },
    { actionType: 'MAINTENANCE_CLOSED', assetTag: 'AST-0019', assetName: 'Dell Monitor',   performedBy: 'anna',   details: 'Power supply replaced. Fully functional.',    actionDate: '2026-05-27T16:30:00' },
    { actionType: 'AUDIT_DAMAGED',      assetTag: 'AST-0022', assetName: 'Lenovo ThinkPad',performedBy: 'joseph', details: 'Battery swollen, flagged during Q3 audit.',   actionDate: '2026-07-05T10:00:00' },
  ];
  return {
    reportType: 'MAINTENANCE', generatedOn: new Date().toISOString().slice(0, 10),
    totalMaintenanceTickets: rows.length,
    openTickets:  rows.filter(r => r.actionType.endsWith('OPENED') || r.actionType === 'AUDIT_DAMAGED').length,
    closedTickets: rows.filter(r => r.actionType.endsWith('CLOSED')).length,
    maintenanceRows: rows,
  };
}

// ── API ───────────────────────────────────────────────────────────────────────

export const reportService = {
  async getAssetReport()       { try { return (await api.get('/reports/assets')).data;       } catch (_) { return mockAssetReport();       } },
  async getAllocationReport()  { try { return (await api.get('/reports/allocations')).data;  } catch (_) { return mockAllocationReport();  } },
  async getAuditReport()      { try { return (await api.get('/reports/audits')).data;        } catch (_) { return mockAuditReport();       } },
  async getMaintenanceReport(){ try { return (await api.get('/reports/maintenance')).data;   } catch (_) { return mockMaintenanceReport(); } },
};
