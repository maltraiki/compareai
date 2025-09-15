import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { safeJsonParse, formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, ExternalLink, Star, ShoppingBag, Trophy } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Product images mapping (in production, these would come from a database)
const productImages: { [key: string]: string } = {
  'iphone': 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop',
  'samsung': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
  'macbook': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop',
  'dell': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
  'ipad': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
  'surface': 'https://images.unsplash.com/photo-1575024357670-2b5164f470c3?w=400&h=400&fit=crop',
  'airpods': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop',
  'sony': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
  'pixel': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
  'oneplus': 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
};

function getProductImage(productName: string): string {
  const name = productName.toLowerCase();
  for (const [key, image] of Object.entries(productImages)) {
    if (name.includes(key)) {
      return image;
    }
  }
  // Default tech product image
  return 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
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
    const description = `Compare ${comparison.product1.name} and ${comparison.product2.name}. See detailed specifications, prices, pros & cons. Make an informed decision with CompareAI.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
      },
    };
  } catch (error) {
    return {
      title: 'CompareAI - Product Comparison',
    };
  }
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  
  let comparison;
  try {
    // Try to update view count
    try {
      await prisma.comparison.update({
        where: { slug },
        data: { 
          viewCount: { increment: 1 },
          lastViewed: new Date(),
        },
      });
    } catch (e) {
      // Ignore view count errors
    }

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
  const product1Image = getProductImage(comparison.product1.name);
  const product2Image = getProductImage(comparison.product2.name);

  // Determine winner based on price (in real app, this would be more sophisticated)
  const winner = comparison.product1.currentPrice && comparison.product2.currentPrice
    ? comparison.product1.currentPrice < comparison.product2.currentPrice ? 'product1' : 'product2'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Chat</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-purple-600">{comparison.viewCount}</span> people viewed this
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full mb-4">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-700">AI-Powered Comparison</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {comparison.product1.name} 
            <span className="text-purple-600 mx-4">vs</span>
            {comparison.product2.name}
          </h1>
          <p className="text-xl text-gray-600">
            Let our AI help you choose the perfect product for your needs
          </p>
        </div>

        {/* Quick Winner Badge */}
        {winner && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-bold text-gray-800">
                Best Value: {winner === 'product1' ? comparison.product1.name : comparison.product2.name}
              </span>
            </div>
          </div>
        )}

        {/* Product Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product 1 Card */}
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${winner === 'product1' ? 'ring-4 ring-green-400' : ''}`}>
            {winner === 'product1' && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 text-sm font-bold">
                🏆 BEST VALUE
              </div>
            )}
            <div className="p-8">
              <div className="aspect-square bg-gray-100 rounded-xl mb-6 overflow-hidden">
                <img 
                  src={product1Image} 
                  alt={comparison.product1.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{comparison.product1.name}</h2>
              <p className="text-gray-600 mb-4">{comparison.product1.brand}</p>
              
              {comparison.product1.currentPrice && (
                <div className="text-3xl font-bold text-green-600 mb-6">
                  {formatPrice(comparison.product1.currentPrice)}
                </div>
              )}

              {/* Pros */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Pros
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Premium build quality
                  </li>
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Excellent performance
                  </li>
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Great ecosystem
                  </li>
                </ul>
              </div>

              {/* Cons */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Cons
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    Higher price point
                  </li>
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    Limited customization
                  </li>
                </ul>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                View on Amazon
              </button>
            </div>
          </div>

          {/* Product 2 Card */}
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${winner === 'product2' ? 'ring-4 ring-green-400' : ''}`}>
            {winner === 'product2' && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 text-sm font-bold">
                🏆 BEST VALUE
              </div>
            )}
            <div className="p-8">
              <div className="aspect-square bg-gray-100 rounded-xl mb-6 overflow-hidden">
                <img 
                  src={product2Image} 
                  alt={comparison.product2.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{comparison.product2.name}</h2>
              <p className="text-gray-600 mb-4">{comparison.product2.brand}</p>
              
              {comparison.product2.currentPrice && (
                <div className="text-3xl font-bold text-green-600 mb-6">
                  {formatPrice(comparison.product2.currentPrice)}
                </div>
              )}

              {/* Pros */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Pros
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Great value for money
                  </li>
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Versatile features
                  </li>
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Good performance
                  </li>
                </ul>
              </div>

              {/* Cons */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Cons
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    Build quality could be better
                  </li>
                  <li className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    Limited support
                  </li>
                </ul>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                View on Amazon
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Specs Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Detailed Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">{comparison.product1.name}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">{comparison.product2.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Display</td>
                  <td className="py-3 px-4">6.1" OLED</td>
                  <td className="py-3 px-4">6.2" AMOLED</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Processor</td>
                  <td className="py-3 px-4">A17 Pro</td>
                  <td className="py-3 px-4">Snapdragon 8 Gen 3</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">RAM</td>
                  <td className="py-3 px-4">8GB</td>
                  <td className="py-3 px-4">12GB</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Storage</td>
                  <td className="py-3 px-4">256GB</td>
                  <td className="py-3 px-4">256GB</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Battery</td>
                  <td className="py-3 px-4">3,274 mAh</td>
                  <td className="py-3 px-4">5,000 mAh</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Alex's Expert Analysis
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Based on my analysis, both products are excellent choices, but they cater to different needs.
            </p>
            <p className="mb-4">
              <strong>{comparison.product1.name}</strong> is perfect if you value premium build quality and seamless ecosystem integration. 
              It's ideal for users who prioritize reliability and are willing to pay for the best experience.
            </p>
            <p>
              <strong>{comparison.product2.name}</strong> offers better value for money with more features at a lower price point. 
              It's great for power users who want flexibility and don't mind a slightly less polished experience.
            </p>
          </div>
        </div>

        {/* Chat CTA */}
        <div className="text-center bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-4">Need More Specific Advice?</h2>
          <p className="text-gray-600 mb-6">
            Chat with Alex to get personalized recommendations based on your exact needs
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <TrendingUp className="w-5 h-5" />
            Ask Alex for More Details
          </Link>
        </div>
      </main>
    </div>
  );
}