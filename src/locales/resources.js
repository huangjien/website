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

export const resources = {
  ar: {
    translation: ar,
  },
  de: {
    translation: de,
  },
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  fr: {
    translation: fr,
  },
  ga: {
    translation: ga,
  },
  it: {
    translation: it,
  },
  ja: {
    translation: ja,
  },
  ko: {
    translation: ko,
  },
  ru: {
    translation: ru,
  },
  zh_CN: {
    translation: zh_CN,
  },
  zh_TW: {
    translation: zh_TW,
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
