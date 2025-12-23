
import React from 'react';
import { X, Map as MapIcon, MapPin } from 'lucide-react';
import { Alarm } from '../../types';

const LocationMapModal = ({ isOpen, onClose, alarm }: { isOpen: boolean, onClose: () => void, alarm: Alarm | null }) => {
  if (!isOpen || !alarm) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full h-[600px] flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
             <div>
                 <h3 className="font-bold text-gray-900">{alarm.facilityName}</h3>
                 <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {alarm.address}</p>
             </div>
             <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-900" /></button>
          </div>
          <div className="flex-1 bg-gray-100 relative flex flex-col items-center justify-center group">
             <MapIcon className="w-24 h-24 text-gray-300 mb-4" />
             <p className="text-gray-500 font-medium">Քարտեզի ինտեգրում (Google Maps / Yandex Maps)</p>
             <p className="text-xs text-gray-400 mt-2">Կոորդինատներ: {alarm.coordinates.x}, {alarm.coordinates.y}</p>
             
             {/* Mock Marker */}
             <div className="absolute top-1/2 left-1/2 -mt-16 -ml-4 animate-bounce">
                <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg" />
             </div>
          </div>
       </div>
    </div>
  );
};

export default LocationMapModal;
