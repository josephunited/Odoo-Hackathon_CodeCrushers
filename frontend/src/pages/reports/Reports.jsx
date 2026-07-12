import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { reportService } from '../../services/reportService';
import {
  FileText, Download, RefreshCw, Package, Users,
  ClipboardList, Wrench, TrendingUp, AlertTriangle,
  CheckCircle, Clock, XCircle, ChevronUp, ChevronDown
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];
const STATUS_COLOR = {
  AVAILABLE:        '#10b981',
  ALLOCATED:        '#6366f1',
  UNDER_MAINTENANCE:'#f59e0b',
  LOST:             '#ef4444',
  RETIRED:          '#64748b',
  DISPOSED:         '#475569',
  ACTIVE:           '#6366f1',
  RETURNED:         '#10b981',
  COMPLETED:        '#10b981',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapToChartData(obj) {
  return Object.entries(obj || {}).map(([name, value]) => ({ name, value }));
}

function fmtCurrency(v) {
  const n = parseFloat(v);
  if (isNaN(n)) return '₹0';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function exportCSV(headers, rows, filename) {
  const lines = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.04)', borderRadius:14,
      border:'1px solid rgba(255,255,255,0.07)', padding:'18px 20px',
      display:'flex', alignItems:'center', gap:14, flex:1, minWidth:150
    }}>
      <div style={{
        width:42, height:42, borderRadius:12, flexShrink:0,
        background:`${color}18`, border:`1px solid ${color}30`,
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <Icon style={{ width:18, height:18, color }} />
      </div>
      <div>
        <p style={{ margin:0, fontSize:24, fontWeight:800, color:'#f1f5f9', lineHeight:1 }}>{value ?? '—'}</p>
        <p style={{ margin:0, fontSize:11.5, color:'#64748b', marginTop:3 }}>{label}</p>
        {sub && <p style={{ margin:0, fontSize:11, color:'#94a3b8', marginTop:2 }}>{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ title, onExport, exporting }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
      <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{title}</h3>
      {onExport && (
        <button onClick={onExport} disabled={exporting} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600,
          background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
          color:'#a5b4fc', cursor:'pointer'
        }}>
          <Download style={{ width:13, height:13 }} /> Export CSV
        </button>
      )}
    </div>
  );
}

function PieBlock({ title, data }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:14, border:'1px solid rgba(255,255,255,0.07)', padding:20, flex:1, minWidth:220 }}>
      <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:600, color:'#94a3b8' }}>{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:12 }}
            itemStyle={{ color:'#e2e8f0' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarBlock({ title, data, color }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:14, border:'1px solid rgba(255,255,255,0.07)', padding:20, flex:2, minWidth:280 }}>
      <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:600, color:'#94a3b8' }}>{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top:0, right:10, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize:10, fill:'#64748b' }} />
          <YAxis tick={{ fontSize:10, fill:'#64748b' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:12 }}
            itemStyle={{ color:'#e2e8f0' }}
          />
          <Bar dataKey="value" fill={color || '#6366f1'} radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sortable table ────────────────────────────────────────────────────────────

function SortableTable({ columns, rows }) {
  const [sortCol, setSortCol]   = useState(0);
  const [sortDir, setSortDir]   = useState('asc');

  const handleSort = (i) => {
    if (sortCol === i) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(i); setSortDir('asc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const thStyle = (i) => ({
    padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700,
    letterSpacing:'0.06em', textTransform:'uppercase', color:'#475569',
    background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.07)',
    cursor:'pointer', userSelect:'none', whiteSpace:'nowrap'
  });
  const tdStyle = { padding:'10px 14px', fontSize:12.5, color:'#cbd5e1', borderBottom:'1px solid rgba(255,255,255,0.05)', whiteSpace:'nowrap' };

  return (
    <div style={{ overflowX:'auto', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={thStyle(i)} onClick={() => handleSort(i)}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                  {col}
                  {sortCol === i
                    ? (sortDir === 'asc' ? <ChevronUp style={{ width:11, height:11 }} /> : <ChevronDown style={{ width:11, height:11 }} />)
                    : <span style={{ width:11 }} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {row.map((cell, ci) => (
                <td key={ci} style={tdStyle}>{cell}</td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={columns.length} style={{ ...tdStyle, textAlign:'center', color:'#475569', padding:'32px 0' }}>No data available.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b';
  return (
    <span style={{
      padding:'2px 9px', borderRadius:20, fontSize:10.5, fontWeight:700,
      letterSpacing:'0.04em', textTransform:'uppercase',
      color, background:`${color}15`, border:`1px solid ${color}30`
    }}>{status}</span>
  );
}

// ── Report panels ─────────────────────────────────────────────────────────────

function AssetReportPanel({ data }) {
  if (!data) return <Loading />;

  const handleExport = () => exportCSV(
    ['ID','Asset Tag','Name','Category','Status','Condition','Location','Purchase Date','Purchase Cost'],
    (data.assetRows || []).map(r => [r.id, r.assetTag, r.name, r.category, r.status, r.condition, r.location, r.purchaseDate, r.purchaseCost]),
    'asset-summary-report'
  );

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
        <StatCard label="Total Assets"    value={data.totalAssets}     icon={Package}    color="#6366f1" />
        <StatCard label="Total Value"     value={fmtCurrency(data.totalAssetValue)} icon={TrendingUp} color="#10b981" />
        <StatCard label="Available"       value={data.assetsByStatus?.AVAILABLE || 0}     icon={CheckCircle} color="#10b981" />
        <StatCard label="Under Maintenance" value={data.assetsByStatus?.UNDER_MAINTENANCE || 0} icon={Wrench} color="#f59e0b" />
        <StatCard label="Lost/Retired"    value={(data.assetsByStatus?.LOST || 0) + (data.assetsByStatus?.RETIRED || 0)} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Charts */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
        <PieBlock title="Assets by Status"   data={mapToChartData(data.assetsByStatus)}   />
        <BarBlock  title="Assets by Category" data={mapToChartData(data.assetsByCategory)} color="#6366f1" />
        <PieBlock title="Assets by Condition" data={mapToChartData(data.assetsByCondition)} />
      </div>

      {/* Table */}
      <SectionTitle title={`Asset Register (${data.assetRows?.length || 0} records)`} onExport={handleExport} />
      <SortableTable
        columns={['Asset Tag','Name','Category','Status','Condition','Location','Purchase Date','Cost (₹)']}
        rows={(data.assetRows || []).map(r => [
          r.assetTag, r.name, r.category,
          <StatusBadge key={r.id} status={r.status} />,
          r.condition, r.location, r.purchaseDate,
          parseFloat(r.purchaseCost || 0).toLocaleString('en-IN')
        ])}
      />
    </div>
  );
}

function AllocationReportPanel({ data }) {
  if (!data) return <Loading />;

  const handleExport = () => exportCSV(
    ['ID','Asset Tag','Asset Name','Employee ID','Employee Name','Allocated By','Allocation Date','Expected Return','Actual Return','Status','Overdue'],
    (data.allocationRows || []).map(r => [r.id, r.assetTag, r.assetName, r.employeeId, r.employeeName, r.allocatedBy, r.allocationDate, r.expectedReturnDate || '', r.actualReturnDate || '', r.status, r.overdue ? 'Yes' : 'No']),
    'allocation-report'
  );

  return (
    <div>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
        <StatCard label="Total Allocations" value={data.totalAllocations}   icon={Users}        color="#6366f1" />
        <StatCard label="Active"            value={data.activeAllocations}  icon={CheckCircle}  color="#10b981" />
        <StatCard label="Returned"          value={data.returnedAllocations} icon={Package}     color="#64748b" />
        <StatCard label="Overdue"           value={data.overdueAllocations} icon={AlertTriangle} color="#ef4444" />
      </div>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
        <PieBlock title="Status Distribution" data={[
          { name:'Active',   value: data.activeAllocations   || 0 },
          { name:'Returned', value: data.returnedAllocations  || 0 },
          { name:'Overdue',  value: data.overdueAllocations   || 0 },
        ]} />
        <BarBlock title="Active vs Returned" color="#6366f1" data={[
          { name:'Active',   value: data.activeAllocations   || 0 },
          { name:'Returned', value: data.returnedAllocations  || 0 },
          { name:'Overdue',  value: data.overdueAllocations   || 0 },
        ]} />
      </div>

      <SectionTitle title={`Allocation Records (${data.allocationRows?.length || 0})`} onExport={handleExport} />
      <SortableTable
        columns={['Asset Tag','Asset Name','Employee','Allocated By','Alloc Date','Exp. Return','Status','Overdue']}
        rows={(data.allocationRows || []).map(r => [
          r.assetTag, r.assetName, r.employeeName, r.allocatedBy || '—',
          r.allocationDate, r.expectedReturnDate || '—',
          <StatusBadge key={r.id} status={r.status} />,
          r.overdue
            ? <span style={{ color:'#ef4444', fontWeight:700, fontSize:11 }}>⚠ Overdue</span>
            : <span style={{ color:'#10b981', fontSize:11 }}>On Time</span>
        ])}
      />
    </div>
  );
}

function AuditReportPanel({ data }) {
  if (!data) return <Loading />;

  const handleExport = () => exportCSV(
    ['ID','Name','Status','Auditor','Start Date','End Date','Completed','Total','Verified','Missing','Damaged','Pending','Rate %'],
    (data.auditRows || []).map(r => [r.id, r.name, r.status, r.auditorName, r.startDate, r.endDate, r.completedDate || '', r.totalAssets, r.verified, r.missing, r.damaged, r.pending, r.verificationRate]),
    'audit-summary-report'
  );

  return (
    <div>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
        <StatCard label="Total Cycles"    value={data.totalAuditCycles}      icon={ClipboardList}  color="#6366f1" />
        <StatCard label="Completed"       value={data.completedAuditCycles}  icon={CheckCircle}    color="#10b981" />
        <StatCard label="Active"          value={data.activeAuditCycles}     icon={Clock}          color="#f59e0b" />
        <StatCard label="Avg Verification" value={`${data.averageVerificationRate ?? 0}%`} icon={TrendingUp} color="#8b5cf6" />
      </div>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
        <BarBlock title="Verification Rates per Cycle" color="#10b981" data={(data.auditRows || []).map(r => ({ name: r.name.split(' ').slice(0,2).join(' '), value: r.verificationRate }))} />
        <PieBlock title="Cycle Status" data={[
          { name:'Completed', value: data.completedAuditCycles || 0 },
          { name:'Active',    value: data.activeAuditCycles    || 0 },
        ]} />
      </div>

      <SectionTitle title={`Audit Cycles (${data.auditRows?.length || 0})`} onExport={handleExport} />
      <SortableTable
        columns={['Cycle Name','Status','Auditor','Start','End','Total','✓ Verified','✗ Missing','⚠ Damaged','? Pending','Rate']}
        rows={(data.auditRows || []).map(r => [
          r.name, <StatusBadge key={r.id} status={r.status} />,
          r.auditorName, r.startDate, r.endDate || '—',
          r.totalAssets, r.verified, r.missing, r.damaged, r.pending,
          <span key="rate" style={{ fontWeight:700, color: r.verificationRate >= 90 ? '#10b981' : r.verificationRate >= 70 ? '#f59e0b' : '#ef4444' }}>
            {r.verificationRate}%
          </span>
        ])}
      />
    </div>
  );
}

function MaintenanceReportPanel({ data }) {
  if (!data) return <Loading />;

  const handleExport = () => exportCSV(
    ['Action Type','Asset Tag','Asset Name','Performed By','Details','Date'],
    (data.maintenanceRows || []).map(r => [r.actionType, r.assetTag, r.assetName, r.performedBy, r.details, r.actionDate]),
    'maintenance-report'
  );

  return (
    <div>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
        <StatCard label="Total Events" value={data.totalMaintenanceTickets} icon={Wrench}        color="#6366f1" />
        <StatCard label="Open Tickets" value={data.openTickets}             icon={AlertTriangle}  color="#f59e0b" />
        <StatCard label="Resolved"     value={data.closedTickets}           icon={CheckCircle}    color="#10b981" />
      </div>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
        <PieBlock title="Open vs Resolved" data={[
          { name:'Open',     value: data.openTickets   || 0 },
          { name:'Resolved', value: data.closedTickets  || 0 },
        ]} />
        <BarBlock title="Events by Type" color="#f59e0b" data={
          (() => {
            const counts = {};
            (data.maintenanceRows || []).forEach(r => { counts[r.actionType] = (counts[r.actionType]||0)+1; });
            return Object.entries(counts).map(([name,value]) => ({ name: name.replace(/_/g,' '), value }));
          })()
        } />
      </div>

      <SectionTitle title={`Maintenance Events (${data.maintenanceRows?.length || 0})`} onExport={handleExport} />
      <SortableTable
        columns={['Action Type','Asset Tag','Asset Name','Performed By','Details','Date']}
        rows={(data.maintenanceRows || []).map((r, i) => [
          <span key={i} style={{ fontSize:11, fontWeight:700, color: r.actionType.endsWith('OPENED') || r.actionType === 'AUDIT_DAMAGED' ? '#f59e0b' : '#10b981' }}>
            {r.actionType.replace(/_/g,' ')}
          </span>,
          r.assetTag, r.assetName, r.performedBy || '—',
          <span key="d" style={{ maxWidth:300, display:'block', whiteSpace:'normal', lineHeight:1.4, color:'#94a3b8', fontSize:12 }}>{r.details}</span>,
          r.actionDate?.slice(0,16).replace('T',' ') || '—'
        ])}
      />
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding:60, textAlign:'center' }}>
      <RefreshCw style={{ width:28, height:28, color:'#6366f1', animation:'spin 1s linear infinite' }} />
      <p style={{ marginTop:12, color:'#64748b', fontSize:13 }}>Generating report…</p>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

const TABS = [
  { id:'assets',      label:'Asset Summary',    icon:Package,      fetch: () => reportService.getAssetReport()       },
  { id:'allocations', label:'Allocations',      icon:Users,        fetch: () => reportService.getAllocationReport()  },
  { id:'audits',      label:'Audit Summary',    icon:ClipboardList,fetch: () => reportService.getAuditReport()       },
  { id:'maintenance', label:'Maintenance',      icon:Wrench,       fetch: () => reportService.getMaintenanceReport() },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Reports() {
  const [activeTab, setActiveTab] = useState('assets');
  const [dataCache, setDataCache] = useState({});
  const [loading,   setLoading]   = useState(false);

  const loadTab = useCallback(async (tabId) => {
    if (dataCache[tabId]) return;        // already loaded
    setLoading(true);
    const tab  = TABS.find(t => t.id === tabId);
    const data = await tab.fetch();
    setDataCache(c => ({ ...c, [tabId]: data }));
    setLoading(false);
  }, [dataCache]);

  const handleRefresh = async () => {
    setDataCache(c => { const n = { ...c }; delete n[activeTab]; return n; });
  };

  useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);

  const data = dataCache[activeTab];

  return (
    <div style={{ maxWidth:1300, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 12px rgba(99,102,241,0.3)'
            }}>
              <FileText style={{ width:18, height:18, color:'#fff' }} />
            </div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#f1f5f9' }}>Reports</h1>
          </div>
          <p style={{ margin:0, fontSize:13, color:'#64748b' }}>
            Pre-built analytical reports with charts and CSV export across all modules.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:600,
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
            color:'#94a3b8', cursor:'pointer'
          }}
        >
          <RefreshCw style={{ width:14, height:14 }} /> Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:6, marginBottom:24, borderBottom:'1px solid rgba(255,255,255,0.07)', paddingBottom:0 }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'10px 18px', borderRadius:'10px 10px 0 0', fontSize:13, fontWeight:600,
              background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              borderBottom: active ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
              color: active ? '#a5b4fc' : '#64748b',
              cursor:'pointer', transition:'all 0.15s',
              marginBottom: active ? -1 : 0,
            }}>
              <Icon style={{ width:14, height:14 }} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report content */}
      <div style={{
        background:'rgba(255,255,255,0.025)', borderRadius:'0 14px 14px 14px',
        border:'1px solid rgba(255,255,255,0.07)', padding:28, minHeight:400
      }}>
        {loading && !data ? (
          <Loading />
        ) : (
          <>
            {activeTab === 'assets'      && <AssetReportPanel       data={data} />}
            {activeTab === 'allocations' && <AllocationReportPanel  data={data} />}
            {activeTab === 'audits'      && <AuditReportPanel       data={data} />}
            {activeTab === 'maintenance' && <MaintenanceReportPanel data={data} />}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
