import Parser from 'rss-parser';

const parser = new Parser();

async function test() {
  const feed = await parser.parseURL('https://cloud.google.com/feeds/gcp-release-notes.xml');
  let count = 0;
  for (const item of feed.items) {
    const title = (item.title || "").toLowerCase();
    const content = (item.content || "").toLowerCase();
    const snippet = (item.contentSnippet || "").toLowerCase();
    
    const hasDeprecationMarker = /<(strong|b|h[1-6]|span)[^>]*>\s*(Deprecation|Deprecated|Retirement|Retired)\s*<\/\1>/i.test(item.content || "") || 
                                /###?\s*(Deprecation|Deprecated|Retirement|Retired)/i.test(item.content || "") ||
                                snippet.includes('deprecation:') ||
                                snippet.includes('deprecated:');
    
    const isDeprecated = title.includes('deprecate') || 
                        title.includes('deprecation') || 
                        title.includes('retirement') ||
                        title.includes('retired') ||
                        content.includes('shutdown date') ||
                        content.includes('end of life') ||
                        content.includes('will be discontinued') ||
                        content.includes('deprecated') ||
                        content.includes('deprecation') ||
                        hasDeprecationMarker;

    if (isDeprecated) {
      count++;
      console.log('Found:', item.title);
    }
  }
  console.log('Total deprecations found:', count);
}

test();
