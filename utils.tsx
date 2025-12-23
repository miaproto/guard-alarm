
import React from 'react';

export const formatTimeFirst = (date: Date) => {
  return (
    <div className="flex flex-col">
       <span className="font-mono font-medium text-gray-800 text-sm">
         {date.toLocaleTimeString('hy-AM', {hour: '2-digit', minute:'2-digit'})}
       </span>
       <span className="text-xs text-gray-500">
         {date.toLocaleDateString('hy-AM', {day: '2-digit', month: '2-digit', year: 'numeric'})}
       </span>
    </div>
  );
};

export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

export const ACTION_LABELS: Record<string, string> = {
  'ARM': 'Դրվեց պահպանության',
  'DISARM': 'Հանվեց պահպանությունից',
  'ALARM_GENERAL': 'Ընդհանուր Տագնապ',
  'ALARM_SILENT': 'Լուռ Տագնապ',
  'CONNECTION_LOST': 'Կապի խզում',
  'POWER_LOSS': 'Հոսանքազրկում',
  'LOW_BATTERY': 'Մարտկոցի լիցքաթափում'
};

export const CALL_TYPE_LABELS: Record<string, string> = {
  'INCOMING_ANSWERED': 'Մուտքային պատասխանված',
  'INCOMING_UNANSWERED': 'Մուտքային չպատասխանված',
  'OUTGOING_ANSWERED': 'Ելքային պատասխանված',
  'OUTGOING_UNANSWERED': 'Ելքային չպատասխանված'
};

export const CALL_TYPE_COLORS: Record<string, string> = {
  'INCOMING_ANSWERED': 'bg-green-50 text-green-700 border-green-200',
  'INCOMING_UNANSWERED': 'bg-red-50 text-red-700 border-red-200',
  'OUTGOING_ANSWERED': 'bg-blue-50 text-blue-700 border-blue-200',
  'OUTGOING_UNANSWERED': 'bg-gray-100 text-gray-600 border-gray-200'
};

export const ACTION_COLORS: Record<string, string> = {
  'ARM': 'bg-green-100 text-green-700 border-green-200',
  'DISARM': 'bg-blue-100 text-blue-700 border-blue-200',
  'ALARM_GENERAL': 'bg-red-100 text-red-700 border-red-200',
  'ALARM_SILENT': 'bg-red-100 text-red-700 border-red-200',
  'CONNECTION_LOST': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'POWER_LOSS': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'LOW_BATTERY': 'bg-yellow-50 text-yellow-700 border-yellow-200'
};

export const TYPE_LABELS = {
  GENERAL: 'Ընդհանուր տագնապ',
  SILENT: 'Լուռ տագնապ',
  POWER_LOSS: 'Հոսանքազրկում',
  LOW_BATTERY: 'Մարտկոցի Լիցքաթափում',
  CONNECTION_LOST: 'Կապի խզում'
};

export const isWarningType = (type: string) => {
  return ['POWER_LOSS', 'LOW_BATTERY', 'CONNECTION_LOST'].includes(type);
};
