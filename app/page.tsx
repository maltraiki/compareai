'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Sparkles, Star, CheckCircle, XCircle, TrendingUp, Shield, Zap, Clock, Eye, Link2 } from 'lucide-react';
import Link from 'next/link';

interface ComparisonResult {
  product1: {
    name: string;
    image: string;
    price: string;
    pros: string[];
    cons: string[];
    rating: number;
    specs: { [key: string]: string };
  };
  product2: {
    name: string;
    image: string;
    price: string;
    pros: string[];
    cons: string[];
    rating: number;
    specs: { [key: string]: string };
  };
  verdict: string;
  recommendation: string;
}

interface RecentComparison {
  slug: string;
  title: string;
  product1: {
    name: string;
    image: string;
    price: number;
  };
  product2: {
    name: string;
    image: string;
    price: number;
  };
  viewCount: number;
  createdAt: string;
  lastViewed: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentComparisons, setRecentComparisons] = useState<RecentComparison[]>([]);

  // Fetch recent comparisons on mount
  useEffect(() => {
    fetchRecentComparisons();
  }, []);

  const fetchRecentComparisons = async () => {
    try {
      const response = await fetch('/api/comparisons/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentComparisons(data.comparisons || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent comparisons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data);
        // Refresh recent comparisons after new comparison
        fetchRecentComparisons();
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Premium Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MT TechAdvisor</h1>
                <p className="text-sm text-purple-300">Your Personal Technology Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-400">MT Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        {!hasSearched && (
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 px-6 py-3 rounded-full border border-purple-500/30 mb-6">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Trusted by 100,000+ Tech Buyers</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Hi, I'm <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">MT</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Your personal technology advisor. I analyze real market data to help you make 
              the smartest tech purchases.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Tell me which products you're considering, and I'll provide you with an expert analysis 
              including real prices, authentic reviews, and my professional recommendation.
            </p>
          </div>
        )}

        {/* Smart Input Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-purple-500/30 p-2 shadow-2xl">
              <div className="flex items-start gap-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything... 'Which phone should I buy: iPhone 16 or Samsung S24?' or 'Help me choose between MacBook Pro and Dell XPS'"
                  className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 min-h-[60px] max-h-[120px] resize-none focus:outline-none"
                  disabled={loading}
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {!hasSearched && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <button 
                onClick={() => setQuery("Which is better: iPhone 16 Pro or Samsung Galaxy S24 Ultra?")}
                className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-full text-sm transition-colors border border-gray-700"
              >
                iPhone 16 vs Galaxy S24
              </button>
              <button 
                onClick={() => setQuery("Should I buy MacBook Air M3 or MacBook Pro M3?")}
                className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-full text-sm transition-colors border border-gray-700"
              >
                MacBook Air vs Pro
              </button>
              <button 
                onClick={() => setQuery("Compare AirPods Pro 2 with Sony WF-1000XM5")}
                className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-full text-sm transition-colors border border-gray-700"
              >
                AirPods vs Sony
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-purple-500/30">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <div className="text-left">
                <p className="text-lg font-semibold text-white">MT is analyzing...</p>
                <p className="text-sm text-gray-400">Fetching real market data and reviews</p>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Results */}
        {comparison && !loading && (
          <div className="animate-fadeIn space-y-8">
            {/* MT's Verdict */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">MT's Expert Analysis</h3>
                  <p className="text-lg text-gray-300 leading-relaxed">{comparison.verdict}</p>
                </div>
              </div>
            </div>

            {/* Product Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product 1 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
                <div className="relative h-64 bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                  <img 
                    src={comparison.product1.image} 
                    alt={comparison.product1.name}
                    className="w-full h-full object-contain p-4 pointer-events-none select-none"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-white">{comparison.product1.price}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">{comparison.product1.name}</h3>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < comparison.product1.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-gray-400">({comparison.product1.rating}/5)</span>
                  </div>

                  {/* Pros */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-400 mb-3 text-sm uppercase tracking-wider">Advantages</h4>
                    {comparison.product1.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cons */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-400 mb-3 text-sm uppercase tracking-wider">Limitations</h4>
                    {comparison.product1.cons.map((con, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{con}</span>
                      </div>
                    ))}
                  </div>

                  {/* Specs */}
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-purple-400 mb-3 text-sm uppercase tracking-wider">Key Specifications</h4>
                    <div className="space-y-2">
                      {Object.entries(comparison.product1.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-500">{key}</span>
                          <span className="text-gray-300 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product 2 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
                <div className="relative h-64 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                  <img 
                    src={comparison.product2.image} 
                    alt={comparison.product2.name}
                    className="w-full h-full object-contain p-4 pointer-events-none select-none"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-white">{comparison.product2.price}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">{comparison.product2.name}</h3>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < comparison.product2.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-gray-400">({comparison.product2.rating}/5)</span>
                  </div>

                  {/* Pros */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-400 mb-3 text-sm uppercase tracking-wider">Advantages</h4>
                    {comparison.product2.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cons */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-400 mb-3 text-sm uppercase tracking-wider">Limitations</h4>
                    {comparison.product2.cons.map((con, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{con}</span>
                      </div>
                    ))}
                  </div>

                  {/* Specs */}
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-purple-400 mb-3 text-sm uppercase tracking-wider">Key Specifications</h4>
                    <div className="space-y-2">
                      {Object.entries(comparison.product2.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-500">{key}</span>
                          <span className="text-gray-300 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Recommendation */}
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md rounded-2xl border border-green-500/30 p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">My Personal Recommendation</h3>
                  <p className="text-lg text-gray-300 leading-relaxed">{comparison.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Comparisons Section */}
        {recentComparisons.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Previous Comparisons</h2>
              <p className="text-gray-400">Quick access to recent product comparisons</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentComparisons.map((comp) => (
                <Link 
                  key={comp.slug}
                  href={`/compare/${comp.slug}`}
                  className="group bg-white/10 backdrop-blur-md rounded-xl border border-purple-500/30 p-4 hover:bg-white/20 hover:shadow-xl hover:shadow-purple-500/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 flex-1">
                      {comp.title}
                    </h3>
                    <Link2 className="w-4 h-4 text-purple-400 ml-2 group-hover:text-purple-300" />
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <div className="h-16 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-lg flex items-center justify-center overflow-hidden">
                        {comp.product1.image ? (
                          <img 
                            src={comp.product1.image} 
                            alt={comp.product1.name}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div className="text-xs text-gray-500">{comp.product1.name}</div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{comp.product1.name}</p>
                      <p className="text-xs text-purple-400 font-semibold">${comp.product1.price}</p>
                    </div>
                    
                    <div className="flex items-center justify-center px-2">
                      <span className="text-gray-500 text-xs font-semibold">VS</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="h-16 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-lg flex items-center justify-center overflow-hidden">
                        {comp.product2.image ? (
                          <img 
                            src={comp.product2.image} 
                            alt={comp.product2.name}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div className="text-xs text-gray-500">{comp.product2.name}</div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{comp.product2.name}</p>
                      <p className="text-xs text-purple-400 font-semibold">${comp.product2.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{comp.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(comp.lastViewed).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}