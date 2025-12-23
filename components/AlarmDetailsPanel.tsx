
import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, Siren, Shield, MapPin, Navigation, ChevronDown, Users, Phone, PhoneCall, Activity, ArrowDownLeft, Play, CheckCircle, FileText, Eye, EyeOff, Lock, Zap, BatteryWarning, WifiOff, BellOff } from 'lucide-react';
import { Alarm, UnitAction, FacilityTypeDefinition } from '../types';
import { StatusBadge } from './Shared';
import { TYPE_LABELS, isWarningType } from '../utils';
import { DEPARTMENTS } from '../mockData';

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
  onFinish: () => void;
  onDownloadReport: () => void;
  onViewMap: () => void;
  facilityTypes: FacilityTypeDefinition[];
}) => {
  const [finishReason, setFinishReason] = useState('RESOLVED');
  const [isFinishing, setIsFinishing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isUnitsOpen, setIsUnitsOpen] = useState(true);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setIsUnitsOpen(true);
    setIsContactsOpen(false);
    setIsHistoryOpen(false);
    setShowPassword(false);
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
             <div className="text-xs text-slate-500 font-medium">Մանրամասն տեղեկատվություն</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
          
          {/* Header Info Card */}
          <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
             <div className="flex items-center justify-between text-sm pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-mono font-medium">{alarm.timestamp.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}</span>
                    <span className="text-slate-300">|</span>
                    <span>{alarm.timestamp.toLocaleDateString('hy-AM')}</span>
                </div>
                <div className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-lg border ${getTypeStyle()}`}>
                    {getTypeIcon()}
                    {TYPE_LABELS[alarm.type]}
                </div>
             </div>

             <div className="flex items-start gap-4">
                <div className="mt-1 w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl text-white shadow-blue-200 shadow-lg">
                   <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1.5">{alarm.facilityName}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                     <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono font-semibold">{alarm.facilityCode}</span>
                     <span>•</span>
                     <span className="font-medium">{DEPARTMENTS[alarm.department]}</span>
                     <span>•</span>
                     <span className="text-slate-700">{facilityTypes.find(t => t.code === alarm.facilityType)?.name || alarm.facilityType}</span>
                  </div>
                  
                  <button 
                    onClick={onViewMap}
                    className="flex items-center gap-2 text-slate-600 text-sm hover:text-blue-600 transition-colors group text-left" 
                  >
                     <MapPin className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-500" />
                     <span className="border-b border-dashed border-slate-300 group-hover:border-blue-300">{alarm.address}</span>
                  </button>

                  {alarm.facilityPassword && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-center justify-between border border-amber-200">
                         <div className="flex items-center gap-2 text-amber-800">
                             <Lock className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase tracking-wide">Գաղտնաբառ</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded border border-amber-100 min-w-[80px] text-center tracking-widest text-lg">
                                {showPassword ? alarm.facilityPassword : '••••••'}
                            </span>
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded p-1.5 transition-colors"
                                title={showPassword ? 'Թաքցնել' : 'Ցուցադրել'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                 <div className="p-5 bg-white">
                     {Object.keys(groupedActions).length === 0 ? (
                       <div className="text-sm text-slate-400 italic text-center py-4">Դեռևս գործողություններ չկան</div>
                     ) : (
                       <div className="space-y-6">
                          {Object.entries(groupedActions).map(([unitName, actions]: [string, UnitAction[]]) => (
                             <div key={unitName} className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                   <div className="h-px bg-slate-200 flex-1"></div>
                                   <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full text-xs">{unitName}</span>
                                   <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                                
                                <div className="space-y-0 relative ml-4">
                                   <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

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
                                          <div key={idx} className="relative pl-8 pb-6 last:pb-0 group">
                                              <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full ${iconColor} border-4 border-white z-10 shadow-sm ring-1 ring-slate-100`}></div>
                                              <div className={`flex flex-col p-3 rounded-lg border transition-all ${highlight ? 'bg-slate-50 border-slate-200' : 'border-transparent'}`}>
                                                  <span className={`text-sm ${textColor}`}>
                                                      {action.action}
                                                  </span>
                                                  <div className="text-xs text-slate-400 font-mono mt-1 flex gap-2">
                                                      <span className="font-medium text-slate-500">{action.timestamp.toLocaleTimeString('hy-AM', {hour:'2-digit', minute:'2-digit'})}</span>
                                                      <span>•</span>
                                                      <span>{action.timestamp.toLocaleDateString('hy-AM', {day: '2-digit', month: '2-digit'})}</span>
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
                className={`w-full flex items-center justify-between p-5 transition-colors ${isContactsOpen ? 'bg-slate-50 text-slate-900 border-b border-slate-100' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isContactsOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Կոնտակտային Տվյալներ</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isContactsOpen ? 'rotate-180' : ''}`} />
              </button>

             {isContactsOpen && (
                <div className="p-5 bg-white space-y-4">
                   <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Կոնտակտային անձ</div>
                        <div className="text-slate-900 font-bold text-lg">{alarm.contactPerson}</div>
                      </div>
                   </div>
                   
                   <div className="grid gap-3">
                     {alarm.contactPhones.map((phone, index) => (
                       <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors group">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                                <Phone className="w-5 h-5" />
                             </div>
                             <span className="font-mono text-lg font-medium text-slate-700">{phone}</span>
                          </div>
                          <button 
                            onClick={() => onCall(phone)}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
                          >
                             <PhoneCall className="w-4 h-4" />
                             Զանգ
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
                     alarm.callHistory.map(call => (
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
                            <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md font-mono">{call.durationSec} վրկ</span>
                            <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                              <Play className="w-3 h-3 fill-current" />
                              Լսել
                            </button>
                          </div>
                        </div>
                     </div>
                   ))
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
                      onChange={(e) => setFinishReason(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-4 transition-shadow"
                    >
                       {!isWarning && <option value="FALSE_ALARM">Կեղծ տագնապ (False Alarm)</option>}
                       <option value="RESOLVED">Խնդիրը լուծված է (Resolved)</option>
                       <option value="TEST">Ստուգում (System Test)</option>
                    </select>
                    <div className="flex gap-3">
                       <button onClick={() => { onFinish(); setIsFinishing(false); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200">Հաստատել</button>
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

// Helper for Lucide icon in map (not exported in original Shared but used here)
const Building2 = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
);

export default AlarmDetailsPanel;
