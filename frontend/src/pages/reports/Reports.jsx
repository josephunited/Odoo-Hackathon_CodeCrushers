import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { reportService } from '../../services/reportService';
import {
  FileText, Download, RefreshCw, Package, Users,
  ClipboardList, Wrench, TrendingUp, AlertTriangle,
  CheckCircle, Clock, ChevronUp, ChevronDown, Printer,
  ChevronDown as CaretDown, FileSpreadsheet
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];
const STATUS_COLOR = {
  AVAILABLE:'#10b981', ALLOCATED:'#6366f1', UNDER_MAINTENANCE:'#f59e0b',
  LOST:'#ef4444', RETIRED:'#64748b', DISPOSED:'#475569',
  ACTIVE:'#6366f1', RETURNED:'#10b981', COMPLETED:'#10b981',
};

// ── Print stylesheet (injected once into <head>) ──────────────────────────────

const PRINT_CSS = `
@media print {
  body > * { display: none !important; }
  #af-print-root { display: block !important; }

  #af-print-root {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #111;
    background: #fff;
    padding: 0;
    margin: 0;
  }
  .prt-page { page-break-after: always; padding: 32px 40px; }
  .prt-page:last-child { page-break-after: auto; }

  .prt-header {
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 3px solid #6366f1; padding-bottom: 14px; margin-bottom: 22px;
  }
  .prt-logo { font-size: 22px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
  .prt-logo span { color: #111; }
  .prt-meta { font-size: 11px; color: #64748b; text-align: right; }

  .prt-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
  .prt-subtitle { font-size: 12px; color: #64748b; margin: 0 0 22px; }

  .prt-kpis { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .prt-kpi {
    border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 18px;
    flex: 1; min-width: 120px;
  }
  .prt-kpi-val { font-size: 24px; font-weight: 800; color: #1e293b; line-height: 1; }
  .prt-kpi-lbl { font-size: 10px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }

  .prt-section-title {
    font-size: 13px; font-weight: 700; color: #334155;
    border-left: 4px solid #6366f1; padding-left: 10px;
    margin: 20px 0 12px;
  }

  .prt-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .prt-table th {
    background: #f1f5f9; color: #475569; font-weight: 700;
    padding: 7px 10px; text-align: left; border-bottom: 1.5px solid #cbd5e1;
    text-transform: uppercase; letter-spacing: 0.05em; font-size: 10px;
  }
  .prt-table td {
    padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;
    vertical-align: top;
  }
  .prt-table tr:nth-child(even) td { background: #f8fafc; }

  .prt-badge {
    display: inline-block; padding: 1px 7px; border-radius: 20px;
    font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    border: 1px solid currentColor;
  }
  .prt-overdue { color: #dc2626; font-weight: 700; }
  .prt-ok      { color: #16a34a; }
  .prt-footer  {
    border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 10px;
    font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;
  }
}
@media screen { #af-print-root { display: none !important; } }
`;

function injectPrintCSS() {
  if (document.getElementById('af-print-css')) return;
  const style = document.createElement('style');
  style.id = 'af-print-css';
  style.textContent = PRINT_CSS;
  document.head.appendChild(style);
}

// ── Generic helpers ────────────────────────────────────────────────────────────

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

function textOf(cell) {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'object' && cell?.props) {
    // React element — extract text content recursively
    const extract = (el) => {
      if (!el) return '';
      if (typeof el === 'string' || typeof el === 'number') return String(el);
      if (Array.isArray(el)) return el.map(extract).join('');
      if (el?.props?.children) return extract(el.props.children);
      return '';
    };
    return extract(cell);
  }
  return String(cell);
}

// ── Enhanced CSV export (Excel-compatible with summary section) ───────────────

function exportExcelCSV({ reportTitle, generatedOn, kpis, headers, rows, filename }) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const lines = [];
  lines.push(esc('AssetFlow Enterprise — ' + reportTitle));
  lines.push(esc('Generated: ' + (generatedOn || new Date().toISOString().slice(0, 10))));
  lines.push('');

  // KPI summary rows
  if (kpis?.length) {
    lines.push(esc('SUMMARY'));
    kpis.forEach(({ label, value }) => lines.push(`${esc(label)},${esc(value)}`));
    lines.push('');
  }

  // Data table
  lines.push(esc('DETAIL DATA'));
  lines.push(headers.map(esc).join(','));
  rows.forEach(row => lines.push(row.map(c => esc(textOf(c))).join(',')));

  const blob = new Blob([BOM + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Print-to-PDF helpers ───────────────────────────────────────────────────────

function renderPrintBadge(status) {
  const c = STATUS_COLOR[status] || '#64748b';
  return `<span class="prt-badge" style="color:${c};border-color:${c};">${status}</span>`;
}

function printReport({ title, subtitle, kpis, tableHeaders, tableRows, generatedOn }) {
  injectPrintCSS();

  // Build rows — strip JSX to plain text, handle overdue specially
  const rowsHtml = tableRows.map(row =>
    `<tr>${row.map((cell, ci) => {
      const txt = textOf(cell);
      let display = txt;
      // Colour overdue/rate cells in print
      if (txt === '⚠ Overdue' || txt.includes('Overdue'))
        display = `<span class="prt-overdue">⚠ Overdue</span>`;
      else if (txt === 'On Time')
        display = `<span class="prt-ok">✓ On Time</span>`;
      else if (tableHeaders[ci] === 'Status' || tableHeaders[ci] === 'Status ')
        display = renderPrintBadge(txt);
      else if (txt.endsWith('%') && tableHeaders[ci] === 'Rate')
        display = `<strong>${txt}</strong>`;
      return `<td>${display}</td>`;
    }).join('')}</tr>`
  ).join('');

  const kpiHtml = (kpis || []).map(({ label, value }) =>
    `<div class="prt-kpi"><div class="prt-kpi-val">${value}</div><div class="prt-kpi-lbl">${label}</div></div>`
  ).join('');

  const headerHtml = tableHeaders.map(h => `<th>${h}</th>`).join('');
  const today = generatedOn || new Date().toISOString().slice(0, 10);

  document.getElementById('af-print-root').innerHTML = `
    <div class="prt-page">
      <div class="prt-header">
        <div class="prt-logo">Asset<span>Flow</span></div>
        <div class="prt-meta">
          <div><strong>AssetFlow Enterprise</strong></div>
          <div>Generated: ${today}</div>
        </div>
      </div>

      <div class="prt-title">${title}</div>
      <div class="prt-subtitle">${subtitle || ''}</div>

      <div class="prt-kpis">${kpiHtml}</div>

      <div class="prt-section-title">Detail Data</div>
      <table class="prt-table">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="prt-footer">
        <span>AssetFlow — Enterprise Asset &amp; Resource Management System</span>
        <span>Confidential · Internal Use Only</span>
      </div>
    </div>
  `;

  setTimeout(() => window.print(), 120);
}

// ── Export dropdown ────────────────────────────────────────────────────────────

function ExportDropdown({ onCSV, onPrint, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          border: 'none', color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)', opacity: disabled ? 0.5 : 1
        }}
      >
        <Download style={{ width: 14, height: 14 }} />
        Export
        <CaretDown style={{ width: 13, height: 13, marginLeft: 2 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50,
          background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          minWidth: 200
        }}>
          <button onClick={() => { onCSV(); setOpen(false); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', background: 'none', border: 'none',
            color: '#e2e8f0', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <FileSpreadsheet style={{ width: 16, height: 16, color: '#10b981' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Export CSV</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Excel-compatible with summary</div>
            </div>
          </button>

          <button onClick={() => { onPrint(); setOpen(false); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', background: 'none', border: 'none',
            color: '#e2e8f0', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Printer style={{ width: 16, height: 16, color: '#6366f1' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Print / Save as PDF</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Branded printable layout</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared UI components ──────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 150
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value ?? '—'}</p>
        <p style={{ margin: 0, fontSize: 11.5, color: '#64748b', marginTop: 3 }}>{label}</p>
      </div>
    </div>
  );
}

function PieBlock({ title, data }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 20, flex: 1, minWidth: 220 }}>
      <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} itemStyle={{ color: '#e2e8f0' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarBlock({ title, data, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 20, flex: 2, minWidth: 280 }}>
      <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} itemStyle={{ color: '#e2e8f0' }} />
          <Bar dataKey="value" fill={color || '#6366f1'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b';
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      color, background: `${color}15`, border: `1px solid ${color}30`
    }}>{status}</span>
  );
}

function SortableTable({ columns, rows }) {
  const [sortCol, setSortCol] = useState(0);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (i) => {
    if (sortCol === i) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(i); setSortDir('asc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    const av = textOf(a[sortCol]), bv = textOf(b[sortCol]);
    const cmp = av.localeCompare(bv, undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569',
    background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap'
  };
  const tdStyle = { padding: '10px 14px', fontSize: 12.5, color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={thStyle} onClick={() => handleSort(i)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col}
                  {sortCol === i
                    ? (sortDir === 'asc' ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />)
                    : <span style={{ width: 11 }} />}
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
              {row.map((cell, ci) => <td key={ci} style={tdStyle}>{cell}</td>)}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: '#475569', padding: '32px 0' }}>No data available.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <RefreshCw style={{ width: 28, height: 28, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>Generating report…</p>
    </div>
  );
}

// ── Report panels ─────────────────────────────────────────────────────────────

function AssetReportPanel({ data }) {
  if (!data) return <Loading />;

  const headers = ['Asset Tag', 'Name', 'Category', 'Status', 'Condition', 'Location', 'Purchase Date', 'Cost (₹)'];
  const rawRows = (data.assetRows || []).map(r => [
    r.assetTag, r.name, r.category,
    <StatusBadge key={r.id} status={r.status} />,
    r.condition, r.location, r.purchaseDate,
    parseFloat(r.purchaseCost || 0).toLocaleString('en-IN')
  ]);

  const kpis = [
    { label: 'Total Assets',       value: data.totalAssets },
    { label: 'Total Value',        value: fmtCurrency(data.totalAssetValue) },
    { label: 'Available',          value: data.assetsByStatus?.AVAILABLE || 0 },
    { label: 'Under Maintenance',  value: data.assetsByStatus?.UNDER_MAINTENANCE || 0 },
    { label: 'Lost / Retired',     value: (data.assetsByStatus?.LOST || 0) + (data.assetsByStatus?.RETIRED || 0) },
  ];

  const handleCSV = () => exportExcelCSV({
    reportTitle: 'Asset Summary Report',
    generatedOn: data.generatedOn,
    kpis,
    headers,
    rows: rawRows,
    filename: 'asset-summary-report',
  });

  const handlePrint = () => printReport({
    title: 'Asset Summary Report',
    subtitle: `Total assets: ${data.totalAssets} · Total value: ${fmtCurrency(data.totalAssetValue)}`,
    kpis,
    tableHeaders: headers,
    tableRows: rawRows,
    generatedOn: data.generatedOn,
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <ExportDropdown onCSV={handleCSV} onPrint={handlePrint} />
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        {kpis.map(k => (
          <StatCard key={k.label} label={k.label} value={k.value}
            icon={k.label === 'Total Assets' ? Package : k.label === 'Total Value' ? TrendingUp : k.label === 'Available' ? CheckCircle : k.label === 'Under Maintenance' ? Wrench : AlertTriangle}
            color={k.label === 'Available' ? '#10b981' : k.label === 'Total Value' ? '#10b981' : k.label === 'Lost / Retired' ? '#ef4444' : k.label === 'Under Maintenance' ? '#f59e0b' : '#6366f1'} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <PieBlock title="Assets by Status"    data={mapToChartData(data.assetsByStatus)} />
        <BarBlock  title="Assets by Category" data={mapToChartData(data.assetsByCategory)} color="#6366f1" />
        <PieBlock title="Assets by Condition" data={mapToChartData(data.assetsByCondition)} />
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
        Asset Register <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>({data.assetRows?.length || 0} records)</span>
      </p>
      <SortableTable columns={headers} rows={rawRows} />
    </div>
  );
}

function AllocationReportPanel({ data }) {
  if (!data) return <Loading />;

  const headers = ['Asset Tag', 'Asset Name', 'Employee', 'Allocated By', 'Alloc Date', 'Exp. Return', 'Status', 'Overdue'];
  const rawRows = (data.allocationRows || []).map(r => [
    r.assetTag, r.assetName, r.employeeName, r.allocatedBy || '—',
    r.allocationDate, r.expectedReturnDate || '—',
    <StatusBadge key={r.id} status={r.status} />,
    r.overdue
      ? <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 11 }}>⚠ Overdue</span>
      : <span style={{ color: '#10b981', fontSize: 11 }}>On Time</span>
  ]);

  const kpis = [
    { label: 'Total Allocations', value: data.totalAllocations },
    { label: 'Active',            value: data.activeAllocations },
    { label: 'Returned',          value: data.returnedAllocations },
    { label: 'Overdue',           value: data.overdueAllocations },
  ];

  const handleCSV = () => exportExcelCSV({ reportTitle: 'Allocation Report', generatedOn: data.generatedOn, kpis, headers, rows: rawRows, filename: 'allocation-report' });
  const handlePrint = () => printReport({ title: 'Allocation Report', subtitle: `Active: ${data.activeAllocations} · Overdue: ${data.overdueAllocations}`, kpis, tableHeaders: headers, tableRows: rawRows, generatedOn: data.generatedOn });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <ExportDropdown onCSV={handleCSV} onPrint={handlePrint} />
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Allocations" value={data.totalAllocations}  icon={Users}        color="#6366f1" />
        <StatCard label="Active"            value={data.activeAllocations} icon={CheckCircle}  color="#10b981" />
        <StatCard label="Returned"          value={data.returnedAllocations} icon={Package}    color="#64748b" />
        <StatCard label="Overdue"           value={data.overdueAllocations} icon={AlertTriangle} color="#ef4444" />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <PieBlock title="Status Distribution" data={[
          { name: 'Active', value: data.activeAllocations || 0 },
          { name: 'Returned', value: data.returnedAllocations || 0 },
          { name: 'Overdue', value: data.overdueAllocations || 0 },
        ]} />
        <BarBlock title="Active vs Returned vs Overdue" color="#6366f1" data={[
          { name: 'Active', value: data.activeAllocations || 0 },
          { name: 'Returned', value: data.returnedAllocations || 0 },
          { name: 'Overdue', value: data.overdueAllocations || 0 },
        ]} />
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
        Allocation Records <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>({data.allocationRows?.length || 0})</span>
      </p>
      <SortableTable columns={headers} rows={rawRows} />
    </div>
  );
}

function AuditReportPanel({ data }) {
  if (!data) return <Loading />;

  const headers = ['Cycle Name', 'Status', 'Auditor', 'Start', 'End', 'Total', '✓ Verified', '✗ Missing', '⚠ Damaged', '? Pending', 'Rate'];
  const rawRows = (data.auditRows || []).map(r => [
    r.name,
    <StatusBadge key={r.id} status={r.status} />,
    r.auditorName, r.startDate, r.endDate || '—',
    r.totalAssets, r.verified, r.missing, r.damaged, r.pending,
    <span key="rate" style={{ fontWeight: 700, color: r.verificationRate >= 90 ? '#10b981' : r.verificationRate >= 70 ? '#f59e0b' : '#ef4444' }}>
      {r.verificationRate}%
    </span>
  ]);

  const kpis = [
    { label: 'Total Cycles',       value: data.totalAuditCycles },
    { label: 'Completed',          value: data.completedAuditCycles },
    { label: 'Active',             value: data.activeAuditCycles },
    { label: 'Avg Verification',   value: `${data.averageVerificationRate ?? 0}%` },
  ];

  const handleCSV = () => exportExcelCSV({ reportTitle: 'Audit Summary Report', generatedOn: data.generatedOn, kpis, headers, rows: rawRows, filename: 'audit-summary-report' });
  const handlePrint = () => printReport({ title: 'Audit Summary Report', subtitle: `Cycles: ${data.totalAuditCycles} · Avg Verification Rate: ${data.averageVerificationRate}%`, kpis, tableHeaders: headers, tableRows: rawRows, generatedOn: data.generatedOn });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <ExportDropdown onCSV={handleCSV} onPrint={handlePrint} />
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Cycles"     value={data.totalAuditCycles}     icon={ClipboardList} color="#6366f1" />
        <StatCard label="Completed"        value={data.completedAuditCycles} icon={CheckCircle}   color="#10b981" />
        <StatCard label="Active"           value={data.activeAuditCycles}    icon={Clock}         color="#f59e0b" />
        <StatCard label="Avg Verification" value={`${data.averageVerificationRate ?? 0}%`} icon={TrendingUp} color="#8b5cf6" />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <BarBlock title="Verification Rates per Cycle" color="#10b981"
          data={(data.auditRows || []).map(r => ({ name: r.name.split(' ').slice(0, 2).join(' '), value: r.verificationRate }))} />
        <PieBlock title="Cycle Status" data={[
          { name: 'Completed', value: data.completedAuditCycles || 0 },
          { name: 'Active', value: data.activeAuditCycles || 0 },
        ]} />
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
        Audit Cycles <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>({data.auditRows?.length || 0})</span>
      </p>
      <SortableTable columns={headers} rows={rawRows} />
    </div>
  );
}

function MaintenanceReportPanel({ data }) {
  if (!data) return <Loading />;

  const headers = ['Action Type', 'Asset Tag', 'Asset Name', 'Performed By', 'Details', 'Date'];
  const rawRows = (data.maintenanceRows || []).map((r, i) => [
    <span key={i} style={{ fontSize: 11, fontWeight: 700, color: r.actionType.endsWith('OPENED') || r.actionType === 'AUDIT_DAMAGED' ? '#f59e0b' : '#10b981' }}>
      {r.actionType.replace(/_/g, ' ')}
    </span>,
    r.assetTag, r.assetName, r.performedBy || '—',
    <span key="d" style={{ maxWidth: 300, display: 'block', whiteSpace: 'normal', lineHeight: 1.4, color: '#94a3b8', fontSize: 12 }}>{r.details}</span>,
    r.actionDate?.slice(0, 16).replace('T', ' ') || '—'
  ]);

  const kpis = [
    { label: 'Total Events',  value: data.totalMaintenanceTickets },
    { label: 'Open Tickets',  value: data.openTickets },
    { label: 'Resolved',      value: data.closedTickets },
  ];

  const handleCSV = () => exportExcelCSV({ reportTitle: 'Maintenance Report', generatedOn: data.generatedOn, kpis, headers, rows: rawRows, filename: 'maintenance-report' });
  const handlePrint = () => printReport({ title: 'Maintenance Report', subtitle: `Open: ${data.openTickets} · Resolved: ${data.closedTickets}`, kpis, tableHeaders: headers, tableRows: rawRows, generatedOn: data.generatedOn });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <ExportDropdown onCSV={handleCSV} onPrint={handlePrint} />
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Events" value={data.totalMaintenanceTickets} icon={Wrench}        color="#6366f1" />
        <StatCard label="Open Tickets" value={data.openTickets}             icon={AlertTriangle}  color="#f59e0b" />
        <StatCard label="Resolved"     value={data.closedTickets}           icon={CheckCircle}    color="#10b981" />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <PieBlock title="Open vs Resolved" data={[
          { name: 'Open', value: data.openTickets || 0 },
          { name: 'Resolved', value: data.closedTickets || 0 },
        ]} />
        <BarBlock title="Events by Type" color="#f59e0b" data={
          (() => {
            const counts = {};
            (data.maintenanceRows || []).forEach(r => { counts[r.actionType] = (counts[r.actionType] || 0) + 1; });
            return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
          })()
        } />
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
        Maintenance Events <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>({data.maintenanceRows?.length || 0})</span>
      </p>
      <SortableTable columns={headers} rows={rawRows} />
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'assets',      label: 'Asset Summary', icon: Package,       fetch: () => reportService.getAssetReport() },
  { id: 'allocations', label: 'Allocations',   icon: Users,         fetch: () => reportService.getAllocationReport() },
  { id: 'audits',      label: 'Audit Summary', icon: ClipboardList, fetch: () => reportService.getAuditReport() },
  { id: 'maintenance', label: 'Maintenance',   icon: Wrench,        fetch: () => reportService.getMaintenanceReport() },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Reports() {
  const [activeTab, setActiveTab] = useState('assets');
  const [dataCache, setDataCache] = useState({});
  const [loading,   setLoading]   = useState(false);

  // Ensure print CSS and hidden print container exist
  useEffect(() => {
    injectPrintCSS();
    if (!document.getElementById('af-print-root')) {
      const div = document.createElement('div');
      div.id = 'af-print-root';
      document.body.appendChild(div);
    }
    return () => {
      // cleanup: remove print root on unmount
      const el = document.getElementById('af-print-root');
      if (el) el.innerHTML = '';
    };
  }, []);

  const loadTab = useCallback(async (tabId) => {
    if (dataCache[tabId]) return;
    setLoading(true);
    const tab  = TABS.find(t => t.id === tabId);
    const data = await tab.fetch();
    setDataCache(c => ({ ...c, [tabId]: data }));
    setLoading(false);
  }, [dataCache]);

  const handleRefresh = () => {
    setDataCache(c => { const n = { ...c }; delete n[activeTab]; return n; });
  };

  useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);

  const data = dataCache[activeTab];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}>
              <FileText style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Reports</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Pre-built analytical reports — export as Excel CSV or print as branded PDF.
          </p>
        </div>
        <button onClick={handleRefresh} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8', cursor: 'pointer'
        }}>
          <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 0, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: '10px 10px 0 0', fontSize: 13, fontWeight: 600,
              background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              borderBottom: active ? '1px solid rgba(14,14,22,1)' : '1px solid transparent',
              color: active ? '#a5b4fc' : '#64748b',
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1
            }}>
              <Icon style={{ width: 14, height: 14 }} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Report content ── */}
      <div style={{
        background: 'rgba(255,255,255,0.025)', borderRadius: '0 14px 14px 14px',
        border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none',
        padding: 28, minHeight: 400
      }}>
        {loading && !data ? <Loading /> : (
          <>
            {activeTab === 'assets'      && <AssetReportPanel       data={data} />}
            {activeTab === 'allocations' && <AllocationReportPanel  data={data} />}
            {activeTab === 'audits'      && <AuditReportPanel       data={data} />}
            {activeTab === 'maintenance' && <MaintenanceReportPanel data={data} />}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
