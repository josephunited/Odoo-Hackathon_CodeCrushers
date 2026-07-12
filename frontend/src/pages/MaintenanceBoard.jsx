import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Wrench, CheckCircle } from 'lucide-react';

export default function MaintenanceBoard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.maintenance.list();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    const cost = prompt("Enter repair cost (0 if internal):");
    if (cost === null) return;
    try {
      await api.maintenance.complete(id, parseFloat(cost) || 0);
      loadRequests();
    } catch (e) {
      alert('Failed: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="text-primary-400" />
            Maintenance Log
          </h2>
          <p className="text-gray-400 text-sm mt-1">Track and resolve asset repairs.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-950/20 text-gray-400 font-semibold border-b border-white/5">
              <th className="p-4">Asset</th>
              <th className="p-4">Issue Description</th>
              <th className="p-4">Status</th>
              <th className="p-4">Cost</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No maintenance records.</td></tr>
            ) : (
              requests.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-white font-medium">{r.asset.name}</td>
                  <td className="p-4 text-gray-400">{r.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      r.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{r.cost ? `$${r.cost}` : '-'}</td>
                  <td className="p-4 text-right">
                    {r.status !== 'COMPLETED' && (
                      <button onClick={() => handleComplete(r.id)} className="text-emerald-400 hover:text-emerald-300">
                        <CheckCircle className="w-5 h-5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
