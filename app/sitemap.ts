import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Get all comparisons from database
  const comparisons = await prisma.comparison.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      viewCount: 'desc',
    },
  });

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      lastUpdated: true,
    },
  });

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Add comparison pages
  comparisons.forEach((comparison) => {
    sitemapEntries.push({
      url: `${baseUrl}/compare/${comparison.slug}`,
      lastModified: comparison.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Add product pages (for future)
  products.forEach((product) => {
    sitemapEntries.push({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  return sitemapEntries;
}