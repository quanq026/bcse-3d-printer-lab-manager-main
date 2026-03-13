import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, Lang, TranslationKey } from '../lib/i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'VN',
  setLang: () => {},
  t: (key) => translations.VN[key],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lab_lang') as Lang) || 'VN';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('lab_lang', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] ?? translations.VN[key];
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
