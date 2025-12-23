
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FacilityTypeDefinition } from '../../types';

const FacilityTypeFormModal = ({
    isOpen,
    onClose,
    initialData,
    onSave
  }: {
    isOpen: boolean;
    onClose: () => void;
    initialData: FacilityTypeDefinition | null;
    onSave: (data: Partial<FacilityTypeDefinition>) => void;
  }) => {
    const [formData, setFormData] = useState<Partial<FacilityTypeDefinition>>({ name: '' });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return alert('Անվանումը պարտադիր է');
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-900">{initialData ? 'Խմբագրել Տեսակը' : 'Ավելացնել Տեսակ'}</h3>
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
                            placeholder="Օր.՝ Դպրոց"
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

export default FacilityTypeFormModal;
