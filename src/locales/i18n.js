import i18n, { use } from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, localeLoaders } from "./resources";

const isPlainObject = (value) =>
  value != null && typeof value === "object" && !Array.isArray(value);

const deepMerge = (base, override) => {
  if (!isPlainObject(base)) return override;
  const result = { ...base };
  if (!isPlainObject(override)) return result;

  Object.entries(override).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      result[key] = deepMerge(base[key], value);
      return;
    }
    result[key] = value;
  });

  return result;
};

export const languages = [
  {
    key: "en",
    value: "English",
  }, //英语					    English
  { key: "ar", value: "عربي" }, //阿拉伯语				                عربي
  {
    key: "ja",
    value: "日本語",
  }, //日语				    日本語
  {
    key: "ko",
    value: "한국어",
  }, //韩语					    한국어
  {
    key: "zh_CN",
    value: "中文(简体)",
  }, //中文(简体)
  {
    key: "zh_TW",
    value: "中文(繁體)",
  }, //中文(繁體)
  {
    key: "fr",
    value: "Français",
  }, //法国语				    Français
  {
    key: "de",
    value: "Deutsche Sprache",
  }, //德语			    Deutsche Sprache
  { key: "ga", value: "Gaeilge" }, //爱尔兰语				Gaeilge
  {
    key: "it",
    value: "lingua italiana",
  }, //意大利语		lingua italiana
  {
    key: "ru",
    value: "Русский язык",
  }, //俄语				Русский язык
  {
    key: "es",
    value: "Español",
  }, //西班牙语				    Español
];

use(initReactI18next).init({
  resources: resources,
  fallbackLng: "en",
  lng: "en",
  debug: false,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

const loadedLocales = new Set(["en"]);

export const ensureLocaleLoaded = async (lng) => {
  if (!lng || loadedLocales.has(lng)) {
    return;
  }
  const loadLocale = localeLoaders[lng];
  if (!loadLocale) {
    return;
  }
  const mod = await loadLocale();
  const translation = mod?.default || mod;
  const fallbackTranslation = resources.en.translation;
  const mergedTranslation = deepMerge(fallbackTranslation, translation);
  i18n.addResourceBundle(lng, "translation", mergedTranslation, true, true);
  loadedLocales.add(lng);
};

i18n.on("languageChanged", (lng) => {
  ensureLocaleLoaded(lng);
});

export default i18n;
