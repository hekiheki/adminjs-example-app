import { Locale } from 'adminjs';
import zhCNLocale from './translation.json' assert { type: 'json' };

const localeKey = process.env.LOCALE || 'zh-CN';

export const locale: Locale = {
  language: localeKey,
  availableLanguages: ['zh-CN'],
  translations: {
    'zh-CN': zhCNLocale,
  },
};
