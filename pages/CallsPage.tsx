
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X, Phone, PhoneIncoming, PhoneOutgoing, Play, Clock, Link as LinkIcon, UserPlus } from 'lucide-react';
import { MultiSelect, Pagination } from '../components/Shared';
import { formatTimeFirst, formatDuration, CALL_TYPE_LABELS, CALL_TYPE_COLORS } from '../utils';
import { DEPARTMENTS, MOCK_CALLS, MOCK_FACILITIES } from '../mockData';
import { CallLog, Facility } from '../types';
import CallAssignmentModal from '../components/modals/CallAssignmentModal';

/**
 * Component to display a live incrementing timer for active calls.
 */
const LiveDuration = ({ startTime }: { startTime: Date }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Initial calculation
    const calc = () => Math.floor((Date.now() - startTime.getTime()) / 1000);
    setSeconds(calc());

    const interval = setInterval(() => {
      setSeconds(calc());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-1.5 text-emerald-600 font-bold animate-pulse">
       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
       <span className="font-mono">{formatDuration(seconds)}</span>
    </div>
  );
};

const CallsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterDepts, setFilterDepts] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Real-time simulation state
  const [calls, setCalls] = useState<CallLog[]>(MOCK_CALLS);
  
  // Modal State for facility assignment
  const [assignCallId, setAssignCallId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Statistics
  const stats = useMemo(() => {
    return {
      total: calls.length,
      incoming: calls.filter(c => c.type.startsWith('INCOMING')).length,
      outgoing: calls.filter(c => c.type.startsWith('OUTGOING')).length
    };
  }, [calls]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateStart, dateEnd, filterDepts, filterTypes]);

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      // Text search
      const term = searchTerm.toLowerCase();
      const matchesText = 
        call.id.toLowerCase().includes(term) ||
        (call.facilityName?.toLowerCase().includes(term) || false) ||
        (call.facilityCode?.toLowerCase().includes(term) || false) ||
        call.phoneNumber.includes(term) ||
        call.operatorName.toLowerCase().includes(term);
      
      // Date Range
      const matchesStartDate = dateStart ? call.timestamp >= new Date(dateStart) : true;
      const matchesEndDate = dateEnd ? (() => {
          const end = new Date(dateEnd);
          end.setHours(23, 59, 59, 999);
          return call.timestamp <= end;
      })() : true;

      // Multi-select Departments
      const matchesDept = filterDepts.length > 0 ? (call.department ? filterDepts.includes(call.department) : false) : true;

      // Multi-select Types
      const matchesType = filterTypes.length > 0 ? filterTypes.includes(call.type) : true;

      return matchesText && matchesStartDate && matchesEndDate && matchesDept && matchesType;
    });
  }, [calls, searchTerm, dateStart, dateEnd, filterDepts, filterTypes]);

  const paginatedCalls = useMemo(() => {
    return filteredCalls.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredCalls, currentPage]);

  const handleLinkFacility = (facility: Facility) => {
      if (!assignCallId) return;

      setCalls(prev => prev.map(c => {
          if (c.id === assignCallId) {
              return {
                  ...c,
                  facilityCode: facility.id,
                  facilityName: facility.name,
                  department: facility.department
              };
          }
          return c;
      }));
      setAssignCallId(null);
  };

  const departmentOptions = Object.entries(DEPARTMENTS).map(([id, label]) => ({ value: id, label }));
  const typeOptions = Object.entries(CALL_TYPE_LABELS).map(([id, label]) => ({ value: id, label }));

  const clearFilters = () => {
    setDateStart('');
    setDateEnd('');
    setFilterDepts([]);
    setFilterTypes([]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-hidden">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Phone className="w-6 h-6" />
           </div>
           <div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ընդհանուր զանգեր</div>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
           <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <PhoneIncoming className="w-6 h-6" />
           </div>
           <div>
              <div className="text-2xl font-bold text-slate-900">{stats.incoming}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Մուտքային զանգեր</div>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
           <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <PhoneOutgoing className="w-6 h-6" />
           </div>
           <div>
              <div className="text-2xl font-bold text-slate-900">{stats.outgoing}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ելքային զանգեր</div>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6 shrink-0 gap-3">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Որոնել զանգեր..." 
             className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm transition-all"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border shadow-sm transition-colors ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
                <Filter className="w-4 h-4" />
                Ֆիլտրեր
                {(filterDepts.length > 0 || filterTypes.length > 0 || dateStart || dateEnd) && (
                    <span className="w-2 h-2 rounded-full bg-red-500 border border-white"></span>
                )}
            </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
          <div className="mb-6 p-5 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-200 shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-medium ml-1 uppercase">Սկիզբ</label>
                      <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 outline-none" 
                          value={dateStart}
                          onChange={e => setDateStart(e.target.value)}
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-medium ml-1 uppercase">Ավարտ</label>
                      <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 outline-none" 
                          value={dateEnd}
                          onChange={e => setDateEnd(e.target.value)}
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-medium ml-1 uppercase">Պահպանության բաժին</label>
                      <MultiSelect 
                          label="Ընտրել բաժիններ"
                          options={departmentOptions}
                          selected={filterDepts}
                          onChange={setFilterDepts}
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-medium ml-1 uppercase">Զանգի տեսակ</label>
                      <MultiSelect 
                          label="Ընտրել տեսակներ"
                          options={typeOptions}
                          selected={filterTypes}
                          onChange={setFilterTypes}
                      />
                  </div>
              </div>
              
              <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                  <button 
                      onClick={clearFilters}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                      <X className="w-3 h-3" /> Մաքրել ֆիլտրերը
                  </button>
              </div>
          </div>
      )}
      
      {/* Table Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm relative">
        <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4">Զանգի ID</th>
                    <th className="p-4">Ամսաթիվ/Ժամ</th>
                    <th className="p-4">Տևողություն</th>
                    <th className="p-4">Տեսակ</th>
                    <th className="p-4">Պահպանվող օբյեկտ</th>
                    <th className="p-4">Հեռախոսահամար</th>
                    <th className="p-4">Պահպանության բաժին</th>
                    <th className="p-4">Օպերատոր</th>
                    <th className="p-4 text-right">Ձայնագրություն</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCalls.length > 0 ? (
                    paginatedCalls.map(call => {
                    const isUnknown = !call.facilityName;
                    
                    return (
                    <tr key={call.id} className={`hover:bg-blue-50/30 transition-colors ${call.status === 'IN_PROGRESS' ? 'bg-emerald-50/20' : ''}`}>
                        <td className="p-4">
                           <span className="font-mono font-bold text-blue-600 text-sm">{call.id}</span>
                        </td>
                        <td className="p-4">
                            {formatTimeFirst(call.timestamp)}
                        </td>
                        <td className="p-4">
                           {call.status === 'IN_PROGRESS' ? (
                              <LiveDuration startTime={call.timestamp} />
                           ) : (
                              <span className="font-mono text-slate-700 font-medium">{formatDuration(call.durationSec)}</span>
                           )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${CALL_TYPE_COLORS[call.type]}`}>
                                {CALL_TYPE_LABELS[call.type]}
                            </span>
                        </td>
                        <td className="p-4">
                            {isUnknown ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-red-500 italic">Անհայտ</span>
                                    <button 
                                        onClick={() => setAssignCallId(call.id)}
                                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-lg transition-all shadow-sm"
                                        title="Կցել օբյեկտին"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="font-bold text-slate-900 text-sm">{call.facilityName}</div>
                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{call.facilityCode}</div>
                                </>
                            )}
                        </td>
                        <td className="p-4">
                            <span className="font-mono text-slate-700 text-sm">{call.phoneNumber}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                            {call.department ? DEPARTMENTS[call.department] : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-800">
                           {call.operatorName}
                        </td>
                        <td className="p-4 text-right">
                            {call.status === 'IN_PROGRESS' ? (
                               <div className="flex justify-end p-2 text-slate-300">
                                  <Clock className="w-4 h-4 animate-spin-slow" />
                                </div>
                            ) : (
                                <button className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-200 hover:border-blue-200 transition-all shadow-sm group">
                                    <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                                </button>
                            )}
                        </td>
                    </tr>
                    )})
                ) : (
                    <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 italic bg-slate-50/30">
                            Տվյալներ չեն գտնվել ըստ նշված ֆիլտրերի
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
        <Pagination 
            currentPage={currentPage}
            totalItems={filteredCalls.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
        />
      </div>

      <CallAssignmentModal 
        isOpen={!!assignCallId}
        onClose={() => setAssignCallId(null)}
        facilities={MOCK_FACILITIES}
        onAssign={handleLinkFacility}
      />
    </div>
  );
};

export default CallsPage;
