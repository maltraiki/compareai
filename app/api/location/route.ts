import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Get location from request headers
  const country = req.headers.get('x-vercel-ip-country') || req.geo?.country || 'US';
  const city = req.headers.get('x-vercel-ip-city') || req.geo?.city || '';
  
  // Determine currency based on country
  const currencyMap: { [key: string]: { symbol: string, code: string, retailers: string[] } } = {
    'SA': { 
      symbol: 'SAR', 
      code: 'SAR',
      retailers: ['amazon.sa', 'noon.com', 'jarir.com', 'extra.com']
    },
    'AE': { 
      symbol: 'AED', 
      code: 'AED',
      retailers: ['amazon.ae', 'noon.com', 'sharafdg.com', 'carrefouruae.com']
    },
    'KW': { 
      symbol: 'KWD', 
      code: 'KWD',
      retailers: ['xcite.com', 'eureka.com.kw', 'amazon.sa']
    },
    'EG': { 
      symbol: 'EGP', 
      code: 'EGP',
      retailers: ['amazon.eg', 'noon.com', 'jumia.com.eg']
    },
    'US': { 
      symbol: '$', 
      code: 'USD',
      retailers: ['amazon.com', 'bestbuy.com', 'walmart.com', 'target.com']
    },
    'GB': { 
      symbol: '£', 
      code: 'GBP',
      retailers: ['amazon.co.uk', 'currys.co.uk', 'argos.co.uk']
    },
    'DE': { 
      symbol: '€', 
      code: 'EUR',
      retailers: ['amazon.de', 'mediamarkt.de', 'saturn.de']
    },
    'FR': { 
      symbol: '€', 
      code: 'EUR',
      retailers: ['amazon.fr', 'fnac.com', 'cdiscount.com']
    },
    'IN': { 
      symbol: '₹', 
      code: 'INR',
      retailers: ['amazon.in', 'flipkart.com', 'myntra.com']
    },
    'JP': { 
      symbol: '¥', 
      code: 'JPY',
      retailers: ['amazon.co.jp', 'rakuten.co.jp', 'yodobashi.com']
    }
  };

  // Default to USD if country not found
  const currency = currencyMap[country] || currencyMap['US'];
  
  return NextResponse.json({
    country,
    city,
    currency: currency.code,
    symbol: currency.symbol,
    retailers: currency.retailers
  });
}