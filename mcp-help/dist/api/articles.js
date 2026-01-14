/**
 * Extract article ID from URL
 * URL format: /pt-BR/articles/8851219-layouts-de-boletos
 */
function extractArticleId(url) {
    const match = url.match(/\/articles\/(\d+)/);
    return match ? match[1] : '';
}
/**
 * Clean HTML text content
 */
function cleanText(text) {
    return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}
/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html) {
    let markdown = html;
    // Remove script and style tags
    markdown = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    markdown = markdown.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // Convert headers
    markdown = markdown.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
    markdown = markdown.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
    markdown = markdown.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
    markdown = markdown.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
    markdown = markdown.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '##### $1\n\n');
    markdown = markdown.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '###### $1\n\n');
    // Convert bold and italic
    markdown = markdown.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
    // Convert links
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
    // Convert images
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
    // Convert lists
    markdown = markdown.replace(/<ul[^>]*>/gi, '\n');
    markdown = markdown.replace(/<\/ul>/gi, '\n');
    markdown = markdown.replace(/<ol[^>]*>/gi, '\n');
    markdown = markdown.replace(/<\/ol>/gi, '\n');
    markdown = markdown.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
    // Convert line breaks
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
    // Convert blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');
    // Convert code blocks
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    markdown = markdown.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
    // Convert horizontal rules
    markdown = markdown.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]+>/g, '');
    // Clean up whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = cleanText(markdown);
    return markdown;
}
/**
 * Parse search results from HTML
 */
function parseSearchResults(html, baseUrl) {
    const results = [];
    // Pattern for Intercom help center article links
    // Looking for article links in the search results page
    const articlePattern = /<a[^>]*href="([^"]*\/articles\/[^"]*)"[^>]*class="[^"]*paper[^"]*"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match;
    while ((match = articlePattern.exec(html)) !== null) {
        const url = match[1].startsWith('http') ? match[1] : `${baseUrl}${match[1]}`;
        results.push({
            id: extractArticleId(url),
            title: cleanText(match[2]),
            description: cleanText(match[3]),
            url,
        });
    }
    // Alternative pattern for simpler article listing
    if (results.length === 0) {
        const simplePattern = /<a[^>]*href="([^"]*\/articles\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        let simpleMatch;
        while ((simpleMatch = simplePattern.exec(html)) !== null) {
            const url = simpleMatch[1].startsWith('http') ? simpleMatch[1] : `${baseUrl}${simpleMatch[1]}`;
            const title = cleanText(simpleMatch[3]);
            if (title && !results.find(r => r.id === simpleMatch[2])) {
                results.push({
                    id: simpleMatch[2],
                    title,
                    description: '',
                    url,
                });
            }
        }
    }
    // Pattern for Intercom search results with data attributes
    if (results.length === 0) {
        const dataPattern = /data-article-id="(\d+)"[^>]*>[\s\S]*?<[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>[\s\S]*?<[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi;
        let dataMatch;
        while ((dataMatch = dataPattern.exec(html)) !== null) {
            results.push({
                id: dataMatch[1],
                title: cleanText(dataMatch[2]),
                description: cleanText(dataMatch[3]),
                url: `${baseUrl}/pt-BR/articles/${dataMatch[1]}`,
            });
        }
    }
    return results;
}
/**
 * Extract article content from HTML
 */
function parseArticleContent(html) {
    let title = '';
    let content = '';
    const relatedArticles = [];
    // Extract title from various possible locations
    const titleMatch = html.match(/<h1[^>]*class="[^"]*article[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
        html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
        html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
        title = cleanText(titleMatch[1].replace(/\|.*$/, '').replace(/ - .*$/, ''));
    }
    // Extract article body content
    const articleBodyMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
        html.match(/<div[^>]*class="[^"]*article[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
        html.match(/<div[^>]*class="[^"]*article[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
        html.match(/<div[^>]*class="[^"]*intercom-interblocks[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (articleBodyMatch) {
        content = htmlToMarkdown(articleBodyMatch[1]);
    }
    // Try to find main content area if article body not found
    if (!content) {
        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        if (mainMatch) {
            content = htmlToMarkdown(mainMatch[1]);
        }
    }
    // Extract related articles
    const relatedSection = html.match(/<[^>]*class="[^"]*related[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i);
    if (relatedSection) {
        const linkPattern = /<a[^>]*href="([^"]*\/articles\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = linkPattern.exec(relatedSection[1])) !== null) {
            relatedArticles.push({
                id: match[2],
                title: cleanText(match[3]),
                description: '',
                url: match[1],
            });
        }
    }
    return { title, content, relatedArticles };
}
/**
 * Search for articles in the help center
 */
export async function searchArticles(client, query) {
    const searchUrl = client.buildSearchUrl(query);
    const html = await client.fetchPage(searchUrl);
    const results = parseSearchResults(html, client.getBaseUrl());
    return {
        query,
        results,
        total: results.length,
    };
}
/**
 * Get a specific article by URL
 */
export async function getArticle(client, url) {
    const html = await client.fetchPage(url);
    const { title, content, relatedArticles } = parseArticleContent(html);
    const id = extractArticleId(url);
    return {
        id,
        title,
        url,
        content,
        relatedArticles: relatedArticles.length > 0 ? relatedArticles : undefined,
    };
}
//# sourceMappingURL=articles.js.map