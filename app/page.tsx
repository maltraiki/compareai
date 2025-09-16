'use client';

import { useState } from 'react';
import { Send, Loader2, Search, Star, CheckCircle, XCircle } from 'lucide-react';
import { Metadata } from 'next';

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

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      }
    } catch (error) {
      console.error('Comparison error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CompareAI by MT
              </h1>
              <p className="text-sm text-gray-600">Smart Product Comparisons with Real Data</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            What do you want to compare today?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Enter products to compare (e.g., "iPhone 15 Pro vs Samsung S24")
          </p>
          
          <form onSubmit={handleCompare} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Compare iPhone 15 Pro vs Samsung Galaxy S24..."
                className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-6 h-6" />
                    Compare
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Comparison Results */}
        {comparison && (
          <div className="animate-fadeIn">
            {/* Verdict Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Quick Verdict</h3>
              <p className="text-lg text-gray-700">{comparison.verdict}</p>
            </div>

            {/* Side by Side Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Product 1 */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src={comparison.product1.image} 
                  alt={comparison.product1.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {comparison.product1.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < comparison.product1.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-purple-600">
                      {comparison.product1.price}
                    </span>
                  </div>

                  {/* Pros */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-600 mb-2">Pros</h4>
                    {comparison.product1.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cons */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-600 mb-2">Cons</h4>
                    {comparison.product1.cons.map((con, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{con}</span>
                      </div>
                    ))}
                  </div>

                  {/* Key Specs */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Specs</h4>
                    <div className="space-y-2">
                      {Object.entries(comparison.product1.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product 2 */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src={comparison.product2.image} 
                  alt={comparison.product2.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {comparison.product2.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < comparison.product2.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-purple-600">
                      {comparison.product2.price}
                    </span>
                  </div>

                  {/* Pros */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-600 mb-2">Pros</h4>
                    {comparison.product2.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cons */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-600 mb-2">Cons</h4>
                    {comparison.product2.cons.map((con, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{con}</span>
                      </div>
                    ))}
                  </div>

                  {/* Key Specs */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Specs</h4>
                    <div className="space-y-2">
                      {Object.entries(comparison.product2.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MT's Recommendation */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-3">MT's Recommendation</h3>
              <p className="text-lg">{comparison.recommendation}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">MT is analyzing products and fetching real data...</p>
          </div>
        )}
      </div>
    </main>
  );
}