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
    
    // Fallback: Use structured data based on known patterns
    const fallbackData = await getFallbackData(query);
    
    return NextResponse.json({
      query,
      results: fallbackData,
      source: 'structured_data',
      timestamp: new Date().toISOString()
    });
    
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

// Get fallback data based on known current products
async function getFallbackData(query: string): Promise<any[]> {
  const queryLower = query.toLowerCase();
  const results = [];
  
  // Current product database (as of 2024-2025)
  const currentProducts = {
    'iphone 16': {
      price: '$799-$1,199',
      processor: 'A18 / A18 Pro',
      display: '6.1" to 6.9"',
      released: 'September 2024',
      current: true
    },
    'iphone 16 pro': {
      price: '$999-$1,199',
      processor: 'A18 Pro',
      display: '6.3" / 6.9"',
      camera: '48MP main',
      released: 'September 2024',
      current: true
    },
    'galaxy s24': {
      price: '$799-$1,299',
      processor: 'Snapdragon 8 Gen 3',
      display: '6.2" to 6.8"',
      released: 'January 2024',
      current: true
    },
    'galaxy s24 ultra': {
      price: '$1,299',
      processor: 'Snapdragon 8 Gen 3',
      display: '6.8"',
      camera: '200MP main',
      released: 'January 2024',
      current: true
    },
    'pixel 9': {
      price: '$799-$999',
      processor: 'Tensor G4',
      display: '6.3" / 6.8"',
      released: 'October 2024',
      current: true
    },
    'iphone 17': {
      price: 'Not available',
      processor: 'Not announced',
      display: 'Not announced',
      released: 'Expected September 2025',
      current: false
    },
    'galaxy s25': {
      price: 'Not available',
      processor: 'Expected Snapdragon 8 Gen 4',
      display: 'Not announced',
      released: 'Expected January 2025',
      current: false
    }
  };
  
  // Check which product is being queried
  for (const [product, data] of Object.entries(currentProducts)) {
    if (queryLower.includes(product)) {
      results.push({
        type: 'product_info',
        name: product,
        data,
        confidence: data.current ? 0.95 : 0.3
      });
      
      if (!data.current) {
        // Suggest current alternative
        const alternative = product.includes('iphone 17') ? 'iPhone 16' :
                          product.includes('galaxy s25') ? 'Galaxy S24' :
                          'current model';
        results.push({
          type: 'suggestion',
          message: `${product} is not yet available. Latest model is ${alternative}`,
          confidence: 1.0
        });
      }
    }
  }
  
  // If no specific product found, return general info
  if (results.length === 0) {
    results.push({
      type: 'info',
      message: 'Please specify a product model for accurate information',
      confidence: 0.5
    });
  }
  
  return results;
}

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