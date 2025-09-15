import { ChatInterface } from '@/components/ChatInterface';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { TrendingUp, Users, Clock, Star, ShieldCheck, Zap, Trophy, DollarSign } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata: Metadata = {
  title: 'CompareAI - Your Personal Shopping Expert | Save Money on Every Purchase',
  description: 'Get instant AI-powered product comparisons from Alex, your personal shopping expert. Compare phones, laptops, tablets and save thousands. Trusted by 50,000+ happy shoppers!',
  keywords: 'product comparison, shopping expert, compare products, save money, best deals, iPhone vs Samsung, MacBook vs Dell, shopping assistant',
  openGraph: {
    title: 'CompareAI - Your Personal Shopping Expert',
    description: 'Save money with AI-powered product comparisons. Your personal shopping expert is here to help!',
    type: 'website',
  },
};

async function getPopularComparisons() {
  const comparisons = await prisma.comparison.findMany({
    take: 6,
    orderBy: {
      viewCount: 'desc',
    },
    include: {
      product1: true,
      product2: true,
    },
  });
  return comparisons;
}

async function getRecentComparisons() {
  const comparisons = await prisma.comparison.findMany({
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      product1: true,
      product2: true,
    },
  });
  return comparisons;
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const [popularComparisons, recentComparisons] = await Promise.all([
    getPopularComparisons(),
    getRecentComparisons(),
  ]);
  
  const isRTL = locale === 'ar';

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{t('header.title')}</h1>
                <p className="text-xs text-purple-600 font-medium">{t('header.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">{t('chat.online')}</span>
              </div>
              <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-purple-700">4.9/5</span>
                <span className="text-xs text-purple-600">{t('header.reviews')}</span>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full mb-4">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-700">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
            <br />
            <span className="text-gray-800">{t('hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto font-medium">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-700">{t('hero.instantAnalysis')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-700">{t('hero.bestPrices')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-700">{t('hero.unbiasedAdvice')}</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="mb-16">
          <ChatInterface />
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border-2 border-purple-100">
            <div className="text-3xl font-bold text-purple-600">50K+</div>
            <div className="text-sm text-gray-600 font-medium">{t('stats.happyShoppers')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border-2 border-green-100">
            <div className="text-3xl font-bold text-green-600">$2M+</div>
            <div className="text-sm text-gray-600 font-medium">{t('stats.moneySaved')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border-2 border-blue-100">
            <div className="text-3xl font-bold text-blue-600">10K+</div>
            <div className="text-sm text-gray-600 font-medium">{t('stats.productsCompared')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border-2 border-yellow-100">
            <div className="text-3xl font-bold text-yellow-600">4.9★</div>
            <div className="text-sm text-gray-600 font-medium">{t('stats.averageRating')}</div>
          </div>
        </div>

        {/* Popular Comparisons */}
        {popularComparisons.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{t('sections.trending')}</h2>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                {t('sections.hot')}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularComparisons.map((comparison) => (
                <Link
                  key={comparison.id}
                  href={`/compare/${comparison.slug}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-5 border-2 border-transparent hover:border-purple-200 group"
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">
                    {comparison.product1.name} vs {comparison.product2.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{comparison.viewCount} {t('sections.viewed')}</span>
                    </span>
                    <span className="text-purple-600 font-bold group-hover:translate-x-1 transition-transform">
                      {t('sections.compare')} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Comparisons */}
        {recentComparisons.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{t('sections.justCompared')}</h2>
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                {t('sections.autoGenerated')}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentComparisons.map((comparison) => (
                <Link
                  key={comparison.id}
                  href={`/compare/${comparison.slug}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-5 border-2 border-transparent hover:border-green-200 group"
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-green-600 transition-colors">
                    {comparison.product1.name} vs {comparison.product2.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {t('sections.autoGeneratedFromChat')}
                    </span>
                    <span className="text-green-600 font-bold">
                      {t('sections.view')} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews */}
        <section className="py-12 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {t('reviews.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 font-medium">
                "{t('reviews.review1')}"
              </p>
              <p className="text-sm text-gray-600 font-bold">{t('reviews.reviewer1')}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 font-medium">
                "{t('reviews.review2')}"
              </p>
              <p className="text-sm text-gray-600 font-bold">{t('reviews.reviewer2')}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 font-medium">
                "{t('reviews.review3')}"
              </p>
              <p className="text-sm text-gray-600 font-bold">{t('reviews.reviewer3')}</p>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 border-t">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              {t('why.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{t('why.aiTitle')}</h3>
                <p className="text-gray-600">
                  {t('why.aiDesc')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{t('why.saveTitle')}</h3>
                <p className="text-gray-600">
                  {t('why.saveDesc')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{t('why.instantTitle')}</h3>
                <p className="text-gray-600">
                  {t('why.instantDesc')}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                {t('why.ctaTitle')}
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                {t('why.ctaDesc')}
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                {t('why.ctaButton')}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 text-center">
          <p className="text-gray-600 font-medium">{t('footer.copyright')}</p>
          <div className="mt-2 space-x-4">
            <Link href="/sitemap.xml" className="text-purple-600 hover:text-purple-700 font-medium">{t('footer.sitemap')}</Link>
            <Link href="/compare/iphone-15-pro-vs-samsung-galaxy-s24-ultra" className="text-purple-600 hover:text-purple-700 font-medium">iPhone vs Samsung</Link>
            <Link href="/compare/macbook-air-m3-vs-dell-xps-13" className="text-purple-600 hover:text-purple-700 font-medium">MacBook vs Dell</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}