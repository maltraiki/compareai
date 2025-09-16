import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils';

export async function GET() {
  try {
    // Get the 10 most recent comparisons from database
    const comparisons = await prisma.comparison.findMany({
      take: 10,
      orderBy: [
        { lastViewed: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        product1: true,
        product2: true
      }
    });

    // Format the comparisons for the frontend
    const formattedComparisons = comparisons.map(comp => {
      const product1Images = safeJsonParse(comp.product1.images as any, []);
      const product2Images = safeJsonParse(comp.product2.images as any, []);
      
      return {
        slug: comp.slug,
        title: comp.title,
        product1: {
          name: comp.product1.name,
          image: product1Images[0] || '',
          price: comp.product1.currentPrice
        },
        product2: {
          name: comp.product2.name,
          image: product2Images[0] || '',
          price: comp.product2.currentPrice
        },
        viewCount: comp.viewCount,
        createdAt: comp.createdAt,
        lastViewed: comp.lastViewed
      };
    });

    return NextResponse.json({
      comparisons: formattedComparisons
    });

  } catch (error) {
    console.error('Recent comparisons error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent comparisons' },
      { status: 500 }
    );
  }
}