import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "/public/assets/languages/en.json";
import bn from "/public/assets/languages/bn.json";
import tr from '/public/assets/languages/tr.json'
import ar from "/public/assets/languages/ar.json";
import fa from "/public/assets/languages/fa.json";
import ps from '/public/assets/languages/ps.json'

const languageDirectionMap = {
  ar: 'rtl',
  fa: 'rtl',
  ps: 'rtl',
  en: 'ltr', // Default direction
  bn: 'ltr',
  tr: 'ltr',
  ge: 'ltr',
  hi: 'ltr',
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
      tr: { translation: tr},
      ar: { translation: ar},
      fa: { translation: fa},
      ps: { translation: ps}
    },
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

  i18n.on('languageChanged', (lng) => {
    const direction = languageDirectionMap[lng] || 'ltr';
    document.documentElement.setAttribute('dir', direction);
  });

const initialDirection = languageDirectionMap[i18n.language] || 'ltr';
document.documentElement.setAttribute('dir', initialDirection);

export default i18n;
