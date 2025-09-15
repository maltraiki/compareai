'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm MT, your personal shopping expert! Tell me what you're looking to buy and I'll help you compare products and find the best deals. Try asking me things like:\n\n• 'Compare iPhone 15 Pro vs Samsung Galaxy S24'\n• 'What's the best laptop under $1500?'\n• 'Should I buy AirPods Pro or Sony WH-1000XM5?'",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if this is a comparison and create a landing page
      const lowerInput = input.trim().toLowerCase();
      if (lowerInput.includes('vs') || lowerInput.includes('versus') || lowerInput.includes('compare')) {
        // Extract product names - improved regex
        let product1 = '';
        let product2 = '';
        
        // Try different patterns
        const patterns = [
          /compare\s+(.+?)\s+(?:vs\.?|versus|and|with|to)\s+(.+)/i,
          /(.+?)\s+(?:vs\.?|versus)\s+(.+)/i,
          /(.+?)\s+or\s+(.+)/i,
        ];
        
        let vsMatch = null;
        for (const pattern of patterns) {
          vsMatch = input.match(pattern);
          if (vsMatch) break;
        }
        
        console.log('Comparison detected, vsMatch:', vsMatch);
        if (vsMatch) {
          [, product1, product2] = vsMatch;
          console.log('Products:', product1, product2);
          
          try {
            // Save comparison to database
            const compResponse = await fetch('/api/comparisons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product1Name: product1.trim(),
                product2Name: product2.trim(),
                product1Data: {
                  price: 999,
                  brand: product1.trim().split(' ')[0],
                },
                product2Data: {
                  price: 1199,
                  brand: product2.trim().split(' ')[0],
                },
              }),
            });

            console.log('Comparison API response:', compResponse.status);
            if (compResponse.ok) {
              const compData = await compResponse.json();
              console.log('Comparison data:', compData);
              const comparisonUrl = `/compare/${compData.slug}`;
              
              // Add link message immediately as part of the response
              const linkMessage = `\n\n---\n\n📊 **[Click here to view the full comparison with photos and detailed specs](${comparisonUrl})**\n\nThis comparison page includes:\n• Product images\n• Side-by-side specifications\n• Detailed pros & cons\n• MT's expert recommendation`;
              
              // Update the last message to include the link
              setMessages(prev => {
                const updatedMessages = [...prev];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = lastMessage.content + linkMessage;
                }
                return updatedMessages;
              });
            } else {
              console.error('Comparison API failed:', await compResponse.text());
            }
          } catch (error) {
            console.error('Failed to save comparison:', error);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Chat with MT</h3>
            <p className="text-white/80 text-sm">Your AI Shopping Expert</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-purple-600'
                  : 'bg-gradient-to-br from-purple-600 to-blue-600'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content.split('\n').map((line, i) => {
                  // Check if line contains a link
                  const linkMatch = line.match(/\[(.+?)\]\((.+?)\)/);
                  if (linkMatch) {
                    const [fullMatch, text, url] = linkMatch;
                    const parts = line.split(fullMatch);
                    return (
                      <div key={i}>
                        {parts[0]}
                        <a 
                          href={url} 
                          className="text-blue-600 underline hover:text-blue-800 font-semibold"
                          target={url.startsWith('http') ? '_blank' : '_self'}
                          rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {text}
                        </a>
                        {parts[1]}
                      </div>
                    );
                  }
                  return <div key={i}>{line || '\u00A0'}</div>;
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600">MT is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about any products you want to compare..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}