
import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Edit2, Trash2, Archive, CheckCircle, RotateCcw, X, Filter, PhoneCall } from 'lucide-react';
import { Facility, FacilityTypeDefinition, SecurityDepartment } from '../types';
import { DEPARTMENTS } from '../mockData';
import FacilityFormModal from '../components/modals/FacilityFormModal';
import FacilityLocationMapModal from '../components/modals/FacilityLocationMapModal';
import { Pagination } from '../components/Shared';
import { SearchableSelect } from '../components/SearchableSelect';

const FacilitiesManagementPage = ({ 
    facilities, 
    setFacilities, 
    types, 
    departments,
    onCall,
}: { 
    facilities: Facility[], 
    setFacilities: (f: Facility[]) => void, 
    types: FacilityTypeDefinition[], 
    departments: SecurityDepartment[],
    onCall: (phone: string, facility: Facility) => void,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Facility | null>(null);

    // Filter States
    const [filterType, setFilterType] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [filterArchived, setFilterArchived] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, filterDepartment, filterArchived]);

    const filtered = facilities.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'all' || f.type === filterType;
        const matchesDept = filterDepartment === 'all' || f.department === filterDepartment;
        
        let matchesArchived = true;
        if (filterArchived === 'yes') matchesArchived = !!f.isArchived;
        if (filterArchived === 'no') matchesArchived = !f.isArchived;

        return matchesSearch && matchesType && matchesDept && matchesArchived;
    });

    const paginatedFacilities = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSave = (data: Partial<Facility>) => {
        if (editingFacility) {
            setFacilities(facilities.map(f => f.id === editingFacility.id ? { ...f, ...data } as Facility : f));
        } else {
             const newFacility = { ...data, connectionStatus: 'ONLINE', isArmed: false } as Facility;
             setFacilities([...facilities, newFacility]);
        }
        setIsModalOpen(false);
        setEditingFacility(null);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Ջնջե՞լ օբյեկտը:')) {
            setFacilities(facilities.filter(f => f.id !== id));
        }
    };

    const handleArchiveToggle = (facility: Facility) => {
        const confirmMsg = facility.isArchived 
            ? 'Վերականգնե՞լ օբյեկտը արխիվից:' 
            : 'Արխիվացնե՞լ օբյեկտը:';
            
        if(window.confirm(confirmMsg)) {
            setFacilities(facilities.map(f => f.id === facility.id ? { ...f, isArchived: !f.isArchived } : f));
        }
    };

    const clearFilters = () => {
        setFilterType('all');
        setFilterDepartment('all');
        setFilterArchived('all');
    };

    const isFiltersActive = filterType !== 'all' || filterDepartment !== 'all' || filterArchived !== 'all';

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0 gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Որոնել օբյեկտ..." 
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border shadow-sm transition-colors ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Ֆիլտրեր
                        {isFiltersActive && (
                            <span className="w-2 h-2 rounded-full bg-red-500 border border-white"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => { setEditingFacility(null); setIsModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Ավելացնել
                    </button>
                </div>
            </div>
            
            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-200 shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-medium ml-1">Տեսակ</label>
                            <SearchableSelect
                                value={filterType}
                                onChange={setFilterType}
                                searchPlaceholder="Որոնել տեսակ..."
                                options={[
                                    { value: 'all', label: 'Բոլորը' },
                                    ...types.map(t => ({ value: t.code, label: t.name }))
                                ]}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-medium ml-1">Պահպանության բաժին</label>
                            <SearchableSelect
                                value={filterDepartment}
                                onChange={setFilterDepartment}
                                searchPlaceholder="Որոնել բաժին..."
                                options={[
                                    { value: 'all', label: 'Բոլորը' },
                                    ...Object.entries(DEPARTMENTS).map(([key, label]) => ({ value: key, label }))
                                ]}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-medium ml-1">Արխիվացված</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-blue-500 outline-none transition-colors"
                                value={filterArchived}
                                onChange={(e) => setFilterArchived(e.target.value)}
                            >
                                <option value="all">Բոլորը</option>
                                <option value="yes">Այո</option>
                                <option value="no">Ոչ</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                        <button 
                            onClick={clearFilters}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Մաքրել ֆիլտրերը
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm relative">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                        <tr className="text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Կոդ</th>
                            <th className="p-4 font-medium">Անվանում</th>
                            <th className="p-4 font-medium">Տեսակ</th>
                            <th className="p-4 font-medium">Բաժին</th>
                            <th className="p-4 font-medium">Հասցե</th>
                            <th className="p-4 font-medium">Կոնտակտ</th>
                            <th className="p-4 font-medium">Արխիվացված</th>
                            <th className="p-4 font-medium text-right">Գործողություններ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedFacilities.length > 0 ? (
                            paginatedFacilities.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 text-xs font-mono text-gray-500">{f.id}</td>
                                <td className="p-4 font-bold text-gray-900 text-sm">{f.name}</td>
                                <td className="p-4 text-sm text-gray-600">{types.find(t => t.code === f.type)?.name || f.type}</td>
                                <td className="p-4 text-sm text-gray-600">{DEPARTMENTS[f.department]}</td>
                                <td className="p-4 text-sm text-gray-600 max-w-[200px]">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedLocation(f)}
                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg border border-transparent hover:border-blue-100 transition-all shrink-0"
                                            title="Տեղորոշում"
                                        >
                                            <MapPin className="w-4 h-4" />
                                        </button>
                                        <span className="truncate" title={f.address}>{f.address}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div className="font-medium">{f.contactPerson}</div>
                                    <div className="mt-0.5 space-y-0.5">
                                      {(f.phones || []).map((phone, idx) => (
                                        <div key={`${f.id}-phone-${idx}`} className="flex items-center gap-2">
                                          <div className="text-xs text-gray-400 font-mono leading-tight">{phone}</div>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              onCall(phone, f);
                                            }}
                                            className="p-1 rounded-md text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors"
                                            title={`Զանգել ${phone}`}
                                          >
                                            <PhoneCall className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {f.isArchived ? (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 inline-flex items-center gap-1">
                                            <Archive className="w-3 h-3" /> Այո
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Ոչ
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => { setEditingFacility(f); setIsModalOpen(true); }} className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg border border-transparent hover:border-gray-200 transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button 
                                            onClick={() => handleArchiveToggle(f)} 
                                            className={`p-1.5 rounded-lg border border-transparent transition-all ${f.isArchived ? 'hover:bg-green-50 text-green-600 hover:border-green-100' : 'hover:bg-orange-50 text-orange-600 hover:border-orange-100'}`}
                                            title={f.isArchived ? "Վերականգնել" : "Արխիվացնել"}
                                        >
                                            {f.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => handleDelete(f.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500 italic">
                                    Նշված ֆիլտրերով օբյեկտներ չեն գտնվել
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filtered.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
            <FacilityFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingFacility}
                onSave={handleSave}
                types={types}
                departments={departments}
            />
            <FacilityLocationMapModal 
                isOpen={!!selectedLocation}
                onClose={() => setSelectedLocation(null)}
                facility={selectedLocation}
            />
        </div>
    );
};

export default FacilitiesManagementPage;
