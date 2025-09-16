import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid query' },
        { status: 400 }
      );
    }
    
    // Enhanced prompt for MT to also suggest image searches
    const prompt = `You are MT, a highly experienced personal technology advisor with deep knowledge of the latest tech products and their official product images.
    
    User Query: "${query}"
    
    Analyze this query and provide a detailed comparison. If the user mentions specific products, compare those. 
    If they ask general questions, identify the two best options to compare.
    
    IMPORTANT: Provide ONLY valid JSON in this exact format with realistic, current market data.
    For images, provide the EXACT official product image URL from the manufacturer's website or a reliable source:
    
    {
      "product1": {
        "name": "Exact product name with model",
        "image": "https://... (actual product image URL or manufacturer website image)",
        "price": "$X,XXX",
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
        "image": "https://... (actual product image URL or manufacturer website image)",
        "price": "$X,XXX",
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
    
    For the image field, provide actual product image URLs. Some reliable sources:
    - Apple products: Use images from apple.com
    - Samsung products: Use images from samsung.com
    - Google products: Use images from store.google.com
    - Dell products: Use images from dell.com
    - Sony products: Use images from sony.com
    
    If you cannot find the exact manufacturer URL, use a high-quality product image from a reputable tech site.
    
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

    // Validate and fix image URLs if needed
    // If the AI didn't provide valid image URLs, use fallback images based on product name
    if (!comparisonData.product1.image || !comparisonData.product1.image.startsWith('http')) {
      // Generate fallback based on product name
      const product1Name = comparisonData.product1.name.toLowerCase();
      if (product1Name.includes('iphone')) {
        comparisonData.product1.image = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=800&hei=600&fmt=jpeg&qlt=90';
      } else if (product1Name.includes('samsung') || product1Name.includes('galaxy')) {
        comparisonData.product1.image = 'https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-s928-sm-s928bzkcmea-thumb-539305789?$800_800_PNG$';
      } else if (product1Name.includes('macbook')) {
        comparisonData.product1.image = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=800&hei=600&fmt=jpeg&qlt=90';
      } else if (product1Name.includes('dell') || product1Name.includes('xps')) {
        comparisonData.product1.image = 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/13-9315/media-gallery/notebook-xps-13-9315-gray-gallery-3.psd?fmt=png-alpha&pscan=auto&scl=1&hei=600&wid=800';
      } else if (product1Name.includes('pixel')) {
        comparisonData.product1.image = 'https://lh3.googleusercontent.com/H6dMPybfzUccvpGcHZ0g1TmJPLh0IsD7cy9zWXJqnRk0XL9zWY6FR6h8NBQqF8g6OKc5usxVOSm7cZJJDBLWX0yZN7sKQfCO2A=rw-e365-w800-h600';
      } else if (product1Name.includes('airpods')) {
        comparisonData.product1.image = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=800&hei=600&fmt=jpeg&qlt=90';
      } else if (product1Name.includes('sony')) {
        comparisonData.product1.image = 'https://www.sony.com/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=800&hei=600';
      } else {
        comparisonData.product1.image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop';
      }
    }

    if (!comparisonData.product2.image || !comparisonData.product2.image.startsWith('http')) {
      // Generate fallback based on product name
      const product2Name = comparisonData.product2.name.toLowerCase();
      if (product2Name.includes('iphone')) {
        comparisonData.product2.image = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=800&hei=600&fmt=jpeg&qlt=90';
      } else if (product2Name.includes('samsung') || product2Name.includes('galaxy')) {
        comparisonData.product2.image = 'https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-s928-sm-s928bzkcmea-thumb-539305789?$800_800_PNG$';
      } else if (product2Name.includes('macbook')) {
        comparisonData.product2.image = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-20220606?wid=800&hei=600&fmt=jpeg&qlt=90';
      } else if (product2Name.includes('dell') || product2Name.includes('xps')) {
        comparisonData.product2.image = 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-gray-gallery-3.psd?fmt=png-alpha&pscan=auto&scl=1&hei=600&wid=800';
      } else if (product2Name.includes('pixel')) {
        comparisonData.product2.image = 'https://lh3.googleusercontent.com/KJrGx0suUU8xQQYH3kdjKg-FuGPWaHmJquU8TyYBPvGJYZ9nPMgKQW8e8g6nMQ35Y5RBQ6OuRHZhPBhkWt6H1vqPeWwHh5mbow=rw-e365-w800-h600';
      } else if (product2Name.includes('airpods')) {
        comparisonData.product2.image = 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-3-witb-202110?wid=800&hei=600&fmt=jpeg&qlt=90';
      } else if (product2Name.includes('sony')) {
        comparisonData.product2.image = 'https://www.sony.com/image/aeed6e8bf7e2d4f3ea09c57e4ac990f9?fmt=pjpeg&wid=800&hei=600';
      } else {
        comparisonData.product2.image = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=600&fit=crop';
      }
    }

    // Ensure prices are properly formatted
    if (comparisonData.product1.price && !comparisonData.product1.price.startsWith('$')) {
      comparisonData.product1.price = '$' + comparisonData.product1.price;
    }
    if (comparisonData.product2.price && !comparisonData.product2.price.startsWith('$')) {
      comparisonData.product2.price = '$' + comparisonData.product2.price;
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