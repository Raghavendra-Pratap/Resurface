import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type { SavedItem, Topic, Intent, Settings, UUID } from '../shared/types';
import type { BackupData } from '../shared/messages';
import { 
  DEFAULT_INTENTS, 
  DEFAULT_TOPIC_COLORS,
  STORAGE_DB_NAME, 
  STORAGE_DB_VERSION 
} from '../shared/constants';
import { generateId, now, getRandomColor } from '../shared/utils';

// Old database name (for migration from TabMind)
const OLD_DB_NAME = 'tabmind';

// Database schema
interface ResurfaceDB extends DBSchema {
  savedItems: {
    key: string;
    value: SavedItem;
    indexes: {
      'by-url': string;
      'by-savedAt': number;
      'by-searchText': string;
    };
  };
  topics: {
    key: string;
    value: Topic;
    indexes: {
      'by-name': string;
    };
  };
  intents: {
    key: string;
    value: Intent;
    indexes: {
      'by-name': string;
    };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

// Database instance
let db: IDBPDatabase<ResurfaceDB> | null = null;

/**
 * Ensure database is initialized (lazy initialization)
 */
async function ensureDb(): Promise<IDBPDatabase<ResurfaceDB>> {
  console.log('Resurface Storage: ensureDb called, db exists:', !!db);
  if (!db) {
    console.log('Resurface Storage: DB not initialized, calling initStorage...');
    await initStorage();
    console.log('Resurface Storage: initStorage completed, db exists:', !!db);
  }
  return db!;
}

/**
 * Initialize the database
 */
export async function initStorage(): Promise<void> {
  if (db) return; // Already initialized
  
  // First, check if we need to migrate from old "tabmind" database
  await migrateFromOldDatabase();
  
  db = await openDB<ResurfaceDB>(STORAGE_DB_NAME, STORAGE_DB_VERSION, {
    upgrade(database, oldVersion, newVersion) {
      console.log(`Resurface Storage: Upgrading DB from v${oldVersion} to v${newVersion}`);
      
      // Create stores if they don't exist (fresh install or upgrade)
      if (!database.objectStoreNames.contains('savedItems')) {
      const itemsStore = database.createObjectStore('savedItems', { keyPath: 'id' });
      itemsStore.createIndex('by-url', 'url');
      itemsStore.createIndex('by-savedAt', 'savedAt');
      itemsStore.createIndex('by-searchText', 'searchText');
      }
      
      if (!database.objectStoreNames.contains('topics')) {
      const topicsStore = database.createObjectStore('topics', { keyPath: 'id' });
      topicsStore.createIndex('by-name', 'name');
      }
      
      if (!database.objectStoreNames.contains('intents')) {
      const intentsStore = database.createObjectStore('intents', { keyPath: 'id' });
      intentsStore.createIndex('by-name', 'name');
      }
      
      if (!database.objectStoreNames.contains('settings')) {
      database.createObjectStore('settings', { keyPath: 'id' });
      }
      
      // Future schema migrations go here:
      // if (oldVersion < 2) { ... }
      // if (oldVersion < 3) { ... }
    },
  });
  
  // Initialize default data
  await initDefaults();
}

/**
 * Migrate data from old "tabmind" database to new "resurface" database
 * This ensures users don't lose their saved data after the rebrand
 */
async function migrateFromOldDatabase(): Promise<void> {
  try {
    // Check if old database exists
    const databases = await indexedDB.databases();
    const oldDbExists = databases.some(db => db.name === OLD_DB_NAME);
    
    if (!oldDbExists) {
      console.log('Resurface Storage: No old TabMind database found, skipping migration');
      return;
    }
    
    console.log('Resurface Storage: Found old TabMind database, starting migration...');
    
    // Open the old database
    const oldDb = await openDB(OLD_DB_NAME, 1);
    
    // Check if new database already has data (don't overwrite)
    let newDbHasData = false;
    try {
      const newDb = await openDB(STORAGE_DB_NAME, 1);
      const existingItems = await newDb.getAll('savedItems');
      newDbHasData = existingItems.length > 0;
      newDb.close();
    } catch {
      // New database doesn't exist yet, that's fine
    }
    
    if (newDbHasData) {
      console.log('Resurface Storage: New database already has data, skipping migration');
      oldDb.close();
      return;
    }
    
    // Read all data from old database
    const oldItems = await oldDb.getAll('savedItems');
    const oldTopics = await oldDb.getAll('topics');
    const oldIntents = await oldDb.getAll('intents');
    const oldSettings = await oldDb.get('settings', 'main');
    
    console.log(`Resurface Storage: Migrating ${oldItems.length} items, ${oldTopics.length} topics, ${oldIntents.length} intents`);
    
    // Close old database before opening new one
    oldDb.close();
    
    // Open/create new database
    const newDb = await openDB<ResurfaceDB>(STORAGE_DB_NAME, STORAGE_DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('savedItems')) {
          const itemsStore = database.createObjectStore('savedItems', { keyPath: 'id' });
          itemsStore.createIndex('by-url', 'url');
          itemsStore.createIndex('by-savedAt', 'savedAt');
          itemsStore.createIndex('by-searchText', 'searchText');
        }
        if (!database.objectStoreNames.contains('topics')) {
          const topicsStore = database.createObjectStore('topics', { keyPath: 'id' });
          topicsStore.createIndex('by-name', 'name');
        }
        if (!database.objectStoreNames.contains('intents')) {
          const intentsStore = database.createObjectStore('intents', { keyPath: 'id' });
          intentsStore.createIndex('by-name', 'name');
        }
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
    
    // Copy all data to new database
    const tx = newDb.transaction(['savedItems', 'topics', 'intents', 'settings'], 'readwrite');
    
    for (const item of oldItems) {
      await tx.objectStore('savedItems').put(item);
    }
    for (const topic of oldTopics) {
      await tx.objectStore('topics').put(topic);
    }
    for (const intent of oldIntents) {
      await tx.objectStore('intents').put(intent);
    }
    if (oldSettings) {
      await tx.objectStore('settings').put(oldSettings);
    }
    
    await tx.done;
    newDb.close();
    
    console.log('Resurface Storage: Migration completed successfully!');
    
    // Optionally delete old database after successful migration
    // await deleteDB(OLD_DB_NAME);
    // console.log('Resurface Storage: Old database deleted');
    
  } catch (error) {
    console.error('Resurface Storage: Migration error (non-fatal):', error);
    // Don't throw - migration failure shouldn't break the extension
  }
}

/**
 * Default Google service pages for new users
 */
const DEFAULT_SAVED_PAGES = [
  {
    url: 'https://gemini.google.com',
    title: 'Gemini - AI Assistant by Google',
    searchKeywords: 'gemini ai google assistant chatbot bard artificial intelligence'
  },
  {
    url: 'https://mail.google.com',
    title: 'Gmail - Email by Google',
    searchKeywords: 'gmail email mail google inbox messages compose send receive'
  },
  {
    url: 'https://drive.google.com',
    title: 'Google Drive - Cloud Storage',
    searchKeywords: 'drive google storage files documents backup cloud sync'
  },
  {
    url: 'https://docs.google.com',
    title: 'Google Docs - Document Editor',
    searchKeywords: 'docs google documents word editor write text typing'
  },
  {
    url: 'https://sheets.google.com',
    title: 'Google Sheets - Spreadsheets',
    searchKeywords: 'sheets google spreadsheet excel tables data cells rows columns'
  },
  {
    url: 'https://slides.google.com',
    title: 'Google Slides - Presentations',
    searchKeywords: 'slides google presentations powerpoint ppt deck slideshow'
  },
  {
    url: 'https://www.youtube.com',
    title: 'YouTube - Video Platform',
    searchKeywords: 'youtube videos watch streaming music tutorials entertainment'
  },
  {
    url: 'https://maps.google.com',
    title: 'Google Maps - Navigation & Places',
    searchKeywords: 'maps google directions navigation places location street view'
  },
  {
    url: 'https://calendar.google.com',
    title: 'Google Calendar - Schedule & Events',
    searchKeywords: 'calendar google schedule events meetings reminders appointments'
  },
  {
    url: 'https://translate.google.com',
    title: 'Google Translate - Language Translation',
    searchKeywords: 'translate google translation language translator convert'
  }
];

/**
 * Initialize default intents and settings
 */
async function initDefaults(): Promise<void> {
  const database = await ensureDb();
  
  // Check if intents exist
  const existingIntents = await database.getAll('intents');
  if (existingIntents.length === 0) {
    // Create default intents
    for (const intent of DEFAULT_INTENTS) {
      await database.add('intents', {
        id: generateId(),
        name: intent.name,
        emoji: intent.emoji,
        createdAt: now(),
        itemCount: 0
      });
    }
  }
  
  // Check if settings exist
  const existingSettings = await database.get('settings', 'main') as Settings | undefined;
  if (!existingSettings) {
    await database.add('settings', {
      id: 'main',
      keyboardShortcut: 'Cmd+Shift+S',
      autoSaveDelay: 5000,
      showResurfaceDropdown: true,
      defaultIntentId: null,
      newTabShowLogo: true,
      newTabEnabledShortcuts: ['gemini', 'gmail', 'drive', 'docs', 'sheets', 'slides', 'youtube', 'maps', 'calendar', 'translate'],
      newTabCustomLinks: []
    });
  } else {
    // Migrate existing settings to include new tab settings
    const needsUpdate = !('newTabShowLogo' in existingSettings);
    if (needsUpdate) {
      const oldSettings = existingSettings as any;
      const updatedSettings: Settings = {
        id: oldSettings.id || 'main',
        keyboardShortcut: oldSettings.keyboardShortcut || 'Cmd+Shift+S',
        autoSaveDelay: oldSettings.autoSaveDelay || 5000,
        showResurfaceDropdown: oldSettings.showResurfaceDropdown !== false,
        defaultIntentId: oldSettings.defaultIntentId || null,
        newTabShowLogo: true,
        newTabEnabledShortcuts: ['gemini', 'gmail', 'drive', 'docs', 'sheets', 'slides', 'youtube', 'maps', 'calendar', 'translate'],
        newTabCustomLinks: []
      };
      await database.put('settings', updatedSettings);
    }
  }
  
  // Check if saved items exist - if not, add default Google services
  const existingItems = await database.getAll('savedItems');
  if (existingItems.length === 0) {
    console.log('Resurface Storage: Adding default saved pages for new user...');
    
    // Create "Quick Access" topic for default pages
    const quickAccessTopic = await getOrCreateTopicDirect(database, 'Quick Access');
    const googleTopic = await getOrCreateTopicDirect(database, 'Google');
    
    // Get the "Quick Reference" intent if it exists
    const intents = await database.getAll('intents');
    const quickRefIntent = intents.find(i => i.name === 'Quick Reference');
    
    const timestamp = now();
    
    for (let i = 0; i < DEFAULT_SAVED_PAGES.length; i++) {
      const page = DEFAULT_SAVED_PAGES[i];
      const domain = new URL(page.url).hostname;
      const searchText = [page.title, page.url, page.searchKeywords].join(' ').toLowerCase();
      
      const itemTimestamp = timestamp - (i * 1000); // Stagger timestamps slightly
      const savedItem: SavedItem = {
        id: generateId(),
        url: page.url,
        title: page.title,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        faviconType: 'url',
        savedAt: itemTimestamp,
        lastAccessedAt: itemTimestamp,
        referrerQuery: null,
        referrerUrl: null,
        siblingTabUrls: [],
        topicIds: [quickAccessTopic.id, googleTopic.id],
        intentIds: quickRefIntent ? [quickRefIntent.id] : [],
        searchText
      };
      
      await database.add('savedItems', savedItem);
    }
    
    // Update topic counts
    quickAccessTopic.itemCount = DEFAULT_SAVED_PAGES.length;
    googleTopic.itemCount = DEFAULT_SAVED_PAGES.length;
    await database.put('topics', quickAccessTopic);
    await database.put('topics', googleTopic);
    
    // Update intent count
    if (quickRefIntent) {
      quickRefIntent.itemCount = DEFAULT_SAVED_PAGES.length;
      await database.put('intents', quickRefIntent);
    }
    
    console.log(`Resurface Storage: Added ${DEFAULT_SAVED_PAGES.length} default saved pages`);
  }
}

/**
 * Helper to create topic directly without circular dependency
 */
async function getOrCreateTopicDirect(
  database: IDBPDatabase<ResurfaceDB>, 
  name: string
): Promise<Topic> {
  const existing = await database.getFromIndex('topics', 'by-name', name);
  if (existing) return existing;
  
  const allTopics = await database.getAll('topics');
  const existingColors = allTopics.map(t => t.color);
  
  const newTopic: Topic = {
    id: generateId(),
    name,
    color: getRandomColor(DEFAULT_TOPIC_COLORS, existingColors),
    isAutoGenerated: false,
    createdAt: now(),
    itemCount: 0
  };
  
  await database.add('topics', newTopic);
  return newTopic;
}

// ============ SAVED ITEMS ============

/**
 * Save a new item
 */
export async function saveItem(item: SavedItem): Promise<SavedItem> {
  console.log('Resurface Storage: saveItem called with:', item.url);
  
  try {
    const database = await ensureDb();
    console.log('Resurface Storage: Got database reference');
    
    // Check for duplicate URL
    console.log('Resurface Storage: Checking for existing item with URL:', item.url);
    const existing = await database.getFromIndex('savedItems', 'by-url', item.url);
    console.log('Resurface Storage: Existing item found:', !!existing);
    
    if (existing) {
      // Update existing item
      console.log('Resurface Storage: Updating existing item');
      const updated = { 
        ...existing, 
        ...item, 
        id: existing.id,
        savedAt: existing.savedAt, // Keep original save date
        lastAccessedAt: now()
      };
      await database.put('savedItems', updated);
      console.log('Resurface Storage: Item updated successfully');
      return updated;
    }
    
    // Add new item
    console.log('Resurface Storage: Adding new item...');
    await database.add('savedItems', item);
    console.log('Resurface Storage: Item added to database');
    
    // Update topic counts
    console.log('Resurface Storage: Updating topic counts for:', item.topicIds);
    await updateTopicCounts(item.topicIds, 1);
    
    // Update intent counts
    console.log('Resurface Storage: Updating intent counts for:', item.intentIds);
    await updateIntentCounts(item.intentIds, 1);
    
    console.log('Resurface Storage: saveItem completed successfully');
    return item;
  } catch (error) {
    console.error('Resurface Storage: Error in saveItem:', error);
    throw error;
  }
}

/**
 * Get item by URL (to check if already saved)
 */
export async function getItemByUrl(url: string): Promise<SavedItem | undefined> {
  const database = await ensureDb();
  return database.getFromIndex('savedItems', 'by-url', url);
}

/**
 * Get all saved items
 */
export async function getAllItems(): Promise<SavedItem[]> {
  const database = await ensureDb();
  const items = await database.getAll('savedItems');
  return items.sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Search items by query
 */
export async function searchItems(query: string, limit = 10): Promise<SavedItem[]> {
  const database = await ensureDb();
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  const allItems = await database.getAll('savedItems');
  
  // Simple search: check if searchText contains query words
  const queryWords = normalizedQuery.split(/\s+/);
  
  return allItems
    .filter(item => 
      queryWords.some(word => item.searchText.includes(word))
    )
    .sort((a, b) => {
      // Score by how many words match
      const scoreA = queryWords.filter(w => a.searchText.includes(w)).length;
      const scoreB = queryWords.filter(w => b.searchText.includes(w)).length;
      if (scoreB !== scoreA) return scoreB - scoreA;
      
      // Then by recency
      return b.savedAt - a.savedAt;
    })
    .slice(0, limit);
}

/**
 * Get items by topic
 */
export async function getItemsByTopic(topicId: UUID): Promise<SavedItem[]> {
  const database = await ensureDb();
  const allItems = await database.getAll('savedItems');
  return allItems
    .filter(item => item.topicIds.includes(topicId))
    .sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Get items by intent
 */
export async function getItemsByIntent(intentId: UUID): Promise<SavedItem[]> {
  const database = await ensureDb();
  const allItems = await database.getAll('savedItems');
  return allItems
    .filter(item => item.intentIds.includes(intentId))
    .sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Update an item
 */
export async function updateItem(id: UUID, updates: Partial<SavedItem>): Promise<SavedItem | null> {
  const database = await ensureDb();
  const item = await database.get('savedItems', id);
  if (!item) return null;
  
  // Track topic/intent changes for counts
  const oldTopicIds = item.topicIds;
  const oldIntentIds = item.intentIds;
  
  const updated = { ...item, ...updates, lastAccessedAt: now() };
  await database.put('savedItems', updated);
  
  // Update counts if topics changed
  if (updates.topicIds) {
    const removedTopics = oldTopicIds.filter(id => !updates.topicIds!.includes(id));
    const addedTopics = updates.topicIds.filter(id => !oldTopicIds.includes(id));
    await updateTopicCounts(removedTopics, -1);
    await updateTopicCounts(addedTopics, 1);
  }
  
  // Update counts if intents changed
  if (updates.intentIds) {
    const removedIntents = oldIntentIds.filter(id => !updates.intentIds!.includes(id));
    const addedIntents = updates.intentIds.filter(id => !oldIntentIds.includes(id));
    await updateIntentCounts(removedIntents, -1);
    await updateIntentCounts(addedIntents, 1);
  }
  
  return updated;
}

/**
 * Delete an item
 */
export async function deleteItem(id: UUID): Promise<boolean> {
  const database = await ensureDb();
  const item = await database.get('savedItems', id);
  if (!item) return false;
  
  await database.delete('savedItems', id);
  
  // Update counts
  await updateTopicCounts(item.topicIds, -1);
  await updateIntentCounts(item.intentIds, -1);
  
  return true;
}

// ============ TOPICS ============

/**
 * Get all topics
 */
export async function getAllTopics(): Promise<Topic[]> {
  const database = await ensureDb();
  const topics = await database.getAll('topics');
  return topics.sort((a, b) => b.itemCount - a.itemCount);
}

/**
 * Get or create a topic by name
 */
export async function getOrCreateTopic(name: string, isAutoGenerated = false): Promise<Topic> {
  const database = await ensureDb();
  const normalizedName = name.trim();
  const existing = await database.getFromIndex('topics', 'by-name', normalizedName);
  
  if (existing) return existing;
  
  // Get existing colors to avoid duplicates
  const allTopics = await database.getAll('topics');
  const existingColors = allTopics.map(t => t.color);
  
  const newTopic: Topic = {
    id: generateId(),
    name: normalizedName,
    color: getRandomColor(DEFAULT_TOPIC_COLORS, existingColors),
    isAutoGenerated,
    createdAt: now(),
    itemCount: 0
  };
  
  await database.add('topics', newTopic);
  return newTopic;
}

/**
 * Create a new topic
 */
export async function createTopic(name: string): Promise<Topic> {
  return getOrCreateTopic(name, false);
}

/**
 * Update topic counts
 */
async function updateTopicCounts(topicIds: UUID[], delta: number): Promise<void> {
  const database = await ensureDb();
  for (const id of topicIds) {
    const topic = await database.get('topics', id);
    if (topic) {
      topic.itemCount = Math.max(0, topic.itemCount + delta);
      await database.put('topics', topic);
    }
  }
}

/**
 * Delete a topic
 */
export async function deleteTopic(id: UUID): Promise<boolean> {
  const database = await ensureDb();
  const topic = await database.get('topics', id);
  if (!topic) return false;
  
  // Remove topic from all items
  const items = await getItemsByTopic(id);
  for (const item of items) {
    await updateItem(item.id, {
      topicIds: item.topicIds.filter(tid => tid !== id)
    });
  }
  
  await database.delete('topics', id);
  return true;
}

/**
 * Rename a topic
 */
export async function renameTopic(id: UUID, newName: string): Promise<Topic | null> {
  const database = await ensureDb();
  const topic = await database.get('topics', id);
  if (!topic) return null;
  
  topic.name = newName.trim();
  await database.put('topics', topic);
  return topic;
}

// ============ INTENTS ============

/**
 * Get all intents
 */
export async function getAllIntents(): Promise<Intent[]> {
  const database = await ensureDb();
  const intents = await database.getAll('intents');
  return intents.sort((a, b) => b.itemCount - a.itemCount);
}

/**
 * Create a new intent (or return existing if name matches case-insensitively)
 */
export async function createIntent(name: string, emoji: string): Promise<Intent> {
  const database = await ensureDb();
  const normalizedName = name.trim();
  
  // Check for existing intent with same name (case-insensitive)
  const allIntents = await database.getAll('intents');
  const existing = allIntents.find(
    i => i.name.toLowerCase() === normalizedName.toLowerCase()
  );
  
  if (existing) {
    return existing;
  }
  
  const newIntent: Intent = {
    id: generateId(),
    name: normalizedName,
    emoji,
    createdAt: now(),
    itemCount: 0
  };
  
  await database.add('intents', newIntent);
  return newIntent;
}

/**
 * Update intent counts
 */
async function updateIntentCounts(intentIds: UUID[], delta: number): Promise<void> {
  const database = await ensureDb();
  for (const id of intentIds) {
    const intent = await database.get('intents', id);
    if (intent) {
      intent.itemCount = Math.max(0, intent.itemCount + delta);
      await database.put('intents', intent);
    }
  }
}

/**
 * Delete an intent
 */
export async function deleteIntent(id: UUID): Promise<boolean> {
  const database = await ensureDb();
  const intent = await database.get('intents', id);
  if (!intent) return false;
  
  // Remove intent from all items
  const items = await getItemsByIntent(id);
  for (const item of items) {
    await updateItem(item.id, {
      intentIds: item.intentIds.filter(iid => iid !== id)
    });
  }
  
  await database.delete('intents', id);
  return true;
}

/**
 * Rename an intent
 */
export async function renameIntent(id: UUID, newName: string, newEmoji: string): Promise<Intent | null> {
  const database = await ensureDb();
  const intent = await database.get('intents', id);
  if (!intent) return null;
  
  intent.name = newName.trim();
  intent.emoji = newEmoji;
  await database.put('intents', intent);
  return intent;
}

// ============ SETTINGS ============

/**
 * Get settings
 */
export async function getSettings(): Promise<Settings> {
  const database = await ensureDb();
  const settings = await database.get('settings', 'main');
  return settings!;
}

/**
 * Update settings
 */
export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  const database = await ensureDb();
  const settings = await getSettings();
  const updated = { ...settings, ...updates };
  await database.put('settings', updated);
  return updated;
}

// ============ EXPORT / IMPORT ============

/**
 * Export all data for backup
 */
export async function exportData(): Promise<BackupData> {
  const database = await ensureDb();
  
  const items = await database.getAll('savedItems');
  const topics = await database.getAll('topics');
  const intents = await database.getAll('intents');
  const settings = await database.get('settings', 'main');
  
  return {
    version: '1.0.0',
    exportedAt: now(),
    items,
    topics,
    intents,
    settings: settings || undefined
  };
}

/**
 * Import data from backup
 * @param data - The backup data to import
 * @param mode - 'merge' to add to existing data, 'replace' to clear and replace
 */
export async function importData(
  data: BackupData, 
  mode: 'merge' | 'replace'
): Promise<{ success: boolean; imported: { items: number; topics: number; intents: number } }> {
  const database = await ensureDb();
  
  try {
    console.log(`Resurface Storage: Importing data in ${mode} mode`);
    console.log(`Resurface Storage: Data contains ${data.items.length} items, ${data.topics.length} topics, ${data.intents.length} intents`);
    
    // Validate backup data structure
    if (!data.items || !data.topics || !data.intents) {
      throw new Error('Invalid backup format: missing required fields');
    }
    
    let importedItems = 0;
    let importedTopics = 0;
    let importedIntents = 0;
    
    // If replacing, clear existing data first
    if (mode === 'replace') {
      const clearTx = database.transaction(['savedItems', 'topics', 'intents'], 'readwrite');
      await clearTx.objectStore('savedItems').clear();
      await clearTx.objectStore('topics').clear();
      await clearTx.objectStore('intents').clear();
      await clearTx.done;
      console.log('Resurface Storage: Cleared existing data for replace mode');
    }
    
    // Import topics first (items reference them)
    for (const topic of data.topics) {
      try {
        if (mode === 'merge') {
          // Check if topic with same name exists
          const existing = await database.getFromIndex('topics', 'by-name', topic.name);
          if (!existing) {
            await database.add('topics', topic);
            importedTopics++;
          }
        } else {
          await database.put('topics', topic);
          importedTopics++;
        }
      } catch (e) {
        console.warn('Resurface Storage: Error importing topic:', topic.name, e);
      }
    }
    
    // Import intents
    for (const intent of data.intents) {
      try {
        if (mode === 'merge') {
          const existing = await database.getFromIndex('intents', 'by-name', intent.name);
          if (!existing) {
            await database.add('intents', intent);
            importedIntents++;
          }
        } else {
          await database.put('intents', intent);
          importedIntents++;
        }
      } catch (e) {
        console.warn('Resurface Storage: Error importing intent:', intent.name, e);
      }
    }
    
    // Import items
    for (const item of data.items) {
      try {
        if (mode === 'merge') {
          // Check if item with same URL exists
          const existing = await database.getFromIndex('savedItems', 'by-url', item.url);
          if (!existing) {
            await database.add('savedItems', item);
            importedItems++;
          }
        } else {
          await database.put('savedItems', item);
          importedItems++;
        }
      } catch (e) {
        console.warn('Resurface Storage: Error importing item:', item.url, e);
      }
    }
    
    // Import settings if provided and in replace mode
    if (data.settings && mode === 'replace') {
      await database.put('settings', data.settings);
    }
    
    console.log(`Resurface Storage: Import completed - ${importedItems} items, ${importedTopics} topics, ${importedIntents} intents`);
    
    return {
      success: true,
      imported: {
        items: importedItems,
        topics: importedTopics,
        intents: importedIntents
      }
    };
    
  } catch (error) {
    console.error('Resurface Storage: Import error:', error);
    throw error;
  }
}
