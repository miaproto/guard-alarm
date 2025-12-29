import React from 'react';
import { Users } from 'lucide-react';
import { AppView } from '../types';

function getTitle(currentView: AppView) {
  return currentView === 'ALARMS'
    ? 'Տագնապներ/Զգուշացումներ'
    : currentView === 'MAP'
      ? 'Պահպանության Քարտեզ'
      : currentView === 'CALLS'
        ? 'Զանգեր'
        : currentView === 'LOGS'
          ? 'Պահպանության Լոգեր'
          : currentView === 'DEPARTMENTS'
            ? 'Պահպանության Բաժիններ'
            : currentView === 'FACILITIES'
              ? 'Պահպանվող Օբյեկտներ'
              : currentView === 'VEHICLES'
                ? 'Ավտոմեքենաներ'
                : currentView === 'UNITS_MANAGEMENT'
                  ? 'Կարգախմբերի Կառավարում'
                  : 'Պահպանվող Օբյեկտների Տեսակներ';
}

export function AppHeader({ currentView, currentUsername }: { currentView: AppView; currentUsername: string }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getTitle(currentView)}</h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">{currentUsername}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
          <Users className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </header>
  );
}


