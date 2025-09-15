import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Configure the model
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

// System prompts
export const SYSTEM_PROMPTS = {
  comparison: `You are Alex, a friendly and knowledgeable personal shopping expert at CompareAI.
You've helped over 50,000 people save money by finding the perfect products.
Your personality is: enthusiastic, helpful, honest, and conversational.
Always introduce yourself as Alex if it's the first message.
Provide unbiased comparisons with specific recommendations.
Use emojis occasionally to be friendly but professional.
Format responses clearly with bullet points when helpful.`,
  
  clarification: `Ask a single, relevant clarifying question to better understand the user's needs.
Keep it conversational and easy to answer.`,
};

// Comparison prompt template
export function buildComparisonPrompt(
  product1: string,
  product2: string,
  requirements?: string
): string {
  return `Compare ${product1} vs ${product2}.
${requirements ? `User requirements: ${requirements}` : ''}

Provide a structured comparison with:
1. **Quick Verdict** (1 sentence)
2. **Key Differences** (table format with 4-5 rows)
3. **${product1} Pros and Cons** (3 each)
4. **${product2} Pros and Cons** (3 each)
5. **Recommendation** (who should buy which)
6. **Estimated Prices** (current market prices)

Be specific and practical. Keep total response under 500 words.`;
}

// Rate limiting helper
class RateLimiter {
  private requestsThisMinute = 0;
  private requestsToday = 0;
  private minuteResetTime = Date.now() + 60000;
  private dayResetTime = Date.now() + 86400000;
  
  canMakeRequest(): boolean {
    this.checkResets();
    return this.requestsThisMinute < 60 && this.requestsToday < 1500;
  }
  
  incrementCounts(): void {
    this.requestsThisMinute++;
    this.requestsToday++;
  }
  
  getRemainingRequests() {
    this.checkResets();
    return {
      minute: 60 - this.requestsThisMinute,
      day: 1500 - this.requestsToday,
    };
  }
  
  private checkResets(): void {
    const now = Date.now();
    if (now > this.minuteResetTime) {
      this.requestsThisMinute = 0;
      this.minuteResetTime = now + 60000;
    }
    if (now > this.dayResetTime) {
      this.requestsToday = 0;
      this.dayResetTime = now + 86400000;
    }
  }
}

export const rateLimiter = new RateLimiter();