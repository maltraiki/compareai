import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MT TechAdvisor - Smart Product Comparisons with Real Data",
  description: "Compare products instantly with AI-powered analysis. Get real photos, prices, specs, pros & cons. iPhone vs Samsung, MacBook vs Dell, AirPods vs Sony. Make smart buying decisions with MT's expert recommendations.",
  keywords: "product comparison, compare products, iphone vs samsung, macbook vs dell, ipad vs surface, airpods vs sony, product reviews, tech comparison, shopping guide, best deals, MT TechAdvisor, smart shopping, price comparison",
  authors: [{ name: "MT" }],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "MT TechAdvisor - Smart Product Comparisons",
    description: "Compare any products instantly with AI. Real photos, prices, and expert recommendations.",
    url: "https://compare-ai-fawn.vercel.app",
    siteName: "MT TechAdvisor",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MT TechAdvisor - Smart Product Comparisons",
    description: "Compare any products instantly with AI-powered analysis",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://compare-ai-fawn.vercel.app" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}