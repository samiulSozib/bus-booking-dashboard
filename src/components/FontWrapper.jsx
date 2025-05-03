// src/components/FontWrapper.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FontWrapper = ({ children }) => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const rtlLanguages = ['ar', 'fa', 'ps'];
    const isRTL = rtlLanguages.includes(i18n.language);
    
    // Set font family based on language
    document.documentElement.style.setProperty(
      '--font-primary', 
      isRTL ? 'iranyekan, system-ui, sans-serif' : 'system-ui, sans-serif'
    );
    
    // Set font weight normalization for RTL languages
    if (isRTL) {
      document.documentElement.style.setProperty(
        '--font-weight-normal', 
        '500' // IranYekan's regular weight is 500
      );
    } else {
      document.documentElement.style.removeProperty('--font-weight-normal');
    }
  }, [i18n.language]);

  return <>{children}</>;
};

export default FontWrapper;