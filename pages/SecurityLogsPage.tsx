
import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { MultiSelect, Pagination } from '../components/Shared';
import { formatTimeFirst, ACTION_LABELS, ACTION_COLORS } from '../utils';
import { DEPARTMENTS, MOCK_LOGS } from '../mockData';

const SecurityLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterDepts, setFilterDepts] = useState<string[]>([]);
  const [filterActions, setFilterActions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateStart, dateEnd, filterDepts, filterActions]);

  const filteredLogs = MOCK_LOGS.filter(log => {
    // Text search
    const matchesText = log.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date Range
    const matchesStartDate = dateStart ? log.timestamp >= new Date(dateStart) : true;
    const matchesEndDate = dateEnd ? (() => {
        const end = new Date(dateEnd);
        end.setHours(23, 59, 59, 999);
        return log.timestamp <= end;
    })() : true;

    // Multi-select Departments
    const matchesDept = filterDepts.length > 0 ? filterDepts.includes(log.department) : true;

    // Multi-select Actions
    const matchesAction = filterActions.length > 0 ? filterActions.includes(log.action) : true;

    return matchesText && matchesStartDate && matchesEndDate && matchesDept && matchesAction;
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const departmentOptions = Object.entries(DEPARTMENTS).map(([id, label]) => ({ value: id, label }));
  const actionOptions = Object.entries(ACTION_LABELS).map(([id, label]) => ({ value: id, label }));

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0 gap-3">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Որոնել լոգեր..." 
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
                {(filterDepts.length > 0 || filterActions.length > 0 || dateStart || dateEnd) && (
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
            </button>
        </div>
      </div>

      {showFilters && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-200 shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs text-gray-500 font-medium ml-1">Սկիզբ</label>
                      <input 
                          type="date" 
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-blue-500 outline-none" 
                          value={dateStart}
                          onChange={e => setDateStart(e.target.value)}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-gray-500 font-medium ml-1">Ավարտ</label>
                      <input 
                          type="date" 
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-blue-500 outline-none" 
                          value={dateEnd}
                          onChange={e => setDateEnd(e.target.value)}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-gray-500 font-medium ml-1">Պահպանության բաժին</label>
                      <MultiSelect 
                          label="Ընտրել բաժիններ"
                          options={departmentOptions}
                          selected={filterDepts}
                          onChange={setFilterDepts}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-gray-500 font-medium ml-1">Գործողություն</label>
                      <MultiSelect 
                          label="Ընտրել գործողություններ"
                          options={actionOptions}
                          selected={filterActions}
                          onChange={setFilterActions}
                      />
                  </div>
              </div>
              
              <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                  <button 
                      onClick={() => { setDateStart(''); setDateEnd(''); setFilterDepts([]); setFilterActions([]); }}
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
                    <th className="p-4 font-medium">Ժամանակ</th>
                    <th className="p-4 font-medium">Օբյեկտ</th>
                    <th className="p-4 font-medium">Հասցե</th>
                    <th className="p-4 font-medium">Բաժին</th>
                    <th className="p-4 font-medium text-right">Գործողություն</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLogs.length > 0 ? (
                    paginatedLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                            {formatTimeFirst(log.timestamp)}
                        </td>
                        <td className="p-4">
                            <div className="font-bold text-gray-900 text-sm">{log.facilityName}</div>
                            <div className="text-xs text-gray-500 font-mono">{log.facilityCode}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate" title={log.address}>{log.address}</td>
                        <td className="p-4 text-sm text-gray-600">{DEPARTMENTS[log.department]}</td>
                        <td className="p-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                {ACTION_LABELS[log.action] || log.action}
                            </span>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                            Տվյալներ չեն գտնվել ըստ նշված ֆիլտրերի
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
        <Pagination 
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default SecurityLogsPage;
