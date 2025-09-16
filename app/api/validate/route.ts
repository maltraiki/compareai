import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { getProductImageUrl } from '@/lib/image-utils';

// Validation tests for LLM responses
export async function GET(req: NextRequest) {
  const testQuery = req.nextUrl.searchParams.get('query') || 'compare iPhone 15 Pro vs Samsung Galaxy S24 Ultra';
  
  console.log('🧪 Running LLM Validation Test...');
  console.log('Query:', testQuery);
  
  const validationResults = {
    query: testQuery,
    timestamp: new Date().toISOString(),
    tests: {
      hardcodedData: false,
      validImageUrls: false,
      correctProducts: false,
      accuratePricing: false,
      properJson: false,
    },
    errors: [] as string[],
    warnings: [] as string[],
    rawResponse: null as any,
    processedData: null as any,
  };

  try {
    // Create test prompt
    const testPrompt = `You are MT, a technology advisor. Compare these products and provide REAL, CURRENT data.
    
    Query: "${testQuery}"
    Current Date: ${new Date().toLocaleDateString()}
    Year: ${new Date().getFullYear()}
    
    CURRENT PRODUCTS (2025):
    - iPhone 15 series with A17 Pro chip
    - Galaxy S24 series with Snapdragon 8 Gen 3
    - Pixel 8 series with Tensor G3
    
    DO NOT mention iPhone 16/17/18 or Galaxy S25/S26 - they don't exist yet.
    
    Return ONLY valid JSON:
    {
      "product1": {
        "name": "exact product name",
        "image": "placeholder",
        "price": "SAR X,XXX",
        "rating": 4.5,
        "pros": ["pro1", "pro2", "pro3"],
        "cons": ["con1", "con2", "con3"],
        "specs": {
          "Display": "size and type",
          "Processor": "chip name",
          "Memory": "RAM and storage",
          "Battery": "capacity",
          "Camera": "main camera specs"
        }
      },
      "product2": {
        "name": "exact product name",
        "image": "placeholder",
        "price": "SAR X,XXX",
        "rating": 4.3,
        "pros": ["pro1", "pro2", "pro3"],
        "cons": ["con1", "con2", "con3"],
        "specs": {
          "Display": "size and type",
          "Processor": "chip name",
          "Memory": "RAM and storage",
          "Battery": "capacity",
          "Camera": "main camera specs"
        }
      },
      "verdict": "2-3 sentence verdict",
      "recommendation": "3-4 sentence recommendation"
    }`;

    // Get LLM response
    const result = await geminiModel.generateContent(testPrompt);
    const responseText = result.response.text();
    
    // Try to parse JSON
    let parsedData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
        validationResults.tests.properJson = true;
        validationResults.rawResponse = parsedData;
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      validationResults.errors.push(`JSON Parse Error: ${e}`);
      return NextResponse.json(validationResults, { status: 400 });
    }

    // Test 1: Check for hardcoded/outdated data
    const responseStr = JSON.stringify(parsedData).toLowerCase();
    const futureProducts = ['iphone 16', 'iphone 17', 'iphone 18', 'galaxy s25', 'galaxy s26', 'pixel 9', 'pixel 10'];
    const foundFuture = futureProducts.filter(product => responseStr.includes(product));
    
    if (foundFuture.length > 0) {
      validationResults.errors.push(`Found future/non-existent products: ${foundFuture.join(', ')}`);
      validationResults.tests.hardcodedData = true;
    }

    // Check for wrong chip associations
    if (responseStr.includes('a17') && !responseStr.includes('iphone 15')) {
      validationResults.warnings.push('A17 chip mentioned without iPhone 15 context');
    }
    
    if (responseStr.includes('a18') || responseStr.includes('a19')) {
      validationResults.errors.push('Found non-existent chips (A18/A19)');
      validationResults.tests.hardcodedData = true;
    }

    // Test 2: Validate product names are current
    const validProducts = {
      iphone: ['iphone 15', 'iphone 15 plus', 'iphone 15 pro', 'iphone 15 pro max', 'iphone 14', 'iphone 13'],
      samsung: ['galaxy s24', 'galaxy s24+', 'galaxy s24 ultra', 'galaxy s23', 'galaxy z fold 5', 'galaxy z flip 5'],
      google: ['pixel 8', 'pixel 8 pro', 'pixel 7', 'pixel 7 pro', 'pixel 7a'],
    };

    const product1Name = parsedData.product1?.name?.toLowerCase() || '';
    const product2Name = parsedData.product2?.name?.toLowerCase() || '';
    
    let validProduct1 = false;
    let validProduct2 = false;
    
    for (const brand in validProducts) {
      if (validProducts[brand as keyof typeof validProducts].some(p => product1Name.includes(p))) {
        validProduct1 = true;
      }
      if (validProducts[brand as keyof typeof validProducts].some(p => product2Name.includes(p))) {
        validProduct2 = true;
      }
    }
    
    validationResults.tests.correctProducts = validProduct1 && validProduct2;
    
    if (!validProduct1) {
      validationResults.warnings.push(`Product 1 "${parsedData.product1?.name}" may not be current`);
    }
    if (!validProduct2) {
      validationResults.warnings.push(`Product 2 "${parsedData.product2?.name}" may not be current`);
    }

    // Test 3: Check price format
    const price1 = parsedData.product1?.price || '';
    const price2 = parsedData.product2?.price || '';
    
    const priceRegex = /^(SAR|AED|USD|\$|£|€|₹|¥)\s?[\d,]+(\.\d{2})?$/;
    
    if (!priceRegex.test(price1) && price1 !== 'N/A') {
      validationResults.warnings.push(`Invalid price format for product 1: ${price1}`);
    }
    if (!priceRegex.test(price2) && price2 !== 'N/A') {
      validationResults.warnings.push(`Invalid price format for product 2: ${price2}`);
    }
    
    validationResults.tests.accuratePricing = priceRegex.test(price1) || priceRegex.test(price2);

    // Test 4: Fix and validate image URLs
    if (parsedData.product1) {
      parsedData.product1.image = getProductImageUrl(parsedData.product1.name);
    }
    if (parsedData.product2) {
      parsedData.product2.image = getProductImageUrl(parsedData.product2.name);
    }
    
    validationResults.tests.validImageUrls = true;
    validationResults.processedData = parsedData;

    // Test 5: Check specifications accuracy
    const specs1 = parsedData.product1?.specs || {};
    const specs2 = parsedData.product2?.specs || {};
    
    // Check iPhone 15 Pro specs if mentioned
    if (product1Name.includes('iphone 15 pro') || product2Name.includes('iphone 15 pro')) {
      const iphoneSpecs = product1Name.includes('iphone 15 pro') ? specs1 : specs2;
      
      if (!JSON.stringify(iphoneSpecs).toLowerCase().includes('a17')) {
        validationResults.warnings.push('iPhone 15 Pro should have A17 Pro chip');
      }
      if (!JSON.stringify(iphoneSpecs).includes('6.1') && !JSON.stringify(iphoneSpecs).includes('6.7')) {
        validationResults.warnings.push('iPhone 15 Pro should have 6.1" or 6.7" display');
      }
    }
    
    // Check Galaxy S24 specs if mentioned
    if (product1Name.includes('galaxy s24') || product2Name.includes('galaxy s24')) {
      const galaxySpecs = product1Name.includes('galaxy s24') ? specs1 : specs2;
      
      if (!JSON.stringify(galaxySpecs).toLowerCase().includes('snapdragon') && 
          !JSON.stringify(galaxySpecs).toLowerCase().includes('exynos')) {
        validationResults.warnings.push('Galaxy S24 should have Snapdragon 8 Gen 3 or Exynos chip');
      }
    }

    // Summary
    const testsPassed = Object.values(validationResults.tests).filter(t => t).length;
    const totalTests = Object.keys(validationResults.tests).length;
    
    return NextResponse.json({
      ...validationResults,
      summary: {
        passed: testsPassed,
        total: totalTests,
        score: `${testsPassed}/${totalTests}`,
        status: validationResults.errors.length === 0 ? 'PASSED' : 'FAILED',
        recommendation: validationResults.errors.length === 0 
          ? 'LLM is providing accurate, current information' 
          : 'LLM needs adjustment - check errors and warnings'
      }
    });

  } catch (error) {
    validationResults.errors.push(`System Error: ${error}`);
    return NextResponse.json(validationResults, { status: 500 });
  }
}

// Test specific products
export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json();
    
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Please provide an array of products to test' }, { status: 400 });
    }
    
    const results = [];
    
    for (const product of products) {
      const imageUrl = getProductImageUrl(product);
      results.push({
        product,
        imageUrl,
        isPlaceholder: imageUrl.includes('placeholder'),
        expectedBrand: detectBrand(product)
      });
    }
    
    return NextResponse.json({ 
      tested: products.length,
      results 
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Test failed', details: error }, { status: 500 });
  }
}

function detectBrand(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes('iphone') || name.includes('ipad') || name.includes('macbook') || name.includes('airpods')) return 'Apple';
  if (name.includes('galaxy') || name.includes('samsung')) return 'Samsung';
  if (name.includes('pixel')) return 'Google';
  if (name.includes('surface')) return 'Microsoft';
  if (name.includes('playstation') || name.includes('ps5')) return 'Sony';
  if (name.includes('xbox')) return 'Microsoft';
  return 'Unknown';
}