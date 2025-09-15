'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Remove the current locale from the pathname
    const segments = pathname.split('/').filter(Boolean);
    const currentPath = segments[0] === locale || segments[0] === 'en' || segments[0] === 'ar' 
      ? '/' + segments.slice(1).join('/') 
      : pathname;
    
    // Navigate to new locale
    router.push(`/${newLocale}${currentPath === '/' ? '' : currentPath}`);
  };

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:shadow-lg transition-all border border-purple-200"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4 text-purple-600" />
      <span className="font-medium text-gray-700">
        {locale === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
}