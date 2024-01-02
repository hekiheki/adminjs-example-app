import { Locale } from 'adminjs';
import zhCNLocale from './translation.json' assert { type: 'json' };

export const locale: Locale = {
  language: 'zh-CN',
  availableLanguages: ['zh-CN'],
  translations: {
    'zh-CN': zhCNLocale,
  },
};
