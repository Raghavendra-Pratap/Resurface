import { 
  initStorage, 
  saveItem, 
  getItemByUrl,
  getAllItems, 
  searchItems,
  getAllTopics,
  getAllIntents,
  deleteItem,
  updateItem,
  createTopic,
  createIntent,
  renameTopic,
  deleteTopic,
  renameIntent,
  deleteIntent,
  getSettings,
  updateSettings,
  exportData,
  importData
} from './storage';
import { generateTopics } from './topicGenerator';
import type { Message, MessagePayloads } from '../shared/messages';
import { sendToTab } from '../shared/messages';
import type { SavedItem, ToastData, DropdownItem } from '../shared/types';
import { 
  generateId, 
  now, 
  generateSearchText, 
  extractDomain,
  formatRelativeTime 
} from '../shared/utils';

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async () => {
  await initStorage();
  await syncKeyboardShortcut();
  console.log('Resurface installed and initialized');
});

// Also initialize on startup (in case of extension update)
chrome.runtime.onStartup.addListener(async () => {
  await initStorage();
  await syncKeyboardShortcut();
  console.log('Resurface started');
});

/**
 * Sync the current keyboard shortcut from Chrome commands to our settings
 */
async function syncKeyboardShortcut() {
  const commands = await chrome.commands.getAll();
  const saveTabCommand = commands.find(c => c.name === 'save-tab');
  if (saveTabCommand?.shortcut) {
    await updateSettings({ keyboardShortcut: saveTabCommand.shortcut });
  }
}

// Register keyboard shortcut handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-tab') {
    await handleSaveCommand();
  } else if (command === 'resurface') {
    await handleResurfaceCommand();
  }
});

// Omnibox support - search saved tabs by typing "rs <query>"
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (text.length < 2) {
    suggest([]);
    return;
  }
  
  const matches = await searchItems(text, 6);
  const suggestions = matches.map(item => ({
    content: item.url,
    description: `<match>${escapeXml(item.title)}</match> <dim>- ${escapeXml(extractDomain(item.url))}</dim>`
  }));
  
  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  // If text is a URL, navigate to it
  // Otherwise, open the dashboard with search
  let url: string;
  
  if (text.startsWith('http://') || text.startsWith('https://')) {
    url = text;
  } else {
    // Open dashboard with search query
    url = chrome.runtime.getURL(`src/dashboard/index.html?search=${encodeURIComponent(text)}`);
  }
  
  switch (disposition) {
    case 'currentTab':
      chrome.tabs.update({ url });
      break;
    case 'newForegroundTab':
      chrome.tabs.create({ url });
      break;
    case 'newBackgroundTab':
      chrome.tabs.create({ url, active: false });
      break;
  }
});

// Helper to escape XML for omnibox suggestions
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await handleSaveCommand();
  }
});

/**
 * Ensure the content script is loaded in the tab
 * Injects it programmatically if not already present
 */
async function ensureContentScriptLoaded(tabId: number): Promise<void> {
  try {
    // Try to ping the content script to see if it's loaded
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
  } catch {
    // Content script not loaded, inject it
    console.log('Content script not found, injecting...');
    
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/index.js']
    });
    
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['src/content/styles.css']
    });
    
    // Wait a bit for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Handle the resurface command (keyboard shortcut)
 */
async function handleResurfaceCommand(): Promise<void> {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id || !tab.url) {
    console.log('No active tab or URL');
    return;
  }
  
  // Skip chrome:// and other restricted URLs
  if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
    // Open dashboard instead for restricted pages
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
    return;
  }
  
  try {
    // Ensure content script is injected
    await ensureContentScriptLoaded(tab.id);
    
    // Get all saved items for initial display
    const items = await getAllItems();
    const topics = await getAllTopics();
    const intents = await getAllIntents();
    
    // Format items for the search modal
    const formattedItems: DropdownItem[] = items.slice(0, 20).map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      favicon: item.favicon,
      faviconType: item.faviconType,
      domain: extractDomain(item.url),
      savedAt: formatRelativeTime(item.savedAt),
      topics: topics.filter(t => item.topicIds.includes(t.id)),
      intents: intents.filter(i => item.intentIds.includes(i.id))
    }));
    
    // Send to content script to show search modal
    await sendToTab(tab.id, 'SHOW_SEARCH_MODAL', { items: formattedItems });
    
  } catch (error) {
    console.error('Error in resurface command:', error);
  }
}

/**
 * Handle the save command (keyboard shortcut or icon click)
 */
async function handleSaveCommand(): Promise<void> {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id || !tab.url) {
    console.log('No active tab or URL');
    return;
  }
  
  // Skip chrome:// and other restricted URLs
  if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
    console.log('Cannot save restricted URL:', tab.url);
    return;
  }
  
  try {
    // Ensure content script is injected
    await ensureContentScriptLoaded(tab.id);

    // Check if already saved
    const existing = await getItemByUrl(tab.url);
    if (existing) {
      // Notify user it's already saved
      await sendToTab(tab.id, 'SHOW_ALREADY_SAVED', { item: existing });
      return;
    }
    
    // Request page data from content script
    const pageData = await sendToTab<'EXTRACT_PAGE'>(tab.id, 'EXTRACT_PAGE');
    
    // Get sibling tabs (other tabs in the same window)
    const allTabs = await chrome.tabs.query({ windowId: tab.windowId });
    const siblingTabUrls = allTabs
      .filter(t => t.id !== tab.id && t.url?.startsWith('http'))
      .map(t => t.url!)
      .slice(0, 10); // Limit to 10
    
    // Generate suggested topics
    const suggestedTopics = await generateTopics({
      url: pageData.url,
      title: pageData.title,
      referrerQuery: pageData.referrerQuery
    });
    
    // Get all intents for the dropdown
    const intents = await getAllIntents();

    // Get settings for auto-save delay
    const settings = await getSettings();
    
    // Send data to content script to show toast (fire and forget - saving is handled via SAVE_ITEM message)
    const toastData: ToastData = {
      pageData,
      suggestedTopics,
      intents,
      siblingTabUrls,
      autoSaveDelay: settings.autoSaveDelay
    };
    
    // Don't await - the content script will send SAVE_ITEM when user saves
    sendToTab(tab.id, 'SHOW_TOAST', toastData).catch(err => {
      console.error('Error showing toast:', err);
    });
    
  } catch (error) {
    console.error('Error in save command:', error);
  }
}

// Message router
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  const handler = messageHandlers[message.type];
  
  if (handler) {
    handler(message.payload, sender)
      .then(sendResponse)
      .catch((error: Error) => {
        console.error(`Error handling ${message.type}:`, error);
        sendResponse({ error: error.message });
      });
    return true; // Indicates async response
  }
  
  console.warn('Unknown message type:', message.type);
  return false;
});

// Message handlers
const messageHandlers: Record<string, (payload: any, sender: chrome.runtime.MessageSender) => Promise<any>> = {
  
  async SAVE_ITEM(payload: MessagePayloads['SAVE_ITEM']): Promise<SavedItem> {
    console.log('Resurface Background: ========== SAVE_ITEM RECEIVED ==========');
    console.log('Resurface Background: Payload:', JSON.stringify(payload, null, 2));
    
    try {
      const { pageData, toastResult, siblingTabUrls } = payload;
      
      console.log('Resurface Background: Creating item object...');
      const item: SavedItem = {
        id: generateId(),
        url: pageData.url,
        title: toastResult.title,
        favicon: pageData.favicon,
        faviconType: pageData.faviconType,
        savedAt: now(),
        lastAccessedAt: now(),
        referrerQuery: pageData.referrerQuery,
        referrerUrl: pageData.referrerUrl,
        siblingTabUrls,
        topicIds: toastResult.topicIds,
        intentIds: toastResult.intentIds,
        searchText: generateSearchText(
          toastResult.title, 
          pageData.url, 
          pageData.referrerQuery
        )
      };
      
      console.log('Resurface Background: Item created:', JSON.stringify(item, null, 2));
      console.log('Resurface Background: Calling saveItem...');
      const savedItem = await saveItem(item);
      console.log('Resurface Background: ========== ITEM SAVED SUCCESSFULLY ==========');
      console.log('Resurface Background: Saved item:', JSON.stringify(savedItem, null, 2));
      return savedItem;
    } catch (error) {
      console.error('Resurface Background: ========== SAVE_ITEM ERROR ==========');
      console.error('Resurface Background: Error:', error);
      throw error;
    }
  },
  
  async SEARCH_ITEMS(payload: MessagePayloads['SEARCH_ITEMS']): Promise<SavedItem[]> {
    return searchItems(payload.query);
  },
  
  async GET_ALL_ITEMS(): Promise<SavedItem[]> {
    return getAllItems();
  },
  
  async GET_ALL_TOPICS() {
    return getAllTopics();
  },
  
  async GET_ALL_INTENTS() {
    return getAllIntents();
  },
  
  async DELETE_ITEM(payload: MessagePayloads['DELETE_ITEM']): Promise<boolean> {
    return deleteItem(payload.id);
  },
  
  async UPDATE_ITEM(payload: MessagePayloads['UPDATE_ITEM']): Promise<SavedItem | null> {
    return updateItem(payload.id, payload.updates);
  },
  
  async CREATE_TOPIC(payload: MessagePayloads['CREATE_TOPIC']) {
    return createTopic(payload.name);
  },
  
  async CREATE_INTENT(payload: MessagePayloads['CREATE_INTENT']) {
    return createIntent(payload.name, payload.emoji);
  },

  async RENAME_TOPIC(payload: MessagePayloads['RENAME_TOPIC']) {
    return renameTopic(payload.id, payload.name);
  },

  async DELETE_TOPIC(payload: MessagePayloads['DELETE_TOPIC']) {
    return deleteTopic(payload.id);
  },

  async RENAME_INTENT(payload: MessagePayloads['RENAME_INTENT']) {
    return renameIntent(payload.id, payload.name, payload.emoji);
  },

  async DELETE_INTENT(payload: MessagePayloads['DELETE_INTENT']) {
    return deleteIntent(payload.id);
  },
  
  async URL_INPUT(payload: MessagePayloads['URL_INPUT'], sender): Promise<void> {
    const { query } = payload;
    const tabId = sender.tab?.id;

    if (!tabId) return;

    // Check settings if resurfacing is enabled
    const settings = await getSettings();
    if (!settings.showResurfaceDropdown) {
      return;
    }
    
    if (query.length < 2) {
      await sendToTab(tabId, 'HIDE_DROPDOWN');
      return;
    }
    
    const matches = await searchItems(query, 5);
    
    if (matches.length > 0) {
      const topics = await getAllTopics();
      const intents = await getAllIntents();
      
      const dropdownItems: DropdownItem[] = matches.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
        faviconType: item.faviconType,
        domain: extractDomain(item.url),
        savedAt: formatRelativeTime(item.savedAt),
        topics: topics.filter(t => item.topicIds.includes(t.id)),
        intents: intents.filter(i => item.intentIds.includes(i.id))
      }));
      
      await sendToTab(tabId, 'SHOW_DROPDOWN', { items: dropdownItems });
    } else {
      await sendToTab(tabId, 'HIDE_DROPDOWN');
    }
  },

  async TRIGGER_SAVE(): Promise<void> {
    await handleSaveCommand();
  },

  async GET_SETTINGS(): Promise<any> {
    await syncKeyboardShortcut();
    return getSettings();
  },

  async UPDATE_SETTINGS(payload: Partial<any>): Promise<any> {
    return updateSettings(payload);
  },

  async EXPORT_DATA(): Promise<any> {
    return exportData();
  },

  async IMPORT_DATA(payload: MessagePayloads['IMPORT_DATA']): Promise<any> {
    return importData(payload.data, payload.mode);
  }
};

// Monitor tab updates for Google search resurfacing
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check settings
    const settings = await getSettings();
    if (!settings.showResurfaceDropdown) return;

    // Check if it's a Google search
    const googleMatch = tab.url.match(/google\.[a-z.]+\/search\?.*q=([^&]+)/);
    if (googleMatch) {
      const query = decodeURIComponent(googleMatch[1].replace(/\+/g, ' '));
      const matches = await searchItems(query, 5);
      
      if (matches.length > 0) {
        try {
          // Get topics and intents for formatting
          const topics = await getAllTopics();
          const intents = await getAllIntents();
          
          const formattedItems: DropdownItem[] = matches.map(item => ({
            id: item.id,
            title: item.title,
            url: item.url,
            favicon: item.favicon,
            faviconType: item.faviconType,
            domain: extractDomain(item.url),
            savedAt: formatRelativeTime(item.savedAt),
            topics: topics.filter(t => item.topicIds.includes(t.id)),
            intents: intents.filter(i => item.intentIds.includes(i.id))
          }));
          
          await sendToTab(tabId, 'SHOW_GOOGLE_OVERLAY', { 
            items: formattedItems, 
            query 
          });
        } catch {
          // Content script might not be ready yet
        }
      }
    }
  }
});
