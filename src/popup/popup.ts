import { sendToBackground } from '../shared/messages';

/**
 * Popup script
 * Shows stats and quick actions
 */

async function init() {
  // Load stats
  await loadStats();
  
  // Setup button handlers
  setupButtons();
}

async function loadStats() {
  try {
    const items = await sendToBackground('GET_ALL_ITEMS');
    const topics = await sendToBackground('GET_ALL_TOPICS');
    
    // Count items saved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const savedToday = items.filter(item => item.savedAt >= todayTimestamp).length;
    
    // Update UI
    document.getElementById('stat-saved')!.textContent = String(items.length);
    document.getElementById('stat-topics')!.textContent = String(topics.length);
    document.getElementById('stat-today')!.textContent = String(savedToday);
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function setupButtons() {
  // Save current tab
  document.getElementById('btn-save')?.addEventListener('click', async () => {
    // Trigger save command
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      // Close popup and trigger save
      await sendToBackground('TRIGGER_SAVE');
      window.close();
    }
  });
  
  // Open dashboard
  document.getElementById('btn-dashboard')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
    window.close();
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
