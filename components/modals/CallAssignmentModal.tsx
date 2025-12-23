
import React, { useState, useMemo } from 'react';
import { X, Search, Check, Shield } from 'lucide-react';
import { Facility } from '../../types';
import { DEPARTMENTS } from '../../mockData';

const CallAssignmentModal = ({
    isOpen,
    onClose,
    facilities,
    onAssign
}: {
    isOpen: boolean;
    onClose: () => void;
    facilities: Facility[];
    onAssign: (facility: Facility) => void;
}) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return facilities.filter(f => 
            f.name.toLowerCase().includes(term) || 
            f.id.toLowerCase().includes(term) ||
            f.address.toLowerCase().includes(term)
        );
    }, [facilities, search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-lg text-gray-900">Կցել պահպանվող օբյեկտին</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="Որոնել ըստ անվանման, կոդի կամ հասցեի..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
                    {filtered.length > 0 ? (
                        filtered.map(f => (
                            <div 
                                key={f.id} 
                                onClick={() => onAssign(f)}
                                className="group bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{f.name}</div>
                                        <div className="text-xs text-slate-500 flex gap-2 items-center mt-1">
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{f.id}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{DEPARTMENTS[f.department]}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">{f.address}</div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                    <Check className="w-4 h-4 text-transparent group-hover:text-blue-600" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <Search className="w-12 h-12 mb-2" />
                            <p>Օբյեկտներ չեն գտնվել</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallAssignmentModal;
