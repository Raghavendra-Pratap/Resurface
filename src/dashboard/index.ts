import type { SavedItem, Topic, Intent, Settings } from '../shared/types';
import { sendToBackground } from '../shared/messages';
import { escapeHtml, formatRelativeTime, extractDomain } from '../shared/utils';

/**
 * Dashboard state
 */
interface DashboardState {
  items: SavedItem[];
  topics: Topic[];
  intents: Intent[];
  settings: Settings | null;
  currentFilter: 'all' | 'recent' | { type: 'topic' | 'intent'; id: string };
  searchQuery: string;
  viewMode: 'grid' | 'list';
}

const state: DashboardState = {
  items: [],
  topics: [],
  intents: [],
  settings: null,
  currentFilter: 'all',
  searchQuery: '',
  viewMode: 'grid'
};

/**
 * Initialize dashboard
 */
async function init() {
  await loadData();
  renderSidebar();
  renderItems();
  setupEventListeners();
}

/**
 * Load data from storage
 */
async function loadData() {
  try {
    state.items = await sendToBackground('GET_ALL_ITEMS');
    state.topics = await sendToBackground('GET_ALL_TOPICS');
    state.intents = await sendToBackground('GET_ALL_INTENTS');
    state.settings = await sendToBackground('GET_SETTINGS');
    updateSettingsUI();
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

/**
 * Render sidebar navigation
 */
function renderSidebar() {
  // Update counts
  document.getElementById('count-all')!.textContent = String(state.items.length);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const recentCount = state.items.filter(item => 
    item.savedAt >= today.getTime() - 7 * 24 * 60 * 60 * 1000
  ).length;
  document.getElementById('count-recent')!.textContent = String(recentCount);
  
  // Render topics
  const topicsList = document.getElementById('topics-list')!;
  topicsList.innerHTML = state.topics.map(topic => `
    <button class="nav-item" data-filter-type="topic" data-filter-id="${topic.id}">
      <span class="nav-color-dot" style="background: ${topic.color};"></span>
      <span>${escapeHtml(topic.name)}</span>
      <span class="nav-count">${topic.itemCount}</span>
    </button>
  `).join('');
  
  // Render intents
  const intentsList = document.getElementById('intents-list')!;
  intentsList.innerHTML = state.intents.map(intent => `
    <button class="nav-item" data-filter-type="intent" data-filter-id="${intent.id}">
      <span>${intent.emoji}</span>
      <span>${escapeHtml(intent.name)}</span>
      <span class="nav-count">${intent.itemCount}</span>
    </button>
  `).join('');
}

/**
 * Get filtered items based on current state
 */
function getFilteredItems(): SavedItem[] {
  let items = [...state.items];
  
  // Apply filter
  if (state.currentFilter === 'recent') {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    items = items.filter(item => item.savedAt >= weekAgo);
  } else if (typeof state.currentFilter === 'object' && state.currentFilter !== null) {
    const filter = state.currentFilter;
    if (filter.type === 'topic') {
      items = items.filter(item => item.topicIds.includes(filter.id));
    } else {
      items = items.filter(item => item.intentIds.includes(filter.id));
    }
  }
  
  // Apply search
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    items = items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      (item.referrerQuery?.toLowerCase().includes(query))
    );
  }
  
  // Sort by saved date (most recent first)
  items.sort((a, b) => b.savedAt - a.savedAt);
  
  return items;
}

/**
 * Render items grid
 */
function renderItems() {
  const container = document.getElementById('items-container')!;
  const emptyState = document.getElementById('empty-state')!;
  const items = getFilteredItems();
  
  if (items.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }
  
  container.style.display = 'grid';
  emptyState.style.display = 'none';
  
  // Apply view mode
  container.classList.toggle('list-view', state.viewMode === 'list');
  
  container.innerHTML = items.map(item => {
    const itemTopics = state.topics.filter(t => item.topicIds.includes(t.id));
    const itemIntents = state.intents.filter(i => item.intentIds.includes(i.id));
    const domain = extractDomain(item.url);
    
    return `
      <div class="item-card" data-item-id="${item.id}" data-url="${escapeHtml(item.url)}">
        <div class="item-actions">
          <button class="item-action-btn" data-action="open" title="Open">
            <svg viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
          <button class="item-action-btn delete" data-action="delete" title="Delete">
            <svg viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
        
        <div class="item-card-header">
          <div class="item-favicon">
            ${item.favicon 
              ? `<img src="${escapeHtml(item.favicon)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${domain[0].toUpperCase()}'">` 
              : domain[0].toUpperCase()
            }
          </div>
          <div class="item-title">${escapeHtml(item.title)}</div>
        </div>
        
        <div class="item-url">${escapeHtml(domain)}</div>
        
        <div class="item-tags">
          ${itemTopics.map(t => `
            <span class="item-tag topic" style="background: ${hexToRgba(t.color, 0.15)}; color: ${t.color};">
              ${escapeHtml(t.name)}
            </span>
          `).join('')}
          ${itemIntents.map(i => `
            <span class="item-tag intent">${i.emoji} ${escapeHtml(i.name)}</span>
          `).join('')}
        </div>
        
        <div class="item-footer">
          <div class="item-context">
            ${item.referrerQuery ? `
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>"${escapeHtml(item.referrerQuery)}"</span>
            ` : ''}
          </div>
          <div class="item-time">${formatRelativeTime(item.savedAt)}</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Navigation items
  document.querySelectorAll('.nav-item[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') as 'all' | 'recent';
      setFilter(filter);
    });
  });
  
  // Topic/Intent filters (delegated)
  document.getElementById('topics-list')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.nav-item');
    if (btn) {
      const id = btn.getAttribute('data-filter-id')!;
      setFilter({ type: 'topic', id });
    }
  });
  
  document.getElementById('intents-list')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.nav-item');
    if (btn) {
      const id = btn.getAttribute('data-filter-id')!;
      setFilter({ type: 'intent', id });
    }
  });
  
  // Search
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  let searchTimeout: ReturnType<typeof setTimeout>;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = searchInput.value;
      renderItems();
    }, 200);
  });
  
  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view') as 'grid' | 'list';
      state.viewMode = view;
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderItems();
    });
  });
  
  // Item actions (delegated)
  document.getElementById('items-container')?.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const actionBtn = target.closest('.item-action-btn');
    const card = target.closest('.item-card') as HTMLElement;
    
    if (!card) return;
    
    const itemId = card.dataset.itemId!;
    const url = card.dataset.url!;
    
    if (actionBtn) {
      const action = actionBtn.getAttribute('data-action');
      
      if (action === 'open') {
        window.open(url, '_blank');
      } else if (action === 'delete') {
        if (confirm('Delete this item?')) {
          await sendToBackground('DELETE_ITEM', { id: itemId });
          await loadData();
          renderSidebar();
          renderItems();
        }
      }
    } else {
      // Click on card itself - open URL
      window.open(url, '_blank');
    }
  });
  
  // Add topic
  document.getElementById('btn-add-topic')?.addEventListener('click', async () => {
    const name = prompt('Enter topic name:');
    if (name?.trim()) {
      await sendToBackground('CREATE_TOPIC', { name: name.trim() });
      await loadData();
      renderSidebar();
    }
  });
  
  // Add intent
  document.getElementById('btn-add-intent')?.addEventListener('click', async () => {
    const name = prompt('Enter intent name:');
    if (name?.trim()) {
      const emoji = prompt('Enter emoji (optional):', '📌') || '📌';
      await sendToBackground('CREATE_INTENT', { name: name.trim(), emoji });
      await loadData();
      renderSidebar();
    }
  });

  // Settings modal
  const settingsModal = document.getElementById('settings-modal');
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    if (settingsModal) {
      updateSettingsUI();
      settingsModal.style.display = 'flex';
    }
  });

  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    if (settingsModal) settingsModal.style.display = 'none';
  });

  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.style.display = 'none';
  });

  // Chrome shortcuts link
  document.getElementById('link-chrome-shortcuts')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // Auto-save range
  const autoSaveRange = document.getElementById('setting-auto-save') as HTMLInputElement;
  const autoSaveValue = document.getElementById('auto-save-value');
  autoSaveRange?.addEventListener('input', () => {
    if (autoSaveValue) autoSaveValue.textContent = `${autoSaveRange.value}s`;
  });

  // Save settings button
  document.getElementById('btn-save-settings')?.addEventListener('click', async () => {
    const autoSaveDelay = parseInt(autoSaveRange.value) * 1000;
    const showResurfaceDropdown = (document.getElementById('setting-show-dropdown') as HTMLInputElement).checked;

    state.settings = await sendToBackground('UPDATE_SETTINGS', {
      autoSaveDelay,
      showResurfaceDropdown
    });

    if (settingsModal) settingsModal.style.display = 'none';
    alert('Settings saved successfully!');
  });
}

/**
 * Update settings UI from state
 */
function updateSettingsUI() {
  if (!state.settings) return;

  const shortcutEl = document.getElementById('current-shortcut');
  if (shortcutEl) shortcutEl.textContent = state.settings.keyboardShortcut;

  const autoSaveRange = document.getElementById('setting-auto-save') as HTMLInputElement;
  const autoSaveValue = document.getElementById('auto-save-value');
  if (autoSaveRange) {
    autoSaveRange.value = String(state.settings.autoSaveDelay / 1000);
    if (autoSaveValue) autoSaveValue.textContent = `${autoSaveRange.value}s`;
  }

  const showDropdownCheck = document.getElementById('setting-show-dropdown') as HTMLInputElement;
  if (showDropdownCheck) {
    showDropdownCheck.checked = state.settings.showResurfaceDropdown;
  }
}

/**
 * Set current filter
 */
function setFilter(filter: DashboardState['currentFilter']) {
  state.currentFilter = filter;
  
  // Update active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  if (filter === 'all') {
    document.querySelector('.nav-item[data-filter="all"]')?.classList.add('active');
    document.getElementById('page-title')!.textContent = 'All Saved';
  } else if (filter === 'recent') {
    document.querySelector('.nav-item[data-filter="recent"]')?.classList.add('active');
    document.getElementById('page-title')!.textContent = 'Recent';
  } else {
    const selector = `.nav-item[data-filter-type="${filter.type}"][data-filter-id="${filter.id}"]`;
    document.querySelector(selector)?.classList.add('active');
    
    // Update title
    if (filter.type === 'topic') {
      const topic = state.topics.find(t => t.id === filter.id);
      document.getElementById('page-title')!.textContent = topic?.name || 'Topic';
    } else {
      const intent = state.intents.find(i => i.id === filter.id);
      document.getElementById('page-title')!.textContent = intent ? `${intent.emoji} ${intent.name}` : 'Intent';
    }
  }
  
  renderItems();
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
