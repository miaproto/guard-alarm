
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Shield, 
  AlertTriangle, 
  Map as MapIcon, 
  Users, 
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Filter,
  ChevronDown,
  Siren,
  FileText,
  CheckCircle,
  Play,
  ArrowDownLeft,
  Activity,
  PhoneCall,
  Phone,
  Clock,
  Plus,
  Edit2,
  AlertCircle,
  X,
  Inbox
} from 'lucide-react';

import { Alarm, Unit, Facility, ServiceVehicle, CallRecord, FacilityTypeDefinition, AlarmType } from './types';
import { MOCK_ALARMS, MOCK_FACILITIES, MOCK_UNITS, MOCK_VEHICLES, MOCK_SECURITY_DEPARTMENTS, MOCK_FACILITY_TYPES_DEF, DEPARTMENTS } from './mockData';
import { formatTimeFirst, TYPE_LABELS, ACTION_LABELS, isWarningType } from './utils';
import { StatusBadge, TypeBadge, SidebarItem, Pagination, MultiSelect } from './components/Shared';

// Components
import SecurityLogsPage from './pages/SecurityLogsPage';
import SecurityDepartmentsPage from './pages/SecurityDepartmentsPage';
import FacilitiesManagementPage from './pages/FacilitiesManagementPage';
import VehiclesPage from './pages/VehiclesPage';
import UnitsManagementPage from './pages/UnitsManagementPage';
import FacilityTypesPage from './pages/FacilityTypesPage';
import SecurityMapPage from './pages/SecurityMapPage';
import CallsPage from './pages/CallsPage';
import AlarmDetailsPanel from './components/AlarmDetailsPanel';
import UnitMapModal from './components/modals/UnitMapModal';
import LocationMapModal from './components/modals/LocationMapModal';

const App = () => {
  // --- State ---
  const [currentView, setCurrentView] = useState<'ALARMS' | 'MAP' | 'CALLS' | 'LOGS' | 'DEPARTMENTS' | 'FACILITIES' | 'FACILITY_TYPES' | 'VEHICLES' | 'UNITS_MANAGEMENT'>('ALARMS');
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES);
  const [alarms, setAlarms] = useState<Alarm[]>(MOCK_ALARMS);
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
  const [vehicles, setVehicles] = useState<ServiceVehicle[]>(MOCK_VEHICLES);
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Settings Menu State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // New Tab State for Alarms vs Warnings
  const [incidentTab, setIncidentTab] = useState<'ALL' | 'ALARM' | 'WARNING'>('ALL');

  // Filter States
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterDepts, setFilterDepts] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

  // Other State
  const [facilityTypes, setFacilityTypes] = useState<FacilityTypeDefinition[]>(MOCK_FACILITY_TYPES_DEF);
  
  // Sequential ID counter for new alarms
  const [alarmIdCounter, setAlarmIdCounter] = useState(128);

  const selectedAlarm = useMemo(() => alarms.find(a => a.id === selectedAlarmId), [alarms, selectedAlarmId]);

  // Audio Player for Alarms
  const playAlarmSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }, []);

  // --- Automatic Alarm Generation ---
  const generateRandomAlarm = useCallback(() => {
    const randomFacility = facilities[Math.floor(Math.random() * facilities.length)];
    const alarmTypes: AlarmType[] = ['GENERAL', 'SILENT', 'POWER_LOSS', 'LOW_BATTERY', 'CONNECTION_LOST'];
    const randomType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
    
    const newId = `2025-${alarmIdCounter}`;
    setAlarmIdCounter(prev => prev + 1);

    const newAlarm: Alarm = {
      id: newId,
      isSeen: false,
      status: 'RECEIVED',
      timestamp: new Date(),
      type: randomType,
      facilityCode: randomFacility.id,
      facilityName: randomFacility.name,
      facilityType: randomFacility.type,
      address: randomFacility.address,
      department: randomFacility.department,
      description: `Ավտոմատ գեներացված իրադարձություն: ${TYPE_LABELS[randomType]}`,
      contactPerson: randomFacility.contactPerson,
      contactPhones: randomFacility.phones,
      coordinates: randomFacility.coordinates,
      unitActions: [],
      callHistory: [],
      unitFinishedWork: false,
      facilityPassword: randomFacility.password,
    };

    setAlarms(prev => [newAlarm, ...prev]);

    // Play sound if it's an alarm (not a warning)
    if (!isWarningType(randomType)) {
      playAlarmSound();
    }
  }, [facilities, playAlarmSound, alarmIdCounter]);

  useEffect(() => {
    const interval = setInterval(() => {
      generateRandomAlarm();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [generateRandomAlarm]);

  const stats = useMemo(() => {
    // Current filtered view stats
    const currentList = alarms.filter(a => {
        if (incidentTab === 'ALARM') return !isWarningType(a.type);
        if (incidentTab === 'WARNING') return isWarningType(a.type);
        return true;
    });

    return {
      total: currentList.length,
      received: currentList.filter(a => a.status === 'RECEIVED').length,
      active: currentList.filter(a => a.status === 'ACTIVE').length,
      unseen: currentList.filter(a => !a.isSeen).length,
      totalAll: alarms.filter(a => a.status === 'RECEIVED' || a.status === 'ACTIVE').length,
      totalAlarms: alarms.filter(a => !isWarningType(a.type) && (a.status === 'RECEIVED' || a.status === 'ACTIVE')).length,
      totalWarnings: alarms.filter(a => isWarningType(a.type) && (a.status === 'RECEIVED' || a.status === 'ACTIVE')).length
    };
  }, [alarms, incidentTab]);

  const handleAlarmClick = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, isSeen: true } : a));
    setSelectedAlarmId(id);
  };

  const handleOpenAssignMap = (alarm: Alarm) => {
    if (selectedAlarmId !== alarm.id) {
       handleAlarmClick(alarm.id);
    }
    setIsMapModalOpen(true);
  };

  const handleViewLocation = () => {
    if (selectedAlarm) {
        setIsLocationModalOpen(true);
    }
  };

  const handleAssignUnit = (unitId: string) => {
    if (!selectedAlarm) return;
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    setAlarms(prev => prev.map(a => {
      if (a.id === selectedAlarm.id) {
        return {
          ...a,
          status: 'ACTIVE',
          assignedUnitId: unitId,
          unitActions: [
            ...a.unitActions,
            { unitName: unit.name, action: 'Կցվել է տագնապին', actionType: 'ACCEPT', timestamp: new Date() }
          ]
        };
      }
      return a;
    }));

    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: 'BUSY', shiftStatus: 'ALARM', activeAlarmId: selectedAlarm.id } : u));
  };

  const handleUnassignUnit = (unitId: string) => {
    if (!selectedAlarm) return;
    
    setAlarms(prev => prev.map(a => {
      if (a.id === selectedAlarm.id) {
        return {
           ...a,
           assignedUnitId: undefined,
           unitActions: [
            ...a.unitActions,
            { unitName: units.find(u => u.id === unitId)?.name || 'Unknown', action: 'Հետ է կանչվել', actionType: 'INFO', timestamp: new Date() }
           ]
        };
      }
      return a;
    }));

    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: 'AVAILABLE', shiftStatus: 'ON_DUTY', activeAlarmId: undefined } : u));
  };

  const handleCall = (phone: string) => {
    if (!selectedAlarm) return;
    const newRecord: CallRecord = {
      id: `C-${Date.now()}`,
      operatorName: 'Ընթացիկ Օպերատոր',
      timestamp: new Date(),
      phoneNumber: phone,
      durationSec: Math.floor(Math.random() * 60) + 10,
      recordingUrl: '#'
    };

    setAlarms(prev => prev.map(a => 
      a.id === selectedAlarm.id 
      ? { ...a, callHistory: [newRecord, ...a.callHistory] }
      : a
    ));
    alert(`Զանգը կատարվում է դեպի ${phone}...`);
  };

  const handleFinishAlarm = () => {
    if (!selectedAlarm) return;
    setAlarms(prev => prev.map(a => 
      a.id === selectedAlarm.id 
      ? { ...a, status: 'FINISHED', assignedUnitId: undefined } 
      : a
    ));
    if (selectedAlarm.assignedUnitId) {
       setUnits(prev => prev.map(u => u.id === selectedAlarm.assignedUnitId ? { ...u, status: 'AVAILABLE', shiftStatus: 'ON_DUTY', activeAlarmId: undefined } : u));
    }
    setSelectedAlarmId(null); 
  };

  const handleDownloadReport = async () => {
    if (!selectedAlarm) return;
    const reportContent = `Հաշվետվություն... ${selectedAlarm.id}`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${selectedAlarm.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDepts, filterTypes, filterStatuses, incidentTab, dateStart, dateEnd]);

  const filteredAlarms = useMemo(() => {
    const result = alarms.filter(alarm => {
       // Tab Filter
       if (incidentTab === 'ALARM' && isWarningType(alarm.type)) return false;
       if (incidentTab === 'WARNING' && !isWarningType(alarm.type)) return false;

       // Multi-select Departments
       if (filterDepts.length > 0 && !filterDepts.includes(alarm.department)) return false;

       // Multi-select Types
       if (filterTypes.length > 0 && !filterTypes.includes(alarm.type)) return false;

       // Multi-select Statuses
       if (filterStatuses.length > 0 && !filterStatuses.includes(alarm.status)) return false;

       // Date Range
       if (dateStart && alarm.timestamp < new Date(dateStart)) return false;
       if (dateEnd) {
           const end = new Date(dateEnd);
           end.setHours(23, 59, 59, 999);
           if (alarm.timestamp > end) return false;
       }

       return true;
    });
    // Sort by ID descending as requested by user
    return result.sort((a, b) => b.id.localeCompare(a.id));
  }, [alarms, filterDepts, filterTypes, filterStatuses, incidentTab, dateStart, dateEnd]);

  const paginatedAlarms = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlarms.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlarms, currentPage]);

  const clearFilters = () => {
      setDateStart('');
      setDateEnd('');
      setFilterDepts([]);
      setFilterTypes([]);
      setFilterStatuses([]);
  };

  const departmentOptions = Object.entries(DEPARTMENTS).map(([id, label]) => ({ value: id, label }));
  const typeOptions = Object.entries(TYPE_LABELS).map(([id, label]) => ({ value: id, label }));
  const statusOptions = [
      { value: 'RECEIVED', label: 'Ստացված' },
      { value: 'ACTIVE', label: 'Ակտիվ' },
      { value: 'FINISHED', label: 'Ավարտված' },
      { value: 'FALSE_ALARM', label: 'Ավարտված (Կեղծ)' }
  ];

  const hasActiveFilters = dateStart || dateEnd || filterDepts.length > 0 || filterTypes.length > 0 || filterStatuses.length > 0;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* 1. Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[2px_0_20px_rgba(0,0,0,0.02)] z-20">
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
              <Shield className="w-7 h-7 text-blue-600 fill-blue-100" />
              <div className="leading-tight">
                  <div className="font-bold text-slate-900 tracking-wide text-lg">POLICE</div>
                  <div className="text-[10px] text-blue-600 font-bold tracking-[0.2em] uppercase">Control Center</div>
              </div>
          </div>

          <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Գլխավոր</div>
              <SidebarItem 
                 icon={AlertTriangle} 
                 label="Տագնապների Կառավարում" 
                 active={currentView === 'ALARMS'} 
                 onClick={() => setCurrentView('ALARMS')} 
              />
              <SidebarItem 
                 icon={MapIcon} 
                 label="Պահպանության քարտեզ" 
                 active={currentView === 'MAP'}
                 onClick={() => setCurrentView('MAP')} 
              />
              <SidebarItem 
                 icon={Users} 
                 label="Կարգախմբեր" 
                 active={currentView === 'UNITS_MANAGEMENT'}
                 onClick={() => setCurrentView('UNITS_MANAGEMENT')} 
              />
              <SidebarItem 
                 icon={Phone} 
                 label="Զանգեր" 
                 active={currentView === 'CALLS'}
                 onClick={() => setCurrentView('CALLS')} 
              />
              <SidebarItem 
                 icon={ClipboardList} 
                 label="Պահպանության լոգեր" 
                 active={currentView === 'LOGS'}
                 onClick={() => setCurrentView('LOGS')} 
              />
              
              <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Կառավարում</div>
              
              {/* Settings Accordion */}
              <div>
                <button 
                   onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                   className={`w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors text-left ${isSettingsOpen || ['DEPARTMENTS', 'FACILITIES', 'FACILITY_TYPES', 'VEHICLES'].includes(currentView) ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                   <div className="flex items-center gap-3">
                       <Settings className="w-5 h-5 text-slate-400" strokeWidth={2} />
                       <span className="text-sm">Կարգավորումներ</span>
                   </div>
                   <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSettingsOpen ? 'rotate-90' : ''}`} />
                </button>
                {isSettingsOpen && (
                   <div className="pl-4 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200 border-l-2 border-slate-100 ml-5">
                      <button 
                         onClick={() => setCurrentView('DEPARTMENTS')}
                         className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${currentView === 'DEPARTMENTS' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                         Պահպանության բաժիններ
                      </button>
                      <button 
                         onClick={() => setCurrentView('FACILITIES')}
                         className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${currentView === 'FACILITIES' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                         Պահպանվող օբյեկտներ
                      </button>
                      <button 
                         onClick={() => setCurrentView('VEHICLES')}
                         className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${currentView === 'VEHICLES' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                         Ավտոմեքենաներ
                      </button>
                      <button 
                         onClick={() => setCurrentView('FACILITY_TYPES')}
                         className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${currentView === 'FACILITY_TYPES' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                         Օբյեկտների տեսակներ
                      </button>
                   </div>
                )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
             <button className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600 transition-colors w-full rounded-lg hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Դուրս գալ</span>
             </button>
          </div>
      </aside>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {currentView === 'ALARMS' ? 'Իրադարձությունների Կառավարում' : 
                 currentView === 'MAP' ? 'Պահպանության Քարտեզ' : 
                 currentView === 'CALLS' ? 'Զանգեր' :
                 currentView === 'LOGS' ? 'Պահպանության Լոգեր' : 
                 currentView === 'DEPARTMENTS' ? 'Պահպանության Բաժիններ' :
                 currentView === 'FACILITIES' ? 'Պահպանվող Օբյեկտներ' :
                 currentView === 'VEHICLES' ? 'Ավտոմեքենաներ' :
                 currentView === 'UNITS_MANAGEMENT' ? 'Կարգախմբերի Կառավարում' :
                 'Պահպանվող Օբյեկտների Տեսակներ'}
             </h2>
             
             <div className="flex items-center gap-4">
                <div className="text-right">
                   <div className="text-sm font-semibold text-slate-900">Օպերատոր Ա.Ա.</div>
                   <div className="text-xs text-slate-500 font-medium">Հերթափոխ #4</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                   <Users className="w-5 h-5 text-slate-500" />
                </div>
             </div>
          </header>

          <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {currentView === 'MAP' ? (
                <SecurityMapPage units={units} facilities={facilities} facilityTypes={facilityTypes} alarms={alarms} />
              ) : currentView === 'CALLS' ? (
                <CallsPage />
              ) : currentView === 'LOGS' ? (
                <SecurityLogsPage />
              ) : currentView === 'DEPARTMENTS' ? (
                <SecurityDepartmentsPage facilities={facilities} />
              ) : currentView === 'FACILITIES' ? (
                <FacilitiesManagementPage facilities={facilities} setFacilities={setFacilities} types={facilityTypes} departments={MOCK_SECURITY_DEPARTMENTS} />
              ) : currentView === 'VEHICLES' ? (
                <VehiclesPage vehicles={vehicles} setVehicles={setVehicles} />
              ) : currentView === 'UNITS_MANAGEMENT' ? (
                <UnitsManagementPage units={units} setUnits={setUnits} vehicles={vehicles} />
              ) : currentView === 'FACILITY_TYPES' ? (
                <FacilityTypesPage facilities={facilities} types={facilityTypes} setTypes={setFacilityTypes} />
              ) : (
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                  
                  {/* Tabs for Incident Type */}
                  <div className="flex gap-2 mb-6 shrink-0 border-b border-gray-200 pb-1">
                      <button 
                          onClick={() => setIncidentTab('ALL')}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${incidentTab === 'ALL' ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'}`}
                      >
                          Բոլորը
                          {stats.totalAll > 0 && <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">{stats.totalAll}</span>}
                      </button>
                      <button 
                          onClick={() => setIncidentTab('ALARM')}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${incidentTab === 'ALARM' ? 'text-red-600 border-red-600 bg-red-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'}`}
                      >
                          <Siren className="w-4 h-4" />
                          Տագնապներ
                          {stats.totalAlarms > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">{stats.totalAlarms}</span>}
                      </button>
                      <button 
                          onClick={() => setIncidentTab('WARNING')}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${incidentTab === 'WARNING' ? 'text-amber-600 border-amber-600 bg-amber-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'}`}
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
                            className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm ${isFilterPanelOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                          >
                              <Filter className="w-4 h-4" />
                              Ֆիլտր
                              <ChevronDown className={`w-3 h-3 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
                              {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>}
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
                                <MultiSelect 
                                    label="Ընտրել բաժիններ"
                                    options={departmentOptions}
                                    selected={filterDepts}
                                    onChange={setFilterDepts}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-500 font-medium ml-1 uppercase">Տեսակ</label>
                                <MultiSelect 
                                    label="Ընտրել տեսակներ"
                                    options={typeOptions}
                                    selected={filterTypes}
                                    onChange={setFilterTypes}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-500 font-medium ml-1 uppercase">Կարգավիճակ</label>
                                <MultiSelect 
                                    label="Ընտրել կարգավիճակներ"
                                    options={statusOptions}
                                    selected={filterStatuses}
                                    onChange={setFilterStatuses}
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
                                paginatedAlarms.map(alarm => {
                                const assignedUnit = units.find(u => u.id === alarm.assignedUnitId);
                                
                                // Logic for new alarm highlight (within last 10 seconds and unseen)
                                const isVeryNew = Date.now() - alarm.timestamp.getTime() < 10000;
                                const animationClass = (isVeryNew && !alarm.isSeen) 
                                  ? (isWarningType(alarm.type) ? 'new-warning-row' : 'new-alarm-row') 
                                  : '';

                                return (
                                <tr 
                                    key={alarm.id} 
                                    className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${selectedAlarmId === alarm.id ? 'bg-blue-50' : ''} ${!alarm.isSeen ? 'bg-blue-50/20' : ''} ${animationClass}`}
                                    onClick={() => handleAlarmClick(alarm.id)}
                                >
                                    <td className="p-4 whitespace-nowrap">
                                      <StatusBadge status={alarm.status} />
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                      <div className="text-blue-600 font-mono font-semibold relative inline-block text-sm">
                                          {alarm.id}
                                          {!alarm.isSeen && (
                                            <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                          )}
                                      </div>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                                      {formatTimeFirst(alarm.timestamp)}
                                    </td>
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
                                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                                      {DEPARTMENTS[alarm.department]}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                      {assignedUnit ? (
                                        <div className="flex items-center justify-end gap-3">
                                            <span className={`text-sm font-bold text-green-600`}>
                                              {assignedUnit.name}
                                            </span>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleOpenAssignMap(alarm); }}
                                              className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-md border border-slate-200 transition-colors shadow-sm"
                                              title="Փոխել կարգախումբը"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                      ) : (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleOpenAssignMap(alarm); }}
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
                              )})
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
                    
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={filteredAlarms.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />

                    {/* Side Panel Overlay */}
                    {selectedAlarm && (
                        <div className="absolute top-0 right-0 bottom-0 z-20 flex shadow-2xl h-full backdrop-blur-sm bg-white/30">
                          <AlarmDetailsPanel 
                            alarm={selectedAlarm} 
                            onClose={() => setSelectedAlarmId(null)}
                            onCall={handleCall}
                            onFinish={handleFinishAlarm}
                            onDownloadReport={handleDownloadReport}
                            onViewMap={handleViewLocation}
                            facilityTypes={facilityTypes}
                          />
                        </div>
                    )}
                  </div>
              </div>
              )}
          </div>
      </div>

      {/* Assign Unit Modal */}
      <UnitMapModal 
         isOpen={isMapModalOpen}
         onClose={() => setIsMapModalOpen(false)}
         alarm={selectedAlarm}
         units={units}
         onAssign={handleAssignUnit}
         onUnassign={handleUnassignUnit}
      />

      {/* Location View Modal */}
      <LocationMapModal
         isOpen={isLocationModalOpen}
         onClose={() => setIsLocationModalOpen(false)}
         alarm={selectedAlarm}
      />

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
