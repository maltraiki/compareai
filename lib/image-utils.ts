// Generate product image URL based on product name and type
export function getProductImageUrl(productName: string): string {
  // Clean and process product name
  const cleanName = productName.toLowerCase().trim();
  
  // Try to identify product type and brand
  if (cleanName.includes('iphone')) {
    // Extract model number - support iPhone 16 (latest) and 15
    const model = cleanName.match(/iphone\s*(\d+\s*(pro|plus|mini)?(\s*max)?)/i)?.[1] || '16';
    const modelClean = model.replace(/\s+/g, '').toLowerCase();
    
    // iPhone 16 series images (latest as of Sept 2024)
    if (modelClean.includes('16')) {
      return `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409?wid=400&hei=300&fmt=jpeg&qlt=90`;
    }
    // iPhone 15 series images
    return `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-card-40-iphone${modelClean}-202409?wid=400&hei=300&fmt=jpeg&qlt=90`;
  }
  
  if (cleanName.includes('samsung') && cleanName.includes('galaxy')) {
    // Samsung Galaxy phones
    const model = cleanName.match(/galaxy\s*(s\d+|z\s*fold|z\s*flip|a\d+)/i)?.[1] || 's24';
    return `https://images.samsung.com/is/image/samsung/assets/global/galaxy/${model.replace(/\s+/g, '-').toLowerCase()}-thumbnail?$720_576_PNG$`;
  }
  
  if (cleanName.includes('pixel')) {
    // Google Pixel phones
    const model = cleanName.match(/pixel\s*(\d+\s*(pro|a)?)/i)?.[1] || '8';
    return `https://lh3.googleusercontent.com/proxy/pixel-${model.replace(/\s+/g, '-').toLowerCase()}-thumbnail`;
  }
  
  if (cleanName.includes('macbook')) {
    // MacBook laptops
    const type = cleanName.includes('air') ? 'air' : 'pro';
    return `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-${type}-card-40-202410?wid=400&hei=300&fmt=jpeg&qlt=90`;
  }
  
  if (cleanName.includes('ipad')) {
    // iPad tablets
    const type = cleanName.includes('air') ? 'air' : cleanName.includes('mini') ? 'mini' : 'pro';
    return `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-card-40-ipad-${type}-202410?wid=400&hei=300&fmt=jpeg&qlt=90`;
  }
  
  if (cleanName.includes('airpods')) {
    // AirPods
    const type = cleanName.includes('max') ? 'max' : cleanName.includes('pro') ? 'pro' : '3';
    return `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-${type}-card?wid=400&hei=300&fmt=jpeg&qlt=90`;
  }
  
  if (cleanName.includes('playstation') || cleanName.includes('ps5')) {
    return `https://media.direct.playstation.com/is/image/sierialto/ps5-product-thumbnail-01-en-14sep21?$facebook$`;
  }
  
  if (cleanName.includes('xbox')) {
    const type = cleanName.includes('series x') ? 'series-x' : 'series-s';
    return `https://compass-ssl.xbox.com/assets/xbox-${type}-thumbnail.jpg`;
  }
  
  if (cleanName.includes('surface')) {
    // Microsoft Surface devices
    const type = cleanName.includes('laptop') ? 'laptop' : 'pro';
    return `https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/surface-${type}-thumbnail`;
  }
  
  if (cleanName.includes('dell') && cleanName.includes('xps')) {
    return `https://i.dell.com/is/image/DellContent/dell-xps-laptop-thumbnail?wid=400&hei=300`;
  }
  
  if (cleanName.includes('thinkpad')) {
    return `https://p3-ofp.static.pub/fes/cms/2023/lenovo-thinkpad-thumbnail.jpg`;
  }
  
  if (cleanName.includes('lg') && (cleanName.includes('oled') || cleanName.includes('tv'))) {
    return `https://www.lg.com/content/dam/lge/global/lg-oled-tv-thumbnail.jpg`;
  }
  
  if (cleanName.includes('sony') && (cleanName.includes('tv') || cleanName.includes('bravia'))) {
    return `https://scene7.sonyanz.com/is/image/sonyglobalsolutions/sony-bravia-tv-thumbnail?$categorypdpnav$`;
  }
  
  if (cleanName.includes('bose') && cleanName.includes('quietcomfort')) {
    return `https://assets.bose.com/content/dam/Bose_DAM/Web/consumer_electronics/global/products/headphones/quietcomfort-thumbnail.jpg`;
  }
  
  if (cleanName.includes('sony') && cleanName.includes('wh-1000xm')) {
    return `https://scene7.sonyanz.com/is/image/sonyglobalsolutions/wh-1000xm5-thumbnail?$productthumb$`;
  }
  
  if (cleanName.includes('nintendo') && cleanName.includes('switch')) {
    const type = cleanName.includes('oled') ? 'oled' : 'standard';
    return `https://assets.nintendo.com/image/upload/f_auto/q_auto/c_fill,w_400,h_300/ncom/en_US/switch/site-design-update/switch-${type}-thumbnail`;
  }
  
  // Default placeholder with product name
  const encodedName = encodeURIComponent(productName).replace(/%20/g, '+');
  return `https://via.placeholder.com/400x300/6B46C1/FFFFFF?text=${encodedName}`;
}

// Validate if an image URL is accessible
export async function validateImageUrl(url: string): Promise<string> {
  try {
    // For server-side, we'll just return the URL
    // In production, you might want to actually check if the image loads
    return url;
  } catch {
    // Return placeholder if validation fails
    return `https://via.placeholder.com/400x300/6B46C1/FFFFFF?text=Product+Image`;
  }
}