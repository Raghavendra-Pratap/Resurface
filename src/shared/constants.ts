import type { Intent } from './types';

// Default intents (without generated fields)
export const DEFAULT_INTENTS: Omit<Intent, 'id' | 'createdAt' | 'itemCount'>[] = [
  { name: 'Read Later', emoji: '📖' },
  { name: 'Reference', emoji: '📌' },
  { name: 'Share', emoji: '🔗' },
  { name: 'Project', emoji: '📁' },
];

// Colors for auto-generated topics
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

// Domain to topic mapping for auto-generation
export const DOMAIN_TOPIC_MAP: Record<string, string> = {
  // Development
  'github.com': 'Development',
  'gitlab.com': 'Development',
  'stackoverflow.com': 'Development',
  'dev.to': 'Development',
  'npmjs.com': 'Development',
  'docs.python.org': 'Development',
  'developer.mozilla.org': 'Development',
  
  // Articles
  'medium.com': 'Articles',
  'substack.com': 'Articles',
  'hashnode.com': 'Articles',
  'blog.': 'Articles',
  
  // Videos
  'youtube.com': 'Videos',
  'vimeo.com': 'Videos',
  'twitch.tv': 'Videos',
  
  // Social
  'twitter.com': 'Social',
  'x.com': 'Social',
  'linkedin.com': 'Social',
  'reddit.com': 'Social',
  'facebook.com': 'Social',
  
  // Tech News
  'news.ycombinator.com': 'Tech News',
  'techcrunch.com': 'Tech News',
  'theverge.com': 'Tech News',
  'arstechnica.com': 'Tech News',
  'wired.com': 'Tech News',
  
  // Research
  'arxiv.org': 'Research',
  'scholar.google.com': 'Research',
  'researchgate.net': 'Research',
  'nature.com': 'Research',
  'sciencedirect.com': 'Research',
  
  // Design
  'figma.com': 'Design',
  'dribbble.com': 'Design',
  'behance.net': 'Design',
  'awwwards.com': 'Design',
  
  // AI
  'openai.com': 'AI',
  'anthropic.com': 'AI',
  'huggingface.co': 'AI',
};

// Timing
export const AUTO_SAVE_DELAY = 5000; // 5 seconds
export const SEARCH_DEBOUNCE_DELAY = 200; // 200ms
export const TOAST_FADE_DURATION = 300; // 300ms

// Limits
export const MAX_SEARCH_RESULTS = 10;
export const MAX_SUGGESTED_TOPICS = 3;
export const MAX_DROPDOWN_ITEMS = 5;

// Storage keys
export const STORAGE_DB_NAME = 'resurface';
export const STORAGE_DB_VERSION = 1;

// Stop words for keyword extraction
export const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'how', 'what', 'when', 'where', 'why', 'who', 'which', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my',
  'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them',
  'just', 'only', 'also', 'very', 'too', 'so', 'than', 'then', 'now',
  'here', 'there', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'not', 'any', 'new', 'first', 'last',
  'long', 'great', 'little', 'own', 'same', 'right', 'big', 'high',
  'different', 'small', 'large', 'next', 'early', 'young', 'important',
  'public', 'bad', 'good', 'best', 'well', 'way', 'use', 'using', 'used',
  'get', 'getting', 'got', 'make', 'making', 'made', 'part', 'full',
  'complete', 'guide', 'tutorial', 'introduction', 'intro', 'overview',
]);
