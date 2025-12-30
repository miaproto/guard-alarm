
import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, Shield, WifiOff, Radio, Car, X, AlertTriangle, PhoneCall } from 'lucide-react';
import { Unit, Facility, FacilityTypeDefinition, Alarm } from '../types';
import { DEPARTMENTS } from '../mockData';
import { BookIcon } from '../components/Shared';
import { TYPE_LABELS, isWarningType } from '../utils';
import MapLibreMap, { MapMarker } from '../components/MapLibreMap';

const toTelHref = (phone: string) => {
  // Keep digits and leading '+'
  const trimmed = phone.trim();
  const cleaned = trimmed.startsWith('+')
    ? '+' + trimmed.slice(1).replace(/[^\d]/g, '')
    : trimmed.replace(/[^\d]/g, '');
  return `tel:${cleaned}`;
};

const SecurityMapPage = ({ 
  units, 
  facilities,
  facilityTypes,
  alarms,
  onCall,
}: { 
  units: Unit[]; 
  facilities: Facility[]; 
  facilityTypes: FacilityTypeDefinition[];
  alarms: Alarm[];
  onCall?: (phone: string, facility?: Facility) => void;
}) => {
  const [sidebarTab, setSidebarTab] = useState<'OBJECTS' | 'UNITS'>('OBJECTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'FACILITY' | 'UNIT', id: string } | null>(null);
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number; zoom?: number } | undefined>(undefined);

  // Collapsible state for department groups
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(() => {
     // Initialize all departments as expanded
     return Object.keys(DEPARTMENTS).reduce((acc, key) => {
         acc[key] = true;
         return acc;
     }, {} as Record<string, boolean>);
  });

  const toggleDept = (deptKey: string) => {
      setExpandedDepts(prev => ({
          ...prev,
          [deptKey]: !prev[deptKey]
      }));
  };

  // Filtering
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [facilities, searchQuery]);

  const filteredUnits = useMemo(() => {
    return units.filter(u => 
      u.shiftStatus !== 'OFF_DUTY' && 
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [units, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    // Helper to get alarm type
    const getActiveAlarmType = (facility: Facility) => {
        if (!facility.activeAlarmId) return null;
        const alarm = alarms.find(a => a.id === facility.activeAlarmId);
        return alarm ? alarm.type : null;
    };

    const facilitiesWithAlarms = facilities.filter(f => f.activeAlarmId);
    
    // Count Alarms (General, Silent, etc.) - Excluding Warnings
    const inAlarmCount = facilitiesWithAlarms.filter(f => {
        const type = getActiveAlarmType(f);
        return type && !isWarningType(type);
    }).length;

    // Count Warnings (Power, Battery, Connection)
    const warningCount = facilitiesWithAlarms.filter(f => {
        const type = getActiveAlarmType(f);
        return type && isWarningType(type);
    }).length;

    // Normal (Total - Alarm - Warning)
    const normalCount = facilities.length - inAlarmCount - warningCount;

    return {
      facilities: {
        total: facilities.length,
        normal: normalCount,
        inAlarm: inAlarmCount,
        warning: warningCount
      },
      units: {
        total: units.filter(u => u.shiftStatus !== 'OFF_DUTY').length,
        online: units.filter(u => u.shiftStatus === 'ON_DUTY').length,
        inAlarm: units.filter(u => u.shiftStatus === 'ALARM').length,
        break: units.filter(u => u.shiftStatus === 'BREAK').length
      }
    };
  }, [facilities, units, alarms]);

  // Visual Helpers
  const getFacilityColor = (f: Facility) => {
    if (f.activeAlarmId) {
       // Check if it's a warning or alarm
       const alarm = alarms.find(a => a.id === f.activeAlarmId);
       if (alarm && isWarningType(alarm.type)) {
           return 'bg-amber-500 border-white'; // Warning Color
       }
       return 'bg-red-600 border-white animate-pulse'; // Alarm Color
    }
    if (f.connectionStatus === 'OFFLINE') return 'bg-gray-500 border-gray-300';
    return 'bg-green-600 border-white';
  };

  const getUnitColor = (u: Unit) => {
    if (u.shiftStatus === 'OFF_DUTY') return 'bg-gray-500 border-gray-300';
    if (u.shiftStatus === 'ALARM') return 'bg-red-600 border-white animate-pulse';
    if (u.shiftStatus === 'BREAK') return 'bg-blue-600 border-white';
    return 'bg-green-600 border-white';
  };

  const selectedData = useMemo(() => {
    if (!selectedEntity) return null;
    if (selectedEntity.type === 'FACILITY') return facilities.find(f => f.id === selectedEntity.id);
    if (selectedEntity.type === 'UNIT') return units.find(u => u.id === selectedEntity.id);
    return null;
  }, [selectedEntity, facilities, units]);

  // Zoom to selected facility/unit whenever selection changes
  useEffect(() => {
    if (!selectedEntity || !selectedData) return;
    const coords =
      selectedEntity.type === 'FACILITY'
        ? (selectedData as Facility).coordinates
        : (selectedData as Unit).coordinates;

    setMapFocus({
      lat: coords.lat,
      lng: coords.lng,
      zoom: selectedEntity.type === 'FACILITY' ? 15 : 16,
    });
  }, [selectedEntity, selectedData]);

  // Create map markers
  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = [];

    // Add facility markers
    facilities.forEach(f => {
      markers.push({
        id: `facility-${f.id}`,
        coordinates: f.coordinates,
        onClick: () => setSelectedEntity({ type: 'FACILITY', id: f.id }),
        element: (
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg cursor-pointer transition-transform hover:scale-110 ${getFacilityColor(f)} ${selectedEntity?.id === f.id ? 'ring-4 ring-blue-500' : ''}`}
          >
            {f.type === 'BANK' ? <Shield className="w-4 h-4 text-white" /> : 
              f.type === 'SCHOOL' ? <BookIcon className="w-4 h-4 text-white" /> :
              <Shield className="w-4 h-4 text-white" />}
          </div>
        )
      });
    });

    // Add unit markers
    units.filter(u => u.shiftStatus !== 'OFF_DUTY').forEach(u => {
      markers.push({
        id: `unit-${u.id}`,
        coordinates: u.coordinates,
        onClick: () => setSelectedEntity({ type: 'UNIT', id: u.id }),
        element: (
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-xl cursor-pointer transition-transform hover:scale-110 relative ${getUnitColor(u)} ${selectedEntity?.id === u.id ? 'ring-4 ring-blue-500' : ''}`}
          >
            <Car className="w-5 h-5 text-white" />
            {/* Status Badges */}
            {u.isWifiLost && (
                <div className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-0.5 border border-white">
                  <WifiOff className="w-2.5 h-2.5 text-red-400" />
                </div>
            )}
            {u.isGpsLost && (
                <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-0.5 border border-white">
                  <Radio className="w-2.5 h-2.5 text-orange-400" />
                </div>
            )}
          </div>
        )
      });
    });

    return markers;
  }, [facilities, units, selectedEntity, alarms]);

  return (
    <div className="flex h-full relative">
       {/* Map Layer */}
       <div className="flex-1 relative bg-gray-100 overflow-hidden">
          <MapLibreMap 
            markers={mapMarkers}
            height="100%"
            focus={mapFocus}
            autoFitBounds={!selectedEntity}
          />

          {/* Statistics Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-center pointer-events-none z-10">
             <div className="bg-white/95 backdrop-blur shadow-lg border border-gray-200 rounded-xl p-2 flex gap-8 pointer-events-auto">
                <div className="flex flex-col items-center px-4 border-r border-gray-200">
                   <span className="text-xs font-bold text-gray-500 uppercase mb-1">Պահպանվող Օբյեկտներ</span>
                   <div className="flex gap-4 text-sm">
                      <div className="flex flex-col items-center"><span className="font-bold text-gray-900">{stats.facilities.total}</span><span className="text-[10px] text-gray-400">Ընդհանուր</span></div>
                      <div className="flex flex-col items-center"><span className="font-bold text-green-600">{stats.facilities.normal}</span><span className="text-[10px] text-gray-400">Նորմալ</span></div>
                      <div className="flex flex-col items-center"><span className="font-bold text-red-600">{stats.facilities.inAlarm}</span><span className="text-[10px] text-gray-400">Տագնապ</span></div>
                      <div className="flex flex-col items-center"><span className="font-bold text-amber-500">{stats.facilities.warning}</span><span className="text-[10px] text-gray-400">Զգուշացում</span></div>
                   </div>
                </div>
                <div className="flex flex-col items-center px-4">
                   <span className="text-xs font-bold text-gray-500 uppercase mb-1">Կարգախմբեր</span>
                   <div className="flex gap-4 text-sm">
                      <div className="flex flex-col items-center"><span className="font-bold text-gray-900">{stats.units.total}</span><span className="text-[10px] text-gray-400">Ընդհանուր</span></div>
                      <div className="flex flex-col items-center"><span className="font-bold text-green-600">{stats.units.online}</span><span className="text-[10px] text-gray-400">Օնլայն</span></div>
                      <div className="flex flex-col items-center"><span className="font-bold text-red-600">{stats.units.inAlarm}</span><span className="text-[10px] text-gray-400">Տագնապ</span></div>
                      <div className="flex flex-col items-center"><span className="font-bold text-blue-600">{stats.units.break}</span><span className="text-[10px] text-gray-400">Դադար</span></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Details Popup */}
          {selectedEntity && selectedData && (
             <div className="absolute top-20 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40 animate-in slide-in-from-right duration-200">
                <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
                   <h3 className="font-bold text-gray-900">
                      {selectedEntity.type === 'FACILITY' ? 'Օբյեկտի Տվյալներ' : 'Կարգախմբի Տվյալներ'}
                   </h3>
                   <button onClick={() => setSelectedEntity(null)} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                   {selectedEntity.type === 'FACILITY' ? (() => {
                      const f = selectedData as Facility;
                      const activeAlarm = alarms.find(a => a.id === f.activeAlarmId);
                      const isWarning = activeAlarm && isWarningType(activeAlarm.type);

                      return (
                        <>
                           <div>
                              <div className="text-lg font-bold text-gray-900 leading-tight">{f.name}</div>
                              <div className="text-xs font-mono text-gray-500 mt-1">{f.id}</div>
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-xs text-gray-400 block">Տեսակ</span>{facilityTypes.find(t => t.code === f.type)?.name || f.type}</div>
                              <div><span className="text-xs text-gray-400 block">Բաժին</span>{DEPARTMENTS[f.department]}</div>
                              <div className="col-span-2"><span className="text-xs text-gray-400 block">Հասցե</span>{f.address}</div>
                              <div className="col-span-2 border-t border-gray-100 pt-2 flex items-center justify-between">
                                 <span className="text-gray-500">Կարգավիճակ:</span>
                                 <span className={`font-bold px-2 py-0.5 rounded text-xs ${f.isArmed ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {f.isArmed ? 'Պահպանության տակ' : 'Հանված է պահպանությունից'}
                                 </span>
                              </div>
                              {f.activeAlarmId && (
                                <div className={`col-span-2 p-2 rounded border mt-1 ${isWarning ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                                   <div className={`flex items-center gap-2 font-bold mb-1 ${isWarning ? 'text-amber-700' : 'text-red-700'}`}>
                                      <AlertTriangle className="w-4 h-4" /> {isWarning ? 'ԶԳՈՒՇԱՑՈՒՄ!' : 'ՏԱԳՆԱՊ!'}
                                   </div>
                                   <div className="flex justify-between items-start">
                                      <div className={`text-xs ${isWarning ? 'text-amber-600' : 'text-red-600'}`}>ID: {f.activeAlarmId}</div>
                                      {activeAlarm ? (
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            isWarning 
                                              ? 'text-amber-700 bg-amber-100 border-amber-200' 
                                              : 'text-red-700 bg-red-100 border-red-200'
                                          }`}>
                                              {TYPE_LABELS[activeAlarm.type]}
                                          </span>
                                      ) : null}
                                   </div>
                                </div>
                              )}
                              <div className="col-span-2 pt-2">
                                 <span className="text-xs text-gray-400 block">Գրաֆիկ</span>
                                 <div className="text-xs bg-gray-50 p-1 rounded border border-gray-100 text-gray-600">{f.schedule}</div>
                              </div>
                              <div className="col-span-2">
                                 <span className="text-xs text-gray-400 block mb-1">Կոնտակտ</span>
                                 <div className="bg-gray-50 p-2 rounded border border-gray-100 space-y-2">
                                    <div className="text-sm font-medium text-gray-900">{f.contactPerson}</div>
                                    <div className="space-y-1">
                                      {(f.phones || []).map((phone) => (
                                        <div
                                          key={phone}
                                          className="flex items-center justify-between bg-white/70 px-2 py-1.5 rounded border border-gray-100"
                                        >
                                          <div className="text-xs font-mono text-gray-600">{phone}</div>
                                          <button
                                            type="button"
                                            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                                            title={`Զանգել ${phone}`}
                                            onClick={() => {
                                              // Demo flow (toast)
                                              onCall?.(phone, f);

                                              // Best-effort real call action on mobile / supported desktops
                                              try {
                                                window.location.href = toTelHref(phone);
                                              } catch {
                                                // ignore
                                              }
                                            }}
                                          >
                                            <PhoneCall className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </>
                      );
                   })() : (() => {
                      const u = selectedData as Unit;
                      return (
                        <>
                           <div>
                              <div className="text-lg font-bold text-gray-900 leading-tight">{u.name}</div>
                              <div className="flex gap-2 mt-1">
                                 <span className="text-sm font-mono text-gray-600 bg-gray-100 px-1.5 rounded border border-gray-200" title="Պետհամարանիշ">{u.plateNumber}</span>
                                 <span className="text-sm font-mono text-blue-600 bg-blue-50 px-1.5 rounded border border-blue-100" title="Բորտի համար">{u.boardNumber}</span>
                              </div>
                           </div>
                           <div className="text-sm space-y-3">
                              <div className="flex justify-between">
                                 <span className="text-gray-500">Բաժին</span>
                                 <span className="font-medium">{DEPARTMENTS[u.department]}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-500">Կարգավիճակ</span>
                                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    u.shiftStatus === 'ON_DUTY' ? 'bg-green-100 text-green-700' :
                                    u.shiftStatus === 'ALARM' ? 'bg-red-100 text-red-700' :
                                    u.shiftStatus === 'BREAK' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                                 }`}>
                                    {u.shiftStatus === 'ON_DUTY' ? 'Հերթափոխի մեջ' :
                                     u.shiftStatus === 'ALARM' ? 'Տագնապ' :
                                     u.shiftStatus === 'BREAK' ? 'Դադար' : 'Հերթափոխից դուրս'}
                                 </span>
                              </div>
                              <div className="text-xs text-gray-500 flex justify-between">
                                 <span>Կարգավիճակի սկիզբ:</span>
                                 <span className="font-medium">
                                    {u.statusStartTime.toLocaleDateString('hy-AM')} {u.statusStartTime.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}
                                 </span>
                              </div>

                              <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs space-y-1">
                                <div className="font-semibold text-gray-700">Հերթափոխ</div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Սկիզբ:</span>
                                    <span>{u.shiftStartTime.toLocaleDateString('hy-AM')} {u.shiftStartTime.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                {u.shiftEndTime && (
                                     <div className="flex justify-between">
                                        <span className="text-gray-500">Ավարտ:</span>
                                        <span>{u.shiftEndTime.toLocaleDateString('hy-AM')} {u.shiftEndTime.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                )}
                              </div>
                              
                              {u.activeAlarmId && (
                                <div className="bg-red-50 p-2 rounded border border-red-100">
                                   <div className="text-red-700 font-bold text-xs">Կցված Տագնապ: {u.activeAlarmId}</div>
                                </div>
                              )}

                              <div>
                                 <span className="text-xs text-gray-400 block mb-1">Անձնակազմ</span>
                                 <div className="space-y-2">
                                    {u.crew.map((member, idx) => (
                                       <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-100 flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                             <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                             <span className="text-xs font-bold">{member.name}</span>
                                             <span className="text-xs text-gray-500 ml-auto">{member.role}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 pl-4">
                                             <div>Կրծքանշան: {member.badge}</div>
                                             <div>Հեռ: {member.phone}</div>
                                             <div className="col-span-2 text-gray-400">
                                                Մուտք: {member.lastLogin.toLocaleDateString('hy-AM')} {member.lastLogin.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </>
                      );
                   })()}
                </div>
             </div>
          )}
       </div>

       {/* Left Sidebar List */}
       <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-20 shadow-xl">
          <div className="p-2 flex gap-2 border-b border-gray-200 bg-gray-50">
             <button 
               onClick={() => {
                   setSidebarTab('OBJECTS');
                   if (selectedEntity?.type === 'UNIT') setSelectedEntity(null);
               }}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${sidebarTab === 'OBJECTS' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
             >
                Օբյեկտներ
             </button>
             <button 
               onClick={() => {
                   setSidebarTab('UNITS');
                   if (selectedEntity?.type === 'FACILITY') setSelectedEntity(null);
               }}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${sidebarTab === 'UNITS' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
             >
                Կարգախմբեր
             </button>
          </div>
          <div className="p-3 border-b border-gray-200">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Որոնել..." 
                  className="w-full bg-gray-100 border-none rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-0 space-y-0">
             {sidebarTab === 'OBJECTS' ? (
                Object.entries(DEPARTMENTS).map(([deptKey, deptName]) => {
                   const items = filteredFacilities.filter(f => f.department === deptKey);
                   if (items.length === 0) return null;
                   
                   const isExpanded = expandedDepts[deptKey];

                   return (
                     <div key={deptKey}>
                        <div 
                          onClick={() => toggleDept(deptKey)}
                          className="sticky top-0 bg-gray-50/95 backdrop-blur border-y border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase z-10 cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors"
                        >
                           <span>{deptName}</span>
                           <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                        </div>
                        {isExpanded && (
                          <div className="p-2 space-y-1">
                             {items.map(f => {
                                const activeAlarm = alarms.find(a => a.id === f.activeAlarmId);
                                const isWarning = activeAlarm && isWarningType(activeAlarm.type);
                                
                                return (
                                  <div 
                                     key={f.id} 
                                     onClick={() => setSelectedEntity({ type: 'FACILITY', id: f.id })}
                                     className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 flex items-center justify-between group transition-all ${selectedEntity?.id === f.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200'}`}
                                  >
                                     <div className="flex-1 min-w-0 pr-2">
                                        <div className="text-sm font-bold text-gray-900 truncate">{f.name}</div>
                                        <div className="text-[10px] text-gray-400">{f.id}</div>
                                     </div>
                                     <div className={`w-2 h-2 shrink-0 rounded-full ${
                                         f.activeAlarmId 
                                            ? isWarning ? 'bg-amber-500' : 'bg-red-500 animate-pulse' 
                                            : f.connectionStatus === 'OFFLINE' ? 'bg-gray-400' : 'bg-green-500'
                                     }`}></div>
                                  </div>
                                );
                             })}
                          </div>
                        )}
                     </div>
                   );
                })
             ) : (
                Object.entries(DEPARTMENTS).map(([deptKey, deptName]) => {
                   const items = filteredUnits.filter(u => u.department === deptKey);
                   if (items.length === 0) return null;
                   
                   const isExpanded = expandedDepts[deptKey];

                   return (
                     <div key={deptKey}>
                        <div 
                          onClick={() => toggleDept(deptKey)}
                          className="sticky top-0 bg-gray-50/95 backdrop-blur border-y border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase z-10 cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors"
                        >
                           <span>{deptName}</span>
                           <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                        </div>
                        {isExpanded && (
                          <div className="p-2 space-y-1">
                              {items.map(u => (
                                 <div 
                                    key={u.id} 
                                    onClick={() => setSelectedEntity({ type: 'UNIT', id: u.id })}
                                    className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 flex items-center justify-between group transition-all ${selectedEntity?.id === u.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200'}`}
                                 >
                                    <div>
                                       <div className="text-sm font-bold text-gray-900">{u.name}</div>
                                       <div className="text-xs text-gray-400">{u.plateNumber}</div>
                                    </div>
                                    <div className="flex gap-1">
                                      {u.isWifiLost && <WifiOff className="w-3 h-3 text-red-400" />}
                                      {u.isGpsLost && <Radio className="w-3 h-3 text-orange-400" />}
                                      <div className={`w-2 h-2 rounded-full ${
                                           u.shiftStatus === 'ON_DUTY' ? 'bg-green-500' :
                                           u.shiftStatus === 'ALARM' ? 'bg-red-500 animate-pulse' :
                                           u.shiftStatus === 'BREAK' ? 'bg-blue-500' : 'bg-gray-400'
                                        }`}></div>
                                    </div>
                                 </div>
                              ))}
                          </div>
                        )}
                     </div>
                   );
                })
             )}
          </div>
       </div>
    </div>
  );
};

export default SecurityMapPage;
