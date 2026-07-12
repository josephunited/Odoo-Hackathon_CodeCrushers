// API Service with Auto-Fallback to LocalStorage Mock Data

const API_BASE = 'http://localhost:8080';

// Mock DB Initializer
const initMockDB = () => {
  if (!localStorage.getItem('af_assets')) {
    const defaultAssets = [
      {
        id: 1,
        assetTag: 'AF-0001',
        name: 'MacBook Pro 16" (M3 Max)',
        category: 'Laptops',
        serialNumber: 'C02F2345ABCD',
        purchaseDate: '2025-11-15',
        purchaseCost: 3499.00,
        assetCondition: 'NEW',
        location: 'HQ - Floor 3 (Engineering)',
        sharedBookable: false,
        status: 'ALLOCATED',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 2,
        assetTag: 'AF-0002',
        name: 'Dell UltraSharp 32" 4K Monitor',
        category: 'Monitors',
        serialNumber: 'CN0987654321',
        purchaseDate: '2025-12-01',
        purchaseCost: 899.50,
        assetCondition: 'GOOD',
        location: 'HQ - Floor 2 (Marketing)',
        sharedBookable: true,
        status: 'AVAILABLE',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 3,
        assetTag: 'AF-0003',
        name: 'iPad Pro 11" 256GB',
        category: 'Tablets',
        serialNumber: 'DLX76543YHN9',
        purchaseDate: '2026-02-10',
        purchaseCost: 999.00,
        assetCondition: 'GOOD',
        location: 'HQ - Floor 3 (Product)',
        sharedBookable: true,
        status: 'UNDER_MAINTENANCE',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 4,
        assetTag: 'AF-0004',
        name: 'Herman Miller Aeron Chair',
        category: 'Office Furniture',
        serialNumber: 'HM-AERON-8829',
        purchaseDate: '2025-06-20',
        purchaseCost: 1450.00,
        assetCondition: 'GOOD',
        location: 'HQ - Floor 1 (HR)',
        sharedBookable: false,
        status: 'RESERVED',
        imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80'
      }
    ];

    const defaultAllocations = [
      {
        id: 1,
        asset: defaultAssets[0],
        employeeId: 101,
        employeeName: 'Sooraj S',
        allocatedBy: 'System Admin',
        allocationDate: '2025-11-20',
        expectedReturnDate: '2026-11-20',
        actualReturnDate: null,
        returnConditionNotes: null,
        status: 'ACTIVE'
      }
    ];

    const defaultTransfers = [
      {
        id: 1,
        asset: defaultAssets[0],
        fromEmployeeId: 101,
        fromEmployeeName: 'Sooraj S',
        toEmployeeId: 102,
        toEmployeeName: 'Jane Doe',
        requestedBy: 'Sooraj S',
        requestDate: '2026-07-10',
        status: 'PENDING',
        remarks: 'Project requirements changed, Jane needs this setup immediately.'
      }
    ];

    const defaultHistory = [
      {
        id: 1,
        assetId: 1,
        actionType: 'REGISTRATION',
        actionDate: '2025-11-15T10:00:00',
        performedBy: 'System Admin',
        details: 'Asset registered in system with tag: AF-0001, initial condition: NEW'
      },
      {
        id: 2,
        assetId: 1,
        actionType: 'ALLOCATION',
        actionDate: '2025-11-20T14:30:00',
        performedBy: 'System Admin',
        details: 'Allocated to Sooraj S (ID: 101). Expected return date: 2026-11-20'
      },
      {
        id: 3,
        assetId: 2,
        actionType: 'REGISTRATION',
        actionDate: '2025-12-01T11:15:00',
        performedBy: 'System Admin',
        details: 'Asset registered in system with tag: AF-0002, initial condition: GOOD'
      },
      {
        id: 4,
        assetId: 3,
        actionType: 'REGISTRATION',
        actionDate: '2026-02-10T09:00:00',
        performedBy: 'System Admin',
        details: 'Asset registered in system with tag: AF-0003, initial condition: GOOD'
      },
      {
        id: 5,
        assetId: 3,
        actionType: 'STATUS_CHANGE',
        actionDate: '2026-06-01T15:00:00',
        performedBy: 'IT Service Dept',
        details: 'Status changed from AVAILABLE to UNDER_MAINTENANCE'
      },
      {
        id: 6,
        assetId: 4,
        actionType: 'REGISTRATION',
        actionDate: '2025-06-20T10:00:00',
        performedBy: 'System Admin',
        details: 'Asset registered in system with tag: AF-0004, initial condition: GOOD'
      }
    ];

    const defaultEmployees = [
      { id: 101, name: 'Sooraj S', email: 'sooraj.s@assetflow.com', department: 'IT Support' },
      { id: 102, name: 'Jane Doe', email: 'jane.doe@assetflow.com', department: 'Engineering' },
      { id: 103, name: 'John Smith', email: 'john.smith@assetflow.com', department: 'HR' },
      { id: 104, name: 'Alice Johnson', email: 'alice.j@assetflow.com', department: 'Marketing' }
    ];

    const defaultCategories = ['Laptops', 'Monitors', 'Tablets', 'Office Furniture', 'Phones', 'Accessories'];
    const defaultDepartments = ['IT Support', 'Engineering', 'HR', 'Marketing', 'Finance', 'Product'];

    localStorage.setItem('af_assets', JSON.stringify(defaultAssets));
    localStorage.setItem('af_allocations', JSON.stringify(defaultAllocations));
    localStorage.setItem('af_transfers', JSON.stringify(defaultTransfers));
    localStorage.setItem('af_history', JSON.stringify(defaultHistory));
    localStorage.setItem('af_employees', JSON.stringify(defaultEmployees));
    localStorage.setItem('af_categories', JSON.stringify(defaultCategories));
    localStorage.setItem('af_departments', JSON.stringify(defaultDepartments));
  }
};

initMockDB();

// Simulated delay helper
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// Fallback Mock Implementations
const mock = {
  getAssets: async (filters = {}) => {
    await delay();
    let assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const allocations = JSON.parse(localStorage.getItem('af_allocations') || '[]');

    if (filters.tag) {
      assets = assets.filter(a => a.assetTag.toLowerCase().includes(filters.tag.toLowerCase()));
    }
    if (filters.serial) {
      assets = assets.filter(a => a.serialNumber.toLowerCase().includes(filters.serial.toLowerCase()));
    }
    if (filters.category) {
      assets = assets.filter(a => a.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.status) {
      assets = assets.filter(a => a.status === filters.status);
    }
    if (filters.location) {
      assets = assets.filter(a => a.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.department) {
      // Find asset IDs allocated to employees in this department
      const activeAllocations = allocations.filter(al => 
        al.status === 'ACTIVE' && 
        al.employeeName && 
        al.employeeName.toLowerCase().includes(filters.department.toLowerCase()) // simpler mock match
      );
      const assetIds = activeAllocations.map(al => al.asset.id);
      assets = assets.filter(a => assetIds.includes(a.id));
    }
    return assets;
  },

  getAssetById: async (id) => {
    await delay();
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const asset = assets.find(a => a.id === parseInt(id));
    if (!asset) throw new Error('Asset not found');
    return asset;
  },

  createAsset: async (assetData) => {
    await delay();
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    
    // Check serial uniqueness
    if (assets.some(a => a.serialNumber.toLowerCase() === assetData.serialNumber.toLowerCase())) {
      throw new Error(`Asset with serial number ${assetData.serialNumber} already exists.`);
    }

    // Auto-generate tag
    const nextId = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
    const assetTag = `AF-${String(nextId).padStart(4, '0')}`;

    const newAsset = {
      ...assetData,
      id: nextId,
      assetTag,
      status: 'AVAILABLE'
    };

    assets.push(newAsset);
    localStorage.setItem('af_assets', JSON.stringify(assets));

    // Log history
    const history = JSON.parse(localStorage.getItem('af_history') || '[]');
    history.push({
      id: history.length + 1,
      assetId: newAsset.id,
      actionType: 'REGISTRATION',
      actionDate: new Date().toISOString(),
      performedBy: 'Admin',
      details: `Asset registered in system with tag: ${assetTag}, initial condition: ${newAsset.assetCondition}`
    });
    localStorage.setItem('af_history', JSON.stringify(history));

    return newAsset;
  },

  updateAsset: async (id, assetData) => {
    await delay();
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const index = assets.findIndex(a => a.id === parseInt(id));
    if (index === -1) throw new Error('Asset not found');

    // Serial uniqueness check if changed
    const serialUsed = assets.some((a, idx) => 
      idx !== index && a.serialNumber.toLowerCase() === assetData.serialNumber.toLowerCase()
    );
    if (serialUsed) {
      throw new Error(`Serial number ${assetData.serialNumber} is already in use.`);
    }

    const oldAsset = assets[index];
    const updatedAsset = {
      ...oldAsset,
      ...assetData,
      id: parseInt(id) // ensure id stays int
    };

    // Construct history log
    let details = 'Asset updated: ';
    if (oldAsset.name !== updatedAsset.name) details += `Name [${oldAsset.name} -> ${updatedAsset.name}]. `;
    if (oldAsset.status !== updatedAsset.status) details += `Status [${oldAsset.status} -> ${updatedAsset.status}]. `;
    if (oldAsset.assetCondition !== updatedAsset.assetCondition) details += `Condition [${oldAsset.assetCondition} -> ${updatedAsset.assetCondition}]. `;
    if (oldAsset.location !== updatedAsset.location) details += `Location [${oldAsset.location} -> ${updatedAsset.location}]. `;

    assets[index] = updatedAsset;
    localStorage.setItem('af_assets', JSON.stringify(assets));

    // Log history
    const history = JSON.parse(localStorage.getItem('af_history') || '[]');
    history.push({
      id: history.length + 1,
      assetId: updatedAsset.id,
      actionType: 'UPDATE',
      actionDate: new Date().toISOString(),
      performedBy: 'Admin',
      details: details || 'Profile detail updates.'
    });
    localStorage.setItem('af_history', JSON.stringify(history));

    return updatedAsset;
  },

  deleteAsset: async (id) => {
    await delay();
    let assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    assets = assets.filter(a => a.id !== parseInt(id));
    localStorage.setItem('af_assets', JSON.stringify(assets));

    // Optional: remove related allocations & history
    let allocations = JSON.parse(localStorage.getItem('af_allocations') || '[]');
    allocations = allocations.filter(a => a.asset.id !== parseInt(id));
    localStorage.setItem('af_allocations', JSON.stringify(allocations));
  },

  allocateAsset: async (allocationData) => {
    await delay();
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const assetIndex = assets.findIndex(a => a.id === parseInt(allocationData.assetId));
    if (assetIndex === -1) throw new Error('Asset not found');

    const asset = assets[assetIndex];

    // Prevent duplicate allocation
    if (asset.status === 'ALLOCATED') {
      throw new Error('Asset already allocated.');
    }

    // Update asset
    asset.status = 'ALLOCATED';
    assets[assetIndex] = asset;
    localStorage.setItem('af_assets', JSON.stringify(assets));

    // Create allocation record
    const allocations = JSON.parse(localStorage.getItem('af_allocations') || '[]');
    const employees = JSON.parse(localStorage.getItem('af_employees') || '[]');
    const employee = employees.find(e => e.id === parseInt(allocationData.employeeId)) || { name: 'Employee #' + allocationData.employeeId };

    const newAllocation = {
      id: allocations.length + 1,
      asset,
      employeeId: parseInt(allocationData.employeeId),
      employeeName: employee.name,
      allocatedBy: allocationData.allocatedBy || 'Admin',
      allocationDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: allocationData.expectedReturnDate || null,
      actualReturnDate: null,
      returnConditionNotes: null,
      status: 'ACTIVE'
    };

    allocations.push(newAllocation);
    localStorage.setItem('af_allocations', JSON.stringify(allocations));

    // Log history
    const history = JSON.parse(localStorage.getItem('af_history') || '[]');
    history.push({
      id: history.length + 1,
      assetId: asset.id,
      actionType: 'ALLOCATION',
      actionDate: new Date().toISOString(),
      performedBy: newAllocation.allocatedBy,
      details: `Allocated to ${newAllocation.employeeName} (ID: ${newAllocation.employeeId}). Expected return date: ${newAllocation.expectedReturnDate || 'N/A'}`
    });
    localStorage.setItem('af_history', JSON.stringify(history));

    return newAllocation;
  },

  returnAsset: async (returnData) => {
    await delay();
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const assetIndex = assets.findIndex(a => a.id === parseInt(returnData.assetId));
    if (assetIndex === -1) throw new Error('Asset not found');

    const asset = assets[assetIndex];

    const allocations = JSON.parse(localStorage.getItem('af_allocations') || '[]');
    const allocIndex = allocations.findIndex(al => al.asset.id === asset.id && al.status === 'ACTIVE');
    if (allocIndex === -1) throw new Error('Asset is not currently active in any allocation.');

    const allocation = allocations[allocIndex];

    // Close allocation
    allocation.status = 'RETURNED';
    allocation.actualReturnDate = new Date().toISOString().split('T')[0];
    allocation.returnConditionNotes = returnData.returnConditionNotes || '';
    allocations[allocIndex] = allocation;
    localStorage.setItem('af_allocations', JSON.stringify(allocations));

    // Reset Asset
    asset.status = 'AVAILABLE';
    if (returnData.actualCondition) {
      asset.assetCondition = returnData.actualCondition;
    }
    assets[assetIndex] = asset;
    localStorage.setItem('af_assets', JSON.stringify(assets));

    // Log history
    const history = JSON.parse(localStorage.getItem('af_history') || '[]');
    history.push({
      id: history.length + 1,
      assetId: asset.id,
      actionType: 'RETURN',
      actionDate: new Date().toISOString(),
      performedBy: returnData.performedBy || 'Admin',
      details: `Returned by ${allocation.employeeName}. Notes: ${returnData.returnConditionNotes || 'None'}. Condition on return: ${asset.assetCondition}`
    });
    localStorage.setItem('af_history', JSON.stringify(history));

    return allocation;
  },

  requestTransfer: async (transferData) => {
    await delay();
    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const asset = assets.find(a => a.id === parseInt(transferData.assetId));
    if (!asset) throw new Error('Asset not found');

    const allocations = JSON.parse(localStorage.getItem('af_allocations') || '[]');
    const activeAlloc = allocations.find(al => al.asset.id === asset.id && al.status === 'ACTIVE');
    if (!activeAlloc) throw new Error('Asset is not currently allocated. Cannot request transfer.');

    const transfers = JSON.parse(localStorage.getItem('af_transfers') || '[]');
    const employees = JSON.parse(localStorage.getItem('af_employees') || '[]');
    const targetEmp = employees.find(e => e.id === parseInt(transferData.toEmployeeId)) || { name: 'Employee #' + transferData.toEmployeeId };

    const newTransfer = {
      id: transfers.length + 1,
      asset,
      fromEmployeeId: activeAlloc.employeeId,
      fromEmployeeName: activeAlloc.employeeName,
      toEmployeeId: parseInt(transferData.toEmployeeId),
      toEmployeeName: targetEmp.name,
      requestedBy: transferData.requestedBy || activeAlloc.employeeName,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      remarks: transferData.remarks || ''
    };

    transfers.push(newTransfer);
    localStorage.setItem('af_transfers', JSON.stringify(transfers));

    // Log history
    const history = JSON.parse(localStorage.getItem('af_history') || '[]');
    history.push({
      id: history.length + 1,
      assetId: asset.id,
      actionType: 'TRANSFER_REQUEST',
      actionDate: new Date().toISOString(),
      performedBy: newTransfer.requestedBy,
      details: `Transfer requested from ${newTransfer.fromEmployeeName} to ${newTransfer.toEmployeeName}. Remarks: ${newTransfer.remarks}`
    });
    localStorage.setItem('af_history', JSON.stringify(history));

    return newTransfer;
  },

  processTransfer: async (transferId, approved, remarks, processedBy) => {
    await delay();
    const transfers = JSON.parse(localStorage.getItem('af_transfers') || '[]');
    const transferIndex = transfers.findIndex(t => t.id === parseInt(transferId));
    if (transferIndex === -1) throw new Error('Transfer request not found');

    const transfer = transfers[transferIndex];
    if (transfer.status !== 'PENDING') throw new Error('Transfer already processed');

    const assets = JSON.parse(localStorage.getItem('af_assets') || '[]');
    const assetIndex = assets.findIndex(a => a.id === transfer.asset.id);
    const asset = assets[assetIndex];

    const allocations = JSON.parse(localStorage.getItem('af_allocations') || '[]');
    const history = JSON.parse(localStorage.getItem('af_history') || '[]');

    if (approved) {
      transfer.status = 'APPROVED';

      // 1. Close current active allocation
      const currentAllocIndex = allocations.findIndex(al => al.asset.id === asset.id && al.status === 'ACTIVE');
      if (currentAllocIndex !== -1) {
        allocations[currentAllocIndex].status = 'RETURNED';
        allocations[currentAllocIndex].actualReturnDate = new Date().toISOString().split('T')[0];
        allocations[currentAllocIndex].returnConditionNotes = `Transferred to ${transfer.toEmployeeName}`;
      }

      // 2. Open new allocation
      const newAllocation = {
        id: allocations.length + 1,
        asset,
        employeeId: transfer.toEmployeeId,
        employeeName: transfer.toEmployeeName,
        allocatedBy: processedBy || 'Admin',
        allocationDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: null,
        actualReturnDate: null,
        returnConditionNotes: null,
        status: 'ACTIVE'
      };
      allocations.push(newAllocation);
      localStorage.setItem('af_allocations', JSON.stringify(allocations));

      // 3. Log history
      history.push({
        id: history.length + 1,
        assetId: asset.id,
        actionType: 'TRANSFER_APPROVED',
        actionDate: new Date().toISOString(),
        performedBy: processedBy || 'Admin',
        details: `Transfer Approved: Transferred from ${transfer.fromEmployeeName} to ${transfer.toEmployeeName}`
      });

    } else {
      transfer.status = 'REJECTED';
      transfer.remarks = remarks;

      // Log history
      history.push({
        id: history.length + 1,
        assetId: asset.id,
        actionType: 'TRANSFER_REJECTED',
        actionDate: new Date().toISOString(),
        performedBy: processedBy || 'Admin',
        details: `Transfer Rejected. Reason: ${remarks || 'No reason provided'}`
      });
    }

    transfers[transferIndex] = transfer;
    localStorage.setItem('af_transfers', JSON.stringify(transfers));
    localStorage.setItem('af_history', JSON.stringify(history));

    return transfer;
  },

  getHistoryForAsset: async (assetId) => {
    await delay();
    const history = JSON.parse(localStorage.getItem('af_history') || '[]');
    return history.filter(h => h.assetId === parseInt(assetId)).sort((a,b) => b.id - a.id);
  },

  getEmployees: async () => {
    await delay();
    return JSON.parse(localStorage.getItem('af_employees') || '[]');
  },

  getCategories: async () => {
    await delay();
    return JSON.parse(localStorage.getItem('af_categories') || '[]');
  },

  getDepartments: async () => {
    await delay();
    return JSON.parse(localStorage.getItem('af_departments') || '[]');
  }
};

// API Service Gateway Class
export const api = {
  // Helper to execute with fallback
  async exec(endpoint, method = 'GET', body = null, params = null) {
    try {
      // Build URL with params if any
      let url = `${API_BASE}${endpoint}`;
      if (params) {
        const urlParams = new URLSearchParams();
        Object.keys(params).forEach(k => {
          if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
            urlParams.append(k, params[k]);
          }
        });
        if (urlParams.toString()) url += `?${urlParams.toString()}`;
      }

      const token = localStorage.getItem('af_token');
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server responded with ${response.status}`);
      }

      if (response.status === 204) return null;
      return await response.json();

    } catch (e) {
      console.warn(`[AssetFlow API] Request to ${endpoint} failed. Falling back to local storage mock data. Error:`, e.message);
      
      // Routing to LocalStorage mock handlers
      if (endpoint === '/assets') {
        if (method === 'POST') return await mock.createAsset(body);
        return await mock.getAssets(params);
      }
      
      const assetMatch = endpoint.match(/^\/assets\/(\d+)$/);
      if (assetMatch) {
        const id = assetMatch[1];
        if (method === 'PUT') return await mock.updateAsset(id, body);
        if (method === 'DELETE') { await mock.deleteAsset(id); return null; }
        return await mock.getAssetById(id);
      }

      if (endpoint === '/assets/allocate' && method === 'POST') {
        return await mock.allocateAsset(body);
      }

      if (endpoint === '/assets/return' && method === 'POST') {
        return await mock.returnAsset(body);
      }

      if (endpoint === '/assets/transfer') {
        return await mock.requestTransfer(body);
      }

      if (endpoint === '/assets/transfer/process') {
        return await mock.processTransfer(body.transferId, body.approved, body.remarks, body.processedBy);
      }

      const historyMatch = endpoint.match(/^\/assets\/(\d+)\/history$/);
      if (historyMatch) {
        return await mock.getHistoryForAsset(historyMatch[1]);
      }

      // External mocked APIs (Employees, Departments, Categories)
      if (endpoint === '/employees') return await mock.getEmployees();
      if (endpoint === '/categories') return await mock.getCategories();
      if (endpoint === '/departments') return await mock.getDepartments();

      throw e;
    }
  },

  // Asset API Mapping
  assets: {
    list: (filters) => api.exec('/assets', 'GET', null, filters),
    get: (id) => api.exec(`/assets/${id}`, 'GET'),
    create: (data) => api.exec('/assets', 'POST', data),
    update: (id, data) => api.exec(`/assets/${id}`, 'PUT', data),
    delete: (id) => api.exec(`/assets/${id}`, 'DELETE'),
    allocate: (data) => api.exec('/assets/allocate', 'POST', data),
    return: (data) => api.exec('/assets/return', 'POST', data),
    history: (id) => api.exec(`/assets/${id}/history`, 'GET'),
    
    // Transfer management
    requestTransfer: (data) => api.exec('/assets/transfer', 'POST', data),
    processTransfer: (transferId, approved, remarks, processedBy) => 
      api.exec('/assets/transfer/process', 'POST', { transferId, approved, remarks, processedBy }),
    listTransfers: (status) => api.exec('/assets/transfer', 'GET', null, status ? { status } : null)
  },

  // ── Generic HTTP convenience methods used by Joseph's services ──────────────
  // These wrap exec() so that activityLogService, reportService, auditService
  // can call api.get('/foo') / api.post('/foo', body) without knowing internals.
  get: (endpoint, options = {}) => api.exec(endpoint, 'GET', null, options?.params || null),
  post: (endpoint, body) => api.exec(endpoint, 'POST', body, null),
  put: (endpoint, body) => api.exec(endpoint, 'PUT', body, null),

  // Mock-assumed existing endpoints
  employees: {
    list: () => api.exec('/employees'),
  },
  categories: {
    list: () => api.exec('/categories'),
  },
  departments: {
    list: () => api.exec('/departments'),
  }
};
