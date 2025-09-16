// Free Product APIs and Scraping Options

interface ProductAPI {
  name: string;
  baseUrl: string;
  requiresKey: boolean;
  rateLimit: string;
}

// Available Free APIs
export const FREE_APIS: ProductAPI[] = [
  {
    name: 'Best Buy API',
    baseUrl: 'https://api.bestbuy.com/v1/products',
    requiresKey: true, // Free key available
    rateLimit: '50,000 requests/day'
  },
  {
    name: 'Walmart Open API', 
    baseUrl: 'https://developer.walmartlabs.com',
    requiresKey: true, // Free tier available
    rateLimit: '5,000 requests/day'
  },
  {
    name: 'Target RedSky API',
    baseUrl: 'https://redsky.target.com/v2',
    requiresKey: false, // Public endpoint
    rateLimit: 'Limited'
  },
  {
    name: 'Amazon Price Scraping',
    baseUrl: 'scrape',
    requiresKey: false,
    rateLimit: 'Careful - can be blocked'
  }
];

// Scraping function for when APIs fail
export async function scrapeProductData(url: string) {
  try {
    // We'll use Puppeteer or Playwright for client-side scraping
    // Or a service like ScraperAPI (has free tier)
    
    // For now, let's try direct fetch with headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const html = await response.text();
    return extractProductInfo(html);
    
  } catch (error) {
    console.error('Scraping failed:', error);
    return null;
  }
}

// Extract product info from HTML
function extractProductInfo(html: string) {
  const info: any = {};
  
  // Price extraction patterns
  const pricePatterns = [
    /<meta property="product:price:amount" content="([^"]+)"/,
    /<span class="price[^>]*>([^<]+)</,
    /\$(\d+(?:\.\d{2})?)/,
    /"price":\s*"?(\d+(?:\.\d{2})?)"?/,
    /data-price="(\d+(?:\.\d{2})?)"/ 
  ];
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      info.price = match[1];
      break;
    }
  }
  
  // Product name patterns
  const namePatterns = [
    /<meta property="og:title" content="([^"]+)"/,
    /<h1[^>]*>([^<]+)</,
    /"name":\s*"([^"]+)"/,
    /<title>([^<]+)</
  ];
  
  for (const pattern of namePatterns) {
    const match = html.match(pattern);
    if (match) {
      info.name = match[1].trim();
      break;
    }
  }
  
  // Image patterns
  const imagePatterns = [
    /<meta property="og:image" content="([^"]+)"/,
    /"image":\s*"([^"]+)"/,
    /<img[^>]*class="product[^>]*src="([^"]+)"/
  ];
  
  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match) {
      info.image = match[1];
      break;
    }
  }
  
  return info;
}

// Best Buy API (free with key)
export async function getBestBuyProduct(sku: string, apiKey: string) {
  try {
    const url = `https://api.bestbuy.com/v1/products/${sku}.json?apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Best Buy API failed');
    }
    
    const data = await response.json();
    
    return {
      name: data.name,
      price: data.salePrice || data.regularPrice,
      image: data.image,
      description: data.shortDescription,
      inStock: data.onlineAvailability,
      url: data.url,
      specs: {
        model: data.modelNumber,
        manufacturer: data.manufacturer,
        color: data.color
      }
    };
  } catch (error) {
    console.error('Best Buy API error:', error);
    return null;
  }
}

// Target RedSky API (no key needed)
export async function getTargetProduct(tcin: string) {
  try {
    const url = `https://redsky.target.com/v3/pdp/tcin/${tcin}?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews&key=9f36aeafbe60771e321a7cc95a78140772ab3e96`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Target API failed');
    }
    
    const data = await response.json();
    const product = data.product;
    
    return {
      name: product.item.product_description.title,
      price: product.price?.formatted_current_price,
      image: product.item.enrichment?.images?.primary_image_url,
      description: product.item.product_description.downstream_description,
      inStock: product.available_to_promise_network?.availability_status === 'IN_STOCK'
    };
  } catch (error) {
    console.error('Target API error:', error);
    return null;
  }
}

// Amazon scraping (be careful with rate limits)
export async function scrapeAmazon(asin: string) {
  const url = `https://www.amazon.com/dp/${asin}`;
  return await scrapeProductData(url);
}

// Main function to get product data from multiple sources
export async function getProductFromAnywhere(productName: string) {
  console.log(`🔍 Searching for: ${productName}`);
  
  // Try different sources
  const sources = [
    { name: 'Target', fn: () => searchTarget(productName) },
    { name: 'Scraping', fn: () => searchByScraping(productName) }
  ];
  
  for (const source of sources) {
    try {
      console.log(`Trying ${source.name}...`);
      const result = await source.fn();
      if (result) {
        return { ...result, source: source.name };
      }
    } catch (error) {
      console.error(`${source.name} failed:`, error);
    }
  }
  
  return null;
}

// Search Target by product name
async function searchTarget(query: string) {
  // Target search endpoint (may need adjustment)
  const searchUrl = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?keyword=${encodeURIComponent(query)}&count=5`;
  
  try {
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      // Extract first product from search results
      const firstProduct = data.data?.search?.products?.[0];
      if (firstProduct) {
        return getTargetProduct(firstProduct.tcin);
      }
    }
  } catch (error) {
    console.error('Target search failed:', error);
  }
  
  return null;
}

// Search by scraping Google Shopping
async function searchByScraping(query: string) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;
  return await scrapeProductData(searchUrl);
}