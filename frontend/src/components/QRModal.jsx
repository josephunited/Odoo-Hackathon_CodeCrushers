import React, { useRef } from 'react';
import { X, QrCode, Printer, Download } from 'lucide-react';

export default function QRModal({ asset, isOpen, onClose }) {
  if (!isOpen || !asset) return null;
  
  const qrRef = useRef(null);

  // Generate a premium faux-QR code grid based on the asset's attributes
  const renderMockQRGrid = () => {
    const size = 21; // 21x21 QR matrix
    const grid = [];
    const seed = asset.assetTag.charCodeAt(3) + asset.serialNumber.charCodeAt(0);
    
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        // Standard QR code position detection patterns (corners)
        const isFinderPattern = 
          (r < 7 && c < 7) || // Top-left
          (r < 7 && c >= size - 7) || // Top-right
          (r >= size - 7 && c < 7); // Bottom-left
          
        if (isFinderPattern) {
          // Render finder pattern box outline & center dot
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6 || 
                           (r < 7 && c === size - 7) || (r < 7 && c === size - 1) ||
                           (r === 0 && c >= size - 7) || (r === 6 && c >= size - 7) ||
                           (r === size - 7 && c < 7) || (r === size - 1 && c < 7) ||
                           (r >= size - 7 && c === 0) || (r >= size - 7 && c === 6);
          const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                           (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
                           (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4);
                           
          row.push(isBorder || isCenter);
        } else {
          // Faux-random matrix based on coordinates and asset attributes
          const hash = Math.sin(r * 12.9898 + c * 78.233 + seed) * 43758.5453;
          row.push((hash - Math.floor(hash)) > 0.45);
        }
      }
      grid.push(row);
    }
    
    return (
      <div 
        className="grid gap-[1px] bg-white p-4 rounded-xl border border-gray-200 shadow-md"
        style={{ gridTemplateColumns: 'repeat(21, minmax(0, 1fr))' }}
      >
        {grid.flatMap((row, r) => 
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`} 
              className={`w-2.5 h-2.5 rounded-[1px] ${cell ? 'bg-gray-900' : 'bg-transparent'}`} 
            />
          ))
        )}
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm glass-panel rounded-2xl overflow-hidden shadow-2xl border border-cardborder animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-lg text-white">Generate Asset QR Badge</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge Card for Printing */}
        <div className="p-6 flex flex-col items-center justify-center bg-gray-950/40 text-center">
          <div 
            ref={qrRef} 
            className="bg-white text-gray-900 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-xl border border-white/10 w-full max-w-[280px]"
          >
            {/* QR Matrix */}
            {renderMockQRGrid()}
            
            {/* Tag details */}
            <div className="w-full">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-0.5">Asset Tag</p>
              <h4 className="text-xl font-bold text-gray-900 tracking-wider mb-2 font-mono">{asset.assetTag}</h4>
              <div className="border-t border-gray-100 pt-2 text-left">
                <p className="text-[10px] text-gray-500 font-semibold truncate uppercase">{asset.name}</p>
                <p className="text-[9px] text-gray-400 truncate">S/N: {asset.serialNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/5 flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-medium text-sm"
          >
            <Printer className="w-4 h-4" />
            Print Badge
          </button>
          <button 
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition-all font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            Save Code
          </button>
        </div>

      </div>
    </div>
  );
}
