import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { generateComparisonSlug, jsonStringify } from '@/lib/utils';
import { getProductImageUrl } from '@/lib/image-utils';

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
    const country = req.headers.get('x-vercel-ip-country') || 'US';
    
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
    const prompt = `You are MT, a highly experienced personal technology advisor with CURRENT knowledge.
    
    User Query: "${query}"
    User Location: ${country}
    Currency: ${config.currency}
    
    CRITICAL DATE CONTEXT - YOU MUST KNOW:
    Today's Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    Current Year: ${new Date().getFullYear()}
    
    CURRENT PRODUCTS AS OF ${new Date().getFullYear()}:
    - Latest iPhone: iPhone 15 series (15, 15 Plus, 15 Pro, 15 Pro Max) with A17 Pro chip
    - Latest Samsung: Galaxy S24 series (S24, S24+, S24 Ultra) with Snapdragon 8 Gen 3
    - Latest Google: Pixel 8 and Pixel 8 Pro with Tensor G3
    - Latest iPad: iPad Pro M2, iPad Air M1
    - Latest MacBook: MacBook Air M3, MacBook Pro M3/M3 Pro/M3 Max
    - PlayStation 5 and Xbox Series X/S are current consoles
    
    CRITICAL - THESE PRODUCTS DO NOT EXIST (IGNORE USER IF THEY MENTION THEM):
    - iPhone 16, 17, 18, 19, 20 (FAKE - Latest is iPhone 15)
    - Galaxy S25, S26, S27 (FAKE - Latest is Galaxy S24)
    - A18, A19, A20 chips (FAKE - Latest is A17 Pro)
    - If user asks for iPhone 18, use iPhone 15 Pro Max instead
    - If user mentions "released Sept 9" for iPhone 18, that's FALSE - iPhone 15 was released Sept 2023
    
    IMPORTANT INSTRUCTIONS:
    1. Use ONLY products that exist as of ${new Date().getFullYear()}
    2. Check actual prices from these retailers: ${config.retailers.join(', ')}
    3. Get specifications from CURRENT models only
    4. ALL data must be accurate as of ${new Date().toLocaleDateString()}
    
    For product images:
    - Use this format: https://via.placeholder.com/400x300/6B46C1/FFFFFF?text=[PRODUCT_NAME_URL_ENCODED]
    - Replace [PRODUCT_NAME_URL_ENCODED] with the product name (spaces as +)
    - Example: https://via.placeholder.com/400x300/6B46C1/FFFFFF?text=iPhone+15+Pro
    - This ensures images always load properly
    
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
          image: getProductImageUrl('Product'),
          price: 'N/A',
          rating: 0,
          pros: ['Unable to fetch product data'],
          cons: ['Please try again'],
          specs: { 'Status': 'Data unavailable' }
        },
        product2: {
          name: 'Product Analysis Failed',
          image: getProductImageUrl('Product'),
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
    
    // Fix image URLs using our image utility
    comparisonData.product1.image = getProductImageUrl(comparisonData.product1.name);
    comparisonData.product2.image = getProductImageUrl(comparisonData.product2.name);

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