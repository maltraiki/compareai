import { NextRequest, NextResponse } from 'next/server';
import { geminiModel, SYSTEM_PROMPTS } from '@/lib/gemini';

// Function to search for product images using Google Custom Search or fallback
async function getProductImage(productName: string): Promise<string> {
  // For now, using high-quality stock photos
  // In production, you'd use Google Custom Search API or similar
  const productImages: { [key: string]: string } = {
    'iphone 15': 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&h=600&fit=crop',
    'samsung': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop',
    'macbook': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=600&fit=crop',
    'dell': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop',
    'ipad': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
    'airpods': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=600&fit=crop',
    'sony': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=600&fit=crop',
    'pixel': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop',
  };

  const nameLower = productName.toLowerCase();
  for (const [key, image] of Object.entries(productImages)) {
    if (nameLower.includes(key)) {
      return image;
    }
  }
  
  // Default tech product image
  return 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop';
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    // Extract product names from query
    let product1Name = '';
    let product2Name = '';
    
    const vsMatch = query.match(/(.+?)\s+(?:vs\.?|versus)\s+(.+)/i) ||
                    query.match(/compare\s+(.+?)\s+(?:and|with|to)\s+(.+)/i);
    
    if (vsMatch) {
      product1Name = vsMatch[1].trim();
      product2Name = vsMatch[2].trim();
    } else {
      // Default if can't parse
      product1Name = 'Product 1';
      product2Name = 'Product 2';
    }

    // Create a detailed prompt for Gemini
    const prompt = `You are MT, a product comparison expert. Compare ${product1Name} vs ${product2Name}.

    Provide a detailed comparison in the following JSON format (be specific and use real data):
    {
      "product1": {
        "name": "${product1Name}",
        "price": "actual price in USD",
        "rating": 4.5,
        "pros": ["3 specific pros"],
        "cons": ["3 specific cons"],
        "specs": {
          "Display": "specific size and type",
          "Processor": "specific model",
          "Storage": "specific options",
          "Camera": "specific details",
          "Battery": "specific capacity"
        }
      },
      "product2": {
        "name": "${product2Name}",
        "price": "actual price in USD",
        "rating": 4.3,
        "pros": ["3 specific pros"],
        "cons": ["3 specific cons"],
        "specs": {
          "Display": "specific size and type",
          "Processor": "specific model",
          "Storage": "specific options",
          "Camera": "specific details",
          "Battery": "specific capacity"
        }
      },
      "verdict": "A clear, concise verdict in 1-2 sentences about which is better overall",
      "recommendation": "MT's personalized recommendation on who should buy which product and why (2-3 sentences)"
    }
    
    Provide ONLY valid JSON, no markdown or explanation.`;

    // Get comparison from Gemini
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up the response to get valid JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let comparisonData;
    
    try {
      comparisonData = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
    } catch {
      // Fallback data if parsing fails
      comparisonData = {
        product1: {
          name: product1Name,
          price: '$999',
          rating: 4.5,
          pros: ['Excellent build quality', 'Great performance', 'Premium features'],
          cons: ['High price', 'Limited customization', 'Proprietary ecosystem'],
          specs: {
            'Display': '6.1-inch OLED',
            'Processor': 'Latest flagship chip',
            'Storage': '128GB - 1TB',
            'Camera': 'Triple-lens system',
            'Battery': 'All-day battery life'
          }
        },
        product2: {
          name: product2Name,
          price: '$899',
          rating: 4.3,
          pros: ['More affordable', 'Flexible ecosystem', 'Expandable storage'],
          cons: ['Less premium feel', 'Inconsistent updates', 'More bloatware'],
          specs: {
            'Display': '6.2-inch AMOLED',
            'Processor': 'High-end chip',
            'Storage': '256GB expandable',
            'Camera': 'Versatile camera system',
            'Battery': 'Fast charging support'
          }
        },
        verdict: `Both are excellent choices, but ${product1Name} offers a more refined experience while ${product2Name} provides better value.`,
        recommendation: `Choose ${product1Name} if you want the best overall experience and ecosystem. Choose ${product2Name} if you want more features for less money and prefer customization options.`
      };
    }

    // Get product images
    const [image1, image2] = await Promise.all([
      getProductImage(product1Name),
      getProductImage(product2Name)
    ]);

    // Add images to the response
    comparisonData.product1.image = image1;
    comparisonData.product2.image = image2;

    return NextResponse.json(comparisonData);

  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}