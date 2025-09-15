import Link from 'next/link';
import { Star, ShieldCheck, Zap, Trophy, DollarSign } from 'lucide-react';
import { Metadata } from 'next';
import { ChatInterface } from '@/components/ChatInterface';

export const metadata: Metadata = {
  title: 'CompareAI - Your Personal Shopping Expert | Save Money on Every Purchase',
  description: 'Get instant AI-powered product comparisons from Alex, your personal shopping expert. Compare phones, laptops, tablets and save thousands. Trusted by 50,000+ happy shoppers!',
  keywords: 'product comparison, shopping expert, compare products, save money, best deals, iPhone vs Samsung, MacBook vs Dell, shopping assistant',
};

export default function Home() {
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
                <h1 className="text-xl font-bold text-gray-800">CompareAI</h1>
                <p className="text-xs text-purple-600 font-medium">Your Personal Shopping Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">MT is Online</span>
              </div>
              <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-purple-700">4.9/5</span>
                <span className="text-xs text-purple-600">(12,847 reviews)</span>
              </div>
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
              #1 AI Shopping Assistant • Saves You Money
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Meet MT
            </span>
            <br />
            <span className="text-gray-800">Your Personal Shopping Expert</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto font-medium">
            Hi! I&apos;m MT, your personal shopping expert. I&apos;ve helped 50,000+ people save money by finding the perfect products at the best prices. Let me help you make smart buying decisions!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-700">Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-700">Best Prices</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-700">Unbiased Advice</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="mb-16">
          <ChatInterface />
        </div>

        {/* Customer Reviews */}
        <section className="py-12 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            What Happy Shoppers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 font-medium">
                &quot;MT helped me save $500 on my new laptop! The comparison was so detailed and easy to understand.&quot;
              </p>
              <p className="text-sm text-gray-600 font-bold">- Sarah M., Verified Buyer</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 font-medium">
                &quot;I always check with MT before making any tech purchase. It&apos;s like having a tech expert friend!&quot;
              </p>
              <p className="text-sm text-gray-600 font-bold">- John D., Tech Enthusiast</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 font-medium">
                &quot;The side-by-side comparisons are amazing. Helped me choose the perfect phone for my needs.&quot;
              </p>
              <p className="text-sm text-gray-600 font-bold">- Maria L., Happy Customer</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 text-center">
          <p className="text-gray-600 font-medium">© 2024 CompareAI. Your trusted shopping companion.</p>
        </footer>
      </div>
    </main>
  );
}