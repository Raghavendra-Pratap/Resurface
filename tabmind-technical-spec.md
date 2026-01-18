# TabMind – Technical Specification v1

> Close tabs without fear. Save with context, resurface when relevant.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Data Models](#data-models)
5. [Core Flows](#core-flows)
6. [Component Details](#component-details)
7. [Storage Layer](#storage-layer)
8. [Topic Auto-Generation](#topic-auto-generation)
9. [Resurfacing Logic](#resurfacing-logic)
10. [Implementation Plan](#implementation-plan)
11. [Future Considerations](#future-considerations)

---

## Overview

### What We're Building

A Chrome extension that:
- Saves tabs with one shortcut (⌘+Shift+S)
- Auto-captures context (search query, related tabs, metadata)
- Auto-generates topic categories
- Resurfaces saved items when user searches related terms
- Provides a dashboard to manage saved items

### Tech Stack

| Layer | Technology |
|-------|------------|
| Extension Framework | Chrome Extension Manifest V3 |
| UI Framework | Vanilla JS + CSS (keep it light) |
| Storage | IndexedDB (via idb wrapper library) |
| Build Tool | Vite (for bundling, HMR in dev) |
| Language | TypeScript |

### Why These Choices

- **Manifest V3**: Required for new Chrome extensions, uses service workers
- **Vanilla JS**: Extensions should be lightweight; React is overkill for this
- **IndexedDB**: Supports complex queries, large storage, indexed fields
- **Vite**: Fast builds, good DX, simple config
- **TypeScript**: Type safety for data models, fewer bugs

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Chrome Extension                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Content Script  │  │    Background    │  │   Dashboard   │  │
│  │                  │  │  Service Worker  │  │   (new tab)   │  │
│  │  - Toast UI      │  │                  │  │               │  │
│  │  - Resurface     │  │  - Command       │  │  - Full UI    │  │
│  │    dropdown      │  │    listener      │  │  - Search     │  │
│  │  - Page data     │  │  - Storage ops   │  │  - Manage     │  │
│  │    extraction    │  │  - Topic gen     │  │    categories │  │
│  │                  │  │  - URL monitor   │  │               │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘  │
│           │                     │                     │          │
│           └─────────────────────┼─────────────────────┘          │
│                                 │                                │
│                       ┌─────────▼─────────┐                      │
│                       │    IndexedDB      │                      │
│                       │                   │                      │
│                       │  - savedItems     │                      │
│                       │  - topics         │                      │
│                       │  - intents        │                      │
│                       │  - settings       │                      │
│                       └───────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Flow

```
Content Script <──message──> Background Worker <──message──> Dashboard
                                    │
                                    ▼
                               IndexedDB
```

All storage operations go through the Background Worker to avoid race conditions.

---

## File Structure

```
tabmind/
├── src/
│   ├── background/
│   │   ├── index.ts              # Service worker entry
│   │   ├── commands.ts           # Keyboard shortcut handlers
│   │   ├── storage.ts            # IndexedDB operations
│   │   ├── topicGenerator.ts     # Auto-topic logic
│   │   └── urlMonitor.ts         # Watch for URL changes
│   │
│   ├── content/
│   │   ├── index.ts              # Content script entry
│   │   ├── toast.ts              # Save toast component
│   │   ├── toast.css             # Toast styles
│   │   ├── dropdown.ts           # Resurface dropdown component
│   │   ├── dropdown.css          # Dropdown styles
│   │   └── extractor.ts          # Page metadata extraction
│   │
│   ├── dashboard/
│   │   ├── index.html            # Dashboard page
│   │   ├── index.ts              # Dashboard entry
│   │   ├── components/
│   │   │   ├── Sidebar.ts
│   │   │   ├── CardGrid.ts
│   │   │   ├── SearchBar.ts
│   │   │   └── TagEditor.ts
│   │   └── styles/
│   │       └── dashboard.css
│   │
│   ├── shared/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── constants.ts          # App constants
│   │   ├── messages.ts           # Message type definitions
│   │   └── utils.ts              # Shared utilities
│   │
│   └── assets/
│       ├── icons/
│       │   ├── icon-16.png
│       │   ├── icon-32.png
│       │   ├── icon-48.png
│       │   └── icon-128.png
│       └── logo.svg
│
├── public/
│   └── manifest.json
│
├── tests/
│   ├── storage.test.ts
│   ├── topicGenerator.test.ts
│   └── extractor.test.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Data Models

### Core Types

```typescript
// src/shared/types.ts

// Unique identifier
type UUID = string;

// Timestamp in milliseconds
type Timestamp = number;

/**
 * A saved tab/page
 */
interface SavedItem {
  id: UUID;
  url: string;
  title: string;
  favicon: string;              // Base64 or URL fallback
  faviconType: 'base64' | 'url';
  savedAt: Timestamp;
  lastAccessedAt: Timestamp;    // For sorting by recent access
  
  // Captured context
  referrerQuery: string | null; // Search query that led to this page
  referrerUrl: string | null;   // The actual referrer URL
  siblingTabUrls: string[];     // Other tabs open when saved
  
  // Categorization (multi-select)
  topicIds: UUID[];
  intentIds: UUID[];
  
  // For search
  searchText: string;           // Lowercase concat of title + url + referrerQuery
}

/**
 * Topic category (auto-generated or user-created)
 */
interface Topic {
  id: UUID;
  name: string;
  color: string;                // Hex color
  isAutoGenerated: boolean;
  createdAt: Timestamp;
  itemCount: number;            // Denormalized for sidebar display
}

/**
 * Intent category (user-selected)
 */
interface Intent {
  id: UUID;
  name: string;
  emoji: string;
  createdAt: Timestamp;
  itemCount: number;
}

/**
 * User settings
 */
interface Settings {
  keyboardShortcut: string;     // Default: "Cmd+Shift+S"
  autoSaveDelay: number;        // Default: 5000 (ms)
  showResurfaceDropdown: boolean;
  defaultIntentId: UUID | null;
}
```

### Default Data

```typescript
// src/shared/constants.ts

export const DEFAULT_INTENTS: Omit<Intent, 'id' | 'createdAt' | 'itemCount'>[] = [
  { name: 'Read Later', emoji: '📖' },
  { name: 'Reference', emoji: '📌' },
  { name: 'Share', emoji: '🔗' },
  { name: 'Project', emoji: '📁' },
];

export const DEFAULT_TOPIC_COLORS = [
  '#818cf8', // Indigo
  '#34d399', // Green
  '#fbbf24', // Yellow
  '#f87171', // Red
  '#38bdf8', // Blue
  '#a78bfa', // Purple
  '#fb7185', // Pink
  '#2dd4bf', // Teal
];

export const DOMAIN_TOPIC_MAP: Record<string, string> = {
  'github.com': 'Development',
  'gitlab.com': 'Development',
  'stackoverflow.com': 'Development',
  'dev.to': 'Development',
  'medium.com': 'Articles',
  'substack.com': 'Articles',
  'youtube.com': 'Videos',
  'vimeo.com': 'Videos',
  'twitter.com': 'Social',
  'x.com': 'Social',
  'linkedin.com': 'Social',
  'reddit.com': 'Social',
  'news.ycombinator.com': 'Tech News',
  'techcrunch.com': 'Tech News',
  'arxiv.org': 'Research',
  'scholar.google.com': 'Research',
  'figma.com': 'Design',
  'dribbble.com': 'Design',
};

export const AUTO_SAVE_DELAY = 5000; // 5 seconds
```

---

## Core Flows

### Flow 1: Save Tab

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │  Background │     │  Content    │     │  IndexedDB  │
│             │     │  Worker     │     │  Script     │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  ⌘+Shift+S        │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  EXTRACT_PAGE     │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  Extract:         │
       │                   │                   │  - URL            │
       │                   │                   │  - Title          │
       │                   │                   │  - Favicon        │
       │                   │                   │  - Referrer       │
       │                   │                   │                   │
       │                   │  PAGE_DATA        │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │  Generate topics  │                   │
       │                   │  Get sibling tabs │                   │
       │                   │                   │                   │
       │                   │  SHOW_TOAST       │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  Inject toast UI  │
       │                   │                   │──────┐            │
       │                   │                   │      │            │
       │  See toast        │                   │<─────┘            │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
       │  Edit / Save      │                   │                   │
       │──────────────────────────────────────>│                   │
       │                   │                   │                   │
       │                   │  SAVE_ITEM        │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │  Write to DB      │                   │
       │                   │──────────────────────────────────────>│
       │                   │                   │                   │
       │                   │  SHOW_CONFIRMATION│                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │  See "Saved!"     │                   │                   │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
```

### Flow 2: Resurface

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │  Content    │     │  Background │     │  IndexedDB  │
│             │     │  Script     │     │  Worker     │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  Type in URL bar  │                   │                   │
       │  "AI agents..."   │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  URL_INPUT        │                   │
       │                   │  {query: "AI...") │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  SEARCH           │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │  Matching items   │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │                   │  SHOW_DROPDOWN    │                   │
       │                   │  {items: [...]}   │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │  Inject dropdown  │                   │
       │                   │──────┐            │                   │
       │                   │      │            │                   │
       │  See suggestions  │<─────┘            │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │  Click item       │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  Navigate to URL  │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

---

## Component Details

### Background Service Worker

```typescript
// src/background/index.ts

import { initStorage } from './storage';
import { registerCommands } from './commands';
import { startUrlMonitor } from './urlMonitor';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  await initStorage();
  console.log('TabMind installed');
});

// Register keyboard shortcut handler
registerCommands();

// Start monitoring URL changes for resurfacing
startUrlMonitor();

// Message router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SAVE_ITEM':
      handleSaveItem(message.payload).then(sendResponse);
      return true; // async response
      
    case 'SEARCH_ITEMS':
      handleSearchItems(message.payload).then(sendResponse);
      return true;
      
    case 'GET_ALL_ITEMS':
      handleGetAllItems().then(sendResponse);
      return true;
      
    case 'DELETE_ITEM':
      handleDeleteItem(message.payload).then(sendResponse);
      return true;
      
    case 'UPDATE_ITEM':
      handleUpdateItem(message.payload).then(sendResponse);
      return true;
      
    // ... more handlers
  }
});
```

### Content Script – Toast

```typescript
// src/content/toast.ts

interface ToastData {
  url: string;
  title: string;
  favicon: string;
  suggestedTopics: Topic[];
  intents: Intent[];
}

export function showToast(data: ToastData): Promise<SavedItem | null> {
  return new Promise((resolve) => {
    // Create toast container
    const container = document.createElement('div');
    container.id = 'tabmind-toast-container';
    container.innerHTML = getToastHTML(data);
    document.body.appendChild(container);
    
    // Inject styles
    injectStyles();
    
    // Setup event handlers
    const saveBtn = container.querySelector('#tabmind-save');
    const cancelBtn = container.querySelector('#tabmind-cancel');
    const titleInput = container.querySelector('#tabmind-title');
    
    let autoSaveTimer: number;
    
    const save = () => {
      clearTimeout(autoSaveTimer);
      const result = collectFormData(container);
      cleanup();
      resolve(result);
    };
    
    const cancel = () => {
      clearTimeout(autoSaveTimer);
      cleanup();
      resolve(null);
    };
    
    const cleanup = () => {
      container.remove();
    };
    
    // Button handlers
    saveBtn?.addEventListener('click', save);
    cancelBtn?.addEventListener('click', cancel);
    
    // Click outside = save
    container.addEventListener('click', (e) => {
      if (e.target === container) save();
    });
    
    // Esc key = save (not cancel!)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') save();
    });
    
    // Auto-save timer
    autoSaveTimer = window.setTimeout(save, AUTO_SAVE_DELAY);
    
    // Animate timer bar
    startTimerAnimation(container);
  });
}

function getToastHTML(data: ToastData): string {
  return `
    <div class="tabmind-toast">
      <div class="tabmind-toast-header">
        <div class="tabmind-toast-icon">
          <svg>...</svg>
        </div>
        <div>
          <div class="tabmind-toast-title">Add to TabMind</div>
          <div class="tabmind-toast-subtitle">Auto-saves in 5 seconds</div>
        </div>
      </div>
      
      <div class="tabmind-toast-body">
        <div class="tabmind-field">
          <label>Title</label>
          <input id="tabmind-title" type="text" value="${escapeHtml(data.title)}">
        </div>
        
        <div class="tabmind-field">
          <label>Topics</label>
          <div class="tabmind-tags" id="tabmind-topics">
            ${data.suggestedTopics.map(t => `
              <span class="tabmind-tag" data-id="${t.id}">
                ${t.name}
                <span class="tabmind-tag-remove">×</span>
              </span>
            `).join('')}
            <span class="tabmind-tag-add">+ Add</span>
          </div>
        </div>
        
        <div class="tabmind-field">
          <label>Intent (optional)</label>
          <select id="tabmind-intent">
            <option value="">Select intent...</option>
            ${data.intents.map(i => `
              <option value="${i.id}">${i.emoji} ${i.name}</option>
            `).join('')}
          </select>
        </div>
      </div>
      
      <div class="tabmind-toast-footer">
        <button id="tabmind-cancel" class="tabmind-btn-secondary">Cancel</button>
        <button id="tabmind-save" class="tabmind-btn-primary">Save</button>
      </div>
      
      <div class="tabmind-timer-bar"></div>
    </div>
  `;
}
```

### Content Script – Resurface Dropdown

```typescript
// src/content/dropdown.ts

interface DropdownItem {
  id: string;
  title: string;
  url: string;
  favicon: string;
  domain: string;
  savedAt: string;      // Formatted relative time
  topics: Topic[];
  intents: Intent[];
}

let currentDropdown: HTMLElement | null = null;

export function showDropdown(items: DropdownItem[], anchorRect: DOMRect): void {
  // Remove existing dropdown
  hideDropdown();
  
  if (items.length === 0) return;
  
  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'tabmind-dropdown';
  dropdown.innerHTML = getDropdownHTML(items);
  
  // Position below URL bar (or anchor)
  dropdown.style.top = `${anchorRect.bottom + 8}px`;
  dropdown.style.left = `${anchorRect.left}px`;
  dropdown.style.width = `${Math.max(anchorRect.width, 500)}px`;
  
  document.body.appendChild(dropdown);
  currentDropdown = dropdown;
  
  // Setup click handlers
  dropdown.querySelectorAll('.tabmind-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.getAttribute('data-url');
      if (url) window.location.href = url;
    });
  });
  
  // Click outside to close
  document.addEventListener('click', handleClickOutside);
}

export function hideDropdown(): void {
  if (currentDropdown) {
    currentDropdown.remove();
    currentDropdown = null;
    document.removeEventListener('click', handleClickOutside);
  }
}

function getDropdownHTML(items: DropdownItem[]): string {
  return `
    <div class="tabmind-dropdown-header">
      <svg>...</svg>
      <span><strong>${items.length} saved pages</strong> match your search</span>
    </div>
    <div class="tabmind-dropdown-items">
      ${items.map(item => `
        <div class="tabmind-dropdown-item" data-url="${escapeHtml(item.url)}">
          <div class="tabmind-dropdown-favicon">
            ${item.favicon 
              ? `<img src="${item.favicon}" alt="">` 
              : `<span>${item.domain[0].toUpperCase()}</span>`
            }
          </div>
          <div class="tabmind-dropdown-info">
            <div class="tabmind-dropdown-title">${escapeHtml(item.title)}</div>
            <div class="tabmind-dropdown-meta">
              <span>${item.domain}</span>
              <span>•</span>
              <span>${item.savedAt}</span>
            </div>
          </div>
          <div class="tabmind-dropdown-tags">
            ${item.topics.slice(0, 2).map(t => `
              <span class="tabmind-mini-tag topic">${t.name}</span>
            `).join('')}
            ${item.intents.slice(0, 1).map(i => `
              <span class="tabmind-mini-tag intent">${i.emoji}</span>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
```

---

## Storage Layer

### IndexedDB Schema

```typescript
// src/background/storage.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TabMindDB extends DBSchema {
  savedItems: {
    key: string;          // id
    value: SavedItem;
    indexes: {
      'by-url': string;
      'by-savedAt': number;
      'by-searchText': string;
    };
  };
  topics: {
    key: string;          // id
    value: Topic;
    indexes: {
      'by-name': string;
    };
  };
  intents: {
    key: string;          // id
    value: Intent;
  };
  settings: {
    key: string;          // 'main'
    value: Settings;
  };
}

let db: IDBPDatabase<TabMindDB>;

export async function initStorage(): Promise<void> {
  db = await openDB<TabMindDB>('tabmind', 1, {
    upgrade(db) {
      // Saved items store
      const itemsStore = db.createObjectStore('savedItems', { keyPath: 'id' });
      itemsStore.createIndex('by-url', 'url');
      itemsStore.createIndex('by-savedAt', 'savedAt');
      itemsStore.createIndex('by-searchText', 'searchText');
      
      // Topics store
      const topicsStore = db.createObjectStore('topics', { keyPath: 'id' });
      topicsStore.createIndex('by-name', 'name');
      
      // Intents store
      db.createObjectStore('intents', { keyPath: 'id' });
      
      // Settings store
      db.createObjectStore('settings', { keyPath: 'id' });
    },
  });
  
  // Initialize default intents if first run
  await initDefaults();
}

export async function saveItem(item: SavedItem): Promise<void> {
  // Check for duplicate URL
  const existing = await db.getFromIndex('savedItems', 'by-url', item.url);
  if (existing) {
    // Update existing instead of duplicate
    await db.put('savedItems', { ...existing, ...item, id: existing.id });
  } else {
    await db.add('savedItems', item);
  }
  
  // Update topic counts
  await updateTopicCounts(item.topicIds);
}

export async function searchItems(query: string): Promise<SavedItem[]> {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  const allItems = await db.getAll('savedItems');
  
  // Simple search: check if searchText contains query
  // Could use Fuse.js for fuzzy matching later
  return allItems
    .filter(item => item.searchText.includes(normalizedQuery))
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, 10); // Limit results
}

export async function getAllItems(): Promise<SavedItem[]> {
  return db.getAll('savedItems');
}

export async function getItemsByTopic(topicId: string): Promise<SavedItem[]> {
  const allItems = await db.getAll('savedItems');
  return allItems.filter(item => item.topicIds.includes(topicId));
}

export async function getItemsByIntent(intentId: string): Promise<SavedItem[]> {
  const allItems = await db.getAll('savedItems');
  return allItems.filter(item => item.intentIds.includes(intentId));
}

export async function deleteItem(id: string): Promise<void> {
  const item = await db.get('savedItems', id);
  if (item) {
    await db.delete('savedItems', id);
    await updateTopicCounts(item.topicIds);
  }
}

// ... more storage functions
```

---

## Topic Auto-Generation

```typescript
// src/background/topicGenerator.ts

import { DOMAIN_TOPIC_MAP, DEFAULT_TOPIC_COLORS } from '../shared/constants';
import { getOrCreateTopic, getAllTopics } from './storage';

interface GenerationInput {
  url: string;
  title: string;
  referrerQuery: string | null;
}

export async function generateTopics(input: GenerationInput): Promise<Topic[]> {
  const suggestedTopics: Topic[] = [];
  const existingTopics = await getAllTopics();
  
  // 1. Domain-based topic
  const domain = extractDomain(input.url);
  const domainTopic = DOMAIN_TOPIC_MAP[domain];
  if (domainTopic) {
    const topic = await getOrCreateTopic(domainTopic, true);
    suggestedTopics.push(topic);
  }
  
  // 2. Extract keywords from title
  const titleKeywords = extractKeywords(input.title);
  
  // 3. Extract keywords from referrer query
  const queryKeywords = input.referrerQuery 
    ? extractKeywords(input.referrerQuery) 
    : [];
  
  // 4. Match keywords against existing topics
  const allKeywords = [...titleKeywords, ...queryKeywords];
  for (const keyword of allKeywords) {
    const matchedTopic = existingTopics.find(t => 
      t.name.toLowerCase().includes(keyword) ||
      keyword.includes(t.name.toLowerCase())
    );
    if (matchedTopic && !suggestedTopics.find(t => t.id === matchedTopic.id)) {
      suggestedTopics.push(matchedTopic);
    }
  }
  
  // 5. If no matches, create topic from strongest keyword
  if (suggestedTopics.length === 0 && allKeywords.length > 0) {
    const newTopicName = capitalizeFirst(allKeywords[0]);
    const topic = await getOrCreateTopic(newTopicName, true);
    suggestedTopics.push(topic);
  }
  
  return suggestedTopics.slice(0, 3); // Max 3 suggestions
}

function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'how', 'what', 'when', 'where', 'why', 'who', 'which', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my',
    'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them',
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')      // Remove special chars
    .split(/\s+/)                        // Split by whitespace
    .filter(word => 
      word.length > 2 &&                 // Min length 3
      !stopWords.has(word) &&            // Not a stop word
      !/^\d+$/.test(word)                // Not just numbers
    )
    .slice(0, 5);                        // Top 5 keywords
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

---

## Resurfacing Logic

```typescript
// src/background/urlMonitor.ts

import { searchItems } from './storage';

// Monitor URL bar input via content script messages
export function startUrlMonitor(): void {
  // Content script sends URL_INPUT messages when user types
  // We debounce and search
  
  let debounceTimer: number;
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'URL_INPUT') {
      clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(async () => {
        const query = message.payload.query;
        
        if (query.length < 2) {
          sendToTab(sender.tab?.id, { type: 'HIDE_DROPDOWN' });
          return;
        }
        
        const matches = await searchItems(query);
        
        if (matches.length > 0) {
          sendToTab(sender.tab?.id, {
            type: 'SHOW_DROPDOWN',
            payload: { items: formatForDropdown(matches) }
          });
        } else {
          sendToTab(sender.tab?.id, { type: 'HIDE_DROPDOWN' });
        }
      }, 200); // 200ms debounce
    }
  });
}

// Also monitor Google search results pages
export function checkGoogleSearch(url: string, tabId: number): void {
  const googleMatch = url.match(/google\.com\/search\?.*q=([^&]+)/);
  if (googleMatch) {
    const query = decodeURIComponent(googleMatch[1]);
    searchItems(query).then(matches => {
      if (matches.length > 0) {
        sendToTab(tabId, {
          type: 'SHOW_GOOGLE_HINT',
          payload: { count: matches.length, query }
        });
      }
    });
  }
}

function sendToTab(tabId: number | undefined, message: any): void {
  if (tabId) {
    chrome.tabs.sendMessage(tabId, message);
  }
}

function formatForDropdown(items: SavedItem[]): DropdownItem[] {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    url: item.url,
    favicon: item.favicon,
    domain: extractDomain(item.url),
    savedAt: formatRelativeTime(item.savedAt),
    topics: [], // Would need to fetch from storage
    intents: [],
  }));
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Vite, TypeScript, manifest)
- [ ] IndexedDB storage layer with basic CRUD
- [ ] Data models and types
- [ ] Background service worker skeleton

### Phase 2: Save Flow (Week 2)
- [ ] Keyboard shortcut registration
- [ ] Content script for page extraction
- [ ] Toast UI component + styles
- [ ] Topic auto-generation (simple version)
- [ ] Save to IndexedDB

### Phase 3: Dashboard (Week 3)
- [ ] Dashboard HTML page
- [ ] Sidebar with topics/intents
- [ ] Card grid display
- [ ] Search functionality
- [ ] Basic CRUD operations (delete, edit)

### Phase 4: Resurfacing (Week 4)
- [ ] URL monitoring in content script
- [ ] Search matching logic
- [ ] Dropdown UI component
- [ ] Google search page integration

### Phase 5: Polish (Week 5)
- [ ] Edge cases and error handling
- [ ] Performance optimization
- [ ] UI polish and animations
- [ ] Testing
- [ ] Chrome Web Store preparation

---

## Future Considerations (v2+)

### Features to Add Later
- Cloud sync (requires backend)
- AI-powered summaries (local model or API)
- Import from other tools (Pocket, Raindrop, OneTab)
- Export functionality
- Firefox/Safari ports
- Mobile companion app
- Team sharing features

### Technical Improvements
- Fuzzy search with Fuse.js
- Full-text search with MiniSearch
- Better topic clustering with embeddings
- Offline-first with sync queue
- Analytics (privacy-preserving)

---

## Appendix

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "TabMind",
  "version": "1.0.0",
  "description": "Close tabs without fear. Save with context, resurface when relevant.",
  
  "permissions": [
    "storage",
    "tabs",
    "activeTab"
  ],
  
  "host_permissions": [
    "<all_urls>"
  ],
  
  "background": {
    "service_worker": "src/background/index.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.js"],
      "css": ["src/content/styles.css"]
    }
  ],
  
  "action": {
    "default_icon": {
      "16": "assets/icons/icon-16.png",
      "32": "assets/icons/icon-32.png",
      "48": "assets/icons/icon-48.png",
      "128": "assets/icons/icon-128.png"
    },
    "default_title": "TabMind"
  },
  
  "commands": {
    "save-tab": {
      "suggested_key": {
        "default": "Ctrl+Shift+S",
        "mac": "Command+Shift+S"
      },
      "description": "Save current tab to TabMind"
    }
  },
  
  "icons": {
    "16": "assets/icons/icon-16.png",
    "32": "assets/icons/icon-32.png",
    "48": "assets/icons/icon-48.png",
    "128": "assets/icons/icon-128.png"
  }
}
```

### Message Types

```typescript
// src/shared/messages.ts

export type MessageType =
  // Content -> Background
  | 'SAVE_ITEM'
  | 'SEARCH_ITEMS'
  | 'GET_ALL_ITEMS'
  | 'DELETE_ITEM'
  | 'UPDATE_ITEM'
  | 'URL_INPUT'
  
  // Background -> Content
  | 'EXTRACT_PAGE'
  | 'SHOW_TOAST'
  | 'SHOW_CONFIRMATION'
  | 'SHOW_DROPDOWN'
  | 'HIDE_DROPDOWN'
  | 'SHOW_GOOGLE_HINT';

export interface Message<T = any> {
  type: MessageType;
  payload?: T;
}
```
