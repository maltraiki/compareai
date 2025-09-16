import { WebSearch } from '@/lib/web-search';

// Interface for product data
interface ProductData {
  name: string;
  price: string;
  image: string;
  specs: Record<string, string>;
  availability: string;
  source: string;
  lastUpdated: string;
}

// Fetch real product data from web search
export async function fetchRealProductData(productName: string, location: string = 'US'): Promise<ProductData | null> {
  try {
    console.log(`🔍 Fetching real data for: ${productName}`);
    
    // Search for current product information
    const searchQuery = `${productName} price specifications ${new Date().getFullYear()} official`;
    const searchResults = await searchForProduct(searchQuery);
    
    // Parse and extract real data
    const productData = await extractProductInfo(searchResults, productName);
    
    return productData;
  } catch (error) {
    console.error('Error fetching real product data:', error);
    return null;
  }
}

// Search for product using web search
async function searchForProduct(query: string): Promise<any> {
  try {
    // Use the WebFetch tool to search and scrape
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return null;
  }
}

// Extract product information from search results
async function extractProductInfo(searchData: any, productName: string): Promise<ProductData> {
  // Default structure
  const productInfo: ProductData = {
    name: productName,
    price: 'Price not found',
    image: '',
    specs: {},
    availability: 'Check retailer',
    source: 'Web search',
    lastUpdated: new Date().toISOString()
  };
  
  // Extract from search results
  if (searchData && searchData.results) {
    // Look for price patterns
    const priceMatch = JSON.stringify(searchData).match(/\$[\d,]+|\d+\.\d{2}|SAR\s?[\d,]+|AED\s?[\d,]+/i);
    if (priceMatch) {
      productInfo.price = priceMatch[0];
    }
    
    // Look for specifications
    const specPatterns = {
      display: /(\d+\.?\d*)["\s]*(inch|display|screen)/i,
      processor: /(A\d+|Snapdragon|Tensor|M\d+|Exynos)[\s\w]*/i,
      memory: /(\d+GB?\s*(RAM|storage))/i,
      camera: /(\d+MP|megapixel)/i,
      battery: /(\d+\s?mAh)/i
    };
    
    for (const [key, pattern] of Object.entries(specPatterns)) {
      const match = JSON.stringify(searchData).match(pattern);
      if (match) {
        productInfo.specs[key] = match[0];
      }
    }
  }
  
  return productInfo;
}

// Get current product prices from multiple sources
export async function getCurrentPrices(product: string, retailers: string[]): Promise<Record<string, string>> {
  const prices: Record<string, string> = {};
  
  for (const retailer of retailers) {
    try {
      const searchQuery = `${product} price site:${retailer} ${new Date().getFullYear()}`;
      const result = await searchForProduct(searchQuery);
      
      // Extract price from result
      const priceMatch = JSON.stringify(result).match(/\$[\d,]+|\d+\.\d{2}|SAR\s?[\d,]+|AED\s?[\d,]+/i);
      if (priceMatch) {
        prices[retailer] = priceMatch[0];
      }
    } catch (error) {
      console.error(`Error fetching price from ${retailer}:`, error);
      prices[retailer] = 'N/A';
    }
  }
  
  return prices;
}

// Validate if a product actually exists
export async function validateProductExists(productName: string): Promise<boolean> {
  try {
    const searchQuery = `"${productName}" official announcement release date`;
    const result = await searchForProduct(searchQuery);
    
    // Check if we found real results
    if (result && result.results && result.results.length > 0) {
      // Look for indicators that product exists
      const resultText = JSON.stringify(result).toLowerCase();
      
      // Check for non-existent product indicators
      if (resultText.includes('rumor') || 
          resultText.includes('expected') || 
          resultText.includes('will be released') ||
          resultText.includes('not yet announced')) {
        return false;
      }
      
      // Check for existence indicators
      if (resultText.includes('available') || 
          resultText.includes('in stock') || 
          resultText.includes('buy now') ||
          resultText.includes('released')) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error validating product:', error);
    return false;
  }
}

// Get latest model for a product line
export async function getLatestModel(productLine: string): Promise<string> {
  try {
    const searchQuery = `latest ${productLine} model ${new Date().getFullYear()} current`;
    const result = await searchForProduct(searchQuery);
    
    if (result && result.results) {
      const resultText = JSON.stringify(result);
      
      // Extract model numbers based on product line
      if (productLine.toLowerCase().includes('iphone')) {
        const match = resultText.match(/iPhone\s*(\d+)(?:\s*(Pro|Plus|Max|mini))?/i);
        if (match) {
          return `iPhone ${match[1]}${match[2] ? ' ' + match[2] : ''}`;
        }
      } else if (productLine.toLowerCase().includes('galaxy')) {
        const match = resultText.match(/Galaxy\s*S(\d+)(?:\s*(Ultra|Plus|\+))?/i);
        if (match) {
          return `Galaxy S${match[1]}${match[2] ? ' ' + match[2] : ''}`;
        }
      } else if (productLine.toLowerCase().includes('pixel')) {
        const match = resultText.match(/Pixel\s*(\d+)(?:\s*(Pro|a))?/i);
        if (match) {
          return `Pixel ${match[1]}${match[2] ? ' ' + match[2] : ''}`;
        }
      }
    }
    
    return productLine; // Return original if can't determine
  } catch (error) {
    console.error('Error getting latest model:', error);
    return productLine;
  }
}