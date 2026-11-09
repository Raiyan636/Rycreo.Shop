/**
 * Formats an ISO date string into accurate Bangladesh Standard Time (BST - Asia/Dhaka, UTC+6)
 * matching the official World Clock time requested by the store owner.
 */
export const formatBangladeshDateTime = (isoString?: string | null): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);

    // Exact Bangladesh Standard Time (Asia/Dhaka, UTC+6)
    const timeBST = date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const dateBST = date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return `${timeBST} | ${dateBST} (BST / বাংলাদেশ সময়)`;
  } catch (err) {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return String(isoString);
    }
  }
};

export const formatShortOrderTime = (isoString?: string | null): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);

    const timeBST = date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const dateBST = date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return `${timeBST}, ${dateBST}`;
  } catch {
    return String(isoString);
  }
};

/**
 * Returns formatted relative time like "Just now", "2 mins ago", "1 hour ago"
 */
export const getRelativeTimeAgo = (isoString?: string | null): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return 'এইমাত্র (Just now)';
    if (diffSec < 60) return `${diffSec} সেকেন্ড আগে (${diffSec}s ago)`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} মিনিট আগে (${diffMin}m ago)`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে (${diffHours}h ago)`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} দিন আগে (${diffDays}d ago)`;
  } catch {
    return '';
  }
};

/**
 * Returns live current World Clock & Bangladesh Standard Time string
 */
export const getLiveWorldClockTime = (): { timeStr: string; dateStr: string; fullStr: string } => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  return {
    timeStr,
    dateStr,
    fullStr: `${timeStr} | ${dateStr} (BST, UTC+6)`
  };
};

