import React, { useRef } from 'react';
import { X, QrCode, Printer, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRModal({ asset, isOpen, onClose }) {
  if (!isOpen || !asset) return null;
  
  const qrRef = useRef(null);

  const qrValue = `assetflow://asset/${asset.id}`;
  const renderMockQRGrid = () => {
    return (
      <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
        <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
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
