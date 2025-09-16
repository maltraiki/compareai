import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { generateComparisonSlug, jsonStringify } from '@/lib/utils';
import { getProductFromAnywhere } from '@/lib/product-apis';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid query' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Hybrid Compare - Query:', query);
    
    // Step 1: Parse the query to extract product names
    const products = extractProductNames(query);
    
    if (products.length < 2) {
      return NextResponse.json(
        { error: 'Please specify two products to compare' },
        { status: 400 }
      );
    }
    
    // Step 2: Get REAL product data from APIs/scraping
    console.log('📦 Fetching real product data...');
    const [product1Data, product2Data] = await Promise.all([
      getProductFromAnywhere(products[0]),
      getProductFromAnywhere(products[1])
    ]);
    
    // Check if we got real data
    if (!product1Data || !product2Data) {
      return NextResponse.json({
        error: 'Unable to fetch product data',
        message: 'Could not find real product information. Try using more specific product names.',
        attempted: products
      }, { status: 404 });
    }
    
    // Step 3: Use LLM ONLY for comparison analysis (not for product data)
    console.log('🤖 Getting comparison analysis from LLM...');
    const comparisonPrompt = `
    You are MT, a technology advisor. Analyze and compare these two products.
    
    Product 1: ${product1Data.name}
    - Price: ${product1Data.price}
    - Source: ${product1Data.source}
    ${product1Data.description ? `- Description: ${product1Data.description}` : ''}
    
    Product 2: ${product2Data.name}  
    - Price: ${product2Data.price}
    - Source: ${product2Data.source}
    ${product2Data.description ? `- Description: ${product2Data.description}` : ''}
    
    Provide ONLY the comparison analysis in this JSON format:
    {
      "verdict": "2-3 sentence comparison verdict",
      "recommendation": "3-4 sentence personalized recommendation",
      "product1_pros": ["advantage 1", "advantage 2", "advantage 3"],
      "product1_cons": ["disadvantage 1", "disadvantage 2"],
      "product2_pros": ["advantage 1", "advantage 2", "advantage 3"],
      "product2_cons": ["disadvantage 1", "disadvantage 2"],
      "best_for": {
        "product1": "Who should buy product 1",
        "product2": "Who should buy product 2"
      }
    }
    
    Base your analysis on general knowledge about these product categories.
    Do NOT make up specifications or prices - only provide comparative analysis.
    `;
    
    let analysisData;
    try {
      const result = await geminiModel.generateContent(comparisonPrompt);
      const responseText = result.response.text();
      
      // Parse LLM analysis
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('LLM analysis failed:', error);
      // Provide basic analysis if LLM fails
      analysisData = {
        verdict: "Both products have their strengths. Compare prices and features to decide.",
        recommendation: "Choose based on your specific needs and budget.",
        product1_pros: ["Check product reviews"],
        product1_cons: ["Compare with alternatives"],
        product2_pros: ["Check product reviews"],
        product2_cons: ["Compare with alternatives"],
        best_for: {
          product1: "Users who prefer this brand",
          product2: "Users who prefer this brand"
        }
      };
    }
    
    // Step 4: Combine real data with LLM analysis
    const comparisonData = {
      product1: {
        name: product1Data.name,
        image: product1Data.image || '/placeholder.png',
        price: product1Data.price || 'Check retailer',
        rating: 4.0, // Default rating
        pros: analysisData.product1_pros || [],
        cons: analysisData.product1_cons || [],
        specs: product1Data.specs || {},
        source: product1Data.source,
        inStock: product1Data.inStock
      },
      product2: {
        name: product2Data.name,
        image: product2Data.image || '/placeholder.png',
        price: product2Data.price || 'Check retailer',
        rating: 4.0, // Default rating
        pros: analysisData.product2_pros || [],
        cons: analysisData.product2_cons || [],
        specs: product2Data.specs || {},
        source: product2Data.source,
        inStock: product2Data.inStock
      },
      verdict: analysisData.verdict,
      recommendation: analysisData.recommendation,
      best_for: analysisData.best_for,
      data_sources: {
        product_data: 'Real-time from retailers',
        analysis: 'AI-powered comparison'
      }
    };
    
    // Step 5: Save to database (optional)
    try {
      const slug = generateComparisonSlug(product1Data.name, product2Data.name);
      
      await prisma.comparison.create({
        data: {
          slug,
          title: `${product1Data.name} vs ${product2Data.name}`,
          product1Id: 'temp-id-1', // You'd create products properly
          product2Id: 'temp-id-2',
          seoContent: `${analysisData.verdict} ${analysisData.recommendation}`,
          conversation: jsonStringify({
            query,
            verdict: analysisData.verdict,
            recommendation: analysisData.recommendation
          })
        }
      });
      
      comparisonData.slug = slug;
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if save fails
    }
    
    return NextResponse.json(comparisonData);
    
  } catch (error) {
    console.error('Hybrid compare error:', error);
    return NextResponse.json(
      { 
        error: 'Comparison failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Extract product names from query
function extractProductNames(query: string): string[] {
  const products = [];
  
  // Common patterns
  const patterns = [
    /compare\s+(.+?)\s+(?:vs|versus|and|with)\s+(.+)/i,
    /(.+?)\s+(?:vs|versus)\s+(.+)/i,
    /(.+?)\s+or\s+(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      products.push(match[1].trim(), match[2].trim());
      break;
    }
  }
  
  // If no pattern matched, try to split by common separators
  if (products.length === 0) {
    const parts = query.split(/\s+(?:vs|versus|and|or)\s+/i);
    if (parts.length >= 2) {
      products.push(parts[0].trim(), parts[1].trim());
    }
  }
  
  return products;
}