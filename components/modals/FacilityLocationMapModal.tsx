
import React, { useState } from 'react';
import { X, MapPin, Layers } from 'lucide-react';
import { Facility } from '../../types';

const FacilityLocationMapModal = ({ 
  isOpen, 
  onClose, 
  facility
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  facility: Facility | null; 
}) => {
  const [isSatellite, setIsSatellite] = useState(false);

  if (!isOpen || !facility) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl border border-gray-200 flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Օբյեկտի Տեղորոշում
            </h3>
            <p className="text-sm text-gray-500 font-mono">{facility.address}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
        </div>
        
        <div className="flex-1 relative overflow-hidden group">
          <div className={`absolute inset-0 transition-colors duration-500 ${isSatellite ? 'bg-slate-900' : 'bg-gray-100'}`}>
             {!isSatellite && (
               <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
               }}></div>
             )}
             {isSatellite && (
               <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               }}></div>
             )}
          </div>
          
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" style={{ left: `${facility.coordinates.x}%`, top: `${facility.coordinates.y}%` }}>
              <div className="relative group/pin">
                <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-pulse-slow"></div>
                <div className="relative z-10 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white transform transition-transform group-hover/pin:-translate-y-2">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-9 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600"></div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md text-gray-800 p-3 rounded-xl border border-gray-200 shadow-2xl whitespace-nowrap z-20 min-w-[200px] flex flex-col gap-1 transform scale-95 opacity-0 group-hover/pin:scale-100 group-hover/pin:opacity-100 transition-all duration-200 pointer-events-none">
                  <div className="font-bold text-sm">{facility.name}</div>
                  <div className="text-xs text-gray-500 border-t border-gray-200 pt-1 mt-1">{facility.address}</div>
                  <div className="flex gap-2 mt-1">
                     <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">{facility.coordinates.x.toFixed(4)}, {facility.coordinates.y.toFixed(4)}</span>
                  </div>
                </div>
              </div>
          </div>

          <div className="absolute bottom-6 right-6 z-30">
            <button 
              onClick={() => setIsSatellite(!isSatellite)}
              className="group flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl shadow-lg border border-gray-200 transition-all hover:scale-105 active:scale-95"
            >
               <div className={`p-1 rounded-md ${isSatellite ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                 <Layers className="w-5 h-5" />
               </div>
               <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ռեժիմ</span>
                  <span className="text-sm font-bold">{isSatellite ? 'Արբանյակ (Satellite)' : 'Ստանդարտ (Map)'}</span>
               </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityLocationMapModal;
