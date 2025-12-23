
import React, { useMemo } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { Alarm, Unit } from '../../types';
import { DEPARTMENTS } from '../../mockData';
import MapLibreMap from '../MapLibreMap';

const UnitMapModal = ({ 
  isOpen, 
  onClose, 
  alarm, 
  units, 
  onAssign, 
  onUnassign 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  alarm: Alarm | null; 
  units: Unit[]; 
  onAssign: (unitId: string) => void;
  onUnassign: (unitId: string) => void;
}) => {
  if (!isOpen || !alarm) return null;

  const relevantUnits = units.filter(u => u.department === alarm.department || u.id === alarm.assignedUnitId);

  const markers = useMemo(() => {
    const allMarkers = [];

    // Add facility marker
    allMarkers.push({
      id: `facility-${alarm.id}`,
      coordinates: alarm.coordinates,
      element: (
        <div className="relative">
          <div className="absolute -inset-4 bg-red-500/30 rounded-full animate-ping"></div>
          <div className="relative z-10 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
             <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
      )
    });

    // Add unit markers
    relevantUnits.forEach(unit => {
      const isAssigned = unit.id === alarm.assignedUnitId;
      allMarkers.push({
        id: `unit-${unit.id}`,
        coordinates: unit.coordinates,
        element: (
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-xl ${isAssigned ? 'bg-blue-600 border-white' : unit.status === 'AVAILABLE' ? 'bg-green-600 border-white' : 'bg-gray-500 border-white'}`}>
                <Navigation className={`w-5 h-5 text-white ${isAssigned ? 'fill-current' : ''}`} />
            </div>
            <div className="mt-1 bg-white/90 text-xs px-2 py-1 rounded text-gray-800 border border-gray-200 shadow-sm">
              {unit.name}
            </div>
          </div>
        )
      });
    });

    return allMarkers;
  }, [alarm, relevantUnits]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl border border-gray-200 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Կցել Կարգախումբ - {alarm.facilityName}</h3>
            <p className="text-sm text-gray-500">{alarm.address}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 flex">
          {/* Map Area */}
          <div className="flex-1">
            <MapLibreMap 
              markers={markers}
              center={alarm.coordinates}
              zoom={13}
              height="100%"
            />
          </div>

          {/* Sidebar Unit List */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
             <div className="p-4 border-b border-gray-200">
               <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Հասանելի Կարգախմբեր</h4>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {relevantUnits.length > 0 ? (
                 relevantUnits.map(unit => {
                   const isAssigned = unit.id === alarm.assignedUnitId;
                   return (
                     <div key={unit.id} className={`p-3 rounded-lg border flex items-center justify-between ${isAssigned ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                        <div>
                          <div className="font-medium text-gray-900">{unit.name}</div>
                          <div className="text-xs text-gray-500">{DEPARTMENTS[unit.department]}</div>
                        </div>
                        {isAssigned ? (
                          <button onClick={() => onUnassign(unit.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs rounded border border-red-200 transition-colors">
                            Հետ կանչել
                          </button>
                        ) : (
                          <button 
                            onClick={() => onAssign(unit.id)} 
                            disabled={unit.status !== 'AVAILABLE'}
                            className={`px-3 py-1 text-xs rounded transition-colors ${unit.status === 'AVAILABLE' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          >
                            Կցել
                          </button>
                        )}
                     </div>
                   );
                 })
               ) : (
                 <div className="text-center text-gray-500 text-sm py-8">
                   Հասանելի կարգախմբեր չկան այս բաժնում
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitMapModal;
