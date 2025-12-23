# 🚨 Guardia - Police Alarm Management System

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A comprehensive police control center application for managing security alarms, units, facilities, and emergency responses in Yerevan, Armenia. Built with React, TypeScript, and MapLibre GL.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [State Management](#state-management)
- [Components Guide](#components-guide)
- [Map Integration](#map-integration)
- [Data Flow](#data-flow)
- [Development Guidelines](#development-guidelines)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Guardia** is a prototype police alarm management system designed for security operators to:
- Monitor and respond to security alarms in real-time
- Assign police units to incidents
- Track facilities and their security status
- Visualize units and facilities on an interactive map
- Manage call logs and security events

**Target Users:** Police operators, security dispatchers  
**Language:** Armenian (Հայերեն)  
**Region:** Yerevan, Armenia (uses real coordinates)

---

## 🛠 Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### UI & Styling
- **Tailwind CSS** (CDN) - Utility-first CSS
- **Lucide React** - Icon library

### Mapping
- **MapLibre GL** - Open-source mapping library
- **react-map-gl/maplibre** - React wrapper for MapLibre
- **CartoDB Positron** - Basemap style

### Data
- **Mock Data** - Static TypeScript objects (no backend)
- All data in `mockData.ts`

### AI Integration (Optional)
- **Google Gemini API** - AI assistance features
- Set `GEMINI_API_KEY` in `.env.local` if needed

---

## 🏗 Architecture

### Application Structure

```
┌─────────────────────────────────────┐
│         index.tsx (Main App)        │
│  - Global state management          │
│  - Toast & Error boundary providers │
│  - Page routing                     │
└─────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐      ┌────▼────┐
   │  Pages  │      │ Modals  │
   └────┬────┘      └────┬────┘
        │                │
   ┌────▼────────────────▼────┐
   │   Shared Components      │
   │   - MapLibreMap          │
   │   - StatusBadge, etc.    │
   └──────────────────────────┘
```

### State Management Pattern

**Centralized State** - All state lives in `index.tsx` using React `useState`:
- `alarms`: Alarm[]
- `facilities`: Facility[]
- `units`: Unit[]
- `vehicles`: ServiceVehicle[]
- `departments`: Department[]
- `calls`: CallRecord[]
- `securityLogs`: SecurityLog[]

**Props Drilling** - State passed down through props (intentional for prototype simplicity)

**Memoization** - Uses `useMemo` for computed values:
- `selectedAlarm`: Currently selected alarm
- `stats`: Alarm statistics
- `filteredAlarms`: Search/filter results
- `paginatedAlarms`: Current page items

---

## 📁 File Structure

```
/guardia-proto
├── index.tsx                 # Main app component with all state
├── types.ts                  # TypeScript interfaces and types
├── mockData.ts               # All mock data (facilities, units, alarms, etc.)
├── utils.tsx                 # Utility functions (formatting, labels, colors)
├── constants.ts              # Magic numbers and configuration
│
├── components/
│   ├── AlarmDetailsPanel.tsx      # Right sidebar for alarm details
│   ├── ErrorBoundary.tsx          # Error boundary component
│   ├── Toast.tsx                  # Toast notification system
│   ├── Shared.tsx                 # Shared UI components
│   ├── MapLibreMap.tsx            # Reusable map component
│   │
│   └── modals/
│       ├── CallAssignmentModal.tsx           # Assign unit to alarm
│       ├── AddressSelectorModal.tsx          # Address selection (deprecated)
│       ├── LocationMapModal.tsx              # View facility location
│       ├── UnitMapModal.tsx                  # Unit location viewer
│       ├── FacilityLocationMapModal.tsx      # Facility map modal
│       ├── DepartmentFormModal.tsx           # CRUD for departments
│       ├── FacilityFormModal.tsx             # CRUD for facilities
│       ├── FacilityTypeFormModal.tsx         # CRUD for facility types
│       ├── UnitFormModal.tsx                 # CRUD for units
│       └── VehicleFormModal.tsx              # CRUD for vehicles
│
├── pages/
│   ├── CallsPage.tsx                  # Alarm management (main page)
│   ├── SecurityMapPage.tsx            # Interactive map view
│   ├── UnitsManagementPage.tsx        # Unit management
│   ├── FacilitiesManagementPage.tsx   # Facility management
│   ├── VehiclesPage.tsx               # Vehicle management
│   ├── SecurityLogsPage.tsx           # Security event logs
│   ├── SecurityDepartmentsPage.tsx    # Department management
│   └── FacilityTypesPage.tsx          # Facility type management
│
├── index.html               # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set up Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 3. Run development server
npm run dev

# Server will start at http://localhost:3001
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

---

## ✨ Key Features

### 1. Alarm Management (`CallsPage.tsx`)
- **Real-time alarm list** with status indicators
- **Filtering** by alarm type (GENERAL, SILENT, etc.)
- **Search** by facility name, ID, address
- **Statistics dashboard** (received, active, unseen)
- **Alarm details panel** with:
  - Facility information
  - Contact details
  - Password display
  - Unit actions timeline
  - Call history
- **Unit assignment** with map visualization
- **Auto-marking viewed** alarms

### 2. Interactive Security Map (`SecurityMapPage.tsx`)
- **MapLibre GL integration** with CartoDB basemap
- **Facility markers** color-coded by status:
  - 🔴 Red = Alarm active
  - 🟢 Green = Normal status
  - 🟡 Amber = Warning
- **Unit markers** with custom labels
- **Click to view details** for facilities/units
- **Auto-fit bounds** to show all markers
- **Controls**: Zoom, pan, fullscreen, scale

### 3. Unit Management (`UnitsManagementPage.tsx`)
- CRUD operations for police units
- Shift status tracking
- Crew member management
- Equipment tracking

### 4. Facility Management (`FacilitiesManagementPage.tsx`)
- CRUD operations for protected facilities
- Department assignment
- Contact information
- Security schedule
- Coordinates (lat/lng)

### 5. Call & Log System
- **Call records** with type, status, duration
- **Security logs** with action tracking
- **Timeline visualization**

---

## 🔄 State Management

### Global State Location
All state is managed in **`index.tsx`** using `useState` hooks.

### Key State Variables

```typescript
// Alarms
const [alarms, setAlarms] = useState<Alarm[]>(MOCK_ALARMS);
const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);

// Facilities
const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES);

// Units
const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);

// UI State
const [currentPage, setCurrentPage] = useState<string>('calls');
const [showFilters, setShowFilters] = useState(false);

// Filters
const [searchQuery, setSearchQuery] = useState('');
const [activeTab, setActiveTab] = useState<'all' | 'alarms' | 'warnings'>('all');
```

### Computed Values (useMemo)

```typescript
// Selected alarm
const selectedAlarm = useMemo(
  () => alarms.find(a => a.id === selectedAlarmId),
  [alarms, selectedAlarmId]
);

// Statistics
const stats = useMemo(() => {
  const received = alarms.filter(a => a.status === 'RECEIVED').length;
  const active = alarms.filter(a => a.status === 'ACTIVE').length;
  const unseen = alarms.filter(a => !a.seenAt).length;
  return { received, active, unseen };
}, [alarms]);

// Filtered alarms
const filteredAlarms = useMemo(() => {
  return alarms
    .filter(alarm => {
      // Tab filter
      if (activeTab === 'alarms' && !isWarningType(alarm.type)) return false;
      if (activeTab === 'warnings' && isWarningType(alarm.type)) return false;
      
      // Search filter
      if (searchQuery) {
        const facility = facilities.find(f => f.id === alarm.facilityId);
        const query = searchQuery.toLowerCase();
        return (
          alarm.id.toLowerCase().includes(query) ||
          facility?.name.toLowerCase().includes(query) ||
          facility?.address.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}, [alarms, activeTab, searchQuery, facilities]);
```

### State Update Patterns

**Adding an alarm:**
```typescript
const newAlarm: Alarm = { /* ... */ };
setAlarms(prev => [newAlarm, ...prev]);
```

**Updating an alarm:**
```typescript
setAlarms(prev => prev.map(alarm =>
  alarm.id === alarmId
    ? { ...alarm, status: 'ACTIVE', assignedUnitId: unitId }
    : alarm
));
```

**Deleting an alarm:**
```typescript
setAlarms(prev => prev.filter(alarm => alarm.id !== alarmId));
```

---

## 🧩 Components Guide

### Core Components

#### `ErrorBoundary.tsx`
React error boundary that catches JavaScript errors and displays a fallback UI.

```typescript
// Usage in index.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Features:**
- Catches render errors
- Displays friendly error message in Armenian
- Shows error details in development mode
- Reload and "Go Home" buttons

#### `Toast.tsx`
Context-based toast notification system.

```typescript
// Usage
const { showToast } = useToast();

showToast('Կարգախումբը կցված է', 'success');
showToast('Սխալ է տեղի ունեցել', 'error');
showToast('Տեղեկատվություն', 'info');
```

**Types:** `success`, `error`, `info`  
**Auto-dismiss:** 5 seconds  
**Position:** Bottom-right

#### `MapLibreMap.tsx`
Reusable map component with marker support.

```typescript
interface MapLibreMapProps {
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    color: 'red' | 'green' | 'blue' | 'amber';
    label?: string;
    icon?: 'facility' | 'unit';
    onClick?: () => void;
  }>;
  height?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

// Usage
<MapLibreMap
  markers={[
    { id: '1', lat: 40.1792, lng: 44.4991, color: 'red', label: 'Bank' }
  ]}
  height="500px"
  defaultZoom={12}
/>
```

**Features:**
- Auto-fit bounds to markers
- Navigation controls
- Scale control
- Fullscreen support
- Click handlers on markers

### Shared Components (`Shared.tsx`)

#### `StatusBadge`
Colored badge for alarm status.

```typescript
<StatusBadge status="ACTIVE" />    // Green
<StatusBadge status="RECEIVED" />  // Blue
<StatusBadge status="RESOLVED" />  // Gray
```

#### `TypeBadge`
Icon + text badge for alarm types.

```typescript
<TypeBadge type="GENERAL" />
<TypeBadge type="SILENT" />
<TypeBadge type="POWER_LOSS" />
```

#### `Pagination`
Page navigation component.

```typescript
<Pagination
  currentPage={1}
  totalPages={5}
  onPageChange={(page) => setCurrentPage(page)}
/>
```

#### `MultiSelect`
Multi-select dropdown for filtering.

```typescript
<MultiSelect
  options={['Option 1', 'Option 2']}
  selectedValues={['Option 1']}
  onChange={(values) => setSelected(values)}
  placeholder="Select..."
/>
```

---

## 🗺 Map Integration

### MapLibre GL Setup

**Import path:** `react-map-gl/maplibre` (not `react-map-gl`)

```typescript
import Map, { Marker, NavigationControl, ScaleControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
```

### Basemap Configuration

```typescript
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
```

**Alternative basemaps:**
- `positron-gl-style` - Light theme (current)
- `dark-matter-gl-style` - Dark theme
- `voyager-gl-style` - Colorful theme

### Coordinate System

**All coordinates use WGS84 (EPSG:4326):**
- Latitude: North/South (-90 to +90)
- Longitude: East/West (-180 to +180)

**Yerevan bounds:**
- Center: `40.1792°N, 44.4991°E`
- Typical zoom: 11-14

### Marker Colors

```typescript
const MARKER_COLORS = {
  red: '#EF4444',      // Alarm/Emergency
  green: '#10B981',    // Normal/Available
  blue: '#3B82F6',     // Unit/Vehicle
  amber: '#F59E0B',    // Warning
};
```

### Adding Markers

```typescript
const markers = facilities.map(facility => ({
  id: facility.id,
  lat: facility.location.coordinates.lat,
  lng: facility.location.coordinates.lng,
  color: facility.alarms?.length > 0 ? 'red' : 'green',
  label: facility.name,
  onClick: () => handleFacilityClick(facility.id),
}));
```

---

## 📊 Data Flow

### Mock Data Structure

All data is in `mockData.ts`:

```typescript
export const MOCK_FACILITIES: Facility[] = [ /* ... */ ];
export const MOCK_UNITS: Unit[] = [ /* ... */ ];
export const MOCK_ALARMS: Alarm[] = [ /* ... */ ];
export const MOCK_CALLS: CallRecord[] = [ /* ... */ ];
export const MOCK_LOGS: SecurityLog[] = [ /* ... */ ];
```

### Data Relationships

```
Department (1) ─┬─→ (N) Facility
                └─→ (N) Unit

Facility (1) ─→ (N) Alarm

Alarm (1) ─→ (0..1) Unit (assigned)

Unit (1) ─┬─→ (N) CrewMember
          └─→ (N) UnitAction (on alarm)

CallRecord (1) ─→ (1) Facility
```

### Auto-Generated Data

**Alarms:** Auto-generated every 5 minutes (see `ALARM_GENERATION_INTERVAL` in `constants.ts`)

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const shouldGenerate = Math.random() < 0.3; // 30% chance
    if (shouldGenerate) {
      const newAlarm = generateRandomAlarm();
      setAlarms(prev => [newAlarm, ...prev]);
      playAlarmSound();
    }
  }, ALARM_GENERATION_INTERVAL);

  return () => clearInterval(interval);
}, [facilities, playAlarmSound]);
```

---

## 👨‍💻 Development Guidelines

### Code Style

**TypeScript:**
- Use explicit types for props and state
- Avoid `any` - use proper types from `types.ts`
- Use interfaces for objects, type aliases for unions

**React Patterns:**
- Functional components only
- Use hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- Memoize expensive computations
- Extract reusable components

**Naming Conventions:**
- Components: `PascalCase` (e.g., `AlarmDetailsPanel`)
- Functions: `camelCase` (e.g., `handleAlarmClick`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `ITEMS_PER_PAGE`)
- Interfaces: `PascalCase` (e.g., `Alarm`, `Facility`)

### Constants

Keep magic numbers in `constants.ts`:

```typescript
export const ITEMS_PER_PAGE = 9;
export const ALARM_GENERATION_INTERVAL = 300000; // 5 minutes
export const ALARM_SOUND_DURATION = 0.5; // seconds
```

### Performance Optimization

**Use `useMemo` for:**
- Filtered/sorted lists
- Computed statistics
- Derived data

**Use `useCallback` for:**
- Event handlers passed to child components
- Functions used in effect dependencies

**Example:**
```typescript
const filteredData = useMemo(() => {
  return data.filter(item => /* ... */);
}, [data, filters]);

const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);
```

### Audio Context Pattern

**Never create multiple `AudioContext` instances:**

```typescript
const audioCtxRef = useRef<AudioContext | null>(null);

const playSound = useCallback(() => {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  const audioCtx = audioCtxRef.current;
  // Use audioCtx...
}, []);
```

---

## 🔧 Common Tasks

### Adding a New Page

1. **Create page component:**
```typescript
// pages/NewPage.tsx
import React from 'react';

interface NewPageProps {
  // Props from index.tsx
}

export const NewPage: React.FC<NewPageProps> = (props) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">New Page</h1>
    </div>
  );
};
```

2. **Import in `index.tsx`:**
```typescript
import { NewPage } from './pages/NewPage';
```

3. **Add to sidebar and routing:**
```typescript
// In sidebar JSX
<SidebarItem
  icon={SomeIcon}
  label="New Page"
  active={currentPage === 'newpage'}
  onClick={() => setCurrentPage('newpage')}
/>

// In main content area
{currentPage === 'newpage' && (
  <NewPage /* pass props */ />
)}
```

### Adding a New Modal

1. **Create modal component:**
```typescript
// components/modals/NewModal.tsx
interface NewModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Other props
}

export const NewModal: React.FC<NewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
        {/* Modal content */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

2. **Use in parent component:**
```typescript
const [showModal, setShowModal] = useState(false);

return (
  <>
    <button onClick={() => setShowModal(true)}>Open Modal</button>
    <NewModal isOpen={showModal} onClose={() => setShowModal(false)} />
  </>
);
```

### Adding a New Alarm Type

1. **Update `types.ts`:**
```typescript
export type AlarmType = 
  | 'GENERAL'
  | 'SILENT'
  | 'POWER_LOSS'
  | 'LOW_BATTERY'
  | 'CONNECTION_LOST'
  | 'NEW_TYPE'; // Add here
```

2. **Update `utils.tsx` labels:**
```typescript
export const TYPE_LABELS: Record<AlarmType, string> = {
  // ...
  NEW_TYPE: 'Նոր Տեսակ',
};
```

3. **Update `isWarningType` if needed:**
```typescript
export function isWarningType(type: AlarmType): boolean {
  return type === 'POWER_LOSS' 
      || type === 'LOW_BATTERY' 
      || type === 'CONNECTION_LOST'
      || type === 'NEW_TYPE'; // If it's a warning
}
```

### Adding Map Markers

```typescript
// In your page component
const markers = useMemo(() => {
  return items.map(item => ({
    id: item.id,
    lat: item.coordinates.lat,
    lng: item.coordinates.lng,
    color: determineColor(item),
    label: item.name,
    icon: 'facility' as const,
    onClick: () => handleItemClick(item.id),
  }));
}, [items]);

return <MapLibreMap markers={markers} height="600px" />;
```

### Updating Statistics

Statistics are auto-computed in `useMemo`. To add new stats:

```typescript
const stats = useMemo(() => {
  const received = alarms.filter(a => a.status === 'RECEIVED').length;
  const active = alarms.filter(a => a.status === 'ACTIVE').length;
  const unseen = alarms.filter(a => !a.seenAt).length;
  
  // Add new stat
  const resolved = alarms.filter(a => a.status === 'RESOLVED').length;
  
  return { received, active, unseen, resolved };
}, [alarms]);
```

---

## 🐛 Troubleshooting

### Map Not Rendering

**Issue:** Blank map or console error about MapLibre

**Solution:**
1. Check import path: `react-map-gl/maplibre` NOT `react-map-gl`
2. Ensure CSS is imported: `import 'maplibre-gl/dist/maplibre-gl.css';`
3. Verify coordinates are valid (lat: -90 to 90, lng: -180 to 180)

### TypeScript Errors

**Issue:** Type errors after adding new data

**Solution:**
1. Update interfaces in `types.ts`
2. Run `npm install` to ensure types are up to date
3. Restart TypeScript server in IDE

### State Not Updating

**Issue:** UI doesn't reflect state changes

**Solution:**
1. Never mutate state directly: use `setState(prev => ...)`
2. Check dependencies in `useMemo`/`useEffect`
3. Verify state is passed correctly through props

### MapLibre Module Not Found

**Issue:** `Cannot find module 'react-map-gl'`

**Solution:**
```bash
npm install maplibre-gl react-map-gl
```

Ensure import uses: `import ... from 'react-map-gl/maplibre';`

### Alarm Sound Not Playing

**Issue:** Audio doesn't play on alarm

**Solution:**
1. Check browser autoplay policy (user interaction required)
2. Verify `audioCtxRef` is used (not creating new context)
3. Wrap in try-catch and handle errors gracefully

### Hot Reload Issues

**Issue:** Changes not reflecting in browser

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart dev server

---

## 📚 Key Files Reference

### `types.ts`
All TypeScript interfaces and type definitions.

**Key Types:**
- `Alarm` - Security alarm data
- `Facility` - Protected facility/building
- `Unit` - Police unit/team
- `CallRecord` - Phone call log
- `SecurityLog` - Security event log
- `Coordinates` - Lat/lng coordinates

### `utils.tsx`
Utility functions and constants.

**Key Functions:**
- `formatTimeFirst(date)` - Format time (HH:MM AM/PM)
- `formatDuration(ms)` - Format duration (5m 32s)
- `isWarningType(type)` - Check if alarm is warning
- `TYPE_LABELS` - Armenian labels for alarm types
- `ACTION_LABELS` - Armenian labels for unit actions

### `constants.ts`
Configuration values.

```typescript
export const ITEMS_PER_PAGE = 9;
export const ALARM_GENERATION_INTERVAL = 300000; // 5 min
export const ALARM_SOUND_FREQUENCY_START = 880; // Hz
export const ALARM_SOUND_FREQUENCY_END = 440;
export const ALARM_SOUND_DURATION = 0.5; // seconds
export const ALARM_SOUND_GAIN_START = 0.1;
export const ALARM_SOUND_GAIN_END = 0.01;
```

### `mockData.ts`
All static data used in the application.

**Data Sets:**
- `DEPARTMENTS` - Security departments
- `MOCK_FACILITIES` - 5 facilities in Yerevan
- `MOCK_UNITS` - 3 police units
- `MOCK_VEHICLES` - Service vehicles
- `MOCK_ALARMS` - Initial alarms
- `MOCK_CALLS` - Call history
- `MOCK_LOGS` - Security logs

---

## 🎨 UI Patterns

### Color Palette

```css
/* Primary Colors */
--blue-600: #2563EB    /* Primary actions, active states */
--gray-800: #1F2937    /* Text */
--gray-100: #F3F4F6    /* Backgrounds */

/* Status Colors */
--green-600: #10B981   /* Success, Normal */
--red-600: #DC2626     /* Error, Alarm */
--amber-600: #D97706   /* Warning */
--blue-500: #3B82F6    /* Info, Received */

/* Alarm Types */
--red-50/red-600: General Alarm
--purple-50/purple-600: Silent Alarm
--amber-50/amber-600: Power Loss
--orange-50/orange-600: Low Battery
--gray-50/gray-600: Connection Lost
```

### Typography

```css
/* Headings */
text-2xl font-bold     /* Page titles */
text-xl font-semibold  /* Section titles */
text-lg font-medium    /* Card titles */

/* Body */
text-sm               /* Regular text */
text-xs               /* Small text, labels */

/* Font */
font-sans             /* System font stack */
```

### Spacing

```css
p-8        /* Page padding */
p-6        /* Card padding */
p-4        /* Button padding */
gap-4      /* Standard gap */
space-y-4  /* Vertical spacing */
```

---

## 🚀 Deployment Notes

### Environment Variables

```bash
# .env.local (optional)
GEMINI_API_KEY=your_api_key_here
```

### Build Optimization

**Current:**
- Tailwind via CDN (development only)

**For Production:**
1. Install Tailwind as PostCSS plugin
2. Remove CDN script from `index.html`
3. Configure `tailwind.config.js`
4. Build CSS during compilation

### Performance Considerations

- **Lazy loading:** Consider code-splitting pages
- **Image optimization:** Add facility images with compression
- **Map tiles:** Consider self-hosting tiles for reliability
- **State management:** For large-scale, migrate to Zustand/Redux

---

## 📝 Notes for AI Agents

### Context Understanding
This is a **prototype/proof-of-concept** application. Code patterns prioritize:
1. **Clarity** over abstraction
2. **Simplicity** over optimal performance
3. **Speed of development** over perfect architecture

### When Making Changes
1. **Always update types** in `types.ts` first
2. **Update mock data** in `mockData.ts` if adding new fields
3. **Keep state in `index.tsx`** - don't introduce new state managers
4. **Test map features** - MapLibre requires correct import path
5. **Use Armenian language** for all user-facing text

### Code Review Checklist
- [ ] TypeScript types added/updated?
- [ ] Mock data includes new fields?
- [ ] Memoization used for expensive operations?
- [ ] Armenian labels added to utils?
- [ ] Map markers use correct coordinate format?
- [ ] Toast notifications instead of `alert()`?
- [ ] Error boundary wraps new components?

### Future Improvements (Not Implemented)
- Backend API integration
- Real-time websockets for alarms
- User authentication
- Database persistence
- Advanced filtering/sorting
- Export reports
- Mobile responsive design
- Internationalization (i18n)
- Unit tests
- E2E tests

---

## 📞 Support & Resources

- **MapLibre GL Docs:** https://maplibre.org/maplibre-gl-js-docs/
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

---

## 📄 License

This is a prototype application for demonstration purposes.

---

**Last Updated:** December 23, 2025  
**Version:** 1.0.0  
**Author:** Arintellect Team
