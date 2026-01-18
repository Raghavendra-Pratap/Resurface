import type { DropdownItem } from '../shared/types';
import { sendToBackground } from '../shared/messages';
import { escapeHtml, getResurfaceLogoSvg } from '../shared/utils';

let currentOverlay: HTMLElement | null = null;
let isMinimized = false;

/**
 * Show the Google search overlay with matching saved items
 */
export function showGoogleOverlay(items: DropdownItem[], query: string): void {
  // Remove existing overlay
  hideGoogleOverlay();
  
  if (items.length === 0) return;
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'tabmind-google-overlay';
  overlay.innerHTML = getOverlayHTML(items, query);
  document.body.appendChild(overlay);
  currentOverlay = overlay;
  
  // Setup event handlers
  setupEventHandlers(overlay, query);
  
  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });
}

/**
 * Hide the Google overlay
 */
export function hideGoogleOverlay(): void {
  if (currentOverlay) {
    currentOverlay.classList.remove('visible');
    setTimeout(() => {
      currentOverlay?.remove();
      currentOverlay = null;
    }, 200);
  }
}

/**
 * Generate overlay HTML
 */
function getOverlayHTML(items: DropdownItem[], query: string): string {
  return `
    <div class="tabmind-google-overlay-container ${isMinimized ? 'minimized' : ''}">
      <div class="tabmind-google-overlay-header">
        <div class="tabmind-google-overlay-header-left">
          <div class="tabmind-google-overlay-icon">
            ${getResurfaceLogoSvg('overlay')}
          </div>
          <span class="tabmind-google-overlay-title">
            <strong>${items.length} saved page${items.length > 1 ? 's' : ''}</strong> match your search
          </span>
        </div>
        <div class="tabmind-google-overlay-header-right">
          <button class="tabmind-google-overlay-toggle" id="tabmind-toggle-overlay" title="${isMinimized ? 'Expand' : 'Minimize'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${isMinimized 
                ? '<polyline points="6 9 12 15 18 9"/>' 
                : '<polyline points="18 15 12 9 6 15"/>'}
            </svg>
          </button>
          <button class="tabmind-google-overlay-close" id="tabmind-close-overlay" title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="tabmind-google-overlay-body" id="tabmind-overlay-body">
        <div class="tabmind-google-overlay-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            id="tabmind-google-search-input"
            placeholder="Search your saved tabs..."
            value="${escapeHtml(query)}"
            autocomplete="off"
            spellcheck="false"
          >
        </div>
        
        <div class="tabmind-google-overlay-items" id="tabmind-overlay-items">
          ${getItemsHTML(items)}
        </div>
      </div>
      
      <div class="tabmind-google-overlay-footer">
        <span class="tabmind-google-overlay-hint">
          <kbd>⌘</kbd><kbd>⇧</kbd><kbd>F</kbd> to search all
        </span>
        <a href="${chrome.runtime.getURL('src/dashboard/index.html')}" class="tabmind-google-overlay-dashboard" target="_blank">
          Open Dashboard →
        </a>
      </div>
    </div>
  `;
}

/**
 * Generate items HTML
 */
function getItemsHTML(items: DropdownItem[]): string {
  return items.map((item, index) => `
    <div class="tabmind-google-overlay-item" data-url="${escapeHtml(item.url)}" data-index="${index}">
      <div class="tabmind-google-overlay-item-favicon" data-fallback="${item.domain[0].toUpperCase()}">
        ${item.favicon 
          ? `<img src="${escapeHtml(item.favicon)}" alt="" data-fallback="${item.domain[0].toUpperCase()}">`
          : item.domain[0].toUpperCase()}
      </div>
      <div class="tabmind-google-overlay-item-info">
        <div class="tabmind-google-overlay-item-row1">
          <div class="tabmind-google-overlay-item-title">${escapeHtml(item.title)}</div>
          <div class="tabmind-google-overlay-item-meta">
            <span>${escapeHtml(item.domain)}</span>
            <span class="tabmind-separator">•</span>
            <span>${item.savedAt}</span>
          </div>
        </div>
        ${item.topics.length > 0 ? `
          <div class="tabmind-google-overlay-item-row2">
            ${item.topics.slice(0, 3).map(t => `
              <span class="tabmind-overlay-tag" style="background: ${hexToRgba(t.color, 0.15)}; color: ${t.color};">
                ${escapeHtml(t.name)}
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Setup event handlers
 */
function setupEventHandlers(overlay: HTMLElement, initialQuery: string): void {
  const closeBtn = overlay.querySelector('#tabmind-close-overlay');
  const toggleBtn = overlay.querySelector<HTMLButtonElement>('#tabmind-toggle-overlay');
  const searchInput = overlay.querySelector<HTMLInputElement>('#tabmind-google-search-input');
  const itemsContainer = overlay.querySelector('#tabmind-overlay-items');
  const container = overlay.querySelector('.tabmind-google-overlay-container');
  
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Close button
  closeBtn?.addEventListener('click', () => {
    hideGoogleOverlay();
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('click', handleClickOutside);
  });
  
  // Click outside to close
  function handleClickOutside(e: MouseEvent) {
    if (container && !container.contains(e.target as Node)) {
      hideGoogleOverlay();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    }
  }
  
  // Esc key to close
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      hideGoogleOverlay();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    }
  }
  
  // Add listeners with a slight delay to prevent immediate close
  setTimeout(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
  }, 100);
  
  // Toggle minimize/expand
  toggleBtn?.addEventListener('click', () => {
    isMinimized = !isMinimized;
    container?.classList.toggle('minimized', isMinimized);
    
    // Update toggle button icon
    if (toggleBtn) {
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${isMinimized 
            ? '<polyline points="6 9 12 15 18 9"/>' 
            : '<polyline points="18 15 12 9 6 15"/>'}
        </svg>
      `;
      toggleBtn.title = isMinimized ? 'Expand' : 'Minimize';
    }
  });
  
  // Search input
  searchInput?.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(async () => {
      const query = searchInput.value.trim();
      
      if (query.length === 0) {
        // Re-fetch with initial query
        await updateResults(initialQuery);
      } else {
        await updateResults(query);
      }
    }, 150);
  });
  
  // Click on items
  itemsContainer?.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('.tabmind-google-overlay-item');
    if (item) {
      const url = item.dataset.url;
      if (url) {
        // Open in new tab
        window.open(url, '_blank');
      }
    }
  });
  
  async function updateResults(query: string) {
    try {
      const results = await sendToBackground('SEARCH_ITEMS', { query });
      const topics = await sendToBackground('GET_ALL_TOPICS');
      const intents = await sendToBackground('GET_ALL_INTENTS');
      
      const formattedItems: DropdownItem[] = results.slice(0, 5).map(item => ({
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
      
      if (itemsContainer) {
        if (formattedItems.length === 0) {
          itemsContainer.innerHTML = `
            <div class="tabmind-google-overlay-empty">
              No saved pages match "${escapeHtml(query)}"
            </div>
          `;
        } else {
          itemsContainer.innerHTML = getItemsHTML(formattedItems);
          
          // Setup image error handlers (CSP compliant)
          itemsContainer.querySelectorAll('img[data-fallback]').forEach((img) => {
            const image = img as HTMLImageElement;
            image.addEventListener('error', function() {
              const fallback = this.getAttribute('data-fallback') || '';
              this.style.display = 'none';
              const parent = this.parentElement;
              if (parent && !parent.textContent?.trim()) {
                parent.textContent = fallback;
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Error updating results:', error);
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
