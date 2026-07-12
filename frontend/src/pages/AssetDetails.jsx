import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import { 
  ArrowLeft, Edit, Trash2, Calendar, DollarSign, MapPin, 
  User, Send, RefreshCw, QrCode, AlertTriangle, ShieldCheck,
  UserPlus, UserMinus, ArrowLeftRight, Clock, Info
} from 'lucide-react';

export default function AssetDetails({ assetId, setCurrentPage, setEditAssetId }) {
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Modal Form States
  const [activeModal, setActiveModal] = useState(null); // 'allocate' | 'return' | 'transfer' | 'qr'
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('');
  const [transferEmpId, setTransferEmpId] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');
  
  // Submitting States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadAssetDetails();
    loadEmployees();
  }, [assetId]);

  const loadAssetDetails = async () => {
    setLoading(true);
    try {
      const assetData = await api.assets.get(assetId);
      setAsset(assetData);
      
      const historyData = await api.assets.history(assetId);
      setHistory(historyData);
      
      // Load current active allocation if allocated
      const allAllocations = JSON.parse(localStorage.getItem('af_allocations') || '[]');
      const active = allAllocations.filter(al => al.asset.id === parseInt(assetId) && al.status === 'ACTIVE');
      setAllocations(active);
      if (assetData.assetCondition) {
        setReturnCondition(assetData.assetCondition);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const list = await api.employees.list();
      setEmployees(list);
      if (list.length > 0) {
        setSelectedEmpId(list[0].id.toString());
        setTransferEmpId(list[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this asset? This cannot be undone.")) {
      try {
        await api.assets.delete(assetId);
        setCurrentPage('directory');
      } catch (e) {
        alert(e.message || "Failed to delete asset.");
      }
    }
  };

  const handleEdit = () => {
    setEditAssetId(assetId);
    setCurrentPage('register');
  };

  const openModal = (type) => {
    setErrorMsg('');
    setSuccessMsg('');
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedEmpId(employees[0]?.id.toString() || '');
    setTransferEmpId(employees[0]?.id.toString() || '');
    setExpectedReturnDate('');
    setReturnNotes('');
    setTransferRemarks('');
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const emp = employees.find(x => x.id === parseInt(selectedEmpId));
      await api.assets.allocate({
        assetId: parseInt(assetId),
        employeeId: parseInt(selectedEmpId),
        employeeName: emp?.name,
        allocatedBy: 'Sooraj S', // Logged in user
        expectedReturnDate: expectedReturnDate || null
      });
      setSuccessMsg('Asset allocated successfully!');
      setTimeout(() => {
        closeModal();
        loadAssetDetails();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to allocate asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.assets.return({
        assetId: parseInt(assetId),
        returnConditionNotes: returnNotes,
        actualCondition: returnCondition || null,
        performedBy: 'Sooraj S'
      });
      setSuccessMsg('Asset returned successfully!');
      setTimeout(() => {
        closeModal();
        loadAssetDetails();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const emp = employees.find(x => x.id === parseInt(transferEmpId));
      await api.assets.requestTransfer({
        assetId: parseInt(assetId),
        toEmployeeId: parseInt(transferEmpId),
        toEmployeeName: emp?.name,
        requestedBy: 'Sooraj S',
        remarks: transferRemarks
      });
      setSuccessMsg('Transfer request submitted successfully!');
      setTimeout(() => {
        closeModal();
        loadAssetDetails();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to request transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
        <p className="text-xs text-gray-400">Loading asset dashboard...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-white">Asset Profile Missing</h3>
        <button onClick={() => setCurrentPage('directory')} className="mt-4 px-4 py-2 bg-primary-600 rounded-xl text-xs font-semibold text-white">
          Back to Directory
        </button>
      </div>
    );
  }

  const activeAllocation = allocations[0];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => setCurrentPage('directory')}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors py-1 pl-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('qr')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/5 transition-all text-xs font-medium"
          >
            <QrCode className="w-3.5 h-3.5" />
            Badge QR
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/5 transition-all text-xs font-medium"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-500/10 transition-all text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Asset
          </button>
        </div>
      </div>

      {/* Asset Header Info Card */}
      <div className="glass-panel p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start relative overflow-hidden">
        
        {/* Device Image Box */}
        <div className="h-56 md:h-full min-h-[220px] rounded-2xl overflow-hidden bg-gray-950/40 relative border border-white/5">
          {asset.imageUrl ? (
            <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Info className="w-10 h-10 text-gray-700" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-gray-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <span className="font-mono text-xs font-bold text-white tracking-wider">{asset.assetTag}</span>
          </div>
        </div>

        {/* Basic specifications */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">{asset.category}</span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{asset.name}</h3>
              <p className="text-xs text-gray-400">
                Serial Identifier: <span className="font-semibold text-gray-300 font-mono">{asset.serialNumber}</span>
              </p>
            </div>
            <StatusBadge status={asset.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-gray-500" /> Location
              </span>
              <span className="text-sm font-semibold text-white truncate block">{asset.location}</span>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-gray-500" /> Purchase Date
              </span>
              <span className="text-sm font-semibold text-white block">{asset.purchaseDate}</span>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-gray-500" /> Valuation Cost
              </span>
              <span className="text-sm font-semibold text-white block">${asset.purchaseCost.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-500" /> Condition
              </span>
              <span className="text-sm font-bold text-primary-400 block">{asset.assetCondition}</span>
            </div>
          </div>

          {/* Allocation Actions Block */}
          <div className="bg-gray-950/20 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Allocation Status</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {asset.status === 'ALLOCATED' && activeAllocation
                    ? `Allocated to ${activeAllocation.employeeName}`
                    : `Asset is currently ${asset.status.replace('_', ' ').toLowerCase()}`
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              {asset.status === 'AVAILABLE' && (
                <button
                  onClick={() => openModal('allocate')}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary-600/20 transition-all w-full sm:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Allocate Resource
                </button>
              )}

              {asset.status === 'ALLOCATED' && (
                <>
                  <button
                    onClick={() => openModal('transfer')}
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/5 text-xs font-semibold transition-all w-full sm:w-auto"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Request Transfer
                  </button>
                  <button
                    onClick={() => openModal('return')}
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all w-full sm:w-auto"
                  >
                    <UserMinus className="w-4 h-4" />
                    Mark Returned
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic columns: Active Assignment on Left, History Audit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Col: Active Assignment details if allocated */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" />
              Active Assignment details
            </h3>

            {asset.status === 'ALLOCATED' && activeAllocation ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                    {activeAllocation.employeeName.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeAllocation.employeeName}</h4>
                    <p className="text-[11px] text-gray-400">Employee ID: {activeAllocation.employeeId}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Allocation Date</span>
                    <span className="text-gray-300 font-semibold">{activeAllocation.allocationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Expected Return</span>
                    <span className="text-gray-300 font-semibold">{activeAllocation.expectedReturnDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Allocated By</span>
                    <span className="text-gray-300 font-semibold">{activeAllocation.allocatedBy}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-500">
                Asset is not currently allocated to any employee.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Timeline history logs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" />
              Audit Log Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-white/5 space-y-6 py-2">
              {history.map((log, idx) => (
                <div key={log.id || idx} className="relative group">
                  {/* Timeline point */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-primary-500 ring-4 ring-primary-500/10 group-hover:scale-110 transition-transform" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-wider text-primary-400">
                        {log.actionType}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {new Date(log.actionDate).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-medium">{log.details}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Performed by: {log.performedBy}</p>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-500">
                  No actions logged for this asset.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ALLOCATE MODAL */}
      {activeModal === 'allocate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form onSubmit={handleAllocate} className="w-full max-w-md glass-panel p-6 rounded-2xl border border-cardborder animate-fade-in space-y-5">
            <h3 className="font-bold text-lg text-white">Allocate Asset Tag {asset.assetTag}</h3>
            
            {errorMsg && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg">{successMsg}</p>}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Assign Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Expected Return Date (Optional)</label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={e => setExpectedReturnDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl text-xs font-semibold border border-white/5">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary-600/20">
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                Confirm Allocation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RETURN MODAL */}
      {activeModal === 'return' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form onSubmit={handleReturn} className="w-full max-w-md glass-panel p-6 rounded-2xl border border-cardborder animate-fade-in space-y-5">
            <h3 className="font-bold text-lg text-white">Process Asset Return</h3>
            
            {errorMsg && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg">{successMsg}</p>}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Condition on Return</label>
                <select
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                >
                  <option value="NEW">New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Condition Notes / Remarks</label>
                <textarea
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  rows="3"
                  placeholder="Note any physical damage, keyboard wear, missing cords..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl text-xs font-semibold border border-white/5">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20">
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                Confirm Return
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRANSFER REQUEST MODAL */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form onSubmit={handleTransferRequest} className="w-full max-w-md glass-panel p-6 rounded-2xl border border-cardborder animate-fade-in space-y-5">
            <h3 className="font-bold text-lg text-white">Request Asset Transfer</h3>
            
            {errorMsg && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg">{successMsg}</p>}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Transfer To Employee</label>
                <select
                  value={transferEmpId}
                  onChange={e => setTransferEmpId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase">Transfer Reason / Remarks</label>
                <textarea
                  value={transferRemarks}
                  onChange={e => setTransferRemarks(e.target.value)}
                  rows="3"
                  placeholder="Specify why this asset is being transferred..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl text-xs font-semibold border border-white/5">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary-600/20">
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QR MODAL CONTAINER */}
      <QRModal asset={asset} isOpen={activeModal === 'qr'} onClose={closeModal} />

    </div>
  );
}
