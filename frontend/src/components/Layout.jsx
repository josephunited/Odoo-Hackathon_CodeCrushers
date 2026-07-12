import React, { useState, useEffect } from 'react';
import { Package, PlusCircle, UserCheck, ArrowLeftRight, History, Monitor, ChevronRight, UserMinus, UserPlus, Building2, Users, Tag, LogOut, ClipboardCheck, Activity, FileText, Calendar, Wrench, Bell, Search } from 'lucide-react';
import { api } from '../services/api';

export default function Layout({ children, currentPage, setCurrentPage, currentUser, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'directory', label: 'Asset Directory', icon: Package },
    { id: 'register', label: 'Register Asset', icon: PlusCircle },
    { id: 'allocate', label: 'Allocate Asset', icon: UserPlus },
    { id: 'transfer', label: 'Transfer Asset', icon: ArrowLeftRight },
    { id: 'return', label: 'Return Asset', icon: UserMinus },
    { id: 'history', label: 'Asset History', icon: History },
    { id: 'maintenance',   label: 'Maintenance',    icon: Wrench },
    { id: 'bookings',      label: 'Bookings',       icon: Calendar },
    { id: 'audits',        label: 'Asset Audits',   icon: ClipboardCheck },
    { id: 'activity-logs', label: 'Activity Logs',  icon: Activity },
    { id: 'reports',       label: 'Reports',         icon: FileText },
    { id: '__sep__',       label: '──── Setup ────', icon: null },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'categories', label: 'Categories', icon: Tag },
  ];

  const user = currentUser || { username: 'User' };
  const initials = (user.username || 'U').slice(0, 2).toUpperCase();
  const empId = user.employeeId || 1; // Fallback for MVP

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [empId]);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getUnread(empId);
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  const markRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 1) {
      setIsSearching(true);
      try {
        const results = await api.search.query(q);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-gray-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-cardborder flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
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
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
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

          {/* Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search assets, employees, departments..." 
                className="w-full bg-gray-900/50 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
            </div>
            
            {searchQuery.length > 1 && (
              <div className="absolute top-full mt-2 w-full glass-panel rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-400">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">No results found for "{searchQuery}"</div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((res, idx) => (
                      <div key={idx} className="px-4 py-2 hover:bg-white/5 cursor-pointer flex flex-col">
                        <span className="text-sm text-white font-medium">{res.title}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{res.type} &bull; {res.subtitle}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats Summary in Header */}
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse border border-gray-900" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute top-full right-0 mt-2 w-72 glass-panel rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-gray-950/50">
                  <h4 className="text-xs font-bold text-white uppercase">Notifications</h4>
                  <span className="text-[10px] text-gray-400">{notifications.length} Unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">All caught up!</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-white/5 hover:bg-white/5 flex flex-col gap-2 cursor-pointer transition-colors" onClick={() => markRead(n.id)}>
                        <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hidden sm:flex">
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
