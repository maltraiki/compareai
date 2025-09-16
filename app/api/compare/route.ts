import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { generateComparisonSlug, jsonStringify } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid query' },
        { status: 400 }
      );
    }
    
    // Get user location and currency
    const country = req.headers.get('x-vercel-ip-country') || req.geo?.country || 'US';
    
    // Determine currency and retailers based on location
    const locationConfig: { [key: string]: { currency: string, retailers: string[] } } = {
      'SA': { 
        currency: 'SAR (Saudi Riyals)', 
        retailers: ['amazon.sa', 'noon.com', 'jarir.com', 'extra.com']
      },
      'AE': { 
        currency: 'AED (UAE Dirhams)', 
        retailers: ['amazon.ae', 'noon.com', 'sharafdg.com']
      },
      'US': { 
        currency: 'USD (US Dollars)', 
        retailers: ['amazon.com', 'bestbuy.com', 'walmart.com']
      },
      'GB': { 
        currency: 'GBP (British Pounds)', 
        retailers: ['amazon.co.uk', 'currys.co.uk', 'argos.co.uk']
      },
      'IN': { 
        currency: 'INR (Indian Rupees)', 
        retailers: ['amazon.in', 'flipkart.com', 'croma.com']
      }
    };
    
    const config = locationConfig[country] || locationConfig['US'];
    
    // Enhanced prompt with REAL internet access instructions
    const prompt = `You are MT, a highly experienced personal technology advisor. You have FULL INTERNET ACCESS.
    
    User Query: "${query}"
    User Location: ${country}
    Currency: ${config.currency}
    
    CRITICAL INSTRUCTIONS:
    1. USE YOUR INTERNET ACCESS to search for REAL, CURRENT information
    2. Search Google/Bing for the latest product images from official sources
    3. Check actual prices from these retailers: ${config.retailers.join(', ')}
    4. Get REAL product specifications from manufacturer websites
    5. Find ACTUAL user reviews and ratings from trusted sources
    6. ALL data must be CURRENT as of ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    
    For product images:
    - Search Google Images for "[product name] official image ${new Date().getFullYear()}"
    - Use manufacturer website images (apple.com, samsung.com, etc.)
    - Get high-resolution product photos from retailer listings
    - NEVER use placeholder or generic images
    
    For prices:
    - Search "${config.retailers[0]} [product name] price today"
    - Check multiple retailers for CURRENT prices as of ${new Date().toLocaleDateString()}
    - Include any active deals, discounts, or promotions happening RIGHT NOW
    - Prices MUST be in ${config.currency} and MUST be today's actual prices
    
    IMPORTANT: 
    - You have FULL internet access. USE IT to get REAL, CURRENT data.
    - All information must be accurate as of TODAY: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    - Do NOT use outdated information. Search for the LATEST data available.
    - Do NOT make up information. Only use what you find online RIGHT NOW.
    
    Provide ONLY valid JSON in this exact format:
    
    {
      "product1": {
        "name": "Exact product name with model",
        "image": "ACTUAL image URL found from internet search",
        "price": "${config.currency.split(' ')[0]} X,XXX",
        "rating": 4.5,
        "pros": [
          "Real advantage from reviews",
          "Actual feature benefit",
          "True user feedback"
        ],
        "cons": [
          "Real limitation from reviews",
          "Actual drawback",
          "True user complaint"
        ],
        "specs": {
          "Display": "Exact specification",
          "Processor": "Actual chip model",
          "Memory": "Real RAM and storage",
          "Battery": "True battery life",
          "Special Features": "Actual unique features"
        }
      },
      "product2": {
        "name": "Exact product name with model",
        "image": "ACTUAL image URL found from internet search",
        "price": "${config.currency.split(' ')[0]} X,XXX",
        "rating": 4.3,
        "pros": [
          "Real advantage from reviews",
          "Actual feature benefit",
          "True user feedback"
        ],
        "cons": [
          "Real limitation from reviews",
          "Actual drawback",
          "True user complaint"
        ],
        "specs": {
          "Display": "Exact specification",
          "Processor": "Actual chip model",
          "Memory": "Real RAM and storage",
          "Battery": "True battery life",
          "Special Features": "Actual unique features"
        }
      },
      "verdict": "Professional verdict based on real data and reviews (2-3 sentences)",
      "recommendation": "Personalized recommendation based on actual user needs and real product performance (3-4 sentences)"
    }
    
    Remember: USE YOUR INTERNET ACCESS. Search for real data. NO hardcoded information.
    Provide ONLY the JSON, no markdown, no explanation, no text before or after.`;

    // Get AI analysis with internet access
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON from response
    let comparisonData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        comparisonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      
      // Return error response
      return NextResponse.json({
        product1: {
          name: 'Product Analysis Failed',
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=',
          price: 'N/A',
          rating: 0,
          pros: ['Unable to fetch product data'],
          cons: ['Please try again'],
          specs: { 'Status': 'Data unavailable' }
        },
        product2: {
          name: 'Product Analysis Failed',
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=',
          price: 'N/A',
          rating: 0,
          pros: ['Unable to fetch product data'],
          cons: ['Please try again'],
          specs: { 'Status': 'Data unavailable' }
        },
        verdict: 'Unable to analyze products at this time.',
        recommendation: 'Please try again with a specific product comparison.'
      });
    }

    // Save comparison to database for SEO landing page
    try {
      const slug = generateComparisonSlug(comparisonData.product1.name, comparisonData.product2.name);
      
      // Check if comparison already exists
      const existingComparison = await prisma.comparison.findUnique({
        where: { slug }
      });

      if (!existingComparison) {
        // Extract price as number
        const getPrice = (priceStr: string) => {
          const numbers = priceStr.replace(/[^0-9.]/g, '');
          return parseFloat(numbers) || 0;
        };

        // Create products if they don't exist
        const [product1, product2] = await Promise.all([
          prisma.product.upsert({
            where: { slug: generateComparisonSlug(comparisonData.product1.name, '') },
            update: {
              name: comparisonData.product1.name,
              currentPrice: getPrice(comparisonData.product1.price),
              images: jsonStringify([comparisonData.product1.image]),
              specifications: jsonStringify(comparisonData.product1.specs),
              pros: jsonStringify(comparisonData.product1.pros),
              cons: jsonStringify(comparisonData.product1.cons),
            },
            create: {
              name: comparisonData.product1.name,
              brand: comparisonData.product1.name.split(' ')[0],
              category: 'Technology',
              slug: generateComparisonSlug(comparisonData.product1.name, ''),
              currentPrice: getPrice(comparisonData.product1.price),
              images: jsonStringify([comparisonData.product1.image]),
              specifications: jsonStringify(comparisonData.product1.specs),
              pros: jsonStringify(comparisonData.product1.pros),
              cons: jsonStringify(comparisonData.product1.cons),
              description: `${comparisonData.product1.name} - ${comparisonData.verdict}`,
            }
          }),
          prisma.product.upsert({
            where: { slug: generateComparisonSlug(comparisonData.product2.name, '') },
            update: {
              name: comparisonData.product2.name,
              currentPrice: getPrice(comparisonData.product2.price),
              images: jsonStringify([comparisonData.product2.image]),
              specifications: jsonStringify(comparisonData.product2.specs),
              pros: jsonStringify(comparisonData.product2.pros),
              cons: jsonStringify(comparisonData.product2.cons),
            },
            create: {
              name: comparisonData.product2.name,
              brand: comparisonData.product2.name.split(' ')[0],
              category: 'Technology',
              slug: generateComparisonSlug(comparisonData.product2.name, ''),
              currentPrice: getPrice(comparisonData.product2.price),
              images: jsonStringify([comparisonData.product2.image]),
              specifications: jsonStringify(comparisonData.product2.specs),
              pros: jsonStringify(comparisonData.product2.pros),
              cons: jsonStringify(comparisonData.product2.cons),
              description: `${comparisonData.product2.name} - ${comparisonData.verdict}`,
            }
          })
        ]);

        // Create comparison
        await prisma.comparison.create({
          data: {
            slug,
            title: `${comparisonData.product1.name} vs ${comparisonData.product2.name}`,
            product1Id: product1.id,
            product2Id: product2.id,
            seoContent: `${comparisonData.verdict} ${comparisonData.recommendation}`,
            conversation: jsonStringify({
              query,
              verdict: comparisonData.verdict,
              recommendation: comparisonData.recommendation
            })
          }
        });
      } else {
        // Update view count
        await prisma.comparison.update({
          where: { slug },
          data: { 
            viewCount: { increment: 1 },
            lastViewed: new Date()
          }
        });
      }

      // Add the slug to response for frontend
      comparisonData.slug = slug;
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if database save fails
    }

    return NextResponse.json(comparisonData);

  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze products. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}