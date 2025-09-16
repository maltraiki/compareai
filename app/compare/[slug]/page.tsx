import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils';
import { Star, CheckCircle, XCircle, TrendingUp, Shield, Sparkles, Eye, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

  return {
    title: `${comparison.title} - MT TechAdvisor`,
    description: comparison.seoContent || `Compare ${comparison.product1.name} vs ${comparison.product2.name}. Get expert analysis, real prices, pros & cons from MT TechAdvisor.`,
    keywords: `${comparison.product1.name}, ${comparison.product2.name}, comparison, review, tech, MT TechAdvisor`,
    openGraph: {
      title: comparison.title,
      description: comparison.seoContent || `Expert comparison of ${comparison.product1.name} vs ${comparison.product2.name}`,
      type: 'article',
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
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

  // Update view count
  await prisma.comparison.update({
    where: { slug },
    data: {
      viewCount: { increment: 1 },
      lastViewed: new Date(),
    },
  });

  // Parse JSON data
  const product1Images = safeJsonParse(comparison.product1.images, []);
  const product2Images = safeJsonParse(comparison.product2.images, []);
  const product1Specs = safeJsonParse(comparison.product1.specifications, {});
  const product2Specs = safeJsonParse(comparison.product2.specifications, {});
  const product1Pros = safeJsonParse(comparison.product1.pros, []);
  const product1Cons = safeJsonParse(comparison.product1.cons, []);
  const product2Pros = safeJsonParse(comparison.product2.pros, []);
  const product2Cons = safeJsonParse(comparison.product2.cons, []);
  const conversation = safeJsonParse(comparison.conversation, {});

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <ArrowLeft className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">MT TechAdvisor</h1>
                  <p className="text-sm text-purple-300">Your Personal Technology Expert</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{comparison.viewCount + 1} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(comparison.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {comparison.title}
          </h1>
          <p className="text-xl text-gray-300">
            Expert comparison and recommendation from MT TechAdvisor
          </p>
        </div>

        {/* MT's Verdict */}
        {conversation.verdict && (
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">MT's Expert Analysis</h3>
                <p className="text-lg text-gray-300 leading-relaxed">{conversation.verdict}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Product 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
            <div className="relative h-64 bg-gradient-to-br from-purple-600/20 to-blue-600/20">
              <img 
                src={product1Images[0] || ''} 
                alt={comparison.product1.name}
                className="w-full h-full object-contain p-4 pointer-events-none select-none"
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl font-bold text-white">SAR {comparison.product1.currentPrice}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-3">{comparison.product1.name}</h3>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-gray-400">(4.5/5)</span>
              </div>

              {/* Pros */}
              {product1Pros.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-400 mb-3 text-sm uppercase tracking-wider">Advantages</h4>
                  {product1Pros.map((pro: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{pro}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cons */}
              {product1Cons.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-red-400 mb-3 text-sm uppercase tracking-wider">Limitations</h4>
                  {product1Cons.map((con: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{con}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Specs */}
              {Object.keys(product1Specs).length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-semibold text-purple-400 mb-3 text-sm uppercase tracking-wider">Key Specifications</h4>
                  <div className="space-y-2">
                    {Object.entries(product1Specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-300 font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
            <div className="relative h-64 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
              <img 
                src={product2Images[0] || ''} 
                alt={comparison.product2.name}
                className="w-full h-full object-contain p-4 pointer-events-none select-none"
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl font-bold text-white">SAR {comparison.product2.currentPrice}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-3">{comparison.product2.name}</h3>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-gray-400">(4.3/5)</span>
              </div>

              {/* Pros */}
              {product2Pros.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-400 mb-3 text-sm uppercase tracking-wider">Advantages</h4>
                  {product2Pros.map((pro: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{pro}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cons */}
              {product2Cons.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-red-400 mb-3 text-sm uppercase tracking-wider">Limitations</h4>
                  {product2Cons.map((con: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{con}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Specs */}
              {Object.keys(product2Specs).length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-semibold text-purple-400 mb-3 text-sm uppercase tracking-wider">Key Specifications</h4>
                  <div className="space-y-2">
                    {Object.entries(product2Specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-300 font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Final Recommendation */}
        {conversation.recommendation && (
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md rounded-2xl border border-green-500/30 p-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">My Personal Recommendation</h3>
                <p className="text-lg text-gray-300 leading-relaxed">{conversation.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-semibold"
          >
            <Sparkles className="w-5 h-5" />
            Compare More Products
          </Link>
        </div>
      </div>
    </main>
  );
}