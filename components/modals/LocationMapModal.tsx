
import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Alarm } from '../../types';
import MapLibreMap from '../MapLibreMap';

const LocationMapModal = ({ isOpen, onClose, alarm }: { isOpen: boolean, onClose: () => void, alarm: Alarm | null }) => {
  if (!isOpen || !alarm) return null;
  
  const markers = [{
    id: alarm.id,
    coordinates: alarm.coordinates,
    element: (
      <div className="relative">
        <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg animate-bounce" />
      </div>
    )
  }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full h-[600px] flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
             <div>
                 <h3 className="font-bold text-gray-900">{alarm.facilityName}</h3>
                 <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                   <MapPin className="w-3 h-3" /> {alarm.address}
                 </p>
                 <p className="text-xs text-gray-400 mt-1">
                   Կոորդինատներ: {alarm.coordinates.lat.toFixed(6)}, {alarm.coordinates.lng.toFixed(6)}
                 </p>
             </div>
             <button onClick={onClose}>
               <X className="w-5 h-5 text-gray-400 hover:text-gray-900" />
             </button>
          </div>
          <div className="flex-1">
             <MapLibreMap 
               markers={markers}
               center={alarm.coordinates}
               zoom={15}
               height="100%"
             />
          </div>
       </div>
    </div>
  );
};

export default LocationMapModal;
