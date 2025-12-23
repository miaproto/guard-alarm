
import React from 'react';
import { X } from 'lucide-react';
import { Coordinates } from '../../types';

const AddressSelectorModal = ({ 
    isOpen, 
    onClose, 
    onSelect 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (coords: Coordinates, address: string) => void 
  }) => {
    if (!isOpen) return null;
  
    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      const mockAddress = `Ընտրված կետ (${x.toFixed(2)}, ${y.toFixed(2)})`;
      const confirm = window.confirm(`Հաստատե՞լ ընտրված հասցեն:\n${mockAddress}`);
      if (confirm) {
        onSelect({ x, y }, mockAddress);
        onClose();
      }
    };
  
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-3xl h-[70vh] rounded-2xl border border-gray-200 flex flex-col shadow-2xl overflow-hidden relative">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
             <h3 className="text-lg font-bold text-gray-900">Նշեք հասցեն քարտեզի վրա</h3>
             <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
          </div>
          <div className="flex-1 bg-gray-100 relative group cursor-crosshair" onClick={handleMapClick}>
             <div className="absolute inset-0 opacity-10" style={{
                 backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-bold text-xl opacity-20 uppercase tracking-widest">
                 Սեղմեք քարտեզին ընտրելու համար
             </div>
          </div>
        </div>
      </div>
    );
};

export default AddressSelectorModal;
