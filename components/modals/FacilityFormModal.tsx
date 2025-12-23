
import React, { useState, useEffect } from 'react';
import { X, Map as MapIcon, Plus, Minus, Lock } from 'lucide-react';
import { Facility, FacilityTypeDefinition, SecurityDepartment, Department } from '../../types';
import { DEPARTMENTS, WEEK_DAYS } from '../../mockData';
import AddressSelectorModal from './AddressSelectorModal';

const FacilityFormModal = ({
    isOpen,
    onClose,
    initialData,
    onSave,
    types,
    departments
  }: {
    isOpen: boolean;
    onClose: () => void;
    initialData: Facility | null;
    onSave: (data: Partial<Facility>) => void;
    types: FacilityTypeDefinition[];
    departments?: SecurityDepartment[];
  }) => {
    const [formData, setFormData] = useState<Partial<Facility>>({
      id: '',
      name: '',
      type: '',
      department: 'Kentron',
      address: '',
      contactPerson: '',
      phones: [''],
      password: '',
      scheduleConfig: {
        'Mon': { start: '09:00', end: '18:00', active: true },
        'Tue': { start: '09:00', end: '18:00', active: true },
        'Wed': { start: '09:00', end: '18:00', active: true },
        'Thu': { start: '09:00', end: '18:00', active: true },
        'Fri': { start: '09:00', end: '18:00', active: true },
        'Sat': { start: '10:00', end: '16:00', active: false },
        'Sun': { start: '10:00', end: '16:00', active: false },
      },
      coordinates: { x: 50, y: 50 },
      isArmed: false,
      connectionStatus: 'ONLINE'
    });
    const [isMapOpen, setIsMapOpen] = useState(false);

    useEffect(() => {
      if (initialData) {
        setFormData({
          ...initialData,
          phones: initialData.phones.length > 0 ? initialData.phones : [''],
          scheduleConfig: initialData.scheduleConfig || {
             'Mon': { start: '09:00', end: '18:00', active: true },
             'Tue': { start: '09:00', end: '18:00', active: true },
             'Wed': { start: '09:00', end: '18:00', active: true },
             'Thu': { start: '09:00', end: '18:00', active: true },
             'Fri': { start: '09:00', end: '18:00', active: true },
             'Sat': { start: '10:00', end: '16:00', active: false },
             'Sun': { start: '10:00', end: '16:00', active: false },
          }
        });
      } else {
        setFormData({
          id: '',
          name: '',
          type: types[0]?.code || '',
          department: 'Kentron',
          address: '',
          contactPerson: '',
          phones: [''],
          password: '',
          coordinates: { x: 50, y: 50 },
          scheduleConfig: {
            'Mon': { start: '09:00', end: '18:00', active: true },
            'Tue': { start: '09:00', end: '18:00', active: true },
            'Wed': { start: '09:00', end: '18:00', active: true },
            'Thu': { start: '09:00', end: '18:00', active: true },
            'Fri': { start: '09:00', end: '18:00', active: true },
            'Sat': { start: '10:00', end: '16:00', active: false },
            'Sun': { start: '10:00', end: '16:00', active: false },
          },
          isArmed: false,
          connectionStatus: 'ONLINE'
        });
      }
    }, [initialData, isOpen, types]);

    const handlePhoneChange = (index: number, value: string) => {
      const newPhones = [...(formData.phones || [])];
      newPhones[index] = value;
      setFormData({ ...formData, phones: newPhones });
    };

    const addPhone = () => {
      setFormData({ ...formData, phones: [...(formData.phones || []), ''] });
    };

    const removePhone = (index: number) => {
      const newPhones = [...(formData.phones || [])];
      newPhones.splice(index, 1);
      setFormData({ ...formData, phones: newPhones });
    };

    const handleScheduleChange = (day: string, field: 'start' | 'end' | 'active', value: any) => {
        const currentConfig = formData.scheduleConfig || {};
        setFormData({
            ...formData,
            scheduleConfig: {
                ...currentConfig,
                [day]: { ...currentConfig[day], [field]: value }
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.id || !formData.name || !formData.type || !formData.department) {
          alert('Խնդրում ենք լրացնել պարտադիր դաշտերը (Կոդ, Անվանում, Տեսակ, Բաժին)');
          return;
      }
      
      let scheduleStr = "Գրաֆիկը սահմանված է";
      
      onSave({
          ...formData,
          schedule: scheduleStr,
          phones: formData.phones?.filter(p => p.trim() !== '') || []
      });
    };

    if (!isOpen) return null;

    return (
      <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
            <h3 className="font-bold text-lg text-gray-900">{initialData ? 'Խմբագրել Օբյեկտը' : 'Ավելացնել Օբյեկտ'}</h3>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">Հիմնական Տվյալներ</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Կոդ <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                value={formData.id}
                                onChange={e => setFormData({...formData, id: e.target.value})}
                                placeholder="OBJ-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Տեսակ <span className="text-red-500">*</span></label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="">Ընտրել...</option>
                                {types.map(t => <option key={t.id} value={t.code}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Անվանում <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="Օր.՝ Ամերիաբանկ"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Պահպանության բաժին <span className="text-red-500">*</span></label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.department}
                            onChange={e => setFormData({...formData, department: e.target.value as Department})}
                        >
                            {departments 
                              ? departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)
                              : Object.entries(DEPARTMENTS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Գաղտնաբառ (Նույնականացման)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder="*****"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">Կոնտակտային Տվյալներ</h4>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Հեռախոսահամարներ</label>
                            <div className="space-y-2">
                                {formData.phones?.map((phone, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={phone}
                                            onChange={e => handlePhoneChange(idx, e.target.value)}
                                            placeholder="+374..."
                                        />
                                        {idx === (formData.phones?.length || 0) - 1 ? (
                                            <button type="button" onClick={addPhone} className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button type="button" onClick={() => removePhone(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">Պահպանության Գրաֆիկ</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {Object.entries(WEEK_DAYS).map(([dayKey, dayLabel]) => {
                                const dayConfig = formData.scheduleConfig?.[dayKey] || { start: '', end: '', active: false };
                                return (
                                    <div key={dayKey} className={`flex items-center gap-3 p-2 rounded-lg border ${dayConfig.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="w-16 flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={dayConfig.active}
                                                onChange={e => handleScheduleChange(dayKey, 'active', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className={`text-sm font-medium ${dayConfig.active ? 'text-gray-900' : 'text-gray-400'}`}>{dayLabel}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1">
                                            <input 
                                                type="time" 
                                                className={`w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none ${!dayConfig.active && 'bg-gray-100 text-gray-400'}`}
                                                value={dayConfig.start}
                                                onChange={e => handleScheduleChange(dayKey, 'start', e.target.value)}
                                                disabled={!dayConfig.active}
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input 
                                                type="time" 
                                                className={`w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none ${!dayConfig.active && 'bg-gray-100 text-gray-400'}`}
                                                value={dayConfig.end}
                                                onChange={e => handleScheduleChange(dayKey, 'end', e.target.value)}
                                                disabled={!dayConfig.active}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-white font-medium">Չեղարկել</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm font-medium">Պահպանել</button>
          </div>
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

export default FacilityFormModal;
