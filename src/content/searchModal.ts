import type { DropdownItem } from '../shared/types';
import { sendToBackground } from '../shared/messages';
import { escapeHtml } from '../shared/utils';

let currentModal: HTMLElement | null = null;
let allItems: DropdownItem[] = [];

/**
 * Show the search modal
 */
export function showSearchModal(items: DropdownItem[]): void {
  // Remove existing modal
  hideSearchModal();
  
  allItems = items;
  
  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'tabmind-search-modal';
  modal.innerHTML = getModalHTML(items);
  document.body.appendChild(modal);
  currentModal = modal;
  
  // Setup event handlers
  setupEventHandlers(modal);
  
  // Focus search input
  const searchInput = modal.querySelector<HTMLInputElement>('#tabmind-search-input');
  setTimeout(() => searchInput?.focus(), 50);
}

/**
 * Hide the search modal
 */
export function hideSearchModal(): void {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
  allItems = [];
}

/**
 * Generate modal HTML
 */
function getModalHTML(items: DropdownItem[]): string {
  return `
    <div class="tabmind-search-overlay" id="tabmind-search-overlay">
      <div class="tabmind-search-container">
        <div class="tabmind-search-header">
          <div class="tabmind-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input 
            type="text" 
            id="tabmind-search-input"
            class="tabmind-search-input" 
            placeholder="Search your saved tabs..."
            autocomplete="off"
            spellcheck="false"
          >
          <div class="tabmind-search-shortcut">
            <kbd>esc</kbd> to close
          </div>
        </div>
        
        <div class="tabmind-search-results" id="tabmind-search-results">
          ${getResultsHTML(items)}
        </div>
        
        <div class="tabmind-search-footer">
          <div class="tabmind-search-footer-left">
            <span class="tabmind-result-count" id="tabmind-result-count">${items.length} saved pages</span>
          </div>
          <div class="tabmind-search-footer-right">
            <span class="tabmind-footer-hint">
              <kbd>↑</kbd><kbd>↓</kbd> navigate
              <kbd>↵</kbd> open
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate results HTML
 */
function getResultsHTML(items: DropdownItem[]): string {
  if (items.length === 0) {
    return `
      <div class="tabmind-search-empty">
        <div class="tabmind-search-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="tabmind-search-empty-text">No saved pages found</div>
        <div class="tabmind-search-empty-hint">Press <kbd>⌘+Shift+S</kbd> to save pages</div>
      </div>
    `;
  }
  
  return items.map((item, index) => getResultItemHTML(item, index)).join('');
}

/**
 * Generate single result item HTML
 */
function getResultItemHTML(item: DropdownItem, index: number): string {
  const faviconContent = item.favicon
    ? `<img src="${escapeHtml(item.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${item.domain[0].toUpperCase()}'">`
    : item.domain[0].toUpperCase();
  
  return `
    <div class="tabmind-search-item ${index === 0 ? 'selected' : ''}" data-url="${escapeHtml(item.url)}" data-index="${index}">
      <div class="tabmind-search-item-favicon">
        ${faviconContent}
      </div>
      <div class="tabmind-search-item-content">
        <div class="tabmind-search-item-title">${escapeHtml(item.title)}</div>
        <div class="tabmind-search-item-meta">
          <span class="tabmind-search-item-domain">${escapeHtml(item.domain)}</span>
          <span class="tabmind-search-item-separator">•</span>
          <span class="tabmind-search-item-time">${item.savedAt}</span>
        </div>
      </div>
      <div class="tabmind-search-item-tags">
        ${item.topics.slice(0, 2).map(t => `
          <span class="tabmind-search-tag topic" style="background: ${hexToRgba(t.color, 0.15)}; color: ${t.color};">
            ${escapeHtml(t.name)}
          </span>
        `).join('')}
        ${item.intents.slice(0, 1).map(i => `
          <span class="tabmind-search-tag intent">${i.emoji}</span>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Setup event handlers
 */
function setupEventHandlers(modal: HTMLElement): void {
  const overlay = modal.querySelector('#tabmind-search-overlay');
  const searchInput = modal.querySelector<HTMLInputElement>('#tabmind-search-input');
  const resultsContainer = modal.querySelector('#tabmind-search-results');
  
  let selectedIndex = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Close on overlay click
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideSearchModal();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyDown);
  
  // Search input
  searchInput?.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(async () => {
      const query = searchInput.value.trim();
      
      if (query.length === 0) {
        // Show all items
        updateResults(allItems);
      } else {
        // Search for items
        try {
          const results = await sendToBackground('SEARCH_ITEMS', { query });
          const topics = await sendToBackground('GET_ALL_TOPICS');
          const intents = await sendToBackground('GET_ALL_INTENTS');
          
          const formattedItems: DropdownItem[] = results.map(item => ({
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
          
          updateResults(formattedItems);
        } catch (error) {
          console.error('Search error:', error);
        }
      }
    }, 150);
  });
  
  // Click on result item
  resultsContainer?.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('.tabmind-search-item');
    if (item) {
      const url = item.dataset.url;
      if (url) {
        window.location.href = url;
        hideSearchModal();
      }
    }
  });
  
  function handleKeyDown(e: KeyboardEvent) {
    const items = modal.querySelectorAll<HTMLElement>('.tabmind-search-item');
    
    switch (e.key) {
      case 'Escape':
        hideSearchModal();
        document.removeEventListener('keydown', handleKeyDown);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (items.length > 0) {
          items[selectedIndex]?.classList.remove('selected');
          selectedIndex = (selectedIndex + 1) % items.length;
          items[selectedIndex]?.classList.add('selected');
          items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (items.length > 0) {
          items[selectedIndex]?.classList.remove('selected');
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          items[selectedIndex]?.classList.add('selected');
          items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        }
        break;
        
      case 'Enter':
        const selectedItem = items[selectedIndex];
        if (selectedItem) {
          const url = selectedItem.dataset.url;
          if (url) {
            window.location.href = url;
            hideSearchModal();
          }
        }
        document.removeEventListener('keydown', handleKeyDown);
        break;
    }
  }
  
  function updateResults(items: DropdownItem[]) {
    if (resultsContainer) {
      resultsContainer.innerHTML = getResultsHTML(items);
      selectedIndex = 0;
      
      // Update count
      const countEl = modal.querySelector('#tabmind-result-count');
      if (countEl) {
        countEl.textContent = `${items.length} saved page${items.length !== 1 ? 's' : ''}`;
      }
    }
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
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
