
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Facility, FacilityTypeDefinition } from '../types';
import FacilityTypeFormModal from '../components/modals/FacilityTypeFormModal';
import { Pagination } from '../components/Shared';

const FacilityTypesPage = ({ facilities, types, setTypes }: { facilities: Facility[], types: FacilityTypeDefinition[], setTypes: (t: FacilityTypeDefinition[]) => void }) => {
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [editingType, setEditingType] = useState<FacilityTypeDefinition | null>(null);
     const [searchQuery, setSearchQuery] = useState('');

     // Pagination
     const [currentPage, setCurrentPage] = useState(1);
     const ITEMS_PER_PAGE = 10;

     useEffect(() => {
        setCurrentPage(1);
     }, [searchQuery]);

     const handleSave = (data: Partial<FacilityTypeDefinition>) => {
        if (editingType) {
            setTypes(types.map(t => t.id === editingType.id ? { ...t, ...data } as FacilityTypeDefinition : t));
        } else {
            const newType = { ...data, id: Date.now().toString(), code: data.name?.toUpperCase().slice(0, 3) } as FacilityTypeDefinition;
            setTypes([...types, newType]);
        }
        setIsModalOpen(false);
        setEditingType(null);
     };
     
     const handleDelete = (id: string) => {
         if(window.confirm('Ջնջե՞լ տեսակը:')) {
             setTypes(types.filter(t => t.id !== id));
         }
     };

     const filteredTypes = useMemo(() => {
        return types.filter(type => 
            type.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
     }, [types, searchQuery]);

     const paginatedTypes = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTypes.slice(start, start + ITEMS_PER_PAGE);
     }, [filteredTypes, currentPage]);

     return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Որոնել տեսակ..." 
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => { setEditingType(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Ավելացնել
                </button>
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm relative">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                        <tr className="text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Անվանում</th>
                            <th className="p-4 font-medium">Քանակ</th>
                            <th className="p-4 font-medium text-right">Գործողություններ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedTypes.length > 0 ? (
                            paginatedTypes.map(type => {
                            const count = facilities.filter(f => f.type === type.code).length;
                            return (
                            <tr key={type.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 font-bold text-gray-900 text-sm">{type.name}</td>
                                <td className="p-4">
                                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-bold border border-blue-100">
                                        {count} օբյեկտ
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => { setEditingType(type); setIsModalOpen(true); }} className="p-1.5 hover:bg-gray-100 text-blue-600 rounded-lg border border-transparent hover:border-blue-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(type.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        )})
                        ) : (
                             <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500 italic">
                                    Նշված անվանումով տեսակներ չեն գտնվել
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredTypes.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
            <FacilityTypeFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingType}
                onSave={handleSave}
            />
        </div>
     );
};

export default FacilityTypesPage;
