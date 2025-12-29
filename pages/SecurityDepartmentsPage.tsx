
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Archive, RotateCcw, CheckCircle, Filter, X, MapPin } from 'lucide-react';
import { Facility, SecurityDepartment } from '../types';
import { MOCK_SECURITY_DEPARTMENTS } from '../mockData';
import DepartmentFormModal from '../components/modals/DepartmentFormModal';
import FacilityLocationMapModal from '../components/modals/FacilityLocationMapModal';
import { Pagination } from '../components/Shared';

const SecurityDepartmentsPage = ({ facilities }: { facilities: Facility[] }) => {
  const [departments, setDepartments] = useState<SecurityDepartment[]>(MOCK_SECURITY_DEPARTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<SecurityDepartment | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SecurityDepartment | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArchived, setFilterArchived] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterArchived]);

  const handleSave = (data: Partial<SecurityDepartment>) => {
      if (editingDept) {
          setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, ...data } as SecurityDepartment : d));
      } else {
          const newDept: SecurityDepartment = {
              id: `DEPT-${Date.now()}`,
              name: data.name!,
              address: data.address || '',
              contactPerson: data.contactPerson || '',
              contactPhone: data.contactPhone || '',
              isArchived: false,
              coordinates: data.coordinates || { x: 50, y: 50 }
          };
          setDepartments(prev => [...prev, newDept]);
      }
      setIsModalOpen(false);
      setEditingDept(null);
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Ջնջե՞լ բաժինը:')) {
          setDepartments(prev => prev.filter(d => d.id !== id));
      }
  };

  const handleArchiveToggle = (dept: SecurityDepartment) => {
      const confirmMsg = dept.isArchived 
          ? 'Վերականգնե՞լ բաժինը արխիվից:' 
          : 'Արխիվացնե՞լ բաժինը:';
          
      if(window.confirm(confirmMsg)) {
          setDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, isArchived: !d.isArchived } : d));
      }
  };

  const clearFilters = () => {
      setFilterArchived('all');
  };

  const filteredDepartments = useMemo(() => {
      return departments.filter(dept => {
          // Search
          if (searchTerm) {
              const term = searchTerm.toLowerCase();
              const matchesSearch = 
                  dept.name.toLowerCase().includes(term) ||
                  dept.address.toLowerCase().includes(term) ||
                  dept.contactPerson.toLowerCase().includes(term);
              if (!matchesSearch) return false;
          }

          // Archived Filter
          if (filterArchived !== 'all') {
              const isArchivedBool = filterArchived === 'yes';
              if (dept.isArchived !== isArchivedBool) return false;
          }

          return true;
      });
  }, [departments, searchTerm, filterArchived]);

  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDepartments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDepartments, currentPage]);

  const isFiltersActive = filterArchived !== 'all';

  return (
      <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6 shrink-0 gap-3">
              <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Որոնել բաժին..." 
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
                    onClick={() => { setEditingDept(null); setIsModalOpen(true); }}
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
                        <th className="p-4 font-medium">Անվանում</th>
                        <th className="p-4 font-medium">Հասցե</th>
                        <th className="p-4 font-medium">Կոնտակտային Անձ</th>
                        <th className="p-4 font-medium">Հեռախոս</th>
                        <th className="p-4 font-medium">Օբյեկտներ</th>
                        <th className="p-4 font-medium">Արխիվացված</th>
                        <th className="p-4 font-medium text-right">Գործողություններ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedDepartments.length > 0 ? (
                        paginatedDepartments.map(dept => {
                      const facilityCount = facilities.filter(f => f.department === dept.id).length;
                      return (
                        <tr key={dept.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-4 font-bold text-gray-900 text-sm">{dept.name}</td>
                            <td className="p-4 text-sm text-gray-600 max-w-[200px]">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedLocation(dept)}
                                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg border border-transparent hover:border-blue-100 transition-all shrink-0"
                                        title="Տեղորոշում"
                                    >
                                        <MapPin className="w-4 h-4" />
                                    </button>
                                    <span className="truncate" title={dept.address}>{dept.address}</span>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{dept.contactPerson}</td>
                            <td className="p-4 text-sm text-gray-600 font-mono">{dept.contactPhone}</td>
                            <td className="p-4">
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-bold border border-blue-100">
                                    {facilityCount} օբյեկտ
                                </span>
                            </td>
                            <td className="p-4">
                                {dept.isArchived ? (
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
                                    <button 
                                        onClick={() => { setEditingDept(dept); setIsModalOpen(true); }}
                                        className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                                        title="Խմբագրել"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleArchiveToggle(dept)} 
                                        className={`p-1.5 rounded-lg border border-transparent transition-all ${dept.isArchived ? 'hover:bg-green-50 text-green-600 hover:border-green-100' : 'hover:bg-orange-50 text-orange-600 hover:border-orange-100'}`}
                                        title={dept.isArchived ? "Վերականգնել" : "Արխիվացնել"}
                                    >
                                        {dept.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(dept.id)} 
                                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                        title="Ջնջել"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                      );
                    })
                    ) : (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                Նշված ֆիլտրերով բաժիններ չեն գտնվել
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
            </div>
            <Pagination 
                currentPage={currentPage}
                totalItems={filteredDepartments.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
          </div>
          <DepartmentFormModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              initialData={editingDept}
              onSave={handleSave}
          />
          <FacilityLocationMapModal 
              isOpen={!!selectedLocation}
              onClose={() => setSelectedLocation(null)}
              facility={selectedLocation as any}
          />
      </div>
  );
};

export default SecurityDepartmentsPage;
