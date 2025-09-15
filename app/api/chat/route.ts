import { NextRequest, NextResponse } from 'next/server';
import { geminiModel, SYSTEM_PROMPTS, buildComparisonPrompt, rateLimiter } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { cache, generateComparisonSlug, jsonStringify, safeJsonParse } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    // Check rate limits
    if (!rateLimiter.canMakeRequest()) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again in a few moments.',
          limits: rateLimiter.getRemainingRequests()
        },
        { status: 429 }
      );
    }

    const { message, conversationHistory = [] } = await req.json();

    // Get or create session ID
    const sessionId = req.headers.get('x-session-id') || crypto.randomUUID();

    // Check cache first
    const cacheKey = `chat:${message}:${conversationHistory.length}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit for:', cacheKey);
      return NextResponse.json({ response: cached, sessionId });
    }

    // Build context from history
    const context = conversationHistory
      .slice(-5) // Last 5 messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n\n');

    // Check if this is a comparison request
    const isComparison = message.toLowerCase().includes(' vs ') || 
                        message.toLowerCase().includes(' versus ') ||
                        message.toLowerCase().includes('compare');

    let prompt: string;
    
    if (isComparison) {
      // Extract products from the message (simple extraction for now)
      const vsMatch = message.match(/(.+?)\s+(?:vs|versus|or)\s+(.+)/i);
      if (vsMatch) {
        const [, product1, product2] = vsMatch;
        prompt = buildComparisonPrompt(product1.trim(), product2.trim(), message);
        
        // Save comparison to database for SEO page generation
        try {
          const slug = generateComparisonSlug(product1, product2);
          const existingComparison = await prisma.comparison.findUnique({
            where: { slug }
          });
          
          if (!existingComparison) {
            // For now, create placeholder products if they don't exist
            // In production, you'd fetch real product data
            const product1Slug = product1.toLowerCase().replace(/\s+/g, '-');
            const product2Slug = product2.toLowerCase().replace(/\s+/g, '-');
            
            // Create or get products
            const [p1, p2] = await Promise.all([
              prisma.product.upsert({
                where: { slug: product1Slug },
                update: {},
                create: {
                  name: product1.trim(),
                  brand: product1.split(' ')[0],
                  category: 'Electronics',
                  slug: product1Slug,
                  specifications: jsonStringify({ placeholder: true }),
                  description: `${product1} - Product details coming soon`,
                }
              }),
              prisma.product.upsert({
                where: { slug: product2Slug },
                update: {},
                create: {
                  name: product2.trim(),
                  brand: product2.split(' ')[0],
                  category: 'Electronics',
                  slug: product2Slug,
                  specifications: jsonStringify({ placeholder: true }),
                  description: `${product2} - Product details coming soon`,
                }
              })
            ]);
            
            // Create comparison
            await prisma.comparison.create({
              data: {
                slug,
                title: `${product1} vs ${product2}`,
                product1Id: p1.id,
                product2Id: p2.id,
                conversation: jsonStringify(conversationHistory),
              }
            });
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Continue even if database save fails
        }
      } else {
        prompt = `${SYSTEM_PROMPTS.comparison}\n\nContext:\n${context}\n\nUser: ${message}\n\nAssistant:`;
      }
    } else {
      // General conversation
      prompt = `${SYSTEM_PROMPTS.comparison}\n\nContext:\n${context}\n\nUser: ${message}\n\nAssistant: Provide helpful product comparison advice. If the user isn't asking about comparisons, guide them towards comparing products.`;
    }

    // Generate response with Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();

    // Update rate limiter
    rateLimiter.incrementCounts();

    // Cache the response
    cache.set(cacheKey, response, 600); // Cache for 10 minutes

    // Save conversation to database
    try {
      await prisma.conversation.upsert({
        where: { sessionId },
        update: {
          messages: jsonStringify([
            ...safeJsonParse((await prisma.conversation.findUnique({ where: { sessionId } }))?.messages, []),
            { role: 'user', content: message },
            { role: 'assistant', content: response }
          ]),
          updatedAt: new Date(),
        },
        create: {
          sessionId,
          messages: jsonStringify([
            { role: 'user', content: message },
            { role: 'assistant', content: response }
          ]),
        }
      });
    } catch (dbError) {
      console.error('Failed to save conversation:', dbError);
      // Continue even if save fails
    }

    return NextResponse.json({ 
      response,
      sessionId,
      limits: rateLimiter.getRemainingRequests()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}