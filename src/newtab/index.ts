import type { SavedItem, Topic, Intent } from '../shared/types';
import { sendToBackground } from '../shared/messages';

interface FormattedItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  domain: string;
  savedAt: string;
  topics: Topic[];
  intents: Intent[];
}

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  visitTime: string;
  visitCount: number;
}

let allItems: SavedItem[] = [];
let allTopics: Topic[] = [];
let allIntents: Intent[] = [];
let currentResults: FormattedItem[] = [];
let currentHistory: HistoryItem[] = [];

// Navigation state: 'none' = search box, 'history' = in history, 'saved' = in saved items
let selectedSection: 'none' | 'history' | 'saved' = 'none';
let selectedIndex = -1; // Index within the selected section

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  updateStats();
  updateShortcutHints();
  
  // Aggressive focus on search input (Chrome tries to focus URL bar)
  focusSearchInput();
});

/**
 * Update keyboard shortcut hints from Chrome commands
 */
async function updateShortcutHints() {
  try {
    const commands = await chrome.commands.getAll();
    const hintsContainer = document.querySelector('.newtab-hints');
    
    if (!hintsContainer) return;
    
    const saveCommand = commands.find(c => c.name === 'save-tab');
    const searchCommand = commands.find(c => c.name === 'resurface');
    
    const saveShortcut = saveCommand?.shortcut || 'Not set';
    const searchShortcut = searchCommand?.shortcut || 'Not set';
    
    hintsContainer.innerHTML = `
      <span class="newtab-hint-item" title="Click to customize">
        ${formatShortcut(saveShortcut)} Save current tab
      </span>
      <span class="newtab-hint-item" title="Click to customize">
        ${formatShortcut(searchShortcut)} Search saved tabs
      </span>
      <a href="chrome://extensions/shortcuts" class="newtab-hint-customize" id="customize-shortcuts">
        Customize shortcuts
      </a>
    `;
    
    // Handle click on customize (can't open chrome:// directly, show instructions)
    const customizeLink = document.getElementById('customize-shortcuts');
    customizeLink?.addEventListener('click', (e) => {
      e.preventDefault();
      showShortcutInstructions();
    });
    
  } catch (error) {
    console.error('Error fetching shortcuts:', error);
  }
}

/**
 * Format shortcut string to HTML with kbd elements
 */
function formatShortcut(shortcut: string): string {
  if (!shortcut || shortcut === 'Not set') {
    return '<span class="newtab-shortcut-notset">Not set</span>';
  }
  
  // Parse shortcut like "⌘+Shift+S" or "Ctrl+Shift+S"
  const parts = shortcut
    .replace('Command', '⌘')
    .replace('Cmd', '⌘')
    .replace('MacCtrl', '⌃')
    .replace('Ctrl', '⌃')
    .replace('Alt', '⌥')
    .replace('Shift', '⇧')
    .split('+');
  
  return parts.map(p => `<kbd>${p.trim()}</kbd>`).join('');
}

/**
 * Show instructions for customizing shortcuts
 */
function showShortcutInstructions() {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'newtab-shortcut-modal';
  modal.innerHTML = `
    <div class="newtab-shortcut-modal-content">
      <div class="newtab-shortcut-modal-header">
        <h3>Customize Keyboard Shortcuts</h3>
        <button class="newtab-shortcut-modal-close" id="close-modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="newtab-shortcut-modal-body">
        <p>To customize Resurface's keyboard shortcuts:</p>
        <ol>
          <li>Open Chrome and go to <code>chrome://extensions</code></li>
          <li>Click the <strong>menu icon</strong> (☰) in the top-left</li>
          <li>Select <strong>"Keyboard shortcuts"</strong></li>
          <li>Find <strong>Resurface</strong> and set your preferred shortcuts</li>
        </ol>
        <div class="newtab-shortcut-modal-actions">
          <button class="newtab-btn newtab-btn-secondary" id="copy-url">
            Copy URL
          </button>
          <button class="newtab-btn newtab-btn-primary" id="close-modal-btn">
            Got it
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate in
  requestAnimationFrame(() => modal.classList.add('visible'));
  
  // Close handlers
  const closeModal = () => {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 200);
  };
  
  modal.querySelector('#close-modal')?.addEventListener('click', closeModal);
  modal.querySelector('#close-modal-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Copy URL
  modal.querySelector('#copy-url')?.addEventListener('click', () => {
    navigator.clipboard.writeText('chrome://extensions/shortcuts');
    const btn = modal.querySelector('#copy-url') as HTMLButtonElement;
    if (btn) {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy URL', 2000);
    }
  });
}

/**
 * Aggressively focus the search input
 * Chrome tries to focus the URL bar, so we need multiple attempts
 */
function focusSearchInput() {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  if (!searchInput) return;
  
  // Simulate Escape key to release focus from URL bar
  const simulateEscape = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    }));
  };
  
  // Aggressive focus strategy - Chrome really wants the URL bar
  const doFocus = () => {
    searchInput.focus();
    searchInput.select(); // Also select any existing text
  };
  
  // First, simulate Escape to release URL bar focus
  simulateEscape();
  
  // Immediate focus
  doFocus();
  
  // Use requestAnimationFrame for smoother timing
  requestAnimationFrame(() => {
    simulateEscape();
    doFocus();
  });
  requestAnimationFrame(() => requestAnimationFrame(doFocus));
  
  // Multiple delayed attempts with Escape simulation
  const delays = [0, 10, 20, 50, 100, 150, 200, 300, 500];
  delays.forEach(delay => setTimeout(() => {
    simulateEscape();
    doFocus();
  }, delay));
  
  // Keep trying for a bit longer with intervals
  let attempts = 0;
  const maxAttempts = 10;
  const focusInterval = setInterval(() => {
    attempts++;
    if (document.activeElement !== searchInput) {
      simulateEscape();
      doFocus();
    }
    if (attempts >= maxAttempts) {
      clearInterval(focusInterval);
    }
  }, 100);
  
  // Also focus on window focus (when user clicks back to the tab)
  window.addEventListener('focus', () => {
    simulateEscape();
    setTimeout(doFocus, 0);
    setTimeout(doFocus, 50);
  });
  
  // Focus on any click in the page (except on interactive elements)
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('a, button, input, select, textarea, .newtab-result-item, .newtab-history-item, .newtab-quick-link')) {
      doFocus();
    }
  });
  
  // Focus when user starts typing anywhere (redirect to search input)
  document.addEventListener('keydown', (e) => {
    // If user types a printable character and not in an input
    if (
      e.key.length === 1 && 
      !e.ctrlKey && 
      !e.metaKey && 
      !e.altKey &&
      document.activeElement !== searchInput
    ) {
      doFocus();
    }
  });
}

/**
 * Load all data from storage
 */
async function loadData() {
  try {
    allItems = await sendToBackground('GET_ALL_ITEMS') || [];
    allTopics = await sendToBackground('GET_ALL_TOPICS') || [];
    allIntents = await sendToBackground('GET_ALL_INTENTS') || [];
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const resultsTray = document.getElementById('results-tray') as HTMLElement;
  const historyTray = document.getElementById('history-tray') as HTMLElement;
  const openDashboard = document.getElementById('open-dashboard') as HTMLAnchorElement;
  
  // Set dashboard URL
  openDashboard.href = chrome.runtime.getURL('src/dashboard/index.html');
  
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Search input
  searchInput.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
      const query = searchInput.value.trim();
      searchAndDisplay(query);
    }, 100);
  });
  
  // Keyboard navigation
  // Up arrow = history (above search box, most recent at bottom)
  // Down arrow = saved items (below search box)
  searchInput.addEventListener('keydown', (e) => {
    const historyItems = historyTray.querySelectorAll('.newtab-history-item');
    const savedItems = resultsTray.querySelectorAll('.newtab-result-item');
    const totalHistoryItems = historyItems.length;
    const totalSavedItems = savedItems.length;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        // Navigate UP into history (most recent is at bottom, index 0)
        if (selectedSection === 'none') {
          // From search box, go to history (start at bottom = most recent)
          if (totalHistoryItems > 0) {
            selectedSection = 'history';
            selectedIndex = 0; // Bottom of history (most recent)
          }
        } else if (selectedSection === 'history') {
          // Move up in history (towards older items)
          if (selectedIndex < totalHistoryItems - 1) {
            selectedIndex++;
          }
          // At top of history, stay there
        } else if (selectedSection === 'saved') {
          // From saved items, go back to search box first
          if (selectedIndex === 0) {
            selectedSection = 'none';
            selectedIndex = -1;
          } else {
            selectedIndex--;
          }
        }
        updateSelection(historyItems, savedItems);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        // Navigate DOWN into saved items
        if (selectedSection === 'none') {
          // From search box, go to saved items
          if (totalSavedItems > 0) {
            selectedSection = 'saved';
            selectedIndex = 0;
          }
        } else if (selectedSection === 'history') {
          // Move down in history (towards more recent / search box)
          if (selectedIndex > 0) {
            selectedIndex--;
          } else {
            // At bottom of history (most recent), go to search box
            selectedSection = 'none';
            selectedIndex = -1;
          }
        } else if (selectedSection === 'saved') {
          // Move down in saved items
          if (selectedIndex < totalSavedItems - 1) {
            selectedIndex++;
          }
          // At bottom of saved, stay there
        }
        updateSelection(historyItems, savedItems);
        break;
        
      case 'Enter':
        e.preventDefault();
        const query = searchInput.value.trim();
        
        // Check if it's a URL - navigate directly
        if (isUrl(query)) {
          window.location.href = formatUrl(query);
          return;
        }
        
        // Check if something is selected
        if (selectedSection === 'history' && currentHistory[selectedIndex]) {
          window.location.href = currentHistory[selectedIndex].url;
        } else if (selectedSection === 'saved' && currentResults[selectedIndex]) {
          window.location.href = currentResults[selectedIndex].url;
        } else {
          // Search Google (when at search box)
          if (query) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          }
        }
        break;
        
      case 'Escape':
        searchInput.value = '';
        searchAndDisplay('');
        selectedSection = 'none';
        selectedIndex = -1;
        break;
    }
  });
  
  // Click on history item
  historyTray.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.newtab-history-item') as HTMLElement;
    if (item) {
      const url = item.dataset.url;
      if (url) {
        window.location.href = url;
      }
    }
  });
  
  // Click on result
  resultsTray.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.newtab-result-item') as HTMLElement;
    if (item) {
      const url = item.dataset.url;
      if (url) {
        window.location.href = url;
      }
    }
  });
}

/**
 * Check if string is a URL
 */
function isUrl(str: string): boolean {
  // Check if it looks like a URL
  if (str.includes(' ')) return false;
  
  // Has protocol
  if (/^https?:\/\//i.test(str)) return true;
  
  // Looks like a domain (e.g., google.com, sub.domain.com)
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(str)) return true;
  
  // localhost or IP
  if (/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?/.test(str)) return true;
  
  return false;
}

/**
 * Format URL for navigation
 */
function formatUrl(str: string): string {
  if (/^https?:\/\//i.test(str)) return str;
  return `https://${str}`;
}

/**
 * Search and display results
 */
async function searchAndDisplay(query: string) {
  const resultsTray = document.getElementById('results-tray') as HTMLElement;
  const resultsList = document.getElementById('results-list') as HTMLElement;
  const resultsCount = document.getElementById('results-count') as HTMLElement;
  const resultsHeader = document.getElementById('results-header') as HTMLElement;
  const historyTray = document.getElementById('history-tray') as HTMLElement;
  const historyList = document.getElementById('history-list') as HTMLElement;
  const searchHint = document.getElementById('search-hint') as HTMLElement;
  
  // Reset selection
  selectedSection = 'none';
  selectedIndex = -1;
  
  if (!query || query.length < 1) {
    resultsTray.classList.remove('visible');
    historyTray.classList.remove('visible');
    searchHint.innerHTML = '<kbd>↵</kbd> Google';
    currentResults = [];
    currentHistory = [];
    return;
  }
  
  // Check if it's a URL
  if (isUrl(query)) {
    resultsTray.classList.remove('visible');
    historyTray.classList.remove('visible');
    searchHint.innerHTML = '<kbd>↵</kbd> Go to site';
    currentResults = [];
    currentHistory = [];
    return;
  }
  
  // Search browser history
  try {
    const historyResults = await chrome.history.search({
      text: query,
      maxResults: 50, // Get more results to deduplicate
      startTime: Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    });
    
    if (historyResults.length > 0) {
      // Deduplicate by URL and count visits
      const urlMap = new Map<string, {
        item: chrome.history.HistoryItem;
        count: number;
        lastVisitTime: number;
      }>();
      
      for (const item of historyResults) {
        if (!item.url || !item.title) continue;
        
        const existing = urlMap.get(item.url);
        if (existing) {
          existing.count += item.visitCount || 1;
          // Keep the most recent visit time
          if (item.lastVisitTime && item.lastVisitTime > existing.lastVisitTime) {
            existing.lastVisitTime = item.lastVisitTime;
            existing.item = item; // Use the most recent item's data
          }
        } else {
          urlMap.set(item.url, {
            item,
            count: item.visitCount || 1,
            lastVisitTime: item.lastVisitTime || 0
          });
        }
      }
      
      // Convert to array and sort by most recent, limit to 5 unique items
      const uniqueHistory = Array.from(urlMap.values())
        .sort((a, b) => b.lastVisitTime - a.lastVisitTime)
        .slice(0, 5);
      
      // Store history with most recent first (index 0 = most recent)
      currentHistory = uniqueHistory.map(({ item, count, lastVisitTime }) => ({
        id: item.id || String(Date.now()),
        title: item.title || item.url || '',
        url: item.url || '',
        domain: extractDomain(item.url || ''),
        visitTime: lastVisitTime ? formatRelativeTime(lastVisitTime) : '',
        visitCount: count
      }));
      
      // Display history reversed so most recent is at BOTTOM (closest to search box)
      // DOM order: oldest at top, most recent at bottom
      const reversedForDisplay = [...currentHistory].reverse();
      historyList.innerHTML = reversedForDisplay.map((item, index) => getHistoryHTML(item, index)).join('');
      historyTray.classList.add('visible');
      
      // Scroll history list to bottom so most recent items are visible
      requestAnimationFrame(() => {
        historyList.scrollTop = historyList.scrollHeight;
      });
    } else {
      historyTray.classList.remove('visible');
      currentHistory = [];
    }
  } catch (error) {
    console.error('Error searching history:', error);
    historyTray.classList.remove('visible');
    currentHistory = [];
  }
  
  // Search saved items locally
  const queryLower = query.toLowerCase();
  const matches = allItems.filter(item => 
    item.title.toLowerCase().includes(queryLower) ||
    item.url.toLowerCase().includes(queryLower) ||
    item.searchText?.toLowerCase().includes(queryLower)
  ).slice(0, 6);
  
  if (matches.length > 0) {
    currentResults = matches.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      favicon: item.favicon,
      domain: extractDomain(item.url),
      savedAt: formatRelativeTime(item.savedAt),
      topics: allTopics.filter(t => item.topicIds.includes(t.id)),
      intents: allIntents.filter(i => item.intentIds.includes(i.id))
    }));
    
    resultsCount.textContent = String(matches.length);
    resultsList.innerHTML = currentResults.map((item, index) => getResultHTML(item, index)).join('');
    resultsHeader.style.display = 'flex';
    resultsTray.classList.add('visible');
  } else {
    resultsTray.classList.remove('visible');
    currentResults = [];
  }
  
  // Update hint based on results
  if (currentHistory.length > 0 && currentResults.length > 0) {
    searchHint.innerHTML = '<kbd>↑</kbd> history &nbsp; <kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open';
  } else if (currentHistory.length > 0) {
    searchHint.innerHTML = '<kbd>↑</kbd> history &nbsp; <kbd>↵</kbd> open or Google';
  } else if (currentResults.length > 0) {
    searchHint.innerHTML = '<kbd>↓</kbd> saved &nbsp; <kbd>↵</kbd> open or Google';
  } else {
    searchHint.innerHTML = '<kbd>↵</kbd> Google';
  }
}

/**
 * Generate history item HTML
 */
function getHistoryHTML(item: HistoryItem, index: number): string {
  const visitCountBadge = item.visitCount > 1 
    ? `<span class="newtab-history-visits">${item.visitCount}×</span>` 
    : '';
  
  return `
    <div class="newtab-history-item" data-url="${escapeHtml(item.url)}" data-index="${index}" data-section="history">
      <div class="newtab-history-favicon">
        ${item.domain[0].toUpperCase()}
      </div>
      <div class="newtab-history-content">
        <div class="newtab-history-title">${escapeHtml(item.title)}</div>
        <div class="newtab-history-meta">
          <span class="newtab-history-domain">${escapeHtml(item.domain)}</span>
          ${item.visitTime ? `<span class="newtab-history-separator">•</span><span class="newtab-history-time">${item.visitTime}</span>` : ''}
          ${visitCountBadge}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate result HTML
 */
function getResultHTML(item: FormattedItem, index: number): string {
  const faviconContent = item.favicon
    ? `<img src="${escapeHtml(item.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${item.domain[0].toUpperCase()}'">`
    : item.domain[0].toUpperCase();
  
  return `
    <div class="newtab-result-item" data-url="${escapeHtml(item.url)}" data-index="${index}" data-section="saved">
      <div class="newtab-result-favicon">
        ${faviconContent}
      </div>
      <div class="newtab-result-content">
        <div class="newtab-result-title">${escapeHtml(item.title)}</div>
        <div class="newtab-result-meta">
          <span class="newtab-result-domain">${escapeHtml(item.domain)}</span>
          <span class="newtab-result-separator">•</span>
          <span class="newtab-result-time">${item.savedAt}</span>
        </div>
      </div>
      <div class="newtab-result-tags">
        ${item.topics.slice(0, 2).map(t => `
          <span class="newtab-result-tag" style="background: ${hexToRgba(t.color, 0.15)}; color: ${t.color};">
            ${escapeHtml(t.name)}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Update selection highlight for combined history + saved items
 */
function updateSelection(
  historyItems: NodeListOf<Element>, 
  savedItems: NodeListOf<Element>
) {
  // Clear all selections
  historyItems.forEach(item => item.classList.remove('selected'));
  savedItems.forEach(item => item.classList.remove('selected'));
  
  if (selectedSection === 'none') {
    return;
  }
  
  if (selectedSection === 'history' && selectedIndex >= 0) {
    // History is displayed with most recent at bottom (index 0 in our array)
    // But DOM order is reversed, so we need to map: index 0 -> last DOM element
    const domIndex = historyItems.length - 1 - selectedIndex;
    historyItems[domIndex]?.classList.add('selected');
    historyItems[domIndex]?.scrollIntoView({ block: 'nearest' });
  } else if (selectedSection === 'saved' && selectedIndex >= 0) {
    savedItems[selectedIndex]?.classList.add('selected');
    savedItems[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Update stats display
 */
function updateStats() {
  const statTotal = document.getElementById('stat-total') as HTMLElement;
  const statTopics = document.getElementById('stat-topics') as HTMLElement;
  
  statTotal.textContent = String(allItems.length);
  statTopics.textContent = String(allTopics.length);
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
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

/**
 * Escape HTML
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Convert hex to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
