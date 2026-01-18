import type { 
  SavedItem, 
  Topic, 
  Intent, 
  ToastData, 
  ToastResult, 
  DropdownItem,
  PageData,
  Settings 
} from './types';

// Message types
export type MessageType =
  // Content -> Background
  | 'SAVE_ITEM'
  | 'SEARCH_ITEMS'
  | 'GET_ALL_ITEMS'
  | 'GET_ALL_TOPICS'
  | 'GET_ALL_INTENTS'
  | 'DELETE_ITEM'
  | 'UPDATE_ITEM'
  | 'CREATE_TOPIC'
  | 'CREATE_INTENT'
  | 'URL_INPUT'
  | 'PAGE_DATA_RESPONSE'
  | 'TRIGGER_SAVE'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'PING'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA'
  
  // Background -> Content
  | 'EXTRACT_PAGE'
  | 'SHOW_TOAST'
  | 'SHOW_CONFIRMATION'
  | 'SHOW_ALREADY_SAVED'
  | 'SHOW_DROPDOWN'
  | 'HIDE_DROPDOWN'
  | 'SHOW_GOOGLE_HINT'
  | 'SHOW_SEARCH_MODAL'
  | 'SEARCH_MODAL_RESULTS'
  | 'SHOW_GOOGLE_OVERLAY';

// Backup data structure for export/import
export interface BackupData {
  version: string;
  exportedAt: number;
  items: SavedItem[];
  topics: Topic[];
  intents: Intent[];
  settings?: Settings;
}

// Message payloads
export interface MessagePayloads {
  // Content -> Background
  SAVE_ITEM: {
    pageData: PageData;
    toastResult: ToastResult;
    siblingTabUrls: string[];
  };
  SEARCH_ITEMS: {
    query: string;
  };
  GET_ALL_ITEMS: undefined;
  GET_ALL_TOPICS: undefined;
  GET_ALL_INTENTS: undefined;
  DELETE_ITEM: {
    id: string;
  };
  UPDATE_ITEM: {
    id: string;
    updates: Partial<SavedItem>;
  };
  CREATE_TOPIC: {
    name: string;
  };
  CREATE_INTENT: {
    name: string;
    emoji: string;
  };
  URL_INPUT: {
    query: string;
  };
  PAGE_DATA_RESPONSE: PageData;
  TRIGGER_SAVE: undefined;
  GET_SETTINGS: undefined;
  UPDATE_SETTINGS: Partial<Settings>;
  PING: undefined;
  EXPORT_DATA: undefined;
  IMPORT_DATA: {
    data: BackupData;
    mode: 'merge' | 'replace';
  };
  
  // Background -> Content
  EXTRACT_PAGE: undefined;
  SHOW_TOAST: ToastData;
  SHOW_CONFIRMATION: {
    message: string;
  };
  SHOW_ALREADY_SAVED: {
    item: SavedItem;
  };
  SHOW_DROPDOWN: {
    items: DropdownItem[];
  };
  HIDE_DROPDOWN: undefined;
  SHOW_GOOGLE_HINT: {
    count: number;
    query: string;
  };
  SHOW_SEARCH_MODAL: {
    items: DropdownItem[];
  };
  SEARCH_MODAL_RESULTS: {
    items: DropdownItem[];
  };
  SHOW_GOOGLE_OVERLAY: {
    items: DropdownItem[];
    query: string;
  };
}

// Response types
export interface MessageResponses {
  SAVE_ITEM: SavedItem;
  SEARCH_ITEMS: SavedItem[];
  GET_ALL_ITEMS: SavedItem[];
  GET_ALL_TOPICS: Topic[];
  GET_ALL_INTENTS: Intent[];
  DELETE_ITEM: boolean;
  UPDATE_ITEM: SavedItem;
  CREATE_TOPIC: Topic;
  CREATE_INTENT: Intent;
  URL_INPUT: void;
  PAGE_DATA_RESPONSE: void;
  TRIGGER_SAVE: void;
  GET_SETTINGS: Settings;
  UPDATE_SETTINGS: Settings;
  PING: { pong: boolean };
  EXPORT_DATA: BackupData;
  IMPORT_DATA: { success: boolean; imported: { items: number; topics: number; intents: number } };
  EXTRACT_PAGE: PageData;
  SHOW_TOAST: ToastResult | null;
  SHOW_CONFIRMATION: void;
  SHOW_ALREADY_SAVED: void;
  SHOW_DROPDOWN: void;
  HIDE_DROPDOWN: void;
  SHOW_GOOGLE_HINT: void;
  SHOW_SEARCH_MODAL: void;
  SEARCH_MODAL_RESULTS: void;
  SHOW_GOOGLE_OVERLAY: void;
}

// Generic message interface
export interface Message<T extends MessageType = MessageType> {
  type: T;
  payload?: MessagePayloads[T];
}

// Helper to create typed messages
export function createMessage<T extends MessageType>(
  type: T,
  payload?: MessagePayloads[T]
): Message<T> {
  return { type, payload };
}

// Helper to send message to background
export async function sendToBackground<T extends MessageType>(
  type: T,
  payload?: MessagePayloads[T]
): Promise<MessageResponses[T]> {
  return chrome.runtime.sendMessage(createMessage(type, payload));
}

// Helper to send message to content script
export async function sendToTab<T extends MessageType>(
  tabId: number,
  type: T,
  payload?: MessagePayloads[T]
): Promise<MessageResponses[T]> {
  return chrome.tabs.sendMessage(tabId, createMessage(type, payload));
}
