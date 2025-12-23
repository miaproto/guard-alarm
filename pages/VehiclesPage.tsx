
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Archive, RotateCcw, X, CheckCircle, Search, Filter } from 'lucide-react';
import { ServiceVehicle } from '../types';
import { DEPARTMENTS } from '../mockData';
import VehicleFormModal from '../components/modals/VehicleFormModal';
import { Pagination } from '../components/Shared';

const VehiclesPage = ({ vehicles, setVehicles }: { vehicles: ServiceVehicle[], setVehicles: (v: ServiceVehicle[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<ServiceVehicle | null>(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [filterBrand, setFilterBrand] = useState('all');
    const [filterArchived, setFilterArchived] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterDepartment, filterBrand, filterArchived]);

    const handleSave = (data: Partial<ServiceVehicle>) => {
        if (editingVehicle) {
            setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...v, ...data } as ServiceVehicle : v));
        } else {
            const newVehicle = { 
                ...data, 
                id: `V-${Date.now()}`,
            } as ServiceVehicle;
            setVehicles([...vehicles, newVehicle]);
        }
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Ջնջե՞լ մեքենան:')) {
            setVehicles(vehicles.filter(v => v.id !== id));
        }
    };

    const handleArchiveToggle = (vehicle: ServiceVehicle) => {
        const confirmMsg = vehicle.isArchived 
            ? 'Վերականգնե՞լ մեքենան արխիվից:' 
            : 'Արխիվացնե՞լ մեքենան:';
            
        if(window.confirm(confirmMsg)) {
            setVehicles(vehicles.map(v => v.id === vehicle.id ? { ...v, isArchived: !v.isArchived } : v));
        }
    };

    const clearFilters = () => {
        setFilterDepartment('all');
        setFilterBrand('all');
        setFilterArchived('all');
    };

    // Calculate unique brands from current vehicles list
    const uniqueBrands = useMemo(() => {
        const brands = new Set(vehicles.map(v => v.brand).filter(Boolean));
        return Array.from(brands).sort();
    }, [vehicles]);

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            // Search Filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const matchesSearch = 
                    vehicle.name.toLowerCase().includes(term) ||
                    vehicle.plateNumber.toLowerCase().includes(term) ||
                    (vehicle.gpsImei && vehicle.gpsImei.includes(term));
                
                if (!matchesSearch) return false;
            }

            // Department Filter
            if (filterDepartment !== 'all' && vehicle.department !== filterDepartment) return false;

            // Brand Filter
            if (filterBrand !== 'all' && vehicle.brand !== filterBrand) return false;

            // Archived Filter
            if (filterArchived !== 'all') {
                const isArchivedBool = filterArchived === 'yes';
                if (vehicle.isArchived !== isArchivedBool) return false;
            }

            return true;
        });
    }, [vehicles, filterDepartment, filterBrand, filterArchived, searchTerm]);

    const paginatedVehicles = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredVehicles, currentPage]);

    const isFiltersActive = filterDepartment !== 'all' || filterBrand !== 'all' || filterArchived !== 'all';

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0 gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Որոնել մեքենա..." 
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
                        onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
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
                            <label className="text-xs text-gray-500 font-medium ml-1">Պահպանության բաժին</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-blue-500 outline-none transition-colors"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <option value="all">Բոլորը</option>
                                {Object.entries(DEPARTMENTS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-medium ml-1">Մակնիշ</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-blue-500 outline-none transition-colors"
                                value={filterBrand}
                                onChange={(e) => setFilterBrand(e.target.value)}
                            >
                                <option value="all">Բոլորը</option>
                                {uniqueBrands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
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
                            <th className="p-4 font-medium">Անվանում (Բորտ)</th>
                            <th className="p-4 font-medium">Պետ. Համարանիշ</th>
                            <th className="p-4 font-medium">Մակնիշ</th>
                            <th className="p-4 font-medium">Բաժին</th>
                            <th className="p-4 font-medium">IMEI կոդ</th>
                            <th className="p-4 font-medium">Արխիվացված</th>
                            <th className="p-4 font-medium text-right">Գործողություններ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedVehicles.length > 0 ? (
                            paginatedVehicles.map(vehicle => (
                            <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 font-bold text-blue-600 text-sm">{vehicle.name}</td>
                                <td className="p-4 font-mono text-gray-900 text-sm">{vehicle.plateNumber}</td>
                                <td className="p-4 text-sm text-gray-600">{vehicle.brand}</td>
                                <td className="p-4 text-sm text-gray-600">{DEPARTMENTS[vehicle.department]}</td>
                                <td className="p-4">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono border border-gray-200">{vehicle.gpsImei || '-'}</span>
                                </td>
                                <td className="p-4">
                                    {vehicle.isArchived ? (
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
                                        <button onClick={() => { setEditingVehicle(vehicle); setIsModalOpen(true); }} className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg border border-transparent hover:border-gray-200 transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button 
                                            onClick={() => handleArchiveToggle(vehicle)} 
                                            className={`p-1.5 rounded-lg border border-transparent transition-all ${vehicle.isArchived ? 'hover:bg-green-50 text-green-600 hover:border-green-100' : 'hover:bg-orange-50 text-orange-600 hover:border-orange-100'}`}
                                            title={vehicle.isArchived ? "Վերականգնել" : "Արխիվացնել"}
                                        >
                                            {vehicle.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => handleDelete(vehicle.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                    Նշված ֆիլտրերով ավտոմեքենաներ չեն գտնվել
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredVehicles.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
            <VehicleFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingVehicle}
                onSave={handleSave}
            />
        </div>
    );
};

export default VehiclesPage;
