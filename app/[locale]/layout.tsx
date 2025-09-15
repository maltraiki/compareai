import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });
const notoArabic = Noto_Sans_Arabic({ 
  subsets: ["arabic"],
  variable: '--font-arabic'
});

export const metadata: Metadata = {
  title: "CompareAI - Smart Product Comparisons",
  description: "Get intelligent product comparisons powered by AI",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const isRTL = locale === 'ar';
  
  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body 
        className={`${isRTL ? notoArabic.className : inter.className} ${isRTL ? notoArabic.variable : ''}`} 
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}