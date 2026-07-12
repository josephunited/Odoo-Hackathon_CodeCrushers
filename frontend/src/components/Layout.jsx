import React from 'react';
import { Package, PlusCircle, UserCheck, ArrowLeftRight, History, Monitor, ChevronRight, UserMinus, UserPlus, Building2, Users, Tag, LogOut, ClipboardCheck } from 'lucide-react';

export default function Layout({ children, currentPage, setCurrentPage, currentUser, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'directory', label: 'Asset Directory', icon: Package },
    { id: 'register', label: 'Register Asset', icon: PlusCircle },
    { id: 'allocate', label: 'Allocate Asset', icon: UserPlus },
    { id: 'transfer', label: 'Transfer Asset', icon: ArrowLeftRight },
    { id: 'return', label: 'Return Asset', icon: UserMinus },
    { id: 'history', label: 'Asset History', icon: History },
    { id: 'audits', label: 'Asset Audits', icon: ClipboardCheck },
    { id: '__sep__', label: '──── Setup ────', icon: null },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'categories', label: 'Categories', icon: Tag },
  ];

  const user = currentUser || { username: 'User' };
  const initials = (user.username || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-gray-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-cardborder flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-none">AssetFlow</h1>
              <span className="text-[10px] uppercase tracking-widest text-primary-400 font-bold">Enterprise</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map(item => {
              if (item.id === '__sep__') {
                return (
                  <div key="sep" style={{ padding: '8px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', fontWeight: 600, marginTop: '8px' }}>
                    {item.label}
                  </div>
                );
              }
              const Icon = item.icon;
              const isActive = currentPage === item.id || (item.id === 'directory' && currentPage === 'details');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600/25 to-indigo-600/5 text-white border border-primary-500/30 shadow-inner'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-white'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-white/5 bg-gray-950/20">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-primary-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/10 text-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-gray-400 truncate">AssetFlow User</p>
            </div>
            {onLogout && (
              <button onClick={onLogout} title="Logout"
                className="text-gray-500 hover:text-red-400 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-8 z-10 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium md:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm ml-1">AssetFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span>Enterprise Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-400 font-semibold uppercase tracking-wider">Asset Management</span>
          </div>

          {/* Quick Stats Summary in Header */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Service Connected
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
