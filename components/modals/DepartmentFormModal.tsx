
import React, { useState, useEffect } from 'react';
import { X, Map as MapIcon } from 'lucide-react';
import { SecurityDepartment } from '../../types';
import AddressSelectorModal from './AddressSelectorModal';

const DepartmentFormModal = ({
      isOpen,
      onClose,
      initialData,
      onSave
  }: {
      isOpen: boolean;
      onClose: () => void;
      initialData: SecurityDepartment | null;
      onSave: (data: Partial<SecurityDepartment>) => void;
  }) => {
      const [formData, setFormData] = useState<Partial<SecurityDepartment>>({
          name: '',
          address: '',
          contactPerson: '',
          contactPhone: '',
          isArchived: false,
          coordinates: { x: 50, y: 50 }
      });
      const [isMapOpen, setIsMapOpen] = useState(false);
  
      useEffect(() => {
          if (initialData) {
              setFormData(initialData);
          } else {
              setFormData({ name: '', address: '', contactPerson: '', contactPhone: '', isArchived: false, coordinates: { x: 50, y: 50 } });
          }
      }, [initialData, isOpen]);
  
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!formData.name) return alert('Անվանումը պարտադիր է');
          onSave(formData);
      };
  
      if (!isOpen) return null;
  
      return (
          <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg text-gray-900">{initialData ? 'Խմբագրել Բաժինը' : 'Ավելացնել Բաժին'}</h3>
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
                              placeholder="Օր.՝ Կենտրոն"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Հասցե</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  readOnly
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-pointer hover:bg-gray-100"
                                  value={formData.address}
                                  onClick={() => setIsMapOpen(true)}
                                  placeholder="Սեղմեք՝ քարտեզից ընտրելու համար"
                              />
                              <button type="button" onClick={() => setIsMapOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100">
                                  <MapIcon className="w-5 h-5" />
                              </button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Կոնտակտային անձ</label>
                          <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              value={formData.contactPerson}
                              onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Կոնտակտային հեռախոսահամար</label>
                          <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              value={formData.contactPhone}
                              onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                          />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Չեղարկել</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm">Պահպանել</button>
                      </div>
                  </form>
              </div>
          </div>
          <AddressSelectorModal 
              isOpen={isMapOpen} 
              onClose={() => setIsMapOpen(false)} 
              onSelect={(coords, address) => {
                  setFormData({...formData, coordinates: coords, address: address});
              }}
          />
          </>
      );
};

export default DepartmentFormModal;
