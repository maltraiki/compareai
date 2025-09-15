import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { product1Name, product2Name, product1Data, product2Data } = await request.json();

    // Generate slug
    const slug = `${product1Name.toLowerCase().replace(/\s+/g, '-')}-vs-${product2Name.toLowerCase().replace(/\s+/g, '-')}`;

    // Check if comparison already exists
    const existingComparison = await prisma.comparison.findUnique({
      where: { slug },
    });

    if (existingComparison) {
      // Increment view count
      await prisma.comparison.update({
        where: { id: existingComparison.id },
        data: { viewCount: { increment: 1 } },
      });
      return NextResponse.json({ slug, isNew: false });
    }

    // Find or create products
    let product1 = await prisma.product.findFirst({
      where: { name: product1Name },
    });

    if (!product1) {
      product1 = await prisma.product.create({
        data: {
          name: product1Name,
          category: 'Electronics',
          brand: product1Data.brand || product1Name.split(' ')[0],
          price: product1Data.price || 999,
          image: product1Data.image || '📱',
          description: `${product1Name} - Premium device`,
          affiliateLink: `https://amzn.to/example-${product1Name.toLowerCase().replace(/\s+/g, '-')}`,
          specifications: product1Data.specs || {},
          pros: product1Data.pros || ['Great performance', 'Premium build', 'Excellent display'],
          cons: product1Data.cons || ['Premium pricing', 'Limited customization'],
        },
      });
    }

    let product2 = await prisma.product.findFirst({
      where: { name: product2Name },
    });

    if (!product2) {
      product2 = await prisma.product.create({
        data: {
          name: product2Name,
          category: 'Electronics',
          brand: product2Data.brand || product2Name.split(' ')[0],
          price: product2Data.price || 999,
          image: product2Data.image || '📱',
          description: `${product2Name} - Premium device`,
          affiliateLink: `https://amzn.to/example-${product2Name.toLowerCase().replace(/\s+/g, '-')}`,
          specifications: product2Data.specs || {},
          pros: product2Data.pros || ['Great value', 'Good performance', 'Versatile features'],
          cons: product2Data.cons || ['Average build', 'Limited support'],
        },
      });
    }

    // Create comparison
    const comparison = await prisma.comparison.create({
      data: {
        slug,
        product1Id: product1.id,
        product2Id: product2.id,
        viewCount: 1,
        winner: product1Data.winner ? 'product1' : product2Data.winner ? 'product2' : 'tie',
        analysis: `Detailed comparison between ${product1Name} and ${product2Name}. Both devices offer excellent features for their respective price points.`,
      },
    });

    return NextResponse.json({ slug, isNew: true });
  } catch (error) {
    console.error('Error creating comparison:', error);
    return NextResponse.json(
      { error: 'Failed to create comparison' },
      { status: 500 }
    );
  }
}