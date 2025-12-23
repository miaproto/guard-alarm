
import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Facility } from '../../types';
import MapLibreMap from '../MapLibreMap';

const FacilityLocationMapModal = ({ 
  isOpen, 
  onClose, 
  facility
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  facility: Facility | null; 
}) => {
  if (!isOpen || !facility) return null;

  const markers = [{
    id: facility.id,
    coordinates: facility.coordinates,
    element: (
      <div className="relative group/pin">
        <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-pulse-slow"></div>
        <div className="relative z-10 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white">
          <MapPin className="w-5 h-5 text-white" />
        </div>
      </div>
    )
  }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl border border-gray-200 flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Օբյեկտի Տեղորոշում
            </h3>
            <p className="text-sm text-gray-500 font-medium">{facility.name}</p>
            <p className="text-xs text-gray-400 mt-1">{facility.address}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Կոորդինատներ: {facility.coordinates.lat.toFixed(6)}, {facility.coordinates.lng.toFixed(6)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1">
          <MapLibreMap 
            markers={markers}
            center={facility.coordinates}
            zoom={15}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default FacilityLocationMapModal;
