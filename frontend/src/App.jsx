import React, { useState } from 'react';
import { authService } from './services/authService';
import Layout from './components/Layout';

// Aparna's Auth & Setup pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import DepartmentList from './pages/departments/DepartmentList';
import DepartmentForm from './pages/departments/DepartmentForm';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';

// Sooraj's Asset Management pages
import AssetDirectory from './pages/AssetDirectory';
import AssetRegistration from './pages/AssetRegistration';
import AssetDetails from './pages/AssetDetails';
import AllocateAsset from './pages/AllocateAsset';
import TransferAsset from './pages/TransferAsset';
import ReturnAsset from './pages/ReturnAsset';
import AssetHistory from './pages/AssetHistory';

// Joseph's Dashboard page
import Dashboard from './pages/dashboard/Dashboard';
import Bookings from './pages/Bookings';
import MaintenanceBoard from './pages/MaintenanceBoard';

// Joseph's Audit pages
import AuditList from './pages/audit/AuditList';
import AuditDetails from './pages/audit/AuditDetails';
import CreateAudit from './pages/audit/CreateAudit';

// Joseph's Activity Logs page
import ActivityLogs from './pages/activitylogs/ActivityLogs';

// Joseph's Reports page
import Reports from './pages/reports/Reports';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  // Navigation state (shared with asset module)
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [editAssetId, setEditAssetId] = useState(null);

  // Organization setup sub-views
  const [deptView, setDeptView] = useState({ mode: 'list', item: null }); // mode: list | form
  const [empView, setEmpView]   = useState({ mode: 'list', item: null });
  const [catView, setCatView]   = useState({ mode: 'list', item: null });

  // Audit sub-views
  const [auditView, setAuditView] = useState({ mode: 'list', id: null }); // mode: list | details | create


  // Handle login/signup success
  const handleLogin = (data) => setCurrentUser(data);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  // Show login or signup if not authenticated
  if (!currentUser) {
    if (authView === 'signup') {
      return (
        <Signup
          onLogin={handleLogin}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  }

  // Render content for current page (including Aparna's setup pages)
  const renderPage = () => {
    switch (currentPage) {
      // ── Aparna: Organization Setup ────────────────────────────────────────
      case 'departments':
        if (deptView.mode === 'form') {
          return (
            <DepartmentForm
              department={deptView.item}
              onSave={() => setDeptView({ mode: 'list', item: null })}
              onCancel={() => setDeptView({ mode: 'list', item: null })}
            />
          );
        }
        return (
          <DepartmentList
            onEdit={item => setDeptView({ mode: 'form', item })}
            onNew={() => setDeptView({ mode: 'form', item: null })}
          />
        );

      case 'employees':
        if (empView.mode === 'form') {
          return (
            <EmployeeForm
              employee={empView.item}
              onSave={() => setEmpView({ mode: 'list', item: null })}
              onCancel={() => setEmpView({ mode: 'list', item: null })}
            />
          );
        }
        return (
          <EmployeeList
            onEdit={item => setEmpView({ mode: 'form', item })}
            onNew={() => setEmpView({ mode: 'form', item: null })}
          />
        );

      case 'categories':
        if (catView.mode === 'form') {
          return (
            <CategoryForm
              category={catView.item}
              onSave={() => setCatView({ mode: 'list', item: null })}
              onCancel={() => setCatView({ mode: 'list', item: null })}
            />
          );
        }
        return (
          <CategoryList
            onEdit={item => setCatView({ mode: 'form', item })}
            onNew={() => setCatView({ mode: 'form', item: null })}
          />
        );

      // ── Joseph: Dashboard, Reports & Activity Logs ────────────────────────
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      
      case 'bookings':
        return <Bookings />;
        
      case 'maintenance':
        return <MaintenanceBoard />;

      case 'activity-logs':
        return <ActivityLogs />;

      case 'reports':
        return <Reports />;

      case 'audits':
        if (auditView.mode === 'create') {
          return (
            <CreateAudit
              onSave={() => setAuditView({ mode: 'list', id: null })}
              onCancel={() => setAuditView({ mode: 'list', id: null })}
            />
          );
        }
        if (auditView.mode === 'details') {
          return (
            <AuditDetails
              auditId={auditView.id}
              onBack={() => setAuditView({ mode: 'list', id: null })}
            />
          );
        }
        return (
          <AuditList
            onSelectAudit={id => setAuditView({ mode: 'details', id })}
            onNewAudit={() => setAuditView({ mode: 'create', id: null })}
          />
        );

      // ── Sooraj: Asset Management ──────────────────────────────────────────
      case 'directory':
        return (
          <AssetDirectory
            setCurrentPage={setCurrentPage}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'register':
        return (
          <AssetRegistration
            editAssetId={editAssetId}
            setEditAssetId={setEditAssetId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'details':
        return (
          <AssetDetails
            assetId={selectedAssetId}
            setCurrentPage={setCurrentPage}
            setEditAssetId={setEditAssetId}
          />
        );
      case 'allocate':
        return <AllocateAsset setCurrentPage={setCurrentPage} />;
      case 'transfer':
        return <TransferAsset />;
      case 'return':
        return <ReturnAsset />;
      case 'history':
        return <AssetHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}
