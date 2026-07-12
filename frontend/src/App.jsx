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

// Anna's Bookings, Maintenance, & Notifications pages
import BookingCalendar from './pages/booking/BookingCalendar';
import BookingForm from './pages/booking/BookingForm';
import BookingHistory from './pages/booking/BookingHistory';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import MaintenanceRequest from './pages/maintenance/MaintenanceRequest';
import MaintenanceDetails from './pages/maintenance/MaintenanceDetails';
import NotificationCenter from './pages/notifications/NotificationCenter';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  // Navigation state (shared with asset module)
  const [currentPage, setCurrentPage] = useState('directory');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [editAssetId, setEditAssetId] = useState(null);

  // Anna's module state
  const [editBookingId, setEditBookingId] = useState(null);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);

  // Organization setup sub-views
  const [deptView, setDeptView] = useState({ mode: 'list', item: null }); // mode: list | form
  const [empView, setEmpView]   = useState({ mode: 'list', item: null });
  const [catView, setCatView]   = useState({ mode: 'list', item: null });

  // Handle login/signup success
  const handleLogin = (data) => setCurrentUser(data);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentPage('directory');
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

      // ── Anna: Resource Booking ─────────────────────────────────────────────
      case 'bookings':
        return (
          <BookingHistory
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
            onNew={() => {
              setEditBookingId(null);
              setCurrentPage('booking-form');
            }}
            onEdit={(id) => {
              setEditBookingId(id);
              setCurrentPage('booking-form');
            }}
          />
        );
      case 'booking-calendar':
        return (
          <BookingCalendar
            setCurrentPage={setCurrentPage}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'booking-form':
        return (
          <BookingForm
            bookingId={editBookingId}
            onSave={() => setCurrentPage('bookings')}
            onCancel={() => setCurrentPage('bookings')}
          />
        );

      // ── Anna: Maintenance ──────────────────────────────────────────────────
      case 'maintenance':
        return (
          <MaintenanceList
            setCurrentPage={setCurrentPage}
            onNew={() => setCurrentPage('maintenance-form')}
            onSelect={(id) => {
              setSelectedMaintenanceId(id);
              setCurrentPage('maintenance-details');
            }}
          />
        );
      case 'maintenance-details':
        return (
          <MaintenanceDetails
            recordId={selectedMaintenanceId}
            currentUser={currentUser}
            onSave={() => setCurrentPage('maintenance')}
            onCancel={() => setCurrentPage('maintenance')}
          />
        );
      case 'maintenance-form':
        return (
          <MaintenanceRequest
            onSave={() => setCurrentPage('maintenance')}
            onCancel={() => setCurrentPage('maintenance')}
          />
        );

      // ── Anna: Notifications ────────────────────────────────────────────────
      case 'notifications':
        return <NotificationCenter currentUser={currentUser} />;

      default:
        return (
          <AssetDirectory
            setCurrentPage={setCurrentPage}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
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
