import path from 'node:path';
import { getCacheManager } from './cache-manager.js';
import { getConfig } from '../config.js';
import type { SearchResult, SearchResponse, PageContent } from '../types/api.js';

interface SearchOptions {
  query: string;
  language?: 'pt' | 'en';
  limit?: number;
}

function extractTitle(content: string): string {
  // Try to find the first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Try frontmatter title
  const frontmatterMatch = content.match(/^---[\s\S]*?title:\s*["']?(.+?)["']?\s*$/m);
  if (frontmatterMatch) {
    return frontmatterMatch[1].trim();
  }

  // Fallback to first line if not empty
  const firstLine = content.split('\n').find(line => line.trim().length > 0);
  if (firstLine) {
    return firstLine.replace(/^#+\s*/, '').trim().slice(0, 100);
  }

  return 'Untitled';
}

function getLanguageFromPath(filePath: string): 'pt' | 'en' {
  if (filePath.startsWith('en/') || filePath.startsWith('en\\')) {
    return 'en';
  }
  return 'pt';
}

function buildUrl(filePath: string, language: 'pt' | 'en'): string {
  const config = getConfig();
  // Remove .md extension and language prefix
  let urlPath = filePath.replace(/\.md$/, '');

  // Remove language prefix from path (pt/ or en/)
  if (urlPath.startsWith('pt/')) {
    urlPath = urlPath.slice(3);
  } else if (urlPath.startsWith('en/')) {
    urlPath = urlPath.slice(3);
  }

  // Build URL based on language
  if (language === 'en') {
    return `${config.baseUrl}/en/${urlPath}`;
  }
  return `${config.baseUrl}/${urlPath}`;
}

function extractSnippet(content: string, query: string, maxLength: number = 200): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const index = lowerContent.indexOf(lowerQuery);
  if (index === -1) {
    // Return start of content if query not found (shouldn't happen)
    return content.slice(0, maxLength).replace(/\s+/g, ' ').trim() + '...';
  }

  // Get surrounding context
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + query.length + 150);

  let snippet = content.slice(start, end);

  // Clean up the snippet
  snippet = snippet.replace(/\s+/g, ' ').trim();

  if (start > 0) {
    snippet = '...' + snippet;
  }
  if (end < content.length) {
    snippet = snippet + '...';
  }

  return snippet;
}

function calculateScore(content: string, query: string): number {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Count occurrences
  let count = 0;
  let position = 0;
  while ((position = lowerContent.indexOf(lowerQuery, position)) !== -1) {
    count++;
    position += lowerQuery.length;
  }

  // Bonus for title match
  const title = extractTitle(content);
  const titleMatch = title.toLowerCase().includes(lowerQuery) ? 10 : 0;

  return count + titleMatch;
}

export async function searchPages(options: SearchOptions): Promise<SearchResponse> {
  const cacheManager = getCacheManager();
  await cacheManager.ensureCache();

  const { query, language, limit = 10 } = options;
  const lowerQuery = query.toLowerCase();

  // Get all markdown files
  const files = cacheManager.listFiles();

  const results: SearchResult[] = [];

  for (const filePath of files) {
    // Filter by language if specified
    const fileLanguage = getLanguageFromPath(filePath);
    if (language && fileLanguage !== language) {
      continue;
    }

    const content = cacheManager.readFile(filePath);
    if (!content) {
      continue;
    }

    // Check if content matches query
    if (!content.toLowerCase().includes(lowerQuery)) {
      continue;
    }

    const title = extractTitle(content);
    const snippet = extractSnippet(content, query);
    const score = calculateScore(content, query);
    const url = buildUrl(filePath, fileLanguage);

    results.push({
      path: filePath,
      url,
      title,
      snippet,
      language: fileLanguage,
      score,
    });
  }

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  // Apply limit
  const limitedResults = results.slice(0, limit);

  return {
    query,
    results: limitedResults,
    total: results.length,
  };
}

export async function getPage(filePath: string): Promise<PageContent | null> {
  const cacheManager = getCacheManager();
  await cacheManager.ensureCache();

  // Normalize path
  let normalizedPath = filePath;
  if (!normalizedPath.endsWith('.md')) {
    normalizedPath += '.md';
  }

  const content = cacheManager.readFile(normalizedPath);
  if (!content) {
    return null;
  }

  const language = getLanguageFromPath(normalizedPath);
  const title = extractTitle(content);
  const url = buildUrl(normalizedPath, language);

  return {
    path: normalizedPath,
    url,
    title,
    content,
    language,
  };
}

export async function listAllPages(language?: 'pt' | 'en'): Promise<string[]> {
  const cacheManager = getCacheManager();
  await cacheManager.ensureCache();

  const files = cacheManager.listFiles();

  if (language) {
    return files.filter(f => getLanguageFromPath(f) === language);
  }

  return files;
}
