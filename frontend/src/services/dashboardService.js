// Dashboard Service - API calls backed by real backend with localStorage fallback
const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('af_token') ? { 'Authorization': `Bearer ${localStorage.getItem('af_token')}` } : {})
});

// Mock Dashboard Summary generator
const generateMockSummary = () => {
  const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
  const transfers = JSON.parse(localStorage.getItem('af_transfers') || '[]');
  const employees = JSON.parse(localStorage.getItem('af_employees') || '[]');
  const departments = JSON.parse(localStorage.getItem('af_departments') || '[]');
  const categories = JSON.parse(localStorage.getItem('af_categories') || '[]');
  const history = JSON.parse(localStorage.getItem('af_history') || '[]');

  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'AVAILABLE').length;
  const allocatedAssets = assets.filter(a => a.status === 'ALLOCATED').length;
  const underMaintenanceAssets = assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;

  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  const totalCategories = categories.length;

  const pendingTransfers = transfers.filter(t => t.status === 'PENDING').length;
  const activeBookings = 0; // fallback default

  const totalAssetValue = assets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);

  // Group by status
  const assetsByStatus = {};
  assets.forEach(a => {
    assetsByStatus[a.status] = (assetsByStatus[a.status] || 0) + 1;
  });

  // Group by category
  const assetsByCategory = {};
  assets.forEach(a => {
    assetsByCategory[a.category] = (assetsByCategory[a.category] || 0) + 1;
  });

  // Map activity logs → recent activities DTO (prefer unified log, fall back to asset history)
  const activityLogs = JSON.parse(localStorage.getItem('af_activity_logs') || '[]');
  let recentActivities;
  if (activityLogs.length > 0) {
    recentActivities = [...activityLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(log => ({
        id: log.id,
        assetTag: log.entityName || log.module,
        assetName: log.description,
        actionType: log.actionType,
        performedBy: log.actorUsername || 'System',
        details: log.description,
        actionDate: log.timestamp
      }));
  } else {
    // Fallback to AssetHistory mock
    recentActivities = history
      .slice(-5)
      .reverse()
      .map(h => {
        const asset = assets.find(a => a.id === h.assetId) || {};
        return {
          id: h.id,
          assetTag: asset.assetTag || 'AF-XXXX',
          assetName: asset.name || 'Unknown Asset',
          actionType: h.actionType,
          performedBy: h.performedBy || 'System',
          details: h.details,
          actionDate: h.actionDate
        };
      });
  }

  return {
    totalAssets,
    availableAssets,
    allocatedAssets,
    underMaintenanceAssets,
    totalEmployees,
    totalDepartments,
    totalCategories,
    pendingTransfers,
    activeBookings,
    totalAssetValue,
    assetsByStatus,
    assetsByCategory,
    recentActivities
  };
};

export const dashboardService = {
  getSummary: async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Server error');
      return await res.json();
    } catch (e) {
      console.warn('[AssetFlow Dashboard Service] Falling back to mock data:', e.message);
      return generateMockSummary();
    }
  },
  getRecentActivities: async (limit = 10) => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/recent-activities?limit=${limit}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Server error');
      return await res.json();
    } catch (e) {
      console.warn('[AssetFlow Dashboard Service] Falling back to mock activities:', e.message);
      const summary = generateMockSummary();
      return summary.recentActivities.slice(0, limit);
    }
  }
};
