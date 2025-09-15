'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Send, Loader2, Sparkles, ShoppingBag, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimpleProductCard } from './SimpleProductCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Array<{
    name: string;
    price: number;
    image: string;
    rating?: number;
    winner?: boolean;
  }>;
}

// Helper function to detect and parse comparisons
function detectComparison(userMessage: string) {
  // Check if this is a comparison request
  const comparisonKeywords = ['vs', 'versus', 'compare', 'or', 'better'];
  const hasComparison = comparisonKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  if (!hasComparison) return null;
  
  // Simple product data mapping
  const productMap: { [key: string]: any } = {
    'iphone 15': { name: 'iPhone 15 Pro', price: 999, image: '📱', rating: 4.8 },
    'samsung s24': { name: 'Samsung S24 Ultra', price: 1199, image: '📱', rating: 4.7 },
    'macbook air': { name: 'MacBook Air M3', price: 1099, image: '💻', rating: 4.9, winner: true },
    'macbook pro': { name: 'MacBook Pro', price: 1599, image: '💻', rating: 4.8 },
    'dell xps': { name: 'Dell XPS 13', price: 999, image: '💻', rating: 4.5 },
    'ipad air': { name: 'iPad Air', price: 599, image: '📱', rating: 4.6 },
    'ipad pro': { name: 'iPad Pro', price: 999, image: '📱', rating: 4.7 },
  };
  
  // Try to find products in the message
  const foundProducts: any[] = [];
  const lowerMessage = userMessage.toLowerCase();
  
  Object.keys(productMap).forEach(key => {
    if (lowerMessage.includes(key)) {
      foundProducts.push(productMap[key]);
    }
  });
  
  // Return products if we found 2 or more
  if (foundProducts.length >= 2) {
    // Mark the first product as winner if it has higher rating
    if (foundProducts[0].rating > foundProducts[1].rating) {
      foundProducts[0].winner = true;
    } else if (foundProducts[1].rating > foundProducts[0].rating) {
      foundProducts[1].winner = true;
    }
    return foundProducts.slice(0, 2);
  }
  
  return null;
}

export function ChatInterface() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('chat.greeting'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setIsTyping(false);
      
      // Check if this is a comparison and extract product data
      const products = detectComparison(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        products: products || undefined,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Auto-save comparison to database for SEO landing pages
      if (products && products.length >= 2) {
        try {
          const response = await fetch('/api/comparisons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product1Name: products[0].name,
              product2Name: products[1].name,
              product1Data: {
                price: products[0].price,
                image: products[0].image,
                rating: products[0].rating,
                winner: products[0].winner,
              },
              product2Data: {
                price: products[1].price,
                image: products[1].image,
                rating: products[1].rating,
                winner: products[1].winner,
              },
            }),
          });
          
          const comparisonData = await response.json();
          console.log('Comparison saved:', comparisonData.slug);
        } catch (error) {
          console.error('Failed to save comparison:', error);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I had a connection issue. Please try again!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQueries = [
    t('suggestions.query1'),
    t('suggestions.query2'),
    t('suggestions.query3'),
    t('suggestions.query4')
  ];

  return (
    <div className="flex flex-col h-[700px] max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              {t('chat.expertTitle')}
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </h3>
            <p className="text-purple-100 text-sm">
              {t('chat.helpedShoppers')}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">⚡ {t('chat.fastResponse')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={cn(
                'flex gap-3 mb-4 animate-fadeIn',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🤖</span>
                  </div>
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3 shadow-md',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <span className={cn(
                  "text-xs mt-1 block",
                  message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs">{t('chat.you')}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Show Simple Product Cards if available */}
            {message.products && message.products.length > 0 && (
              <SimpleProductCard products={message.products} />
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 justify-start mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-lg">🤖</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 bg-white">
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            {t('chat.popularComparisons')}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query) => (
              <button
                key={query}
                onClick={() => setInput(query.replace(/^[^\s]+ /, ''))}
                className="text-sm px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-full transition-all transform hover:scale-105 font-medium text-gray-700 border border-purple-200"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-gradient-to-r from-gray-50 to-white p-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-800 placeholder-gray-500 bg-white"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={cn(
              'px-6 py-3 rounded-full transition-all flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105',
              loading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('chat.thinking')}
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                {t('chat.send')}
              </>
            )}
          </button>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              {t('chat.instantAI')}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-green-500" />
              {t('chat.priceFinder')}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {t('chat.poweredBy')}
          </span>
        </div>
      </div>
    </div>
  );
}