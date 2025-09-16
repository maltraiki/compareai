import { NextRequest, NextResponse } from 'next/server';

// API to search for real product data
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }
    
    console.log('🔍 Searching for:', query);
    
    // Use web search to get real data
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    // For now, we'll use a combination of approaches
    // In production, you might want to use a proper search API like SerpAPI or ScraperAPI
    
    try {
      // Try to fetch search results (this might be blocked by Google)
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Extract relevant information
        const results = extractDataFromHTML(html, query);
        
        return NextResponse.json({
          query,
          results,
          source: 'web_search',
          timestamp: new Date().toISOString()
        });
      }
    } catch (searchError) {
      console.error('Direct search failed:', searchError);
    }
    
    // If we can't get real data, return error - NO FALLBACK!
    return NextResponse.json({
      error: 'Unable to fetch current data',
      message: 'Could not retrieve real-time information. Please try again.',
      query,
      timestamp: new Date().toISOString()
    }, { status: 503 });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Extract data from HTML response
function extractDataFromHTML(html: string, query: string): any[] {
  const results = [];
  
  // Look for price patterns
  const pricePatterns = [
    /\$[\d,]+\.?\d*/g,
    /SAR\s?[\d,]+\.?\d*/g,
    /AED\s?[\d,]+\.?\d*/g,
    /£[\d,]+\.?\d*/g,
    /€[\d,]+\.?\d*/g
  ];
  
  for (const pattern of pricePatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      results.push({
        type: 'price',
        value: matches[0],
        confidence: 0.8
      });
      break;
    }
  }
  
  // Look for specifications
  const specPatterns = {
    display: /(\d+\.?\d*)["\s]*(inch|"|display|screen)/gi,
    processor: /(A\d+\s*(?:Pro|Bionic)?|Snapdragon\s*\d+|Tensor\s*G\d+|M\d+|Exynos\s*\d+)/gi,
    memory: /(\d+)\s*GB\s*(?:RAM|storage|memory)/gi,
    camera: /(\d+)\s*(?:MP|megapixel)/gi,
    battery: /(\d+)\s*mAh/gi
  };
  
  for (const [key, pattern] of Object.entries(specPatterns)) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      results.push({
        type: 'spec',
        key,
        value: matches[0],
        confidence: 0.7
      });
    }
  }
  
  return results;
}

// NO FALLBACK DATA - We only use REAL data or nothing!

// GET endpoint for testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    message: 'Product search API',
    endpoints: {
      POST: '/api/search - Search for product information',
      body: '{ query: "iPhone 16 price" }'
    }
  });
}