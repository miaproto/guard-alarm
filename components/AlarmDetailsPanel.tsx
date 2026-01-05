
import React, { useMemo, useState, useEffect } from 'react';
import { X, Clock, Siren, Shield, MapPin, Navigation, ChevronDown, Users, Phone, PhoneCall, Activity, ArrowDownLeft, CheckCircle, FileText, Eye, EyeOff, Lock, Zap, BatteryWarning, WifiOff, BellOff, Building2 } from 'lucide-react';
import { Alarm, UnitAction, FacilityTypeDefinition } from '../types';
import { StatusBadge } from './Shared';
import { TYPE_LABELS, isWarningType, formatDuration } from '../utils';
import { DEPARTMENTS } from '../mockData';
import { WaveformPlayer } from './calls/WaveformPlayer';

type FinishReason = 'FALSE_ALARM' | 'RESOLVED' | 'TEST';

const AlarmDetailsPanel = ({ 
  alarm, 
  onClose, 
  onCall,
  onFinish,
  onDownloadReport,
  onViewMap,
  facilityTypes
}: { 
  alarm: Alarm; 
  onClose: () => void;
  onCall: (phone: string) => void;
  onFinish: (reason: FinishReason) => void;
  onDownloadReport: () => void;
  onViewMap: () => void;
  facilityTypes: FacilityTypeDefinition[];
}) => {
  const [finishReason, setFinishReason] = useState<FinishReason>('RESOLVED');
  const [isFinishing, setIsFinishing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isUnitsOpen, setIsUnitsOpen] = useState(true);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [recordingProgress, setRecordingProgress] = useState<Record<string, { current: number; duration: number }>>({});

  useEffect(() => {
    setIsUnitsOpen(true);
    setIsContactsOpen(false);
    setIsHistoryOpen(false);
    setShowPassword(false);
    setPlayingRecordingId(null);
    setRecordingProgress({});
    // Set default finish reason based on type
    if (isWarningType(alarm.type)) {
      setFinishReason('RESOLVED');
    } else {
      setFinishReason('FALSE_ALARM');
    }
  }, [alarm.id, alarm.type]);

  const groupedActions = useMemo(() => {
    const groups: Record<string, UnitAction[]> = {};
    alarm.unitActions.forEach(action => {
       if (!groups[action.unitName]) groups[action.unitName] = [];
       groups[action.unitName].push(action);
    });
    Object.keys(groups).forEach(key => {
       groups[key].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
    return groups;
  }, [alarm.unitActions]);

  const canFinish = alarm.status === 'RECEIVED' || (alarm.status === 'ACTIVE' && alarm.unitFinishedWork);
  
  const isWarning = isWarningType(alarm.type);

  const getTypeIcon = () => {
    switch (alarm.type) {
        case 'GENERAL': return <Siren className="w-4 h-4" />;
        case 'SILENT': return <BellOff className="w-4 h-4" />;
        case 'POWER_LOSS': return <Zap className="w-4 h-4" />;
        case 'LOW_BATTERY': return <BatteryWarning className="w-4 h-4" />;
        case 'CONNECTION_LOST': return <WifiOff className="w-4 h-4" />;
        default: return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeStyle = () => {
      switch(alarm.type) {
          case 'GENERAL': return 'bg-red-50 text-red-700 border-red-200';
          case 'SILENT': return 'bg-red-50 text-red-700 border-red-200';
          case 'POWER_LOSS': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          case 'LOW_BATTERY': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          case 'CONNECTION_LOST': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          default: return 'bg-blue-50 text-blue-700 border-blue-100';
      }
  };

  return (
    <div className="w-[600px] h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans">
       <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 bg-white shrink-0">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{alarm.id}</h2>
                 <StatusBadge status={alarm.status} />
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
          
          {/* Header Info Card */}
          <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
             <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-mono font-medium">{alarm.timestamp.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}</span>
                    <span className="text-slate-300">|</span>
                    <span>{alarm.timestamp.toLocaleDateString('hy-AM')}</span>
                </div>
                <div className={`flex items-center gap-2 font-bold px-2 py-1 rounded-md border ${getTypeStyle()}`}>
                    {getTypeIcon()}
                    {TYPE_LABELS[alarm.type]}
                </div>
             </div>

             <div className="flex items-start gap-3">
                <div className="mt-0.5 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl text-white shadow-blue-200 shadow-md">
                   <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 leading-snug mb-1">{alarm.facilityName}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                     <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono font-semibold">{alarm.facilityCode}</span>
                     <span>•</span>
                     <span className="font-medium">{DEPARTMENTS[alarm.department]}</span>
                     <span>•</span>
                     <span className="text-slate-700">{facilityTypes.find(t => t.code === alarm.facilityType)?.name || alarm.facilityType}</span>
                  </div>
                  
                  <button 
                    onClick={onViewMap}
                    className="flex items-center gap-2 text-slate-600 text-xs hover:text-blue-600 transition-colors group text-left" 
                  >
                     <MapPin className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-500" />
                     <span className="border-b border-dashed border-slate-300 group-hover:border-blue-300">{alarm.address}</span>
                  </button>

                  {alarm.facilityPassword && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg flex items-center justify-between border border-amber-200">
                         <div className="flex items-center gap-2 text-amber-800">
                             <Lock className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase tracking-wide">Գաղտնաբառ</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-amber-100 min-w-[72px] text-center tracking-widest text-base">
                                {showPassword ? alarm.facilityPassword : '••••••'}
                            </span>
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded p-1 transition-colors"
                                title={showPassword ? 'Թաքցնել' : 'Ցուցադրել'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                         </div>
                    </div>
                  )}
                </div>
             </div>
          </section>

          {/* Unit Actions Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setIsUnitsOpen(!isUnitsOpen)} 
                className={`w-full flex items-center justify-between p-5 transition-colors ${isUnitsOpen ? 'bg-slate-50 text-slate-900 border-b border-slate-100' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isUnitsOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Navigation className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Կարգախմբերի Գործողություններ</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isUnitsOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {isUnitsOpen && (
                 <div className="p-4 bg-white">
                     {Object.keys(groupedActions).length === 0 ? (
                       <div className="text-sm text-slate-400 italic text-center py-3">Դեռևս գործողություններ չկան</div>
                     ) : (
                       <div className="space-y-4">
                          {Object.entries(groupedActions).map(([unitName, actions]: [string, UnitAction[]]) => (
                             <div key={unitName} className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                                     {unitName}
                                   </span>
                                   <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                                
                                <div className="space-y-0 relative ml-2">
                                   <div className="absolute left-[5px] top-1 bottom-1 w-px bg-slate-200"></div>

                                   {actions.map((action, idx) => {
                                      let iconColor = 'bg-slate-400 border-slate-200';
                                      let textColor = 'text-slate-600';
                                      let highlight = false;
                                      
                                      if (action.actionType === 'RECEIVE') { iconColor = 'bg-slate-400'; textColor = 'text-slate-500'; }
                                      if (action.actionType === 'ACCEPT') { iconColor = 'bg-blue-500'; textColor = 'text-blue-700 font-semibold'; highlight = true; }
                                      if (action.actionType === 'REJECT') { iconColor = 'bg-red-500'; textColor = 'text-red-600 font-semibold'; }
                                      if (action.actionType === 'ARRIVE') { iconColor = 'bg-amber-500'; textColor = 'text-amber-700 font-semibold'; highlight = true; }
                                      if (action.actionType === 'FINISH') { iconColor = 'bg-green-500'; textColor = 'text-green-700 font-bold'; highlight = true; }

                                      return (
                                          <div key={idx} className="relative pl-6 pb-3 last:pb-0 group">
                                              <div
                                                className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${iconColor} border-2 border-white z-10 shadow-sm ring-1 ring-slate-100`}
                                              ></div>
                                              <div
                                                className={`flex items-start justify-between gap-3 rounded-md px-2 py-1.5 transition-colors ${
                                                  highlight ? 'bg-slate-50' : 'bg-transparent'
                                                }`}
                                              >
                                                  <span className={`text-sm leading-snug ${textColor}`}>
                                                      {action.action}
                                                  </span>
                                                  <div className="text-xs text-slate-400 font-mono flex gap-2 shrink-0">
                                                      <span className="font-medium text-slate-500">
                                                        {action.timestamp.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}
                                                      </span>
                                                      <span>•</span>
                                                      <span>
                                                        {action.timestamp.toLocaleDateString('hy-AM', {day: '2-digit', month: '2-digit'})}
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                   })}
                                </div>
                             </div>
                          ))}
                       </div>
                     )}
                 </div>
              )}
          </div>

          {/* Contacts Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <button 
                onClick={() => setIsContactsOpen(!isContactsOpen)} 
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isContactsOpen ? 'bg-slate-50 text-slate-900 border-b border-slate-100' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-lg ${isContactsOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Կոնտակտային Տվյալներ</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isContactsOpen ? 'rotate-180' : ''}`} />
              </button>

             {isContactsOpen && (
                <div className="px-4 py-3 bg-white space-y-3">
                   <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Կոնտակտային անձ</div>
                        <div className="text-slate-900 font-semibold text-sm truncate">{alarm.contactPerson}</div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium shrink-0">
                        {alarm.contactPhones.length} հեռ․
                      </div>
                   </div>
                   
                   <div className="grid gap-2">
                     {alarm.contactPhones.map((phone, index) => (
                       <div key={index} className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group">
                          <div className="flex items-center gap-2 min-w-0">
                             <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                                <Phone className="w-4 h-4" />
                             </div>
                             <span className="font-mono text-sm font-semibold text-slate-700 truncate">{phone}</span>
                          </div>
                          <button 
                            onClick={() => {
                              onCall(phone);
                              setIsHistoryOpen(true);
                            }}
                            className="h-8 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-md text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm shrink-0"
                          >
                             <PhoneCall className="w-3.5 h-3.5" />
                             <span>Զանգ</span>
                          </button>
                       </div>
                     ))}
                   </div>
                </div>
             )}
          </div>

          {/* Call History Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
              className={`w-full flex items-center justify-between p-5 transition-colors ${isHistoryOpen ? 'bg-slate-50 text-slate-900 border-b border-slate-100' : 'hover:bg-slate-50 text-slate-600'}`}
            >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isHistoryOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider">Զանգերի Պատմություն</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isHistoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isHistoryOpen && (
              <div className="p-5 bg-white space-y-3">
                   {alarm.callHistory.length === 0 ? (
                      <div className="text-sm text-slate-400 italic px-2">Ձայնագրություններ չկան</div>
                   ) : (
                     alarm.callHistory.map((call) => {
                      const waveformId = `${alarm.id}:${call.id}`;
                      const url = call.recordingUrl;
                      const progress = recordingProgress[waveformId];
                      const isThisPlaying = playingRecordingId === waveformId;
                      const totalSec = call.durationSec ?? Math.round(progress?.duration ?? 0);
                      const elapsedSec = Math.floor(progress?.current ?? 0);

                      return (
                     <div key={call.id} className="text-sm p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-center text-slate-500 text-xs uppercase font-semibold tracking-wide">
                          <span className="text-slate-600">{call.operatorName}</span>
                          <span>{call.timestamp.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                              <span className="font-mono text-slate-800 font-medium">{call.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md font-mono">
                              {(isThisPlaying || elapsedSec > 0)
                                ? `${formatDuration(elapsedSec)} / ${formatDuration(totalSec)}`
                                : formatDuration(totalSec)}
                            </span>
                            <WaveformPlayer
                              callId={waveformId}
                              recordingUrl={url}
                              isCurrentlyPlaying={playingRecordingId === waveformId}
                              onPlayStateChange={(id, playing) => {
                                if (playing) setPlayingRecordingId(id);
                                else if (playingRecordingId === id) setPlayingRecordingId(null);
                              }}
                              onProgress={(id, currentTimeSec, durationSec) => {
                                setRecordingProgress((prev) => ({
                                  ...prev,
                                  [id]: { current: currentTimeSec, duration: durationSec || prev[id]?.duration || 0 },
                                }));
                              }}
                            />
                          </div>
                        </div>
                     </div>
                   );
                  })
                   )}
              </div>
            )}
          </div>

       </div>

       {/* Footer Actions */}
       <div className="p-6 border-t border-slate-200 bg-white space-y-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
          {alarm.status !== 'FINISHED' && alarm.status !== 'FALSE_ALARM' && (
            <div className="space-y-4">
              {isFinishing ? (
                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Ընտրեք ավարտման պատճառը</label>
                    <select 
                      value={finishReason}
                      onChange={(e) => setFinishReason(e.target.value as FinishReason)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-4 transition-shadow"
                    >
                       {!isWarning && <option value="FALSE_ALARM">Կեղծ տագնապ (False Alarm)</option>}
                       <option value="RESOLVED">Խնդիրը լուծված է (Resolved)</option>
                       <option value="TEST">Ստուգում (System Test)</option>
                    </select>
                    <div className="flex gap-3">
                       <button onClick={() => { onFinish(finishReason); setIsFinishing(false); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200">Հաստատել</button>
                       <button onClick={() => setIsFinishing(false)} className="px-6 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-colors">Չեղարկել</button>
                    </div>
                 </div>
              ) : (
                <button 
                  onClick={() => setIsFinishing(true)}
                  disabled={!canFinish}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    canFinish 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 hover:-translate-y-0.5' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Ավարտել {isWarning ? 'Զգուշացումը' : 'Տագնապը'}
                </button>
              )}
              
              {!canFinish && alarm.status === 'ACTIVE' && (
                 <p className="text-xs font-medium text-amber-700 text-center bg-amber-50 py-2 rounded-lg border border-amber-100 flex items-center justify-center gap-2">
                   <Clock className="w-3.5 h-3.5" />
                   Սպասեք կարգախմբի գործողությունների ավարտին
                 </p>
              )}
            </div>
          )}

          <button 
             onClick={onDownloadReport}
             className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
             <FileText className="w-5 h-5 text-slate-400" />
             Ներբեռնել Հաշվետվություն
          </button>
       </div>
    </div>
  );
};

export default AlarmDetailsPanel;
