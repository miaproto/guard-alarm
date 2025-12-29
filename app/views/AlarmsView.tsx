import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Edit2,
  Filter,
  Inbox,
  Plus,
  Search,
  Siren,
  X,
} from 'lucide-react';

import { Alarm, FacilityTypeDefinition, Unit } from '../../types';
import { formatTimeFirst, isWarningType } from '../../utils';
import { StatusBadge, TypeBadge, Pagination, MultiSelect } from '../../components/Shared';
import AlarmDetailsPanel from '../../components/AlarmDetailsPanel';
import { ITEMS_PER_PAGE, NEW_ALARM_HIGHLIGHT_DURATION } from '../../constants';

export type AlarmStats = {
  received: number;
  active: number;
  unseen: number;
  totalAll: number;
  totalAlarms: number;
  totalWarnings: number;
};

type Option = { value: string; label: string };

type Props = {
  // Tabs
  incidentTab: 'ALL' | 'ALARM' | 'WARNING';
  setIncidentTab: (tab: 'ALL' | 'ALARM' | 'WARNING') => void;
  stats: AlarmStats;

  // Filters UI
  isFilterPanelOpen: boolean;
  setIsFilterPanelOpen: (open: boolean) => void;
  hasActiveFilters: boolean;
  dateStart: string;
  dateEnd: string;
  setDateStart: (v: string) => void;
  setDateEnd: (v: string) => void;
  filterDepts: string[];
  setFilterDepts: (v: string[]) => void;
  filterTypes: string[];
  setFilterTypes: (v: string[]) => void;
  filterStatuses: string[];
  setFilterStatuses: (v: string[]) => void;
  departmentOptions: Option[];
  typeOptions: Option[];
  statusOptions: Option[];
  clearFilters: () => void;

  // Table + pagination
  paginatedAlarms: Alarm[];
  filteredAlarmsCount: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  departmentsLabelById: Record<string, string>;
  units: Unit[];

  // Selection + actions
  selectedAlarmId: string | null;
  selectedAlarm: Alarm | undefined;
  handleAlarmClick: (id: string) => void;
  handleOpenAssignMap: (alarm: Alarm) => void;
  handleViewLocation: () => void;
  handleCall: (phone: string) => void;
  handleFinishAlarm: (alarm: Alarm, reason: 'FALSE_ALARM' | 'RESOLVED' | 'TEST') => void;
  handleDownloadReport: (alarm: Alarm) => void;
  onCloseDetails: () => void;
  facilityTypes: FacilityTypeDefinition[];
};

export function AlarmsView(props: Props) {
  const {
    incidentTab,
    setIncidentTab,
    stats,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    hasActiveFilters,
    dateStart,
    dateEnd,
    setDateStart,
    setDateEnd,
    filterDepts,
    setFilterDepts,
    filterTypes,
    setFilterTypes,
    filterStatuses,
    setFilterStatuses,
    departmentOptions,
    typeOptions,
    statusOptions,
    clearFilters,
    paginatedAlarms,
    filteredAlarmsCount,
    currentPage,
    setCurrentPage,
    departmentsLabelById,
    units,
    selectedAlarmId,
    selectedAlarm,
    handleAlarmClick,
    handleOpenAssignMap,
    handleViewLocation,
    handleCall,
    handleFinishAlarm,
    handleDownloadReport,
    onCloseDetails,
    facilityTypes,
  } = props;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {/* Tabs for Incident Type */}
      <div className="flex gap-2 mb-6 shrink-0 border-b border-gray-200 pb-1">
        <button
          onClick={() => setIncidentTab('ALL')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
            incidentTab === 'ALL' ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Բոլորը
          {stats.totalAll > 0 && <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">{stats.totalAll}</span>}
        </button>
        <button
          onClick={() => setIncidentTab('ALARM')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
            incidentTab === 'ALARM' ? 'text-red-600 border-red-600 bg-red-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Siren className="w-4 h-4" />
          Տագնապներ
          {stats.totalAlarms > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">{stats.totalAlarms}</span>}
        </button>
        <button
          onClick={() => setIncidentTab('WARNING')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
            incidentTab === 'WARNING' ? 'text-amber-600 border-amber-600 bg-amber-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Զգուշացումներ
          {stats.totalWarnings > 0 && <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full text-xs">{stats.totalWarnings}</span>}
        </button>
      </div>

      {/* Stats & Actions Row */}
      <div className="flex flex-col xl:flex-row gap-6 mb-6 shrink-0">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.received}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ստացված</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ակտիվ</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stats.unseen > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
              <Siren className={`w-6 h-6 ${stats.unseen > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${stats.unseen > 0 ? 'text-slate-900' : 'text-slate-400'}`}>{stats.unseen}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Չդիտված</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Որոնել..."
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none w-64 shadow-sm placeholder:text-slate-400 transition-all"
            />
          </div>
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm ${
              isFilterPanelOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Ֆիլտր
            <ChevronDown className={`w-3 h-3 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
            {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full ml-1" />}
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {isFilterPanelOpen && (
        <div className="mb-6 p-5 bg-white border border-slate-200 rounded-xl animate-in slide-in-from-top-2 duration-200 shrink-0 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase">Սկիզբ</label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 outline-none"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase">Ավարտ</label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 outline-none"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase">Բաժին</label>
              <MultiSelect label="Ընտրել բաժիններ" options={departmentOptions} selected={filterDepts} onChange={setFilterDepts} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase">Տեսակ</label>
              <MultiSelect label="Ընտրել տեսակներ" options={typeOptions} selected={filterTypes} onChange={setFilterTypes} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase">Կարգավիճակ</label>
              <MultiSelect label="Ընտրել կարգավիճակներ" options={statusOptions} selected={filterStatuses} onChange={setFilterStatuses} />
            </div>
          </div>
          <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
            <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" /> Մաքրել ֆիլտրերը
            </button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col relative shadow-sm">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
              <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Կարգավիճակ</th>
                <th className="p-4">ID</th>
                <th className="p-4">Ամսաթիվ</th>
                <th className="p-4">Տեսակ</th>
                <th className="p-4">Օբյեկտ</th>
                <th className="p-4">Հասցե</th>
                <th className="p-4">Բաժին</th>
                <th className="p-4 text-right">Կարգախումբ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAlarms.length > 0 ? (
                paginatedAlarms.map((alarm) => {
                  const assignedUnit = units.find((u) => u.id === alarm.assignedUnitId);
                  const isVeryNew = Date.now() - alarm.timestamp.getTime() < NEW_ALARM_HIGHLIGHT_DURATION;
                  const animationClass = isVeryNew && !alarm.isSeen ? (isWarningType(alarm.type) ? 'new-warning-row' : 'new-alarm-row') : '';
                  const isFalseAlarm = alarm.status === 'FALSE_ALARM';

                  return (
                    <tr
                      key={alarm.id}
                      className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${selectedAlarmId === alarm.id ? 'bg-blue-50' : ''} ${
                        !alarm.isSeen ? 'bg-blue-50/20' : ''
                      } ${isFalseAlarm ? 'bg-emerald-50/40' : ''} ${animationClass}`}
                      onClick={() => handleAlarmClick(alarm.id)}
                    >
                      <td className="p-4 whitespace-nowrap">
                        <StatusBadge status={alarm.status} />
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-blue-600 font-mono font-semibold relative inline-block text-sm">
                          {alarm.id}
                          {!alarm.isSeen && <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 text-sm whitespace-nowrap">{formatTimeFirst(alarm.timestamp)}</td>
                      <td className="p-4 whitespace-nowrap">
                        <TypeBadge type={alarm.type} />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 text-sm">{alarm.facilityName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{alarm.facilityCode}</div>
                      </td>
                      <td className="p-4 text-slate-500 text-sm max-w-[180px] truncate" title={alarm.address}>
                        {alarm.address}
                      </td>
                      <td className="p-4 text-slate-600 text-sm whitespace-nowrap">{departmentsLabelById[alarm.department]}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {assignedUnit ? (
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-sm font-bold text-green-600">{assignedUnit.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAssignMap(alarm);
                              }}
                              className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-md border border-slate-200 transition-colors shadow-sm"
                              title="Փոխել կարգախումբը"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAssignMap(alarm);
                            }}
                            className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 transition-all shadow-sm group/btn"
                          >
                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center group-hover/btn:bg-blue-100 text-slate-500 group-hover/btn:text-blue-600">
                              <Plus className="w-3 h-3" />
                            </div>
                            Կցել
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 italic">
                    Նշված ֆիլտրերով տվյալներ չեն գտնվել
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalItems={filteredAlarmsCount} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />

        {selectedAlarm && (
          <div className="absolute top-0 right-0 bottom-0 z-20 flex shadow-2xl h-full backdrop-blur-sm bg-white/30">
            <AlarmDetailsPanel
              alarm={selectedAlarm}
              onClose={onCloseDetails}
              onCall={handleCall}
              onFinish={(reason) => handleFinishAlarm(selectedAlarm, reason)}
              onDownloadReport={() => handleDownloadReport(selectedAlarm)}
              onViewMap={handleViewLocation}
              facilityTypes={facilityTypes}
            />
          </div>
        )}
      </div>
    </div>
  );
}


