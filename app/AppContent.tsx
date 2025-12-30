import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alarm, Facility, ServiceVehicle, Unit, FacilityTypeDefinition, AlarmType } from '../types';
import {
  MOCK_ALARMS,
  MOCK_FACILITIES,
  MOCK_UNITS,
  MOCK_VEHICLES,
  MOCK_SECURITY_DEPARTMENTS,
  MOCK_FACILITY_TYPES_DEF,
  DEPARTMENTS,
} from '../mockData';
import { TYPE_LABELS, isWarningType } from '../utils';
import {
  ALARM_GENERATION_INTERVAL,
  ALARM_SOUND_DURATION,
  ALARM_SOUND_FREQUENCY,
  ALARM_SOUND_VOLUME,
  ITEMS_PER_PAGE,
  NEW_ALARM_HIGHLIGHT_DURATION,
  getNewAlarmId,
} from '../constants';
import { useToast } from '../components/Toast';

// Pages
import SecurityLogsPage from '../pages/SecurityLogsPage';
import SecurityDepartmentsPage from '../pages/SecurityDepartmentsPage';
import FacilitiesManagementPage from '../pages/FacilitiesManagementPage';
import VehiclesPage from '../pages/VehiclesPage';
import UnitsManagementPage from '../pages/UnitsManagementPage';
import FacilityTypesPage from '../pages/FacilityTypesPage';
import SecurityMapPage from '../pages/SecurityMapPage';
import CallsPage from '../pages/CallsPage';

// Modals
import UnitMapModal from '../components/modals/UnitMapModal';
import LocationMapModal from '../components/modals/LocationMapModal';

import { AppHeader } from './layout/AppHeader';
import { AppSidebar } from './layout/AppSidebar';
import { AlarmsView } from './views/AlarmsView';
import { AppView, IncidentTab } from './types';

export default function AppContent() {
  const { showToast } = useToast();

  // --- State ---
  const [currentView, setCurrentView] = useState<AppView>('ALARMS');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === '1';
    } catch {
      return false;
    }
  });
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

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', isSidebarCollapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [isSidebarCollapsed]);

  // Pagination State (alarms view)
  const [currentPage, setCurrentPage] = useState(1);

  // New Tab State for Alarms vs Warnings
  const [incidentTab, setIncidentTab] = useState<IncidentTab>('ALL');

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

  // Current user info
  const [currentUsername] = useState<string>('Օպերատոր Ա.Ա.');

  // Calls deep-linking (open in new tab with URL params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'CALLS') {
      setCurrentView('CALLS');
    }
  }, []);

  const selectedAlarm = useMemo(() => alarms.find((a) => a.id === selectedAlarmId), [alarms, selectedAlarmId]);

  // Audio Context Reference (reused to prevent memory leaks)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio Player for Alarms
  const playAlarmSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioCtx = audioCtxRef.current;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(ALARM_SOUND_FREQUENCY, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(ALARM_SOUND_FREQUENCY / 2, audioCtx.currentTime + ALARM_SOUND_DURATION);

      gainNode.gain.setValueAtTime(ALARM_SOUND_VOLUME, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + ALARM_SOUND_DURATION);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + ALARM_SOUND_DURATION);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }, []);

  // --- Automatic Alarm Generation ---
  const generateRandomAlarm = useCallback(() => {
    setAlarmIdCounter((prevCounter) => {
      const newId = getNewAlarmId(prevCounter);

      setFacilities((currentFacilities) => {
        if (currentFacilities.length === 0) return currentFacilities;

        const randomFacility = currentFacilities[Math.floor(Math.random() * currentFacilities.length)];
        const alarmTypes: AlarmType[] = ['GENERAL', 'SILENT', 'POWER_LOSS', 'LOW_BATTERY', 'CONNECTION_LOST'];
        const randomType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];

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

        setAlarms((prev) => [newAlarm, ...prev]);

        // Play sound if it's an alarm (not a warning)
        if (!isWarningType(randomType)) {
          playAlarmSound();
        }

        return currentFacilities;
      });

      return prevCounter + 1;
    });
  }, [playAlarmSound]);

  useEffect(() => {
    const interval = setInterval(() => {
      generateRandomAlarm();
    }, ALARM_GENERATION_INTERVAL);

    return () => clearInterval(interval);
  }, [generateRandomAlarm]);

  const stats = useMemo(() => {
    const currentList = alarms.filter((a) => {
      if (incidentTab === 'ALARM') return !isWarningType(a.type);
      if (incidentTab === 'WARNING') return isWarningType(a.type);
      return true;
    });

    return {
      total: currentList.length,
      received: currentList.filter((a) => a.status === 'RECEIVED').length,
      active: currentList.filter((a) => a.status === 'ACTIVE').length,
      unseen: currentList.filter((a) => !a.isSeen).length,
      totalAll: alarms.filter((a) => a.status === 'RECEIVED' || a.status === 'ACTIVE').length,
      totalAlarms: alarms.filter((a) => !isWarningType(a.type) && (a.status === 'RECEIVED' || a.status === 'ACTIVE')).length,
      totalWarnings: alarms.filter((a) => isWarningType(a.type) && (a.status === 'RECEIVED' || a.status === 'ACTIVE')).length,
    };
  }, [alarms, incidentTab]);

  const handleAlarmClick = (id: string) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, isSeen: true } : a)));
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
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;

    const actionTimestamp = new Date();
    const unitAction = {
      unitName: unit.name,
      action: `Կցվել է կանչին`,
      actionType: 'ACCEPT' as const,
      timestamp: actionTimestamp,
    };

    setAlarms((prev) =>
      prev.map((a) =>
        a.id === selectedAlarm.id
          ? { ...a, assignedUnitId: unitId, status: 'ACTIVE', unitActions: [...a.unitActions, unitAction] }
          : a,
      ),
    );

    showToast(`${unit.name} կցվեց ${selectedAlarm.facilityName}-ին`, 'success');
  };

  const handleUnassignUnit = () => {
    if (!selectedAlarm) return;

    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id !== selectedAlarm.id) return a;

        const unitName =
          a.assignedUnitId ? units.find((u) => u.id === a.assignedUnitId)?.name ?? a.assignedUnitId : 'Կարգախումբ';

        return {
          ...a,
          assignedUnitId: undefined,
          unitActions: [
            ...a.unitActions,
            {
              unitName,
              action: `Հեռացվեց տագնապից (${a.id})`,
              actionType: 'INFO' as const,
              timestamp: new Date(),
            },
          ],
        };
      }),
    );
    showToast('Կարգախումբը հեռացվեց իրադարձությունից', 'info');
  };

  const handleCall = (phone: string) => {
    if (!selectedAlarm) return;

    const callId = `CALL-${Date.now()}`;
    const durationSec = Math.floor(15 + Math.random() * 105); // 15s - 2m (demo)
    const newCall = {
      id: callId,
      operatorName: currentUsername,
      timestamp: new Date(),
      phoneNumber: phone,
      durationSec,
      recordingUrl: '#', // AlarmDetailsPanel will map this to a demo URL
    };

    setAlarms((prev) =>
      prev.map((a) => (a.id === selectedAlarm.id ? { ...a, callHistory: [newCall, ...a.callHistory] } : a)),
    );

    showToast(`Զանգը կատարվում է դեպի ${phone} (դեմո)`, 'info');
  };

  const handleCallPhone = useCallback(
    (phone: string, facility?: Facility) => {
      const facilityLabel = facility?.name ? ` (${facility.name})` : '';
      showToast(`Զանգը կատարվում է դեպի ${phone}${facilityLabel} (դեմո)`, 'info');
    },
    [showToast],
  );

  const handleFinishAlarm = (alarm: Alarm, reason: 'FALSE_ALARM' | 'RESOLVED' | 'TEST') => {
    const newStatus = reason === 'FALSE_ALARM' ? 'FALSE_ALARM' : 'FINISHED';
    setAlarms((prev) => prev.map((a) => (a.id === alarm.id ? { ...a, status: newStatus } : a)));

    if (newStatus === 'FALSE_ALARM') {
      showToast(`Իրադարձությունը ${alarm.id} փակվեց որպես կեղծ տագնապ`, 'info');
    } else {
      showToast(`Իրադարձությունը ${alarm.id} ավարտվեց`, 'success');
    }
  };

  const handleDownloadReport = (alarm: Alarm) => {
    showToast(`Հաշվետվություն ${alarm.id}-ի համար (դեմո)`, 'info');
  };

  // --- Alarm Filtering & Pagination ---
  useEffect(() => {
    setCurrentPage(1);
  }, [incidentTab, dateStart, dateEnd, filterDepts, filterTypes, filterStatuses]);

  const filteredAlarms = useMemo(() => {
    const result = alarms.filter((alarm) => {
      // Tab filter
      if (incidentTab === 'ALARM' && isWarningType(alarm.type)) return false;
      if (incidentTab === 'WARNING' && !isWarningType(alarm.type)) return false;

      // Depts
      if (filterDepts.length > 0 && !filterDepts.includes(alarm.department)) return false;
      // Types
      if (filterTypes.length > 0 && !filterTypes.includes(alarm.type)) return false;
      // Status
      if (filterStatuses.length > 0 && !filterStatuses.includes(alarm.status)) return false;

      // Date range
      if (dateStart) {
        const start = new Date(dateStart);
        if (alarm.timestamp < start) return false;
      }
      if (dateEnd) {
        const end = new Date(dateEnd);
        end.setHours(23, 59, 59, 999);
        if (alarm.timestamp > end) return false;
      }

      return true;
    });

    // Sort by ID descending
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
    { value: 'FALSE_ALARM', label: 'Կեղծ տագնապ' },
  ];

  const hasActiveFilters = Boolean(dateStart || dateEnd || filterDepts.length > 0 || filterTypes.length > 0 || filterStatuses.length > 0);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <AppSidebar
        currentView={currentView}
        setCurrentView={(v) => setCurrentView(v)}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <AppHeader currentView={currentView} currentUsername={currentUsername} />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {currentView === 'MAP' ? (
            <SecurityMapPage
              units={units}
              facilities={facilities}
              facilityTypes={facilityTypes}
              alarms={alarms}
              onCall={handleCallPhone}
            />
          ) : currentView === 'CALLS' ? (
            <CallsPage />
          ) : currentView === 'LOGS' ? (
            <SecurityLogsPage />
          ) : currentView === 'DEPARTMENTS' ? (
            <SecurityDepartmentsPage facilities={facilities} />
          ) : currentView === 'FACILITIES' ? (
            <FacilitiesManagementPage
              facilities={facilities}
              setFacilities={setFacilities}
              types={facilityTypes}
              departments={MOCK_SECURITY_DEPARTMENTS}
              onCall={handleCallPhone}
            />
          ) : currentView === 'VEHICLES' ? (
            <VehiclesPage vehicles={vehicles} setVehicles={setVehicles} />
          ) : currentView === 'UNITS_MANAGEMENT' ? (
            <UnitsManagementPage units={units} setUnits={setUnits} vehicles={vehicles} />
          ) : currentView === 'FACILITY_TYPES' ? (
            <FacilityTypesPage facilities={facilities} types={facilityTypes} setTypes={setFacilityTypes} />
          ) : (
            <AlarmsView
              incidentTab={incidentTab}
              setIncidentTab={setIncidentTab}
              stats={stats}
              isFilterPanelOpen={isFilterPanelOpen}
              setIsFilterPanelOpen={setIsFilterPanelOpen}
              hasActiveFilters={hasActiveFilters}
              dateStart={dateStart}
              dateEnd={dateEnd}
              setDateStart={setDateStart}
              setDateEnd={setDateEnd}
              filterDepts={filterDepts}
              setFilterDepts={setFilterDepts}
              filterTypes={filterTypes}
              setFilterTypes={setFilterTypes}
              filterStatuses={filterStatuses}
              setFilterStatuses={setFilterStatuses}
              departmentOptions={departmentOptions}
              typeOptions={typeOptions}
              statusOptions={statusOptions}
              clearFilters={clearFilters}
              paginatedAlarms={paginatedAlarms}
              filteredAlarmsCount={filteredAlarms.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              departmentsLabelById={DEPARTMENTS}
              units={units}
              selectedAlarmId={selectedAlarmId}
              selectedAlarm={selectedAlarm}
              handleAlarmClick={handleAlarmClick}
              handleOpenAssignMap={handleOpenAssignMap}
              handleViewLocation={handleViewLocation}
              handleCall={handleCall}
              handleFinishAlarm={handleFinishAlarm}
              handleDownloadReport={handleDownloadReport}
              onCloseDetails={() => setSelectedAlarmId(null)}
              facilityTypes={facilityTypes}
            />
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
      <LocationMapModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} alarm={selectedAlarm} />
    </div>
  );
}


