import ar from "./ar.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import ga from "./ga.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import ru from "./ru.json";
import zh_CN from "./zh_CN.json";
import zh_TW from "./zh_TW.json";

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

const withEnglishFallback = (translation) => deepMerge(en, translation || {});

export const resources = {
  ar: {
    translation: withEnglishFallback(ar),
  },
  de: {
    translation: withEnglishFallback(de),
  },
  en: {
    translation: withEnglishFallback(en),
  },
  es: {
    translation: withEnglishFallback(es),
  },
  fr: {
    translation: withEnglishFallback(fr),
  },
  ga: {
    translation: withEnglishFallback(ga),
  },
  it: {
    translation: withEnglishFallback(it),
  },
  ja: {
    translation: withEnglishFallback(ja),
  },
  ko: {
    translation: withEnglishFallback(ko),
  },
  ru: {
    translation: withEnglishFallback(ru),
  },
  zh_CN: {
    translation: withEnglishFallback(zh_CN),
  },
  zh_TW: {
    translation: withEnglishFallback(zh_TW),
  },
};

export const localeLoaders = {
  ar: () => import("./ar.json"),
  de: () => import("./de.json"),
  en: () => import("./en.json"),
  es: () => import("./es.json"),
  fr: () => import("./fr.json"),
  ga: () => import("./ga.json"),
  it: () => import("./it.json"),
  ja: () => import("./ja.json"),
  ko: () => import("./ko.json"),
  ru: () => import("./ru.json"),
  zh_CN: () => import("./zh_CN.json"),
  zh_TW: () => import("./zh_TW.json"),
};
