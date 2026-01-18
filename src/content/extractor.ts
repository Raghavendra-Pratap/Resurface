import type { PageData } from '../shared/types';
import { extractSearchQuery, extractDomain } from '../shared/utils';

/**
 * Extract page metadata from the current page
 */
export async function extractPageData(): Promise<PageData> {
  const url = window.location.href;
  const title = document.title || url;
  const referrerUrl = document.referrer || null;
  const referrerQuery = extractSearchQuery(referrerUrl);
  
  // Get favicon
  const faviconResult = await getFavicon(url);
  
  return {
    url,
    title,
    favicon: faviconResult.data,
    faviconType: faviconResult.type,
    referrerUrl,
    referrerQuery
  };
}

/**
 * Get favicon for the current page
 */
async function getFavicon(url: string): Promise<{ data: string; type: 'base64' | 'url' }> {
  // Try to find favicon in the page
  const linkElements = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );
  
  let faviconUrl: string | null = null;
  
  // Find the best favicon
  for (const link of linkElements) {
    if (link.href) {
      faviconUrl = link.href;
      // Prefer apple-touch-icon as it's usually higher quality
      if (link.rel.includes('apple-touch-icon')) {
        break;
      }
    }
  }
  
  // Fallback to Google's favicon service
  if (!faviconUrl) {
    const domain = extractDomain(url);
    faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }
  
  // Try to convert to base64
  try {
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
          data: faviconUrl!,
          type: 'url'
        });
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return {
      data: faviconUrl,
      type: 'url'
    };
  }
}
