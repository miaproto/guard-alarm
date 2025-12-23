
import React, { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { ServiceVehicle } from '../../types';
import { DEPARTMENTS } from '../../mockData';

const VehicleFormModal = ({
  isOpen,
  onClose,
  initialData,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: ServiceVehicle | null;
  onSave: (data: Partial<ServiceVehicle>) => void;
}) => {
  const [formData, setFormData] = useState<Partial<ServiceVehicle>>({
      name: '',
      plateNumber: '',
      brand: '',
      department: 'Kentron',
      isArchived: false,
      gpsImei: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
      if (initialData) {
          setFormData(initialData);
      } else {
          setFormData({ name: '', plateNumber: '', brand: '', department: 'Kentron', isArchived: false, gpsImei: '' });
      }
  }, [initialData, isOpen]);

  const handlePlateSearch = () => {
      if (!formData.plateNumber) return;
      setIsSearching(true);
      // Simulate API call
      setTimeout(() => {
          setIsSearching(false);
          const mockBrands = ['Toyota Corolla', 'Skoda Octavia', 'Kia Forte', 'Hyundai Elantra'];
          const randomBrand = mockBrands[Math.floor(Math.random() * mockBrands.length)];
          setFormData(prev => ({ ...prev, brand: randomBrand }));
      }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.plateNumber || !formData.department) {
          alert('Լրացրեք պարտադիր դաշտերը (Անվանում, Պետ. համարանիշ, Բաժին)');
          return;
      }
      onSave(formData);
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-900">{initialData ? 'Խմբագրել Ավտոմեքենան' : 'Ավելացնել Ավտոմեքենա'}</h3>
                  <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Անվանում <span className="text-red-500">*</span></label>
                      <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Օր.՝ Y0101"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Պետ. համարանիշ <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none uppercase font-mono"
                              value={formData.plateNumber}
                              onChange={e => setFormData({...formData, plateNumber: e.target.value})}
                              placeholder="00 AA 000"
                          />
                          <button 
                              type="button" 
                              onClick={handlePlateSearch}
                              disabled={isSearching || !formData.plateNumber}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Որոնել"
                          >
                              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                          </button>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Մակնիշ</label>
                      <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 outline-none cursor-not-allowed"
                          value={formData.brand}
                          readOnly
                          placeholder="Ավտոմատ լրացվում է որոնումից հետո"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Պահպանության բաժին</label>
                      <select 
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          value={formData.department}
                          onChange={e => setFormData({...formData, department: e.target.value})}
                      >
                          {Object.entries(DEPARTMENTS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IMEI կոդ</label>
                      <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                          value={formData.gpsImei || ''}
                          onChange={e => setFormData({...formData, gpsImei: e.target.value})}
                          placeholder="15 նիշանոց կոդ"
                      />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Չեղարկել</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm">Պահպանել</button>
                  </div>
              </form>
          </div>
      </div>
  );
};

export default VehicleFormModal;
