import { v4 as uuidv4 } from 'uuid';
import { STOP_WORDS } from './constants';

/**
 * Generate a UUID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Get current timestamp
 */
export function now(): number {
  return Date.now();
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Extract search query from Google/Bing referrer URL
 */
export function extractSearchQuery(referrerUrl: string | null): string | null {
  if (!referrerUrl) return null;
  
  try {
    const url = new URL(referrerUrl);
    
    // Google
    if (url.hostname.includes('google.')) {
      return url.searchParams.get('q');
    }
    
    // Bing
    if (url.hostname.includes('bing.')) {
      return url.searchParams.get('q');
    }
    
    // DuckDuckGo
    if (url.hostname.includes('duckduckgo.')) {
      return url.searchParams.get('q');
    }
    
    // Yahoo
    if (url.hostname.includes('yahoo.')) {
      return url.searchParams.get('p');
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract keywords from text for topic matching
 */
export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')      // Remove special chars
    .split(/\s+/)                        // Split by whitespace
    .filter(word => 
      word.length > 2 &&                 // Min length 3
      !STOP_WORDS.has(word) &&           // Not a stop word
      !/^\d+$/.test(word)                // Not just numbers
    )
    .slice(0, 5);                        // Top 5 keywords
}

/**
 * Capitalize first letter
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate search text for an item (used for searching)
 */
export function generateSearchText(
  title: string,
  url: string,
  referrerQuery: string | null
): string {
  const parts = [
    title.toLowerCase(),
    url.toLowerCase(),
    referrerQuery?.toLowerCase() || ''
  ];
  return parts.join(' ').trim();
}

/**
 * Try to fetch favicon as base64
 */
export async function fetchFaviconAsBase64(url: string): Promise<{ data: string; type: 'base64' | 'url' }> {
  try {
    const domain = extractDomain(url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    
    const response = await fetch(faviconUrl);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          data: reader.result as string,
          type: 'base64'
        });
      };
      reader.onerror = () => {
        resolve({
          data: faviconUrl,
          type: 'url'
        });
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    // Fallback to URL
    const domain = extractDomain(url);
    return {
      data: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      type: 'url'
    };
  }
}

/**
 * Check if URL is a valid http/https URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Get a random color from the palette
 */
export function getRandomColor(colors: string[], existingColors: string[]): string {
  const available = colors.filter(c => !existingColors.includes(c));
  if (available.length === 0) {
    return colors[Math.floor(Math.random() * colors.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get the Resurface logo SVG (Layered Recall design)
 */
export function getResurfaceLogoSvg(idSuffix: string = ''): string {
  const gradientId = `bgGrad${idSuffix || Math.random().toString(36).substr(2, 9)}`;
  return `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8b5cf6"/>
        <stop offset="100%" style="stop-color:#7c3aed"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#${gradientId})"/>
    <rect x="22" y="58" width="84" height="56" rx="8" fill="rgba(255,255,255,0.2)" transform="rotate(-3 64 86)"/>
    <rect x="22" y="50" width="84" height="56" rx="8" fill="rgba(255,255,255,0.4)" transform="rotate(2 64 78)"/>
    <rect x="20" y="28" width="88" height="60" rx="8" fill="white"/>
    <line x1="32" y1="46" x2="96" y2="46" stroke="#7c3aed" stroke-width="4" stroke-linecap="round"/>
    <line x1="32" y1="60" x2="76" y2="60" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round"/>
    <line x1="32" y1="74" x2="60" y2="74" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round"/>
    <circle cx="98" cy="22" r="7" fill="#fbbf24"/>
    <path d="M98 12 L98 8 M108 22 L112 22 M98 32 L98 28" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}
