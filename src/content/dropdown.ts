import type { DropdownItem } from '../shared/types';
import { escapeHtml, getResurfaceLogoSvg } from '../shared/utils';

let currentDropdown: HTMLElement | null = null;
let clickOutsideHandler: ((e: MouseEvent) => void) | null = null;

/**
 * Show the resurface dropdown
 */
export function showDropdown(items: DropdownItem[]): void {
  // Remove existing dropdown
  hideDropdown();
  
  if (items.length === 0) return;
  
  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'tabmind-dropdown';
  dropdown.innerHTML = getDropdownHTML(items);
  
  // Setup image error handlers (CSP compliant)
  dropdown.querySelectorAll('img[data-fallback]').forEach((img) => {
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
  
  // Position in top-right
  dropdown.style.top = '80px';
  dropdown.style.right = '20px';
  dropdown.style.position = 'fixed';
  
  document.body.appendChild(dropdown);
  currentDropdown = dropdown;
  
  // Setup click handlers for items
  dropdown.querySelectorAll('.tabmind-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = (item as HTMLElement).dataset.url;
      if (url) {
        window.location.href = url;
      }
    });
  });
  
  // Click outside to close (with delay to prevent immediate close)
  setTimeout(() => {
    clickOutsideHandler = (e: MouseEvent) => {
      if (currentDropdown && !currentDropdown.contains(e.target as Node)) {
        hideDropdown();
      }
    };
    document.addEventListener('click', clickOutsideHandler);
  }, 100);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    hideDropdown();
  }, 10000);
}

/**
 * Hide the dropdown
 */
export function hideDropdown(): void {
  if (currentDropdown) {
    currentDropdown.remove();
    currentDropdown = null;
  }
  
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
    clickOutsideHandler = null;
  }
}

/**
 * Generate dropdown HTML
 */
function getDropdownHTML(items: DropdownItem[]): string {
  return `
    <div class="tabmind-dropdown-header">
      ${getResurfaceLogoSvg('dropdown')}
      <span><strong>${items.length} saved page${items.length > 1 ? 's' : ''}</strong> match your search</span>
    </div>
    <div class="tabmind-dropdown-items">
      ${items.map(item => getItemHTML(item)).join('')}
    </div>
  `;
}

/**
 * Generate item HTML
 */
function getItemHTML(item: DropdownItem): string {
  const faviconContent = item.favicon
    ? `<img src="${escapeHtml(item.favicon)}" alt="" data-fallback="${item.domain[0].toUpperCase()}">`
    : item.domain[0].toUpperCase();
  
  return `
    <div class="tabmind-dropdown-item" data-url="${escapeHtml(item.url)}">
      <div class="tabmind-dropdown-favicon">
        ${faviconContent}
      </div>
      <div class="tabmind-dropdown-info">
        <div class="tabmind-dropdown-title">${escapeHtml(item.title)}</div>
        <div class="tabmind-dropdown-meta">
          <span>${escapeHtml(item.domain)}</span>
          <span>•</span>
          <span>${item.savedAt}</span>
        </div>
      </div>
      <div class="tabmind-dropdown-tags">
        ${item.topics.slice(0, 2).map(t => `
          <span class="tabmind-mini-tag topic" style="background: ${hexToRgba(t.color, 0.15)}; color: ${t.color};">
            ${escapeHtml(t.name)}
          </span>
        `).join('')}
        ${item.intents.slice(0, 1).map(i => `
          <span class="tabmind-mini-tag intent">${i.emoji}</span>
        `).join('')}
      </div>
    </div>
  `;
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
