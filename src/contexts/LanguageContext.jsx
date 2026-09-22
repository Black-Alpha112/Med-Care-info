import { createContext, useContext, useMemo, useState } from 'react';
import { copy } from '../lib/i18n';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: copy.en,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem('clearmed_lang') === 'es' ? 'es' : 'en';
  });

  const setLang = (next) => {
    const value = next === 'es' ? 'es' : 'en';
    setLangState(value);
    localStorage.setItem('clearmed_lang', value);
  };

  const value = useMemo(() => ({ lang, setLang, t: copy[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
