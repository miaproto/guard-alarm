
// App-wide constants

// Pagination
export const ITEMS_PER_PAGE = 9;

// Timing
export const ALARM_GENERATION_INTERVAL = 300000; // 5 minutes in milliseconds
export const NEW_ALARM_HIGHLIGHT_DURATION = 10000; // 10 seconds

// Audio
export const ALARM_SOUND_FREQUENCY = 880; // A5 note
export const ALARM_SOUND_DURATION = 0.5; // seconds
export const ALARM_SOUND_VOLUME = 0.1;

// Alarm ID Format
export const getNewAlarmId = (counter: number): string => {
  const currentYear = new Date().getFullYear();
  return `${currentYear}-${counter}`;
};

