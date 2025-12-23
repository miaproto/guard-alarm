
import { CrewMember, Unit, Facility, ServiceVehicle, MobileDevice, Alarm, SecurityLog, SecurityDepartment, FacilityTypeDefinition, CallLog } from './types';

export const DEPARTMENTS: Record<string, string> = {
  'Kentron': 'Կենտրոն',
  'Arabkir': 'Արաբկիր',
  'Nor Nork': 'Նոր Նորք',
  'Erebuni': 'Էրեբունի',
};

export const WEEK_DAYS: Record<string, string> = {
  'Mon': 'Երկ',
  'Tue': 'Երք',
  'Wed': 'Չոր',
  'Thu': 'Հինգ',
  'Fri': 'Ուրբ',
  'Sat': 'Շաբ',
  'Sun': 'Կիր'
};

export const MOCK_CREW: CrewMember[] = [
  { name: 'Արմեն Պետրոսյան', role: 'Հրամանատար', badge: 'P-001', phone: '091-11-11-11', isOnline: true, lastLogin: new Date(Date.now() - 1000 * 60 * 240) },
  { name: 'Կարեն Սարգսյան', role: 'Վարորդ', badge: 'P-002', phone: '091-22-22-22', isOnline: true, lastLogin: new Date(Date.now() - 1000 * 60 * 235) },
];

export const MOCK_UNITS: Unit[] = [
  { 
    id: 'U-101', name: 'Կարգախումբ 101', boardNumber: 'Y0101', plateNumber: '555 ՈՈ 01', status: 'AVAILABLE', shiftStatus: 'ON_DUTY', 
    statusStartTime: new Date(Date.now() - 3600000), shiftStartTime: new Date(Date.now() - 1000 * 60 * 60 * 4), shiftEndTime: new Date(Date.now() + 1000 * 60 * 60 * 8),
    department: 'Kentron', coordinates: { x: 45, y: 35 }, crew: MOCK_CREW, isWifiLost: false, isGpsLost: false, vehicleId: 'V-001'
  },
  { 
    id: 'U-102', name: 'Կարգախումբ 102', boardNumber: 'Y0102', plateNumber: '555 ՈՈ 02', status: 'BUSY', shiftStatus: 'BREAK', 
    statusStartTime: new Date(Date.now() - 1800000), shiftStartTime: new Date(Date.now() - 1000 * 60 * 60 * 5), shiftEndTime: new Date(Date.now() + 1000 * 60 * 60 * 7),
    department: 'Arabkir', coordinates: { x: 20, y: 20 }, crew: MOCK_CREW, isWifiLost: true, isGpsLost: false, vehicleId: 'V-002'
  },
  { 
    id: 'U-103', name: 'Կարգախումբ 103', boardNumber: 'Y0103', plateNumber: '555 ՈՈ 03', status: 'AVAILABLE', shiftStatus: 'OFF_DUTY', 
    statusStartTime: new Date(Date.now() - 7200000), shiftStartTime: new Date(Date.now() - 1000 * 60 * 60 * 12), shiftEndTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    department: 'Nor Nork', coordinates: { x: 75, y: 30 }, crew: MOCK_CREW, isWifiLost: false, isGpsLost: true, vehicleId: 'V-003'
  },
  { 
    id: 'U-104', name: 'Կարգախումբ 104', boardNumber: 'Y0104', plateNumber: '555 ՈՈ 04', status: 'AVAILABLE', shiftStatus: 'ALARM', activeAlarmId: '2025-124', 
    statusStartTime: new Date(Date.now() - 900000), shiftStartTime: new Date(Date.now() - 1000 * 60 * 60 * 3), shiftEndTime: new Date(Date.now() + 1000 * 60 * 60 * 9),
    department: 'Kentron', coordinates: { x: 50, y: 40 }, crew: MOCK_CREW, isWifiLost: false, isGpsLost: false, vehicleId: 'V-004' 
  },
];

export const MOCK_FACILITIES: Facility[] = [
  {
    id: 'OBJ-112', name: 'Ոսկու Շուկա', type: 'SHOP', department: 'Kentron', address: 'ք. Երևան, Խորենացի 24', coordinates: { x: 42, y: 45 },
    contactPerson: 'Կարեն Կարապետյան', phones: ['094-00-11-22'], isArmed: true, connectionStatus: 'ONLINE', activeAlarmId: '2025-127', schedule: '24/7', password: '123', isArchived: false
  },
  {
    id: 'OBJ-055', name: 'Երևանի թիվ 114 դպրոց', type: 'SCHOOL', department: 'Kentron', address: 'ք. Երևան, Հանրապետության 7', coordinates: { x: 52, y: 38 },
    contactPerson: 'Նարինե Պետրոսյան', phones: ['099-88-77-66'], isArmed: true, connectionStatus: 'ONLINE', activeAlarmId: '2025-124', schedule: 'Երկ-Ուրբ, 18:00 - 08:00', password: '456', isArchived: false
  },
  {
    id: 'OBJ-001', name: 'Ամերիաբանկ ՓԲԸ', type: 'BANK', department: 'Kentron', address: 'ք. Երևան, Թումանյան 15', coordinates: { x: 48, y: 32 },
    contactPerson: 'Արմեն Սարգսյան', phones: ['091-11-22-33'], isArmed: true, connectionStatus: 'ONLINE', schedule: '24/7', password: '789', isArchived: false
  },
  {
    id: 'OBJ-099', name: 'Սուպերմարկետ "Երևան Սիթի"', type: 'SHOP', department: 'Arabkir', address: 'ք. Երևան, Կոմիտաս 22', coordinates: { x: 25, y: 25 },
    contactPerson: 'Գևորգ Գևորգյան', phones: ['093-33-22-11'], isArmed: false, connectionStatus: 'OFFLINE', activeAlarmId: '2025-125', schedule: '24/7', password: '000', isArchived: false
  },
  {
    id: 'OBJ-200', name: 'Թանգարան', type: 'MUSEUM', department: 'Erebuni', address: 'ք. Երևան, Էրեբունի 1', coordinates: { x: 65, y: 65 },
    contactPerson: 'Հայկ Հայկյան', phones: ['010-11-11-11'], isArmed: true, connectionStatus: 'ONLINE', schedule: '24/7', password: '111', isArchived: false
  }
];

export const MOCK_VEHICLES: ServiceVehicle[] = [
  { id: 'V-001', name: 'Y0101', plateNumber: '555 ՈՈ 01', brand: 'Toyota Corolla', department: 'Kentron', isArchived: false, gpsImei: '354896091234567' },
  { id: 'V-002', name: 'Y0102', plateNumber: '555 ՈՈ 02', brand: 'Skoda Octavia', department: 'Arabkir', isArchived: false, gpsImei: '354896097654321' },
  { id: 'V-003', name: 'Y0103', plateNumber: '555 ՈՈ 03', brand: 'Toyota Corolla', department: 'Nor Nork', isArchived: false },
  { id: 'V-004', name: 'Y0104', plateNumber: '555 ՈՈ 04', brand: 'Kia Forte', department: 'Kentron', isArchived: false, gpsImei: '354896091122334' },
  { id: 'V-005', name: 'Y0105', plateNumber: '999 AA 99', brand: 'Lada Priora', department: 'Erebuni', isArchived: true },
];

export const MOCK_DEVICES: MobileDevice[] = [
  { id: 'DEV-001', name: 'Samsung Tab S7 - 01', serialNumber: 'SN-111222' },
  { id: 'DEV-002', name: 'Samsung Tab S7 - 02', serialNumber: 'SN-333444' },
  { id: 'DEV-003', name: 'Lenovo Tab M10', serialNumber: 'SN-555666' },
  { id: 'DEV-004', name: 'iPad 9', serialNumber: 'SN-777888' },
];

export const MOCK_ALARMS: Alarm[] = [
  {
    id: '2025-127',
    isSeen: false,
    status: 'RECEIVED',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
    type: 'SILENT',
    facilityCode: 'OBJ-112',
    facilityName: 'Ոսկու Շուկա',
    facilityType: 'SHOP',
    address: 'ք. Երևան, Խորենացի 24',
    department: 'Kentron',
    description: 'Սեյֆի սենյակի շարժման տվիչ:',
    contactPerson: 'Կարեն Կարապետյան',
    contactPhones: ['094-00-11-22', '091-55-44-33', '010-22-33-44'],
    coordinates: { x: 42, y: 45 },
    unitActions: [],
    callHistory: [],
    unitFinishedWork: false,
    facilityPassword: '123',
  },
  {
    id: '2025-126',
    isSeen: false,
    status: 'RECEIVED',
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
    type: 'POWER_LOSS',
    facilityCode: 'OBJ-001',
    facilityName: 'Ամերիաբանկ ՓԲԸ',
    facilityType: 'BANK',
    address: 'ք. Երևան, Թումանյան 15',
    department: 'Kentron',
    description: 'Հիմնական հոսանքի անջատում (220V)',
    contactPerson: 'Արմեն Սարգսյան',
    contactPhones: ['091-11-22-33'],
    coordinates: { x: 48, y: 32 },
    unitActions: [],
    callHistory: [],
    unitFinishedWork: false,
    facilityPassword: '789',
  },
  {
    id: '2025-125',
    isSeen: true,
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    type: 'CONNECTION_LOST',
    facilityCode: 'OBJ-099',
    facilityName: 'Սուպերմարկետ "Երևան Սիթի"',
    facilityType: 'SHOP',
    address: 'ք. Երևան, Կոմիտաս 22',
    department: 'Arabkir',
    description: 'Կապի խափանում կենտրոնական վահանակի հետ',
    contactPerson: 'Գևորգ Գևորգյան',
    contactPhones: ['093-33-22-11'],
    coordinates: { x: 25, y: 25 },
    assignedUnitId: 'U-102',
    unitActions: [
      { unitName: 'Կարգախումբ 102', action: 'Ստացել է կանչը', actionType: 'RECEIVE', timestamp: new Date(Date.now() - 1000 * 60 * 29) },
      { unitName: 'Կարգախումբ 102', action: 'Ընդունել է կանչը', actionType: 'ACCEPT', timestamp: new Date(Date.now() - 1000 * 60 * 25) }
    ],
    callHistory: [],
    unitFinishedWork: false,
    facilityPassword: '000',
  },
  {
    id: '2025-124',
    isSeen: true,
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    type: 'SILENT',
    facilityCode: 'OBJ-055',
    facilityName: 'Երևանի թիվ 114 դպրոց',
    facilityType: 'SCHOOL',
    address: 'ք. Երևան, Հանրապետության 7',
    department: 'Kentron',
    description: 'Շարժման տվիչի ակտիվացում միջանցքում:',
    contactPerson: 'Նարինե Պետրոսյան',
    contactPhones: ['099-88-77-66', '093-11-22-33'],
    coordinates: { x: 52, y: 38 },
    assignedUnitId: 'U-104',
    unitActions: [
      { unitName: 'Կարգախումբ 102', action: 'Ստացել է կանչը', actionType: 'RECEIVE', timestamp: new Date(Date.now() - 1000 * 60 * 44) },
      { unitName: 'Կարգախումբ 102', action: 'Մերժել է կանչը (Զբաղված)', actionType: 'REJECT', timestamp: new Date(Date.now() - 1000 * 60 * 43) },
      { unitName: 'Կարգախումբ 104', action: 'Ստացել է կանչը', actionType: 'RECEIVE', timestamp: new Date(Date.now() - 1000 * 60 * 44) },
      { unitName: 'Կարգախումբ 104', action: 'Ընդունել է կանչը', actionType: 'ACCEPT', timestamp: new Date(Date.now() - 1000 * 60 * 40) },
      { unitName: 'Կարգախումբ 104', action: 'Ժամանել է տեղանք', actionType: 'ARRIVE', timestamp: new Date(Date.now() - 1000 * 60 * 25) },
      { unitName: 'Կարգախումբ 104', action: 'Ավարտել է կանչը', actionType: 'FINISH', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    ],
    callHistory: [
       { id: 'C-1', operatorName: 'Օպերատոր 1', timestamp: new Date(Date.now() - 1000 * 60 * 42), phoneNumber: '099-88-77-66', durationSec: 45, recordingUrl: '#' }
    ],
    unitFinishedWork: true,
    facilityPassword: '456',
  },
  {
    id: '2025-123',
    isSeen: false,
    status: 'RECEIVED',
    timestamp: new Date(Date.now() - 1000 * 60 * 65), // 1h 5m ago
    type: 'GENERAL',
    facilityCode: 'OBJ-001',
    facilityName: 'Ամերիաբանկ ՓԲԸ',
    facilityType: 'BANK',
    address: 'ք. Երևան, Թումանյան 15',
    department: 'Kentron',
    description: 'Տագնապի կոճակ (Panic Button). Դրամարկղ 2.',
    contactPerson: 'Արմեն Սարգսյան',
    contactPhones: ['091-11-22-33', '010-55-44-33'],
    coordinates: { x: 48, y: 32 },
    unitActions: [],
    callHistory: [],
    unitFinishedWork: false,
    facilityPassword: '789',
  },
  {
    id: '2025-120',
    isSeen: true,
    status: 'FINISHED',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    type: 'GENERAL',
    facilityCode: 'OBJ-099',
    facilityName: 'Սուպերմարկետ "Երևան Սիթի"',
    facilityType: 'SHOP',
    address: 'ք. Երևան, Կոմիտաս 22',
    department: 'Arabkir',
    description: 'Անվտանգության համակարգի խափանում:',
    contactPerson: 'Գևորգ Գևորգյան',
    contactPhones: ['093-33-22-11'],
    coordinates: { x: 25, y: 25 },
    unitActions: [],
    callHistory: [],
    unitFinishedWork: true,
    facilityPassword: '000',
  }
];

export const MOCK_LOGS: SecurityLog[] = [
  { id: 'L-1', timestamp: new Date(Date.now() - 1000 * 60 * 5), department: 'Kentron', facilityName: 'Ոսկու Շուկա', facilityCode: 'OBJ-112', address: 'ք. Երևան, Խորենացի 24', action: 'ALARM_SILENT' },
  { id: 'L-2', timestamp: new Date(Date.now() - 1000 * 60 * 20), department: 'Kentron', facilityName: 'Երևանի թիվ 114 դպրոց', facilityCode: 'OBJ-055', address: 'ք. Երևան, Հանրապետության 7', action: 'ARM' },
  { id: 'L-3', timestamp: new Date(Date.now() - 1000 * 60 * 45), department: 'Kentron', facilityName: 'Ամերիաբանկ ՓԲԸ', facilityCode: 'OBJ-001', address: 'ք. Երևան, Թումանյան 15', action: 'ALARM_GENERAL' },
  { id: 'L-4', timestamp: new Date(Date.now() - 1000 * 60 * 120), department: 'Arabkir', facilityName: 'Սուպերմարկետ "Երևան Սիթի"', facilityCode: 'OBJ-099', address: 'ք. Երևան, Կոմիտաս 22', action: 'DISARM' },
  { id: 'L-5', timestamp: new Date(Date.now() - 1000 * 60 * 180), department: 'Erebuni', facilityName: 'Թանգարան', facilityCode: 'OBJ-200', address: 'ք. Երևան, Էրեբունի 1', action: 'ARM' },
  { id: 'L-6', timestamp: new Date(Date.now() - 1000 * 60 * 200), department: 'Arabkir', facilityName: 'Բնակարան 22', facilityCode: 'OBJ-301', address: 'ք. Երևան, Կոմիտաս 10', action: 'ARM' },
  { id: 'L-7', timestamp: new Date(Date.now() - 1000 * 60 * 300), department: 'Nor Nork', facilityName: 'Խանութ "Ծիածան"', facilityCode: 'OBJ-404', address: 'ք. Երևան, Գայի 10', action: 'DISARM' },
  { id: 'L-8', timestamp: new Date(Date.now() - 1000 * 60 * 360), department: 'Kentron', facilityName: 'Ամերիաբանկ ՓԲԸ', facilityCode: 'OBJ-001', address: 'ք. Երևան, Թումանյան 15', action: 'POWER_LOSS' },
  { id: 'L-9', timestamp: new Date(Date.now() - 1000 * 60 * 400), department: 'Arabkir', facilityName: 'Սուպերմարկետ "Երևան Սիթի"', facilityCode: 'OBJ-099', address: 'ք. Երևան, Կոմիտաս 22', action: 'CONNECTION_LOST' },
  { id: 'L-10', timestamp: new Date(Date.now() - 1000 * 60 * 420), department: 'Erebuni', facilityName: 'Թանգարան', facilityCode: 'OBJ-200', address: 'ք. Երևան, Էրեբունի 1', action: 'LOW_BATTERY' },
];

export const MOCK_CALLS: CallLog[] = [
  { id: '2025-125', timestamp: new Date(Date.now() - 1000 * 20), durationSec: 0, type: 'INCOMING_ANSWERED', status: 'IN_PROGRESS', phoneNumber: '095-99-88-77', operatorName: 'Արմեն Ավագյան', recordingUrl: '#' },
  { id: '2025-124', timestamp: new Date(Date.now() - 1000 * 45), durationSec: 0, type: 'INCOMING_ANSWERED', status: 'IN_PROGRESS', facilityCode: 'OBJ-200', facilityName: 'Թանգարան', phoneNumber: '010-11-11-11', department: 'Erebuni', operatorName: 'Արմեն Ավագյան', recordingUrl: '#' },
  { id: '2025-123', timestamp: new Date(Date.now() - 1000 * 60 * 5), durationSec: 125, type: 'INCOMING_ANSWERED', status: 'COMPLETED', facilityCode: 'OBJ-112', facilityName: 'Ոսկու Շուկա', phoneNumber: '094-00-11-22', department: 'Kentron', operatorName: 'Արմեն Ավագյան', recordingUrl: '#' },
  { id: '2025-122', timestamp: new Date(Date.now() - 1000 * 60 * 15), durationSec: 45, type: 'OUTGOING_ANSWERED', status: 'COMPLETED', facilityCode: 'OBJ-001', facilityName: 'Ամերիաբանկ ՓԲԸ', phoneNumber: '091-11-22-33', department: 'Kentron', operatorName: 'Օպերատոր 4', recordingUrl: '#' },
  { id: '2025-121', timestamp: new Date(Date.now() - 1000 * 60 * 45), durationSec: 0, type: 'INCOMING_UNANSWERED', status: 'COMPLETED', facilityCode: 'OBJ-055', facilityName: 'Երևանի թիվ 114 դպրոց', phoneNumber: '099-88-77-66', department: 'Kentron', operatorName: 'Աննա Սարգսյան', recordingUrl: '#' },
  { id: '2025-120', timestamp: new Date(Date.now() - 1000 * 60 * 120), durationSec: 180, type: 'OUTGOING_ANSWERED', status: 'COMPLETED', facilityCode: 'OBJ-099', facilityName: 'Սուպերմարկետ "Երևան Սիթի"', phoneNumber: '093-33-22-11', department: 'Arabkir', operatorName: 'Վահան Սարգսյան', recordingUrl: '#' },
  { id: '2025-119', timestamp: new Date(Date.now() - 1000 * 60 * 180), durationSec: 12, type: 'OUTGOING_UNANSWERED', status: 'COMPLETED', facilityCode: 'OBJ-200', facilityName: 'Թանգարան', phoneNumber: '010-11-11-11', department: 'Erebuni', operatorName: 'Գևորգ Կարապետյան', recordingUrl: '#' },
  { id: '2025-118', timestamp: new Date(Date.now() - 1000 * 60 * 240), durationSec: 320, type: 'INCOMING_ANSWERED', status: 'COMPLETED', facilityCode: 'OBJ-112', facilityName: 'Ոսկու Շուկա', phoneNumber: '094-00-11-22', department: 'Kentron', operatorName: 'Արմեն Ավագյան', recordingUrl: '#' },
];

export const MOCK_SECURITY_DEPARTMENTS: SecurityDepartment[] = [
  { id: 'Kentron', name: 'Կենտրոն', address: 'ք. Երևան, Նալբանդյան 104', contactPerson: 'Արմեն Ավագյան', contactPhone: '010-55-55-55', isArchived: false, coordinates: {x: 50, y: 50} },
  { id: 'Arabkir', name: 'Արաբկիր', address: 'ք. Երևան, Մամիկոնյանց 1', contactPerson: 'Վահան Սարգսյան', contactPhone: '010-22-22-22', isArchived: false, coordinates: {x: 30, y: 30} },
  { id: 'Nor Nork', name: 'Նոր Նորք', address: 'ք. Երևան, Գայի պողոտա 2', contactPerson: 'Հայկ Պետրոսյան', contactPhone: '010-66-66-66', isArchived: false, coordinates: {x: 70, y: 40} },
  { id: 'Erebuni', name: 'Էրեբունի', address: 'ք. Երևան, Խաղաղ Դոնի 1', contactPerson: 'Գևորգ Կարապետյան', contactPhone: '010-44-44-44', isArchived: true, coordinates: {x: 60, y: 70} },
];

export const MOCK_FACILITY_TYPES_DEF: FacilityTypeDefinition[] = [
  { id: '1', name: 'Բանկ', code: 'BANK' },
  { id: '2', name: 'Դպրոց', code: 'SCHOOL' },
  { id: '3', name: 'Խանութ', code: 'SHOP' },
  { id: '4', name: 'Թանգարան', code: 'MUSEUM' },
  { id: '5', name: 'Գրասենյակ', code: 'OFFICE' },
  { id: '6', name: 'Բնակարան', code: 'RESIDENCE' },
  { id: '7', name: 'Ռեստորան', code: 'RESTAURANT' },
  { id: '8', name: 'Դեղատուն', code: 'PHARMACY' },
  { id: '9', name: 'Առանձնատուն', code: 'HOUSE' },
];
