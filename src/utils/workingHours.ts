/**
 * Working Hours Auto-Calculator (Bangladesh Standard Time - UTC+6)
 * Automatically calculates if store is currently Open or Closed based on BST.
 * Example: 7:00 AM to 12:00 PM -> At 12:01 PM, automatically marks as "Closed Currently"
 */

export interface WorkingHoursConfig {
  startTime?: string; // e.g. "07:00", "7:00 AM", "09:00"
  endTime?: string;   // e.g. "12:00", "12:00 PM", "22:00"
  displayText?: string; // e.g. "7:00 AM - 12:00 PM (Daily)"
  isOpen?: boolean;   // Manual override flag
  isAlwaysOpen?: boolean; // Added
}

export interface WorkingHoursStatus {
  isOpen: boolean;
  badgeText: string;
  badgeColor: string;
  statusText: string;
  currentBangladeshTime: string;
  opensAtFormatted: string;
  closesAtFormatted: string;
}

// Convert "07:00", "7:00 AM", "12:00 PM", "22:00" to minutes since midnight (0 - 1439)
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();

  // Handle 12-hour format e.g. "7:00 AM", "12:00 PM", "11:30 PM", "7 AM", "12 PM"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const meridiem = match12[3];

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Handle 24-hour format e.g. "07:00", "12:00", "22:30", "7:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

export function formatMinutesTo12Hour(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${meridiem}`;
}

export function formatTimeString(timeStr?: string, defaultVal: string = '7:00 AM'): string {
  if (!timeStr) return defaultVal;
  const mins = parseTimeToMinutes(timeStr);
  if (mins === null) return timeStr;
  return formatMinutesTo12Hour(mins);
}

export function getWorkingHoursText(config?: WorkingHoursConfig): string {
  if (config?.isAlwaysOpen) {
    return "12:00 AM - 11:59 PM (24/7 Always Open)";
  }
  if (config?.displayText && config.displayText.trim()) {
    return config.displayText.trim();
  }
  const start = formatTimeString(config?.startTime || '07:00', '7:00 AM');
  const end = formatTimeString(config?.endTime || '12:00', '12:00 PM');
  return `${start} - ${end} (Daily)`;
}

export function getWorkingHoursStatus(config?: WorkingHoursConfig): WorkingHoursStatus {
  const now = new Date();
  const bd12Formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit'
  });
  const formattedBdTime = bd12Formatter.format(now);

  if (config?.isAlwaysOpen) {
    return {
      isOpen: true,
      badgeText: "Open Now",
      badgeColor: "emerald",
      statusText: "Open Now • Always Open (24 Hours)",
      currentBangladeshTime: formattedBdTime,
      opensAtFormatted: "12:00 AM",
      closesAtFormatted: "11:59 PM"
    };
  }

  if (config?.isOpen === false) return {
    isOpen: false,
    badgeText: "Closed Currently",
    badgeColor: "rose",
    statusText: `Closed Currently • Opens at ${formatMinutesTo12Hour(parseTimeToMinutes(config?.startTime || '07:00') ?? 420)}`,
    currentBangladeshTime: formattedBdTime,
    opensAtFormatted: formatMinutesTo12Hour(parseTimeToMinutes(config?.startTime || '07:00') ?? 420),
    closesAtFormatted: formatMinutesTo12Hour(parseTimeToMinutes(config?.endTime || '12:00') ?? 720)
  };

  // Get current Bangladesh Standard Time (BST, UTC+6)
  const bdTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const bdTimeStr = bdTimeFormatter.format(now);
  const [bdHourStr, bdMinStr] = bdTimeStr.split(':');
  const bdMinutes = parseInt(bdHourStr, 10) * 60 + parseInt(bdMinStr, 10);

  const startMinutes = parseTimeToMinutes(config?.startTime || '07:00') ?? 420; // default 7:00 AM = 420 mins
  const endMinutes = parseTimeToMinutes(config?.endTime || '12:00') ?? 720;    // default 12:00 PM = 720 mins

  let isAutoOpen = true;

  if (startMinutes < endMinutes) {
    isAutoOpen = bdMinutes >= startMinutes && bdMinutes < endMinutes;
  } else {
    isAutoOpen = bdMinutes >= startMinutes || bdMinutes < endMinutes;
  }

  const startFormatted = formatMinutesTo12Hour(startMinutes);
  const endFormatted = formatMinutesTo12Hour(endMinutes);

  if (isAutoOpen) {
    return {
      isOpen: true,
      badgeText: "Open Now",
      badgeColor: "emerald",
      statusText: `Open Now • Accepting Orders until ${endFormatted}`,
      currentBangladeshTime: formattedBdTime,
      opensAtFormatted: startFormatted,
      closesAtFormatted: endFormatted
    };
  } else {
    return {
      isOpen: false,
      badgeText: "Closed Currently",
      badgeColor: "rose",
      statusText: `Closed Currently • Opens at ${startFormatted}`,
      currentBangladeshTime: formattedBdTime,
      opensAtFormatted: startFormatted,
      closesAtFormatted: endFormatted
    };
  }
}
