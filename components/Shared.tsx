
import React, { useState, useRef, useEffect } from 'react';
import { AlarmStatus, AlarmType } from '../types';
import { WifiOff, Siren, Check, ChevronDown, ChevronLeft, ChevronRight, Zap, BatteryWarning, BellOff } from 'lucide-react';
import { TYPE_LABELS } from '../utils';

export const StatusBadge = ({ status }: { status: AlarmStatus }) => {
  const styles = {
    RECEIVED: 'bg-red-100 text-red-700 border-red-200 shadow-sm',
    ACTIVE: 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm',
    FINISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    // Requested: make FALSE_ALARM use the same coloring as FINISHED
    FALSE_ALARM: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
  const labels = {
    RECEIVED: 'Ստացված',
    ACTIVE: 'Ակտիվ',
    FINISHED: 'Ավարտված',
    FALSE_ALARM: 'Կեղծ տագնապ'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const TypeBadge = ({ type }: { type: AlarmType }) => {
  let style = 'bg-gray-100 text-gray-700 border-gray-200';
  let Icon = Siren;

  switch (type) {
    case 'GENERAL':
      style = 'bg-red-50 text-red-700 border-red-200';
      Icon = Siren;
      break;
    case 'SILENT':
      style = 'bg-red-50 text-red-700 border-red-200';
      Icon = BellOff;
      break;
    case 'POWER_LOSS':
      style = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      Icon = Zap;
      break;
    case 'LOW_BATTERY':
      style = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      Icon = BatteryWarning;
      break;
    case 'CONNECTION_LOST':
      style = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      Icon = WifiOff;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style}`}>
      <Icon className="w-3.5 h-3.5" />
      {TYPE_LABELS[type]}
    </span>
  );
};

export const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  collapsed = false,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    aria-label={collapsed ? label : undefined}
    className={`w-full flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 mb-1 text-left group relative ${
      active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={active ? 2.5 : 2} />
    {!collapsed && <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>}
  </button>
);

export const BookIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

export const MultiSelect = ({ label, options, selected, onChange }: { label: string, options: {value: string, label: string}[], selected: string[], onChange: (vals: string[]) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-white border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all ${selected.length > 0 ? 'text-slate-900 border-blue-300 bg-blue-50/30' : 'text-slate-500 border-slate-200'}`}
            >
                <span className="truncate font-medium">
                    {selected.length === 0 ? label : 
                     selected.length === 1 ? options.find(o => o.value === selected[0])?.label :
                     `${selected.length} ընտրված`}
                </span>
                <ChevronDown className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
                    <div 
                        className={`p-2 rounded-md cursor-pointer hover:bg-slate-50 flex items-center gap-2 text-sm ${selected.length === 0 ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                        onClick={() => { onChange([]); setIsOpen(false); }}
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.length === 0 ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                            {selected.length === 0 && <Check className="w-3 h-3 text-white" />}
                        </div>
                        Բոլորը
                    </div>
                    {options.map(opt => (
                        <div 
                            key={opt.value} 
                            className="p-2 rounded-md cursor-pointer hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                            onClick={() => toggleOption(opt.value)}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(opt.value) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                {selected.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const displayTotalPages = Math.max(1, totalPages);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 shrink-0">
            <div className="text-sm text-slate-500">
                Ցուցադրված է <span className="font-medium text-slate-900">{startItem}</span>-ից <span className="font-medium text-slate-900">{endItem}</span>-ը (<span className="font-medium">{totalItems}</span>-ից)
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                     {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map(page => {
                         // Simple pagination logic to show limited buttons if many pages
                         if (displayTotalPages > 7 && (page > 2 && page < displayTotalPages - 1 && Math.abs(page - currentPage) > 1)) {
                             if (page === 3 && currentPage > 4) return <span key={page} className="px-1 text-slate-400">...</span>;
                             if (page === displayTotalPages - 2 && currentPage < displayTotalPages - 3) return <span key={page} className="px-1 text-slate-400">...</span>;
                             return null;
                         }
                         
                         return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === page 
                                    ? 'bg-blue-600 text-white border border-blue-600' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {page}
                            </button>
                         );
                     })}
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === displayTotalPages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
