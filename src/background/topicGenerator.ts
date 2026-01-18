import type { Topic } from '../shared/types';
import { DOMAIN_TOPIC_MAP, MAX_SUGGESTED_TOPICS } from '../shared/constants';
import { extractDomain, extractKeywords, capitalizeFirst } from '../shared/utils';
import { getOrCreateTopic, getAllTopics } from './storage';

interface GenerationInput {
  url: string;
  title: string;
  referrerQuery: string | null;
}

/**
 * Generate suggested topics for a page
 */
export async function generateTopics(input: GenerationInput): Promise<Topic[]> {
  const suggestedTopics: Topic[] = [];
  const addedTopicNames = new Set<string>();
  
  // 1. Domain-based topic
  const domainTopic = await getTopicFromDomain(input.url);
  if (domainTopic && !addedTopicNames.has(domainTopic.name.toLowerCase())) {
    suggestedTopics.push(domainTopic);
    addedTopicNames.add(domainTopic.name.toLowerCase());
  }
  
  // 2. Get existing topics for matching
  const existingTopics = await getAllTopics();
  
  // 3. Extract keywords from title and referrer query
  const titleKeywords = extractKeywords(input.title);
  const queryKeywords = input.referrerQuery 
    ? extractKeywords(input.referrerQuery) 
    : [];
  const allKeywords = [...new Set([...queryKeywords, ...titleKeywords])];
  
  // 4. Match keywords against existing topics
  for (const keyword of allKeywords) {
    if (suggestedTopics.length >= MAX_SUGGESTED_TOPICS) break;
    
    const matchedTopic = findMatchingTopic(keyword, existingTopics);
    if (matchedTopic && !addedTopicNames.has(matchedTopic.name.toLowerCase())) {
      suggestedTopics.push(matchedTopic);
      addedTopicNames.add(matchedTopic.name.toLowerCase());
    }
  }
  
  // 5. If we have room and strong keywords, create new topic
  if (suggestedTopics.length < MAX_SUGGESTED_TOPICS && allKeywords.length > 0) {
    // Use the first keyword that isn't already a topic
    for (const keyword of allKeywords) {
      if (suggestedTopics.length >= MAX_SUGGESTED_TOPICS) break;
      
      const topicName = capitalizeFirst(keyword);
      if (!addedTopicNames.has(topicName.toLowerCase()) && keyword.length >= 3) {
        // Check if this would be a meaningful topic (not too generic)
        if (isGoodTopicCandidate(keyword)) {
          const newTopic = await getOrCreateTopic(topicName, true);
          suggestedTopics.push(newTopic);
          addedTopicNames.add(topicName.toLowerCase());
        }
      }
    }
  }
  
  return suggestedTopics;
}

/**
 * Get topic from domain mapping
 */
async function getTopicFromDomain(url: string): Promise<Topic | null> {
  const domain = extractDomain(url);
  
  // Check exact match
  if (DOMAIN_TOPIC_MAP[domain]) {
    return getOrCreateTopic(DOMAIN_TOPIC_MAP[domain], true);
  }
  
  // Check partial match (e.g., 'blog.' prefix)
  for (const [pattern, topicName] of Object.entries(DOMAIN_TOPIC_MAP)) {
    if (pattern.endsWith('.') && domain.includes(pattern)) {
      return getOrCreateTopic(topicName, true);
    }
  }
  
  return null;
}

/**
 * Find a topic that matches a keyword
 */
function findMatchingTopic(keyword: string, topics: Topic[]): Topic | null {
  const normalizedKeyword = keyword.toLowerCase();
  
  // Exact match
  const exactMatch = topics.find(t => 
    t.name.toLowerCase() === normalizedKeyword
  );
  if (exactMatch) return exactMatch;
  
  // Partial match (keyword in topic name or vice versa)
  const partialMatch = topics.find(t => {
    const topicName = t.name.toLowerCase();
    return topicName.includes(normalizedKeyword) || 
           normalizedKeyword.includes(topicName);
  });
  if (partialMatch) return partialMatch;
  
  return null;
}

/**
 * Check if a keyword would make a good topic
 */
function isGoodTopicCandidate(keyword: string): boolean {
  // Too short
  if (keyword.length < 3) return false;
  
  // Common words that aren't good topics
  const badTopics = new Set([
    'app', 'web', 'site', 'page', 'post', 'blog', 'news', 'article',
    'home', 'about', 'contact', 'help', 'faq', 'terms', 'privacy',
    'login', 'signup', 'register', 'account', 'profile', 'settings',
    'search', 'results', 'list', 'view', 'edit', 'create', 'delete',
    'file', 'files', 'folder', 'document', 'image', 'video', 'audio',
    'free', 'pro', 'premium', 'trial', 'demo', 'beta', 'alpha',
    'online', 'digital', 'virtual', 'mobile', 'desktop', 'cloud',
  ]);
  
  if (badTopics.has(keyword.toLowerCase())) return false;
  
  // Numbers only
  if (/^\d+$/.test(keyword)) return false;
  
  return true;
}

/**
 * Re-analyze an item to suggest better topics
 * (Could be used for batch re-categorization later)
 */
export async function reanalyzePage(
  url: string, 
  title: string, 
  referrerQuery: string | null
): Promise<Topic[]> {
  return generateTopics({ url, title, referrerQuery });
}
