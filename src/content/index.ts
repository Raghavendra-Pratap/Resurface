import type { Message, MessagePayloads } from '../shared/messages';
import { sendToBackground } from '../shared/messages';
import { extractPageData } from './extractor';
import { showToast } from './toast';
import { showDropdown, hideDropdown } from './dropdown';
import { showSearchModal } from './searchModal';
import { showGoogleOverlay } from './googleOverlay';
import { escapeHtml, getResurfaceLogoSvg } from '../shared/utils';

/**
 * Content script entry point
 * Handles messages from background worker and manages UI components
 */

// Listen for messages from background worker
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  // Simple ping to check if content script is loaded
  if (message.type === 'PING') {
    sendResponse({ pong: true });
    return true;
  }

  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      console.error('Resurface content script error:', error);
      sendResponse({ error: error.message });
    });
  
  return true; // Indicates async response
});

/**
 * Handle incoming messages
 */
async function handleMessage(message: Message): Promise<unknown> {
  switch (message.type) {
    case 'EXTRACT_PAGE':
      return extractPageData();
    
    case 'SHOW_TOAST':
      // Handle toast asynchronously - don't block the message response
      handleShowToast(message.payload as MessagePayloads['SHOW_TOAST']);
      return { received: true };
    
    case 'SHOW_ALREADY_SAVED':
      return handleShowAlreadySaved(message.payload as MessagePayloads['SHOW_ALREADY_SAVED']);
    
    case 'SHOW_CONFIRMATION':
      return handleShowConfirmation(message.payload as MessagePayloads['SHOW_CONFIRMATION']);
    
    case 'SHOW_DROPDOWN':
      return handleShowDropdown(message.payload as MessagePayloads['SHOW_DROPDOWN']);
    
    case 'HIDE_DROPDOWN':
      hideDropdown();
      return;
    
    case 'SHOW_GOOGLE_HINT':
      return handleShowGoogleHint(message.payload as MessagePayloads['SHOW_GOOGLE_HINT']);
    
    case 'SHOW_SEARCH_MODAL':
      return handleShowSearchModal(message.payload as MessagePayloads['SHOW_SEARCH_MODAL']);
    
    case 'SHOW_GOOGLE_OVERLAY':
      return handleShowGoogleOverlay(message.payload as MessagePayloads['SHOW_GOOGLE_OVERLAY']);
    
    default:
      console.warn('Resurface: Unknown message type:', message.type);
  }
}

/**
 * Handle show Google overlay message
 */
async function handleShowGoogleOverlay(data: MessagePayloads['SHOW_GOOGLE_OVERLAY']): Promise<void> {
  showGoogleOverlay(data.items, data.query);
}

/**
 * Handle show search modal message
 */
async function handleShowSearchModal(data: MessagePayloads['SHOW_SEARCH_MODAL']): Promise<void> {
  showSearchModal(data.items);
}

/**
 * Handle show toast message
 */
async function handleShowToast(data: MessagePayloads['SHOW_TOAST']): Promise<void> {
  console.log('Resurface: Showing toast with data:', data);
  
  try {
    const result = await showToast(data);
    console.log('Resurface: Toast result:', result);
    
    if (result) {
      console.log('Resurface: User saved, sending SAVE_ITEM to background...');
      // User saved - send to background
      const savePayload = {
        pageData: data.pageData,
        toastResult: result,
        siblingTabUrls: data.siblingTabUrls
      };
      console.log('Resurface: SAVE_ITEM payload:', savePayload);
      
      const savedItem = await sendToBackground('SAVE_ITEM', savePayload);
      console.log('Resurface: Save successful! Saved item:', savedItem);
      // Show confirmation
      showMiniToast('Saved to Resurface', 'success');
    } else {
      console.log('Resurface: User cancelled (result was null/undefined)');
      // User cancelled
      showMiniToast('Not saved', 'muted');
    }
  } catch (error) {
    console.error('Resurface: Error in handleShowToast:', error);
    showMiniToast('Error saving', 'muted');
  }
}

/**
 * Handle already saved message
 */
async function handleShowAlreadySaved(_data: MessagePayloads['SHOW_ALREADY_SAVED']): Promise<void> {
  showMiniToast('Already in your library', 'info');
}

/**
 * Handle show confirmation message
 */
async function handleShowConfirmation(data: MessagePayloads['SHOW_CONFIRMATION']): Promise<void> {
  showMiniToast(data.message, 'success');
}

/**
 * Handle show dropdown message
 */
async function handleShowDropdown(data: MessagePayloads['SHOW_DROPDOWN']): Promise<void> {
  showDropdown(data.items);
}

/**
 * Handle Google search hint
 */
async function handleShowGoogleHint(data: MessagePayloads['SHOW_GOOGLE_HINT']): Promise<void> {
  // Don't show if hint already exists
  if (document.getElementById('tabmind-google-hint')) return;
  
  const hint = document.createElement('div');
  hint.id = 'tabmind-google-hint';
  hint.className = 'tabmind-google-hint';
  hint.innerHTML = `
    <div class="tabmind-google-hint-icon">
      ${getResurfaceLogoSvg('hint')}
    </div>
    <div class="tabmind-google-hint-text">
      <strong>${data.count}</strong> saved page${data.count > 1 ? 's' : ''} match "${escapeHtml(data.query)}"
    </div>
  `;
  
  document.body.appendChild(hint);
  
  // Click to show dropdown
  hint.addEventListener('click', async () => {
    const results = await sendToBackground('SEARCH_ITEMS', { query: data.query });
    if (results && results.length > 0) {
      // Format and show dropdown
      const topics = await sendToBackground('GET_ALL_TOPICS');
      const intents = await sendToBackground('GET_ALL_INTENTS');
      
      const items = results.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
        faviconType: item.faviconType,
        domain: new URL(item.url).hostname.replace('www.', ''),
        savedAt: formatRelativeTime(item.savedAt),
        topics: topics.filter((t: { id: string }) => item.topicIds.includes(t.id)),
        intents: intents.filter((i: { id: string }) => item.intentIds.includes(i.id))
      }));
      
      showDropdown(items);
    }
    
    // Hide hint after click
    hint.remove();
  });
  
  // Auto-hide after 8 seconds
  setTimeout(() => {
    hint.remove();
  }, 8000);
}

/**
 * Show a mini toast notification
 */
function showMiniToast(message: string, type: 'success' | 'info' | 'muted'): void {
  // Remove existing mini toast
  const existing = document.querySelector('.tabmind-mini-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'tabmind-mini-toast';
  
  const iconSvg = type === 'success'
    ? '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>'
    : type === 'info'
    ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  
  toast.innerHTML = `
    <div class="tabmind-mini-toast-icon ${type}">
      ${iconSvg}
    </div>
    <div class="tabmind-mini-toast-text">${escapeHtml(message)}</div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('tabmind-closing');
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: number): string {
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

// Log initialization
console.log('Resurface content script loaded');
