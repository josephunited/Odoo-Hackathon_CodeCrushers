import React, { useState, useEffect, useCallback } from 'react';
import { activityLogService } from '../../services/activityLogService';
import {
  Activity, Search, Filter, ChevronLeft, ChevronRight,
  RefreshCw, Download, User, Clock, Tag, Box,
  CheckCircle, AlertTriangle, Wrench, Calendar,
  LogIn, BookOpen, ClipboardList, X
} from 'lucide-react';

// ── Module meta (icon + color) ────────────────────────────────────────────────

const MODULE_META = {
  ASSET:       { label: 'Asset',       color: '#6366f1', bg: 'rgba(99,102,241,0.12)'  },
  AUDIT:       { label: 'Audit',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  BOOKING:     { label: 'Booking',     color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  MAINTENANCE: { label: 'Maintenance', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  AUTH:        { label: 'Auth',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  SYSTEM:      { label: 'System',      color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
};

const ACTION_ICONS = {
  ASSET_CREATED:       Box,
  ASSET_ALLOCATED:     User,
  ASSET_TRANSFERRED:   Activity,
  ASSET_RETURNED:      CheckCircle,
  ASSET_RETIRED:       AlertTriangle,
  AUDIT_CREATED:       ClipboardList,
  AUDIT_VERIFIED:      CheckCircle,
  AUDIT_MISSING:       AlertTriangle,
  AUDIT_DAMAGED:       AlertTriangle,
  AUDIT_CLOSED:        ClipboardList,
  BOOKING_CREATED:     BookOpen,
  BOOKING_APPROVED:    CheckCircle,
  MAINTENANCE_OPENED:  Wrench,
  MAINTENANCE_CLOSED:  CheckCircle,
  USER_LOGIN:          LogIn,
  USER_CREATED:        User,
};

function ModuleBadge({ module }) {
  const meta = MODULE_META[module] || { label: module, color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}30`
    }}>
      {meta.label}
    </span>
  );
}

function ActionIcon({ actionType }) {
  const Icon = ACTION_ICONS[actionType] || Activity;
  const module = (actionType || '').split('_')[0];
  const meta   = MODULE_META[module] || MODULE_META.SYSTEM;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: meta.bg, border: `1px solid ${meta.color}30`
    }}>
      <Icon style={{ width: 16, height: 16, color: meta.color }} />
    </div>
  );
}

function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}h ago`;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Filter bar ────────────────────────────────────────────────────────────────

function FilterBar({ filters, setFilters, meta, onReset }) {
  const { modules = [], actors = [] } = meta;

  const handle = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value, page: 0 }));

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#e2e8f0', fontSize: 13, padding: '8px 12px',
    outline: 'none', cursor: 'pointer', minWidth: 130
  };
  const inputStyle = { ...selectStyle, minWidth: 180 };

  const hasActive = filters.module || filters.actorUsername || filters.actionType ||
                    filters.from   || filters.to             || filters.search;

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
      borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)'
    }}>
      <Filter style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />

      {/* Module */}
      <select value={filters.module} onChange={handle('module')} style={selectStyle}>
        <option value="">All Modules</option>
        {modules.map(m => <option key={m} value={m}>{MODULE_META[m]?.label || m}</option>)}
      </select>

      {/* Actor */}
      <select value={filters.actorUsername} onChange={handle('actorUsername')} style={selectStyle}>
        <option value="">All Actors</option>
        {actors.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      {/* Date from */}
      <input
        type="datetime-local" value={filters.from} onChange={handle('from')}
        style={inputStyle}
        title="From date"
      />
      <span style={{ color: '#475569', fontSize: 12 }}>→</span>
      <input
        type="datetime-local" value={filters.to} onChange={handle('to')}
        style={inputStyle}
        title="To date"
      />

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
        <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#64748b' }} />
        <input
          type="text"
          placeholder="Search description, entity…"
          value={filters.search}
          onChange={handle('search')}
          style={{ ...inputStyle, paddingLeft: 32, width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {hasActive && (
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          color: '#ef4444', cursor: 'pointer'
        }}>
          <X style={{ width: 12, height: 12 }} /> Reset
        </button>
      )}
    </div>
  );
}

// ── Log row ───────────────────────────────────────────────────────────────────

function LogRow({ log, idx }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px',
      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      transition: 'background 0.15s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
    >
      <ActionIcon actionType={log.actionType} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: '#e2e8f0', lineHeight: 1.4 }}>
          {log.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6, alignItems: 'center' }}>
          {log.actorUsername && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#94a3b8' }}>
              <User style={{ width: 11, height: 11 }} /> {log.actorUsername}
            </span>
          )}
          {log.entityName && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#94a3b8' }}>
              <Tag style={{ width: 11, height: 11 }} /> {log.entityName}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#64748b' }}>
            <Clock style={{ width: 11, height: 11 }} /> {formatTimestamp(log.timestamp)}
          </span>
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <ModuleBadge module={log.module} />
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, totalElements, size, onPageChange }) {
  if (totalPages <= 1) return null;
  const from = page * size + 1;
  const to   = Math.min((page + 1) * size, totalElements);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <span style={{ fontSize: 12, color: '#64748b' }}>
        Showing {from}–{to} of {totalElements} events
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: page === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(255,255,255,0.1)', color: page === 0 ? '#475569' : '#a5b4fc',
            cursor: page === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} /> Prev
        </button>
        <span style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
          color: '#a5b4fc'
        }}>
          {page + 1} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: page >= totalPages - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: page >= totalPages - 1 ? '#475569' : '#a5b4fc',
            cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          Next <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

// ── Stat cards ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 160
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</p>
        <p style={{ margin: 0, fontSize: 11.5, color: '#64748b', marginTop: 4 }}>{label}</p>
      </div>
    </div>
  );
}

// ── Export helper ─────────────────────────────────────────────────────────────

function exportCSV(logs) {
  const header = ['ID', 'Timestamp', 'Module', 'Action Type', 'Description', 'Actor', 'Entity Type', 'Entity ID', 'Entity Name'];
  const rows = logs.map(l => [
    l.id, l.timestamp, l.module, l.actionType,
    `"${(l.description || '').replace(/"/g, '""')}"`,
    l.actorUsername || '', l.entityType || '', l.entityId || '', l.entityName || ''
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `activity-logs-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  module: '', actorUsername: '', actionType: '', from: '', to: '', search: '', page: 0, size: 25
};

export default function ActivityLogs() {
  const [logs,     setLogs]     = useState([]);
  const [meta,     setMeta]     = useState({ modules: [], actors: [] });
  const [filters,  setFilters]  = useState(DEFAULT_FILTERS);
  const [total,    setTotal]    = useState({ elements: 0, pages: 1 });
  const [loading,  setLoading]  = useState(false);
  const [stats,    setStats]    = useState({ total: 0, today: 0, modules: 0, actors: 0 });

  const fetchMeta = useCallback(async () => {
    const m = await activityLogService.getMeta();
    setMeta(m);
  }, []);

  const fetchLogs = useCallback(async (f) => {
    setLoading(true);
    try {
      const result = await activityLogService.getLogs(f);
      setLogs(result.content || []);
      setTotal({ elements: result.totalElements || 0, pages: result.totalPages || 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  const computeStats = useCallback(async () => {
    // Pull all logs briefly for stat computation (fallback: use current page)
    const all = await activityLogService.getLogs({ size: 200 });
    const allLogs = all.content || [];
    const today = new Date().toDateString();
    setStats({
      total:   all.totalElements || 0,
      today:   allLogs.filter(l => new Date(l.timestamp).toDateString() === today).length,
      modules: new Set(allLogs.map(l => l.module)).size,
      actors:  new Set(allLogs.map(l => l.actorUsername).filter(Boolean)).size,
    });
  }, []);

  useEffect(() => { fetchMeta(); computeStats(); }, [fetchMeta, computeStats]);
  useEffect(() => { fetchLogs(filters); }, [filters, fetchLogs]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleExport = async () => {
    const result = await activityLogService.getLogs({ ...filters, page: 0, size: 200 });
    exportCSV(result.content || []);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}>
              <Activity style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Activity Logs</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Complete audit trail of all system events across every module.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { fetchLogs(filters); computeStats(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', cursor: 'pointer'
            }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
          </button>
          <button
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: '#fff', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
            }}
          >
            <Download style={{ width: 14, height: 14 }} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total Events"   value={stats.total}   icon={Activity}     color="#6366f1" />
        <StatCard label="Today"          value={stats.today}   icon={Calendar}     color="#10b981" />
        <StatCard label="Active Modules" value={stats.modules} icon={ClipboardList} color="#f59e0b" />
        <StatCard label="Unique Actors"  value={stats.actors}  icon={User}         color="#8b5cf6" />
      </div>

      {/* ── Filter bar ── */}
      <div style={{ marginBottom: 16 }}>
        <FilterBar filters={filters} setFilters={setFilters} meta={meta} onReset={resetFilters} />
      </div>

      {/* ── Log table ── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden'
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '36px 1fr 100px',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#475569'
        }}>
          <span />
          <span>Event</span>
          <span style={{ textAlign: 'right' }}>Module</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <RefreshCw style={{ width: 28, height: 28, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>Loading events…</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Activity style={{ width: 40, height: 40, color: '#334155', marginBottom: 12 }} />
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>No events match your filters.</p>
            <button onClick={resetFilters} style={{
              marginTop: 12, padding: '8px 20px', borderRadius: 10, fontSize: 13,
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc', cursor: 'pointer', fontWeight: 600
            }}>Clear Filters</button>
          </div>
        ) : (
          logs.map((log, i) => <LogRow key={log.id} log={log} idx={i} />)
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <Pagination
            page={filters.page}
            totalPages={total.pages}
            totalElements={total.elements}
            size={filters.size}
            onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
          />
        )}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
