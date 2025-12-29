import React from 'react';
import {
  Shield,
  AlertTriangle,
  Map as MapIcon,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Phone,
} from 'lucide-react';

import { SidebarItem } from '../../components/Shared';
import { AppView } from '../types';

type Props = {
  currentView: AppView;
  setCurrentView: (v: AppView) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
};

export function AppSidebar({
  currentView,
  setCurrentView,
  isSettingsOpen,
  setIsSettingsOpen,
  isCollapsed,
  setIsCollapsed,
}: Props) {
  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[2px_0_20px_rgba(0,0,0,0.02)] z-20 transition-[width] duration-200 ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className={`h-16 flex items-center border-b border-slate-100 gap-3 ${isCollapsed ? 'px-3 justify-between' : 'px-6'}`}>
        <Shield className="w-7 h-7 text-blue-600 fill-blue-100 shrink-0" />
        {!isCollapsed && (
          <div className="leading-tight">
            <div className="font-bold text-slate-900 tracking-wide text-lg">ՀՀ ՆԳՆ</div>
            <div className="text-[10px] text-blue-600 font-bold tracking-[0.2em] uppercase">ՏԱԳՆԱՊՆԵՐԻ ԿԱՌԱՎԱՐՈՒՄ</div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            const next = !isCollapsed;
            setIsCollapsed(next);
            if (next) setIsSettingsOpen(false);
          }}
          className="ml-auto p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          title={isCollapsed ? 'Բացել ընտրացանկը' : 'Փակել ընտրացանկը'}
          aria-label={isCollapsed ? 'Բացել ընտրացանկը' : 'Փակել ընտրացանկը'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className={`flex-1 py-6 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Գլխավոր</div>}
        <SidebarItem
          icon={AlertTriangle}
          label="Տագնապներ/Զգուշացումներ"
          active={currentView === 'ALARMS'}
          onClick={() => setCurrentView('ALARMS')}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={MapIcon}
          label="Պահպանության քարտեզ"
          active={currentView === 'MAP'}
          onClick={() => setCurrentView('MAP')}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={Users}
          label="Կարգախմբեր"
          active={currentView === 'UNITS_MANAGEMENT'}
          onClick={() => setCurrentView('UNITS_MANAGEMENT')}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={Phone}
          label="Զանգեր"
          active={currentView === 'CALLS'}
          onClick={() => setCurrentView('CALLS')}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={ClipboardList}
          label="Պահպանության լոգեր"
          active={currentView === 'LOGS'}
          onClick={() => setCurrentView('LOGS')}
          collapsed={isCollapsed}
        />

        {!isCollapsed && <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Կառավարում</div>}

        <div>
          <button
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsSettingsOpen(true);
              } else {
                setIsSettingsOpen(!isSettingsOpen);
              }
            }}
            title={isCollapsed ? 'Կարգավորումներ' : undefined}
            aria-label={isCollapsed ? 'Կարգավորումներ' : undefined}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors text-left ${
              isSettingsOpen || ['DEPARTMENTS', 'FACILITIES', 'FACILITY_TYPES', 'VEHICLES'].includes(currentView)
                ? 'bg-slate-50 text-slate-900 font-medium'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
              <Settings className="w-5 h-5 text-slate-400" strokeWidth={2} />
              {!isCollapsed && <span className="text-sm">Կարգավորումներ</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSettingsOpen ? 'rotate-90' : ''}`} />
            )}
          </button>

          {isSettingsOpen && !isCollapsed && (
            <div className="pl-4 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200 border-l-2 border-slate-100 ml-5">
              <button
                onClick={() => setCurrentView('DEPARTMENTS')}
                className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                  currentView === 'DEPARTMENTS' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Պահպանության բաժիններ
              </button>
              <button
                onClick={() => setCurrentView('FACILITIES')}
                className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                  currentView === 'FACILITIES' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Պահպանվող օբյեկտներ
              </button>
              <button
                onClick={() => setCurrentView('VEHICLES')}
                className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                  currentView === 'VEHICLES' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Ավտոմեքենաներ
              </button>
              <button
                onClick={() => setCurrentView('FACILITY_TYPES')}
                className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                  currentView === 'FACILITY_TYPES' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Օբյեկտների տեսակներ
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2 text-slate-500 hover:text-red-600 transition-colors w-full rounded-lg hover:bg-red-50`}
          title={isCollapsed ? 'Դուրս գալ' : undefined}
          aria-label={isCollapsed ? 'Դուրս գալ' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Դուրս գալ</span>}
        </button>
      </div>
    </aside>
  );
}


