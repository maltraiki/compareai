# CompareAI - Smart Product Comparison Platform 🚀

An AI-powered product comparison platform using Google Gemini, Next.js, and SQLite.

## Features ✨

- 🤖 **AI Chat Interface** - Natural language product comparisons powered by Google Gemini
- 💾 **Local SQLite Database** - Easy development with local storage (migrates to PostgreSQL for production)
- 🚀 **Fast & Responsive** - Built with Next.js 15 and TypeScript
- 💰 **Free Tier Optimized** - Uses Google Gemini free tier (1,500 requests/day)
- 🔍 **SEO Ready** - Auto-generates comparison pages for search engines
- 📱 **Mobile Responsive** - Works great on all devices

## Quick Start 🏃‍♂️

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key (free at https://makersuite.google.com/app/apikey)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up your Gemini API key:**
   - The `.env` file already contains your API key
   - To get a new key: visit https://makersuite.google.com/app/apikey

3. **Initialize the database:**
```bash
npx prisma db push
npm run db:seed
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**
   - Navigate to http://localhost:3000
   - Start comparing products!

## Usage Examples 💬

Try these comparison queries:
- "Compare iPhone 15 Pro vs Samsung Galaxy S24 Ultra"
- "MacBook Air vs Dell XPS 13 for programming"
- "iPad Air or Samsung Tab S9 for students?"
- "Best phone under $1000"

## Project Structure 📁

```
compareai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── chat/         # Chat endpoint with Gemini
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   └── ChatInterface.tsx # Main chat UI
├── lib/                   # Utilities and configurations
│   ├── gemini.ts         # Gemini AI setup
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and seeds
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Sample data
└── .env                  # Environment variables
```

## Database Schema 🗄️

The app uses SQLite locally with these main tables:
- **Products** - Store product information
- **Comparisons** - Save comparison results
- **Conversations** - Track chat history
- **Users** - User accounts (future feature)

## Migrating to Production 🚀

To deploy and use cloud database:

1. **Switch to PostgreSQL:**
   - Update `prisma/schema.prisma` datasource to `postgresql`
   - Use Supabase, Neon, or any PostgreSQL provider
   - Update `DATABASE_URL` in `.env`

2. **Deploy to Vercel:**
```bash
npm run build
vercel deploy
```

3. **Environment Variables:**
   - Set `GEMINI_API_KEY` in Vercel dashboard
   - Set `DATABASE_URL` for your PostgreSQL instance

## Available Scripts 📝

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Sync database schema
npm run db:seed    # Add sample products
```

## API Rate Limits ⚡

Google Gemini Free Tier:
- 60 requests per minute
- 1,500 requests per day
- 32K context window

The app includes:
- Automatic rate limiting
- Response caching (10 minutes)
- Queue system for high traffic

## Tech Stack 🛠️

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **AI:** Google Gemini 1.5 Flash
- **Deployment:** Vercel

## Future Features 🔮

- [ ] User accounts & saved comparisons
- [ ] Price tracking & alerts
- [ ] More product categories
- [ ] Review aggregation
- [ ] Affiliate link integration
- [ ] Browser extension
- [ ] Mobile app

## Troubleshooting 🔧

**Issue:** Rate limit exceeded
- **Solution:** Wait a minute for limits to reset, or implement caching

**Issue:** Database errors
- **Solution:** Run `npx prisma db push` to sync schema

**Issue:** Gemini API errors
- **Solution:** Check your API key is valid and has correct permissions

## License 📄

MIT

## Support 💬

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Google Gemini AI