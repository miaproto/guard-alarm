
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter, X, Search } from 'lucide-react';
import { Unit, ServiceVehicle } from '../types';
import { DEPARTMENTS } from '../mockData';
import UnitFormModal from '../components/modals/UnitFormModal';
import { Pagination } from '../components/Shared';

const UnitsManagementPage = ({ units, setUnits, vehicles }: { units: Unit[], setUnits: (u: Unit[]) => void, vehicles: ServiceVehicle[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    // Filter States
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStartDate, filterEndDate, filterDepartment, searchQuery]);

    const handleSave = (data: Partial<Unit>) => {
         if (editingUnit) {
            setUnits(units.map(u => u.id === editingUnit.id ? { ...u, ...data } as Unit : u));
        } else {
            const newUnit = { 
                id: `U-${Date.now()}`,
                status: 'AVAILABLE',
                shiftStatus: 'OFF_DUTY',
                statusStartTime: new Date(),
                coordinates: { x: 50, y: 50 },
                isWifiLost: false,
                isGpsLost: false,
                crew: [], 
                shiftStartTime: new Date(), // Fallback
                ...data, // This will overwrite the defaults with data from modal (including shift times and crew)
            } as Unit;
            setUnits([...units, newUnit]);
        }
        setIsModalOpen(false);
        setEditingUnit(null);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Ջնջե՞լ կարգախումբը:')) {
            setUnits(units.filter(u => u.id !== id));
        }
    };

    const clearFilters = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterDepartment('all');
    };

    const filteredUnits = useMemo(() => {
        return units.filter(unit => {
            // Search Query
            if (searchQuery) {
                if (!unit.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }
            }

            // Department Filter
            if (filterDepartment !== 'all' && unit.department !== filterDepartment) {
                return false;
            }

            // Date Range Filter (Based on Shift Start Time)
            if (filterStartDate) {
                const start = new Date(filterStartDate);
                start.setHours(0, 0, 0, 0);
                if (unit.shiftStartTime < start) return false;
            }

            if (filterEndDate) {
                const end = new Date(filterEndDate);
                end.setHours(23, 59, 59, 999);
                if (unit.shiftStartTime > end) return false;
            }

            return true;
        });
    }, [units, filterDepartment, filterStartDate, filterEndDate, searchQuery]);

    const paginatedUnits = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUnits.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUnits, currentPage]);

    const isFiltersActive = filterStartDate || filterEndDate || filterDepartment !== 'all';

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0 gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Որոնել կարգախումբ..." 
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
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
                        onClick={() => { setEditingUnit(null); setIsModalOpen(true); }}
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
                            <label className="text-xs text-gray-500 font-medium ml-1">Սկիզբ (Հերթափոխի)</label>
                            <input 
                                type="date" 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-blue-500 outline-none transition-colors"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-medium ml-1">Ավարտ (Հերթափոխի)</label>
                            <input 
                                type="date" 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-blue-500 outline-none transition-colors"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                            />
                        </div>
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
                            <th className="p-4 font-medium">Անվանում</th>
                            <th className="p-4 font-medium">Մեքենա / Պետհամարանիշ</th>
                            <th className="p-4 font-medium">Բաժին</th>
                            <th className="p-4 font-medium">Հերթափոխի Սկիզբ</th>
                            <th className="p-4 font-medium">Հերթափոխի Ավարտ</th>
                            <th className="p-4 font-medium">Անձնակազմ</th>
                            <th className="p-4 font-medium text-right">Գործողություններ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedUnits.length > 0 ? (
                            paginatedUnits.map(unit => (
                            <tr key={unit.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 font-bold text-gray-900 text-sm align-top">{unit.name}</td>
                                <td className="p-4 align-top">
                                    <div className="text-sm font-medium">{unit.boardNumber}</div>
                                    <div className="text-xs text-gray-500 font-mono">{unit.plateNumber}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 align-top">{DEPARTMENTS[unit.department]}</td>
                                <td className="p-4 align-top">
                                    <div className="text-sm font-medium text-gray-900">
                                        {unit.shiftStartTime.toLocaleDateString('hy-AM')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {unit.shiftStartTime.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    {unit.shiftEndTime ? (
                                        <>
                                            <div className="text-sm font-medium text-gray-900">
                                                {unit.shiftEndTime.toLocaleDateString('hy-AM')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {unit.shiftEndTime.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-600 align-top">
                                    {unit.crew.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {unit.crew.map((member, idx) => (
                                                <div key={idx} className="font-medium text-gray-800">
                                                    {member.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">Անձնակազմ չկա</span>
                                    )}
                                </td>
                                <td className="p-4 text-right align-top">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => { setEditingUnit(unit); setIsModalOpen(true); }} className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg border border-transparent hover:border-gray-200 transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(unit.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                        ) : (
                             <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                    Նշված ֆիլտրերով կարգախմբեր չեն գտնվել
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredUnits.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
            <UnitFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingUnit}
                onSave={handleSave}
                vehicles={vehicles}
            />
        </div>
    );
};

export default UnitsManagementPage;
