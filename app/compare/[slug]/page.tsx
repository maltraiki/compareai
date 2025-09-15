import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { safeJsonParse, formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  
  let comparison;
  try {
    comparison = await prisma.comparison.findUnique({
      where: { slug },
      include: {
        product1: true,
        product2: true,
      },
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    notFound();
  }

  if (!comparison) {
    notFound();
  }

  const product1Specs = safeJsonParse(comparison.product1.specifications, {});
  const product2Specs = safeJsonParse(comparison.product2.specifications, {});

  return (
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
  );
}