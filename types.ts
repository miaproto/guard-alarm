
export type AlarmStatus = 'RECEIVED' | 'ACTIVE' | 'FINISHED' | 'FALSE_ALARM';
export type AlarmType = 'GENERAL' | 'SILENT' | 'POWER_LOSS' | 'LOW_BATTERY' | 'CONNECTION_LOST';
export type FacilityType = 'BANK' | 'SCHOOL' | 'SHOP' | 'MUSEUM' | 'OFFICE' | 'RESIDENCE' | 'RESTAURANT' | 'PHARMACY' | 'HOUSE';
export type Department = 'Kentron' | 'Arabkir' | 'Nor Nork' | 'Erebuni';
export type UnitShiftStatus = 'OFF_DUTY' | 'ON_DUTY' | 'ALARM' | 'BREAK';
export type LogAction = 'ARM' | 'DISARM' | 'ALARM_GENERAL' | 'ALARM_SILENT' | 'CONNECTION_LOST' | 'POWER_LOSS' | 'LOW_BATTERY';

export type CallType = 
  | 'INCOMING_ANSWERED' 
  | 'INCOMING_UNANSWERED' 
  | 'OUTGOING_ANSWERED' 
  | 'OUTGOING_UNANSWERED';

export type CallStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface Coordinates {
  x: number;
  y: number;
}

export interface CallRecord {
  id: string;
  operatorName: string;
  timestamp: Date;
  phoneNumber: string;
  durationSec: number;
  recordingUrl: string; // Mock URL
}

export interface CallLog {
  id: string;
  timestamp: Date;
  durationSec: number;
  type: CallType;
  status: CallStatus;
  facilityCode?: string;
  facilityName?: string;
  phoneNumber: string;
  department?: Department;
  operatorName: string;
  recordingUrl: string;
}

export interface UnitAction {
  unitName: string;
  action: string;
  actionType: 'RECEIVE' | 'ACCEPT' | 'REJECT' | 'ARRIVE' | 'FINISH' | 'INFO';
  timestamp: Date;
}

export interface Alarm {
  id: string; // Format: YYYY-XXX
  isSeen: boolean;
  status: AlarmStatus;
  timestamp: Date;
  type: AlarmType;
  facilityCode: string;
  facilityName: string;
  facilityType: string;
  address: string;
  department: Department;
  description: string;
  contactPerson: string;
  contactPhones: string[];
  coordinates: Coordinates;
  assignedUnitId?: string;
  unitActions: UnitAction[];
  callHistory: CallRecord[];
  unitFinishedWork: boolean; 
  facilityPassword?: string;
}

export interface CrewMember {
  name: string;
  role: string;
  badge: string;
  phone: string;
  isOnline: boolean;
  lastLogin: Date;
}

export interface Unit {
  id: string;
  name: string;
  boardNumber: string;
  plateNumber: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  shiftStatus: UnitShiftStatus;
  statusStartTime: Date;
  shiftStartTime: Date;
  shiftEndTime?: Date;
  department: Department;
  coordinates: Coordinates;
  crew: CrewMember[];
  isWifiLost: boolean;
  isGpsLost: boolean;
  activeAlarmId?: string;
  vehicleId?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  department: Department;
  address: string;
  coordinates: Coordinates;
  contactPerson: string;
  phones: string[];
  isArmed: boolean;
  connectionStatus: 'ONLINE' | 'OFFLINE';
  activeAlarmId?: string;
  schedule: string;
  password?: string;
  isArchived?: boolean;
  scheduleConfig?: Record<string, { start: string; end: string; active: boolean }>;
}

export interface ServiceVehicle {
  id: string;
  name: string;
  plateNumber: string;
  brand: string;
  department: string;
  isArchived: boolean;
  gpsImei?: string;
}

export interface MobileDevice {
  id: string;
  name: string;
  serialNumber: string;
}

export interface SecurityLog {
  id: string;
  timestamp: Date;
  department: Department;
  facilityName: string;
  facilityCode: string;
  address: string;
  action: LogAction;
}

export interface SecurityDepartment {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  isArchived: boolean;
  coordinates: Coordinates;
}

export interface FacilityTypeDefinition {
  id: string;
  name: string;
  code: string;
}
