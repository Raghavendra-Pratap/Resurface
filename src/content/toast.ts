import type { ToastData, ToastResult, Topic, UUID } from '../shared/types';
import { escapeHtml } from '../shared/utils';

let currentToast: HTMLElement | null = null;
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
let currentAutoSaveDelay = 5000;
let resolvePromise: ((result: ToastResult | null) => void) | null = null;
let beforeUnloadHandler: (() => void) | null = null;

/**
 * Show the save toast
 */
export function showToast(data: ToastData): Promise<ToastResult | null> {
  return new Promise((resolve) => {
    // Remove existing toast FIRST (before setting new resolvePromise)
    hideToast();
    
    // Now set the new promise resolver
    resolvePromise = resolve;
    currentAutoSaveDelay = data.autoSaveDelay;
    
    // Create container
    const container = document.createElement('div');
    container.id = 'tabmind-toast-container';
    container.innerHTML = getToastHTML(data);
    document.body.appendChild(container);
    currentToast = container;
    
    // Setup event handlers
    setupEventHandlers(container, data);
    
    // Start auto-save timer
    startAutoSaveTimer();
    
    // Click outside to save
    container.addEventListener('click', (e) => {
      if (e.target === container) {
        save();
      }
    });
    
    // Save when tab is being closed (beforeunload)
    beforeUnloadHandler = () => {
      if (currentToast && resolvePromise) {
        // Synchronously save before page unloads
        saveSync();
      }
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);
  });
}

/**
 * Hide the toast
 */
export function hideToast(): void {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
  
  if (beforeUnloadHandler) {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    beforeUnloadHandler = null;
  }
  
  if (currentToast) {
    currentToast.remove();
    currentToast = null;
  }
  
  resolvePromise = null;
}

/**
 * Generate toast HTML
 */
function getToastHTML(data: ToastData): string {
  const { pageData, suggestedTopics, intents } = data;
  
  return `
    <div class="tabmind-toast">
      <div class="tabmind-toast-header">
        <div class="tabmind-toast-icon">
          <svg viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <div class="tabmind-toast-header-text">Add to Resurface</div>
          <div class="tabmind-toast-header-subtitle">${data.autoSaveDelay > 0 ? `Auto-saves in ${data.autoSaveDelay / 1000} seconds` : 'Manual save only'}</div>
        </div>
      </div>
      
      <div class="tabmind-toast-body">
        <div class="tabmind-field">
          <label class="tabmind-label">Title</label>
          <input 
            id="tabmind-title" 
            type="text" 
            class="tabmind-input" 
            value="${escapeHtml(pageData.title)}"
          >
        </div>
        
        <div class="tabmind-field">
          <label class="tabmind-label">Topics</label>
          <div class="tabmind-tags" id="tabmind-topics">
            ${suggestedTopics.map(topic => getTagHTML(topic)).join('')}
            <button class="tabmind-tag-add" id="tabmind-add-topic">+ Add</button>
          </div>
        </div>
        
        <div class="tabmind-field">
          <label class="tabmind-label">Intent (optional)</label>
          <select id="tabmind-intent" class="tabmind-select">
            <option value="">Select intent...</option>
            ${intents.map(intent => `
              <option value="${intent.id}">${intent.emoji} ${escapeHtml(intent.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>
      
      <div class="tabmind-toast-footer">
        <button id="tabmind-cancel" class="tabmind-btn tabmind-btn-secondary">Cancel</button>
        <button id="tabmind-save" class="tabmind-btn tabmind-btn-primary">Save</button>
      </div>
      
      ${data.autoSaveDelay > 0 ? `<div class="tabmind-timer-bar" id="tabmind-timer" style="animation-duration: ${data.autoSaveDelay}ms"></div>` : ''}
    </div>
  `;
}

/**
 * Generate tag HTML
 */
function getTagHTML(topic: Topic): string {
  return `
    <span class="tabmind-tag" data-topic-id="${topic.id}" style="background: ${hexToRgba(topic.color, 0.15)}; color: ${topic.color};">
      ${escapeHtml(topic.name)}
      <span class="tabmind-tag-remove" data-topic-id="${topic.id}">×</span>
    </span>
  `;
}

/**
 * Setup event handlers
 */
function setupEventHandlers(container: HTMLElement, data: ToastData): void {
  const saveBtn = container.querySelector('#tabmind-save');
  const cancelBtn = container.querySelector('#tabmind-cancel');
  const titleInput = container.querySelector<HTMLInputElement>('#tabmind-title');
  const topicsContainer = container.querySelector('#tabmind-topics');
  const addTopicBtn = container.querySelector('#tabmind-add-topic');
  const timerBar = container.querySelector('#tabmind-timer');
  
  // Store selected topic IDs
  const selectedTopicIds = new Set<UUID>(data.suggestedTopics.map(t => t.id));
  
  // Save button
  saveBtn?.addEventListener('click', () => save());
  
  // Cancel button
  cancelBtn?.addEventListener('click', () => cancel());
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
  
  // Pause timer on input focus
  titleInput?.addEventListener('focus', () => pauseTimer());
  titleInput?.addEventListener('blur', () => resumeTimer());
  
  // Remove topic
  topicsContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('tabmind-tag-remove')) {
      const topicId = target.dataset.topicId;
      if (topicId) {
        selectedTopicIds.delete(topicId);
        target.parentElement?.remove();
      }
    }
  });
  
  // Add topic (simple prompt for now)
  addTopicBtn?.addEventListener('click', () => {
    const name = prompt('Enter topic name:');
    if (name && name.trim()) {
      // Create a temporary topic (will be created properly on save)
      const tempId = `temp-${Date.now()}`;
      selectedTopicIds.add(tempId);
      
      const tag = document.createElement('span');
      tag.className = 'tabmind-tag';
      tag.dataset.topicId = tempId;
      tag.dataset.topicName = name.trim();
      tag.style.background = 'rgba(99, 102, 241, 0.15)';
      tag.style.color = '#818cf8';
      tag.innerHTML = `
        ${escapeHtml(name.trim())}
        <span class="tabmind-tag-remove" data-topic-id="${tempId}">×</span>
      `;
      
      addTopicBtn.before(tag);
    }
  });
  
  // Collect form data function
  (container as HTMLElement & { collectData: () => ToastResult }).collectData = () => {
    const title = titleInput?.value || data.pageData.title;
    const intentSelect = container.querySelector<HTMLSelectElement>('#tabmind-intent');
    const intentId = intentSelect?.value || '';
    
    // Collect topic IDs from tags
    const topicIds: UUID[] = [];
    container.querySelectorAll<HTMLElement>('.tabmind-tag[data-topic-id]').forEach(tag => {
      const id = tag.dataset.topicId;
      if (id) topicIds.push(id);
    });
    
    return {
      title,
      topicIds,
      intentIds: intentId ? [intentId] : []
    };
  };
  
  function pauseTimer() {
    timerBar?.classList.add('tabmind-paused');
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
  }
  
  function resumeTimer() {
    timerBar?.classList.remove('tabmind-paused');
    startAutoSaveTimer();
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    // Don't trigger save if user is typing in an input field
    const target = e.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
    
    if (e.key === 'Escape') {
      // Esc saves (as per spec)
      save();
    } else if (e.key === 'Enter') {
      // Enter saves (unless user is in input field without Cmd/Ctrl)
      if (!isTyping || e.metaKey || e.ctrlKey) {
        e.preventDefault();
        save();
      }
    }
  }
}

/**
 * Save and close
 */
function save(): void {
  console.log('Resurface Toast: save() called');
  if (!currentToast || !resolvePromise) {
    console.log('Resurface Toast: No toast or resolve promise', { currentToast: !!currentToast, resolvePromise: !!resolvePromise });
    return;
  }
  
  const collectData = (currentToast as HTMLElement & { collectData: () => ToastResult }).collectData;
  const result = collectData();
  console.log('Resurface Toast: Collected data:', result);
  
  // Close with animation
  const toast = currentToast.querySelector('.tabmind-toast');
  toast?.classList.add('tabmind-closing');
  
  setTimeout(() => {
    console.log('Resurface Toast: Resolving promise with result');
    resolvePromise?.(result);
    hideToast();
  }, 200);
}

/**
 * Save synchronously (for beforeunload - tab closing)
 * This resolves immediately without animation
 */
function saveSync(): void {
  console.log('Resurface Toast: saveSync() called (tab closing)');
  if (!currentToast || !resolvePromise) {
    return;
  }
  
  const collectData = (currentToast as HTMLElement & { collectData: () => ToastResult }).collectData;
  const result = collectData();
  console.log('Resurface Toast: Saving before tab close:', result);
  
  // Resolve immediately - no animation needed since page is closing
  resolvePromise(result);
  
  // Clean up (remove beforeunload to avoid double-save)
  if (beforeUnloadHandler) {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    beforeUnloadHandler = null;
  }
  resolvePromise = null;
}

/**
 * Cancel and close
 */
function cancel(): void {
  if (!resolvePromise) return;
  
  // Close with animation
  const toast = currentToast?.querySelector('.tabmind-toast');
  toast?.classList.add('tabmind-closing');
  
  setTimeout(() => {
    resolvePromise?.(null);
    hideToast();
  }, 200);
}

/**
 * Start auto-save timer
 */
function startAutoSaveTimer(): void {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  autoSaveTimer = setTimeout(() => {
    save();
  }, currentAutoSaveDelay);
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
