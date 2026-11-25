import { ref, computed } from 'vue';
import fr from '../i18n/fr';
import mg from '../i18n/mg';

type Translations = typeof fr;
type TranslationKeys = keyof Translations;

const currentLang = ref<'fr' | 'mg'>((localStorage.getItem('lang') as 'fr' | 'mg') || 'fr');

const translations: Record<'fr' | 'mg', Translations> = {
  fr,
  mg,
};

export function useI18n() {
  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = translations[currentLang.value];
    
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return result;
  };

  const setLanguage = (lang: 'fr' | 'mg') => {
    currentLang.value = lang;
    localStorage.setItem('lang', lang);
  };

  const lang = computed(() => currentLang.value);

  return {
    t,
    setLanguage,
    lang,
  };
}
