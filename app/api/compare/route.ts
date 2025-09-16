import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { generateComparisonSlug, jsonStringify } from '@/lib/utils';
import { searchProductImage, searchProductPrice } from '@/lib/product-search';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid query' },
        { status: 400 }
      );
    }
    
    // Enhanced prompt for MT with better instructions for real data
    const prompt = `You are MT, a highly experienced personal technology advisor with deep knowledge of the latest tech products, their real market prices, and availability.
    
    User Query: "${query}"
    
    Analyze this query and provide a detailed comparison. If the user mentions specific products, compare those. 
    If they ask general questions, identify the two best options to compare.
    
    IMPORTANT INSTRUCTIONS:
    1. Use REAL, CURRENT market prices in SAR (Saudi Riyals) when possible
    2. Check prices from retailers like Amazon.sa, Noon.com, Jarir.com, Extra.com
    3. For images, search for actual product images from official sources
    4. Include ACCURATE technical specifications from 2024/2025
    5. Provide genuine pros and cons based on real user reviews
    
    IMPORTANT: Provide ONLY valid JSON in this exact format with realistic, current market data.
    For prices, use actual Saudi Arabian market prices (SAR):
    
    {
      "product1": {
        "name": "Exact product name with model",
        "image": "https://... (search for actual product image from official sources)",
        "price": "SAR X,XXX",
        "rating": 4.5,
        "pros": [
          "Specific advantage 1 with details",
          "Specific advantage 2 with details",
          "Specific advantage 3 with details"
        ],
        "cons": [
          "Specific limitation 1",
          "Specific limitation 2",
          "Specific limitation 3"
        ],
        "specs": {
          "Display": "Exact size and technology",
          "Processor": "Exact chip model",
          "Memory": "RAM and storage options",
          "Battery": "Battery life in hours",
          "Special Features": "Key unique features"
        }
      },
      "product2": {
        "name": "Exact product name with model",
        "image": "https://... (search for actual product image from official sources)",
        "price": "SAR X,XXX",
        "rating": 4.3,
        "pros": [
          "Specific advantage 1 with details",
          "Specific advantage 2 with details",
          "Specific advantage 3 with details"
        ],
        "cons": [
          "Specific limitation 1",
          "Specific limitation 2",
          "Specific limitation 3"
        ],
        "specs": {
          "Display": "Exact size and technology",
          "Processor": "Exact chip model",
          "Memory": "RAM and storage options",
          "Battery": "Battery life in hours",
          "Special Features": "Key unique features"
        }
      },
      "verdict": "A professional, detailed verdict explaining which product wins overall and why (2-3 sentences)",
      "recommendation": "As your technology advisor, here's my personalized recommendation based on different use cases and user needs (3-4 sentences)"
    }
    
    For prices, search these Saudi retailers in order of preference:
    - Amazon.sa (usually has competitive prices and wide selection)
    - Noon.com (local favorite with good deals)
    - Jarir.com (Jarir Bookstore - trusted for electronics)
    - Extra.com (Extra Stores - major electronics retailer)
    
    For the image field, search for actual product images from:
    - Official manufacturer websites (Apple.com, Samsung.com, etc.)
    - Amazon.sa product listings
    - Noon.com product pages
    - Official press images
    
    ALWAYS provide prices in SAR (Saudi Riyals) format.
    
    Use real, current market data. Be specific with model numbers, exact specifications, and actual prices.
    Provide ONLY the JSON, no markdown, no explanation, no text before or after.`;

    // Get AI analysis
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
      
      // Fallback with better default images
      return NextResponse.json({
        product1: {
          name: 'Product Analysis Failed',
          image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&h=600&fit=crop',
          price: 'N/A',
          rating: 0,
          pros: [
            'Unable to fetch product data',
            'Please try with specific product names',
            'Example: "iPhone 15 Pro vs Samsung Galaxy S24"'
          ],
          cons: ['Data temporarily unavailable'],
          specs: {
            'Status': 'Please try again with clearer product names'
          }
        },
        product2: {
          name: 'Product Analysis Failed',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
          price: 'N/A',
          rating: 0,
          pros: ['Unable to fetch product data'],
          cons: ['Data temporarily unavailable'],
          specs: {
            'Status': 'Please try again'
          }
        },
        verdict: 'Unable to analyze products. Please provide specific product names.',
        recommendation: 'Try asking: "Compare iPhone 15 Pro with Samsung Galaxy S24" or "Which laptop is better: MacBook Air M3 or Dell XPS 13?"'
      });
    }

    // Use the product search utility for better image URLs
    if (!comparisonData.product1.image || !comparisonData.product1.image.startsWith('http')) {
      comparisonData.product1.image = await searchProductImage(comparisonData.product1.name);
    }

    if (!comparisonData.product2.image || !comparisonData.product2.image.startsWith('http')) {
      comparisonData.product2.image = await searchProductImage(comparisonData.product2.name);
    }

    // Ensure prices are properly formatted (handle both $ and SAR)
    if (comparisonData.product1.price) {
      const price1 = comparisonData.product1.price;
      if (!price1.startsWith('$') && !price1.startsWith('SAR')) {
        comparisonData.product1.price = 'SAR ' + price1;
      }
    }
    if (comparisonData.product2.price) {
      const price2 = comparisonData.product2.price;
      if (!price2.startsWith('$') && !price2.startsWith('SAR')) {
        comparisonData.product2.price = 'SAR ' + price2;
      }
    }

    // Save comparison to database for SEO landing page
    try {
      const slug = generateComparisonSlug(comparisonData.product1.name, comparisonData.product2.name);
      
      // Check if comparison already exists
      const existingComparison = await prisma.comparison.findUnique({
        where: { slug }
      });

      if (!existingComparison) {
        // Create products if they don't exist
        const [product1, product2] = await Promise.all([
          prisma.product.upsert({
            where: { slug: generateComparisonSlug(comparisonData.product1.name, '') },
            update: {
              name: comparisonData.product1.name,
              currentPrice: parseFloat(comparisonData.product1.price.replace('SAR', '').replace('$', '').replace(',', '').trim()),
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
              currentPrice: parseFloat(comparisonData.product1.price.replace('SAR', '').replace('$', '').replace(',', '').trim()),
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
              currentPrice: parseFloat(comparisonData.product2.price.replace('SAR', '').replace('$', '').replace(',', '').trim()),
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
              currentPrice: parseFloat(comparisonData.product2.price.replace('SAR', '').replace('$', '').replace(',', '').trim()),
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