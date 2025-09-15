import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Ensure locale is defined
  if (!locale) {
    locale = 'en';
  }
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});