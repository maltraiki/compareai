import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { safeJsonParse, formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = await prisma.comparison.findUnique({
    where: { slug },
    include: {
      product1: true,
      product2: true,
    },
  });

  if (!comparison) {
    return {
      title: 'Comparison Not Found',
    };
  }

  const title = `${comparison.product1.name} vs ${comparison.product2.name} - Detailed Comparison ${new Date().getFullYear()}`;
  const description = `Compare ${comparison.product1.name} and ${comparison.product2.name}. See detailed specifications, prices, pros & cons. Make an informed decision with our AI-powered comparison.`;

  return {
    title,
    description,
    keywords: `${comparison.product1.name}, ${comparison.product2.name}, comparison, versus, review, specifications, price`,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: comparison.createdAt.toISOString(),
      modifiedTime: comparison.updatedAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/compare/${slug}`,
    },
  };
}

// Generate static params for known comparisons
export async function generateStaticParams() {
  try {
    const comparisons = await prisma.comparison.findMany({
      select: { slug: true },
      take: 100, // Pre-render top 100 comparisons
    });

    return comparisons.map((comparison) => ({
      slug: comparison.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    // Update view count
    await prisma.comparison.update({
      where: { slug },
      data: { 
        viewCount: { increment: 1 },
        lastViewed: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating view count:', error);
  }

  const comparison = await prisma.comparison.findUnique({
    where: { slug },
    include: {
      product1: true,
      product2: true,
    },
  });

  if (!comparison) {
    notFound();
  }

  const product1Specs = safeJsonParse(comparison.product1.specifications, {});
  const product2Specs = safeJsonParse(comparison.product2.specifications, {});
  const product1Links = safeJsonParse(comparison.product1.affiliateLinks, {});
  const product2Links = safeJsonParse(comparison.product2.affiliateLinks, {});

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: comparison.title,
    description: `Comparison between ${comparison.product1.name} and ${comparison.product2.name}`,
    offers: [
      {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: Math.min(comparison.product1.currentPrice || 0, comparison.product2.currentPrice || 0),
        highPrice: Math.max(comparison.product1.currentPrice || 0, comparison.product2.currentPrice || 0),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Chat</span>
              </Link>
              <div className="text-sm text-gray-500">
                {comparison.viewCount} views
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {comparison.product1.name} vs {comparison.product2.name}
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive comparison to help you make the right choice
            </p>
          </div>

          {/* Quick Overview Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Product 1 Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">{comparison.product1.name}</h2>
                  <p className="text-gray-600">{comparison.product1.brand}</p>
                </div>
                {comparison.product1.currentPrice && (
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(comparison.product1.currentPrice)}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-700">Key Features:</h3>
                {Object.entries(product1Specs).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>

              {Object.keys(product1Links).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(product1Links).map(([store, link]) => (
                    <a
                      key={store}
                      href={String(link)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View on {store}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Product 2 Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">{comparison.product2.name}</h2>
                  <p className="text-gray-600">{comparison.product2.brand}</p>
                </div>
                {comparison.product2.currentPrice && (
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(comparison.product2.currentPrice)}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-700">Key Features:</h3>
                {Object.entries(product2Specs).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>

              {Object.keys(product2Links).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(product2Links).map(([store, link]) => (
                    <a
                      key={store}
                      href={String(link)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View on {store}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Detailed Specifications</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-left py-2 px-4">{comparison.product1.name}</th>
                    <th className="text-left py-2 px-4">{comparison.product2.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Combine all unique specs */}
                  {Array.from(new Set([...Object.keys(product1Specs), ...Object.keys(product2Specs)])).map((key) => (
                    <tr key={key} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{key}</td>
                      <td className="py-2 px-4">
                        {product1Specs[key] ? (
                          <span className="flex items-center gap-1">
                            {String(product1Specs[key])}
                            {product1Specs[key] === product2Specs[key] && (
                              <span className="text-gray-400">=</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {product2Specs[key] ? (
                          <span>{String(product2Specs[key])}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Analysis Section */}
          {comparison.seoContent && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Expert Analysis</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{comparison.seoContent}</p>
              </div>
            </div>
          )}

          {/* Quick Decision Helper */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Decision Guide</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <CheckCircle className="text-green-600" />
                  Choose {comparison.product1.name} if:
                </h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• You prefer {comparison.product1.brand} ecosystem</li>
                  <li>• Budget is around {comparison.product1.currentPrice && formatPrice(comparison.product1.currentPrice)}</li>
                  <li>• You need specific features it offers</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <CheckCircle className="text-green-600" />
                  Choose {comparison.product2.name} if:
                </h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• You prefer {comparison.product2.brand} ecosystem</li>
                  <li>• Budget is around {comparison.product2.currentPrice && formatPrice(comparison.product2.currentPrice)}</li>
                  <li>• You need specific features it offers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chat CTA */}
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Get personalized recommendations from our AI assistant
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <TrendingUp className="w-5 h-5" />
              Ask AI for More Details
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}