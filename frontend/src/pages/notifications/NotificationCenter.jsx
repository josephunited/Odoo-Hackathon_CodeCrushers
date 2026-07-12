import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { Bell, Check, Trash2, MailOpen, Mail, Clock } from 'lucide-react';

export default function NotificationCenter({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map user to default Employee ID (101) for this collaborative dashboard sandbox
  const employeeId = 101;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.list(employeeId);
      setNotifications(data);
    } catch (e) {
      console.error('Error fetching notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (e) {
      console.error('Error marking as read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(employeeId);
      fetchNotifications();
    } catch (e) {
      console.error('Error marking all as read', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      fetchNotifications();
    } catch (e) {
      console.error('Error deleting notification', e);
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Notification Alert Center</h2>
          <p className="text-gray-400 text-sm">Stay updated on your booking status changes and asset allocations.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-cardborder">
          <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white mb-1">All Caught Up!</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">You have no system or booking notifications at the moment.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-cardborder divide-y divide-white/5 overflow-hidden">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-all hover:bg-white/[0.01] ${
                !n.isRead ? 'bg-primary-500/[0.02]' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Mail Icon based on state */}
                <div className={`mt-0.5 p-2 rounded-lg ${
                  !n.isRead ? 'bg-primary-500/10 text-primary-400' : 'bg-gray-900 text-gray-500 border border-white/5'
                }`}>
                  {!n.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <p className={`text-sm ${!n.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {n.message}
                  </p>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(n.timestamp)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                    className="p-1.5 hover:bg-white/5 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors border border-transparent"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  title="Delete alert"
                  className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-red-400 rounded-lg transition-colors border border-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
