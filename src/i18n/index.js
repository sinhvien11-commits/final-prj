import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import vi from './vi.json'
import en from './en.json'

// Song ngữ Anh–Việt CHỈ cho màn khách. Admin giữ nguyên tiếng Việt, không dùng i18n.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    detection: {
      // Lưu lựa chọn ngôn ngữ vào localStorage (key 'lang'); mặc định 'vi'.
      order: ['localStorage'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
