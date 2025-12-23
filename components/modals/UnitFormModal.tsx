
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Search, ChevronDown, Check, User } from 'lucide-react';
import { Unit, ServiceVehicle, CrewMember, Department } from '../../types';
import { DEPARTMENTS } from '../../mockData';

// Mock database of available police officers for selection
const AVAILABLE_STAFF: CrewMember[] = [
    { name: 'Արմեն Պետրոսյան', role: 'Հրամանատար', badge: 'P-001', phone: '091-11-11-11', isOnline: true, lastLogin: new Date() },
    { name: 'Կարեն Սարգսյան', role: 'Վարորդ', badge: 'P-002', phone: '091-22-22-22', isOnline: true, lastLogin: new Date() },
    { name: 'Վահե Գրիգորյան', role: 'Ոստիկան', badge: 'P-003', phone: '093-33-33-33', isOnline: false, lastLogin: new Date() },
    { name: 'Դավիթ Հովհաննիսյան', role: 'Ոստիկան', badge: 'P-004', phone: '094-44-44-44', isOnline: true, lastLogin: new Date() },
    { name: 'Սամվել Ավետիսյան', role: 'Վարորդ', badge: 'P-005', phone: '095-55-55-55', isOnline: false, lastLogin: new Date() },
    { name: 'Տիգրան Մարտիրոսյան', role: 'Հրամանատար', badge: 'P-006', phone: '096-66-66-66', isOnline: true, lastLogin: new Date() },
];

const UnitFormModal = ({
    isOpen,
    onClose,
    initialData,
    onSave,
    vehicles
}: {
    isOpen: boolean,
    onClose: () => void,
    initialData: Unit | null,
    onSave: (data: Partial<Unit>) => void,
    vehicles: ServiceVehicle[]
}) => {
    // Form States
    const [name, setName] = useState('');
    const [department, setDepartment] = useState<string>('Kentron');
    const [vehicleId, setVehicleId] = useState('');
    
    // Date/Time States
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    // Crew Selection States
    const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
    const [isCrewDropdownOpen, setIsCrewDropdownOpen] = useState(false);
    const [crewSearch, setCrewSearch] = useState('');
    const crewDropdownRef = useRef<HTMLDivElement>(null);

    // Helpers to format Date objects to Input strings (YYYY-MM-DD and HH:MM)
    const formatDate = (date?: Date) => date ? date.toISOString().split('T')[0] : '';
    const formatTime = (date?: Date) => date ? date.toLocaleTimeString('hy-AM', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    useEffect(() => {
        if(initialData) {
            setName(initialData.name);
            setDepartment(initialData.department);
            setVehicleId(initialData.vehicleId || '');
            
            setStartDate(formatDate(initialData.shiftStartTime));
            setStartTime(formatTime(initialData.shiftStartTime));
            
            if (initialData.shiftEndTime) {
                setEndDate(formatDate(initialData.shiftEndTime));
                setEndTime(formatTime(initialData.shiftEndTime));
            } else {
                setEndDate('');
                setEndTime('');
            }

            // Map existing crew names to our mock IDs (simplified logic for prototype)
            // In a real app, CrewMember would have an ID. using badge as unique ID here.
            const existingBadges = initialData.crew.map(c => c.badge);
            setSelectedCrewIds(existingBadges);

        } else {
             // Defaults for new entry
             setName('');
             setDepartment('Kentron');
             setVehicleId('');
             
             const now = new Date();
             setStartDate(formatDate(now));
             setStartTime(formatTime(now));
             
             // Default end time +8 hours
             const end = new Date(now.getTime() + 8 * 60 * 60 * 1000);
             setEndDate(formatDate(end));
             setEndTime(formatTime(end));

             setSelectedCrewIds([]);
        }
    }, [initialData, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (crewDropdownRef.current && !crewDropdownRef.current.contains(event.target as Node)) {
                setIsCrewDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCrewMember = (badge: string) => {
        if (selectedCrewIds.includes(badge)) {
            setSelectedCrewIds(prev => prev.filter(id => id !== badge));
        } else {
            setSelectedCrewIds(prev => [...prev, badge]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !department || !vehicleId || !startDate || !startTime) {
            alert('Խնդրում ենք լրացնել պարտադիր դաշտերը');
            return;
        }

        const selectedVehicle = vehicles.find(v => v.id === vehicleId);
        
        // Construct Dates
        const startDateTime = new Date(`${startDate}T${startTime}`);
        let endDateTime = undefined;
        if (endDate && endTime) {
            endDateTime = new Date(`${endDate}T${endTime}`);
        }

        // Reconstruct Crew array
        const finalCrew = AVAILABLE_STAFF.filter(s => selectedCrewIds.includes(s.badge));

        onSave({
            name,
            department: department as Department,
            vehicleId,
            plateNumber: selectedVehicle?.plateNumber || '',
            boardNumber: selectedVehicle?.name || '', // Using vehicle name as board number
            shiftStartTime: startDateTime,
            shiftEndTime: endDateTime,
            crew: finalCrew
        });
    };

    const filteredCrew = AVAILABLE_STAFF.filter(member => 
        member.name.toLowerCase().includes(crewSearch.toLowerCase()) || 
        member.badge.toLowerCase().includes(crewSearch.toLowerCase())
    );

    if(!isOpen) return null;

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-lg text-gray-900">{initialData ? 'Խմբագրել Կարգախումբը' : 'Ավելացնել Կարգախումբ'}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Անվանում <span className="text-red-500">*</span></label>
                             <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Օր.՝ Կարգախումբ 105"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Պահպանության բաժին <span className="text-red-500">*</span></label>
                             <select 
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                 value={department}
                                 onChange={e => setDepartment(e.target.value)}
                             >
                                 {Object.entries(DEPARTMENTS).map(([key, label]) => (
                                     <option key={key} value={key}>{label}</option>
                                 ))}
                             </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Ավտոմեքենա <span className="text-red-500">*</span></label>
                             <select 
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                 value={vehicleId}
                                 onChange={e => setVehicleId(e.target.value)}
                             >
                                 <option value="">Ընտրել ավտոմեքենա...</option>
                                 {vehicles.map(v => (
                                     <option key={v.id} value={v.id}>
                                         {v.plateNumber} — {v.brand} ({v.name})
                                     </option>
                                 ))}
                             </select>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 my-2"></div>

                    {/* Shift Schedule */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Ծառայության Գրաֆիկ</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Start */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500">Ծառայության սկիզբ <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input 
                                            type="date" 
                                            className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input 
                                            type="time" 
                                            className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={startTime}
                                            onChange={e => setStartTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* End */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500">Ծառայության ավարտ</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input 
                                            type="date" 
                                            className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input 
                                            type="time" 
                                            className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={endTime}
                                            onChange={e => setEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 my-2"></div>

                    {/* Crew Selection */}
                    <div className="relative" ref={crewDropdownRef}>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Կարգախմբի Անդամներ</h4>
                        <div 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[42px] cursor-pointer bg-white flex items-center justify-between hover:border-blue-400 transition-colors"
                            onClick={() => setIsCrewDropdownOpen(!isCrewDropdownOpen)}
                        >
                            <div className="flex flex-wrap gap-2">
                                {selectedCrewIds.length === 0 && <span className="text-gray-400 text-sm">Ընտրեք աշխատակիցներ...</span>}
                                {selectedCrewIds.map(id => {
                                    const member = AVAILABLE_STAFF.find(s => s.badge === id);
                                    if (!member) return null;
                                    return (
                                        <span key={id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                                            {member.name}
                                            <span 
                                                className="cursor-pointer hover:text-blue-900"
                                                onClick={(e) => { e.stopPropagation(); toggleCrewMember(id); }}
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCrewDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isCrewDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-2 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Որոնել անունով կամ կրծքանշանով..." 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={crewSearch}
                                            onChange={(e) => setCrewSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-1">
                                    {filteredCrew.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-xs italic">Արդյունքներ չեն գտնվել</div>
                                    ) : (
                                        filteredCrew.map(member => {
                                            const isSelected = selectedCrewIds.includes(member.badge);
                                            return (
                                                <div 
                                                    key={member.badge} 
                                                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                                    onClick={() => toggleCrewMember(member.badge)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isSelected ? 'bg-blue-200 border-blue-300 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{member.name}</div>
                                                            <div className="text-xs text-gray-500 flex gap-2">
                                                                <span>{member.role}</span>
                                                                <span className="text-gray-300">|</span>
                                                                <span className="font-mono">{member.badge}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </form>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-white font-medium">Չեղարկել</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm font-medium">Պահպանել</button>
                </div>
            </div>
         </div>
    );
};

export default UnitFormModal;
