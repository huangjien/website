import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

export const languages = [
  {
    key: 'en',
    value: 'English',
    languageCode: 'en-US',
    name: 'en-US-Standard-A',
  }, //英语					    English
  // {"key": "af", "value":  "Burry (Afrikaans)"}, //布尔语(南非荷兰语)       Burry (Afrikaans)
  // {"key": "sq", "value":  "shqiptar"}, //阿尔巴尼亚语                     shqiptar
  // {"key": "am", "value":  "አማርኛ"}, //阿姆哈拉语				           አማርኛ
  { key: 'ar', value: 'عربي', languageCode: 'ar-XA', name: 'ar-XA-Standard-A' }, //阿拉伯语				                عربي
  {
    key: 'ja',
    value: '日本語',
    languageCode: 'ja-JP',
    name: 'ja-JP-Standard-A',
  }, //日语				    日本語
  {
    key: 'ko',
    value: '한국어',
    languageCode: 'ko-KR',
    name: 'ko-KR-Standard-A',
  }, //韩语					    한국어
  // {"key": "hy", "value":  "Հայերեն"}, //亚美尼亚语				        Հայերեն
  // {"key": "az", "value":  "Azərbaycan"}, //阿塞拜疆语				        Azərbaycan
  // {"key": "eu", "value":  "Euskal"}, //巴斯克语				            Euskal
  // {"key": "be", "value":  "беларускі"}, //白俄罗斯语				        беларускі
  // {"key": "bn", "value":  "বাংলা ভাষার"}, //孟加拉语				            বাংলা ভাষার
  // {"key": "bs", "value":  "Bosanski"}, //波斯尼亚语				        Bosanski

  // {"key": "bg", "value":  "български"}, //保加利亚语				        български
  // {"key": "ca", "value":  "Català"}, //加泰罗尼亚语			            Català
  // {"key": "ceb", "value":  "Sugbo"}, //宿务语				                Sugbo
  {
    key: 'zh_CN',
    value: '中文(简体)',
    languageCode: 'cmn-CN',
    name: 'cmn-CN-Standard-A',
  }, //中文(简体)
  {
    key: 'zh_TW',
    value: '中文(繁體)',
    languageCode: 'cmn-TW',
    name: 'cmn-TW-Standard-A',
  }, //中文(繁體)
  // {"key": "co", "value":  "Corsa"}, //科西嘉语				    Corsa
  // {"key": "hr", "value":  "Croata"}, //克罗地亚语				    Croata
  // {"key": "cs", "value":  "Česky"}, //捷克语				        Česky
  // {"key": "da", "value":  "dansk"}, //丹麦语				        dansk
  // {"key": "nl", "value":  "Nederlands"}, //荷兰语				    Nederlands

  // {"key": "eo", "value":  "Esperanto"}, //世界语				    Esperanto
  // {"key": "et", "value":  "Eesti keel"}, //爱沙尼亚语				 Eesti keel
  // {"key": "fi", "value":  "suomalainen"}, //芬兰语				suomalainen
  {
    key: 'fr',
    value: 'Français',
    languageCode: 'fr-FR',
    name: 'fr-FR-Standard-A',
  }, //法国语				    Français
  // {"key": "fy", "value":  "Frysk"}, //弗里西语				    Frysk
  // {"key": "gl", "value":  "Galego"}, //加利西亚语				    Galego
  // {"key": "ka", "value":  "ქართული"}, //格鲁吉亚语				ქართული
  {
    key: 'de',
    value: 'Deutsche Sprache',
    languageCode: 'de-DE',
    name: 'de-DE-Standard-A',
  }, //德语			    Deutsche Sprache
  // {"key": "el", "value":  "Ελληνικά"}, //希腊语				    Ελληνικά

  // {"key": "gu", "value":  "ગુજરાતી"}, //古吉拉特语				    ગુજરાતી
  // {"key": "ht", "value":  "Kreyòl Ayisyen"}, //海地克里奥尔语			Kreyòl Ayisyen
  // {"key": "ha", "value":  "Hausa"}, //豪萨语				        Hausa
  // {"key": "haw", "value":  "Hawaiian"}, //夏威夷语				Hawaiian
  // {"key": "iw", "value":  "עברית"}, //希伯来语				    עברית
  // {"key": "hi", "value":  "बात मत करो"}, //印地语				    बात मत करो
  // {"key": "hmn", "value":  "Miao"}, //苗语					    Miao
  // {"key": "hu", "value":  "magyar"}, //匈牙利语				    magyar
  // {"key": "is", "value":  "Íslensku"}, //冰岛语				    Íslensku
  // {"key": "ig", "value":  "Asụsụ Ibo"}, //伊博语				    Asụsụ Ibo

  // {"key": "id", "value":  "Bahasa indonesia"}, //印尼语	    Bahasa indonesia
  { key: 'ga', value: 'Gaeilge' }, //爱尔兰语				Gaeilge
  {
    key: 'it',
    value: 'lingua italiana',
    languageCode: 'it-IT',
    name: 'it-IT-Standard-A',
  }, //意大利语		lingua italiana

  // {"key": "jw", "value":  "Wong Jawa"}, //印尼爪哇语			Wong Jawa
  // {"key": "kn", "value":  "ಕನ್ನಡ"}, //卡纳达语				    ಕನ್ನಡ
  // {"key": "kk", "value":  "Қазақша"}, //哈萨克语				Қазақша
  // {"key": "km", "value":  "ភាសាខ្មែរ"}, //高棉语				    ភាសាខ្មែរ
  // {"key": "ku", "value":  "Kurdî"}, //库尔德语				    Kurdî

  // {"key": "ky", "value":  "Кыргыз тили"}, //吉尔吉斯语		Кыргыз тили
  // {"key": "lo", "value":  "ລາວ"}, //老挝语				    ລາວ
  // {"key": "la", "value":  "Latine"}, //拉丁语				    Latine
  // {"key": "lv", "value":  "Latviešu"}, //拉脱维亚语				Latviešu
  // // {"key": "lt", "value":  "Lietuviškai"}, //立陶宛语				Lietuviškai
  // {"key": "lb", "value":  "Lëtzebuergesch"}, //卢森堡语			Lëtzebuergesch
  // {"key": "mk", "value":  "Македонски"}, //马其顿语				Македонски
  // {"key": "mg", "value":  "Malagasy"}, //马尔加什语				Malagasy
  // {"key": "ms", "value":  "Melayu"}, //马来语				    Melayu
  // {"key": "ml", "value":  "മലയാളം"}, //马拉雅拉姆语			മലയാളം

  // {"key": "mt", "value":  "Malti"}, //马耳他语				Malti
  // {"key": "mi", "value":  "Maori"}, //毛利语				    Maori
  // {"key": "mr", "value":  "मराठी"}, //马拉地语				    मराठी
  // {"key": "mn", "value":  "Монгол хэл"}, //蒙古语				Монгол хэл
  // {"key": "my", "value":  "မြန်မာ"}, //缅甸语				    မြန်မာ
  // {"key": "ne", "value":  "नेपाली"}, //尼泊尔语				नेपाली
  // {"key": "no", "value":  "norsk språk"}, //挪威语			norsk språk
  // {"key": "ny", "value":  "Chichewa"}, //齐切瓦语				Chichewa
  // {"key": "ps", "value":  "پښتو"}, //普什图语				    پښتو
  // {"key": "fa", "value":  "فارسی"}, //波斯语				    فارسی

  // {"key": "pl", "value":  "Polski"}, //波兰语				    Polski
  // {"key": "pt", "value":  "Português"}, //葡萄牙语			Português
  // {"key": "pa", "value":  "ਪੰਜਾਬੀ"}, //旁遮普语				   ਪੰਜਾਬੀ
  // {"key": "ro", "value":  "românesc"}, //罗马尼亚语			românesc
  {
    key: 'ru',
    value: 'Русский язык',
    languageCode: 'ru-RU',
    name: 'ru-RU-Standard-A',
  }, //俄语				Русский язык
  // {"key": "sm", "value":  "Samoa"}, //萨摩亚语				Samoa
  // {"key": "gd", "value":  "Gàidhlig na h-Alba"}, //苏格兰盖尔语			Gàidhlig na h-Alba
  // {"key": "sr", "value":  "Српски"}, //塞尔维亚语				    Српски
  // {"key": "st", "value":  "Sesotho"}, //塞索托语				    Sesotho
  // {"key": "sn", "value":  "Shinra"}, //修纳语				    Shinra

  // {"key": "sd", "value":  "سنڌي"}, //信德语				    سنڌي
  // {"key": "si", "value":  "සිංහල"}, //僧伽罗语				සිංහල
  // {"key": "sk", "value":  "slovenského jazyk"}, //斯洛伐克语	    slovenského jazyk
  // {"key": "sl", "value":  "Slovenščina"}, //斯洛文尼亚语			Slovenščina
  // {"key": "so", "value":  "Somali"}, //索马里语				    Somali
  {
    key: 'es',
    value: 'Español',
    languageCode: 'es-ES',
    name: 'es-ES-Standard-A',
  }, //西班牙语				    Español
  // {"key": "su", "value":  "Sunda Indonesian"}, //印尼巽他语       Sunda Indonesian
  // {"key": "sw", "value":  "Kiswahili"}, //斯瓦希里语				Kiswahili
  // {"key": "sv", "value":  "Svenska"}, //瑞典语				    Svenska
  // {"key": "tl", "value":  "Filipino"}, //菲律宾语				    Filipino

  // {"key": "tg", "value":  "Тоҷикӣ"}, //塔吉克语				    Тоҷикӣ
  // {"key": "ta", "value":  "தமிழ் மொழி"}, //泰米尔语				    தமிழ் மொழி
  // {"key": "te", "value":  "తెలుగు"}, //泰卢固语				    తెలుగు
  // {"key": "th", "value":  "ไทย"}, //泰语					        ไทย
  // {"key": "tr", "value":  "Türk dili"}, //土耳其语				Türk dili
  // {"key": "uk", "value":  "Українська"}, //乌克兰语				Українська
  // {"key": "ur", "value":  "اردو"}, //乌尔都语				    اردو
  // {"key": "uz", "value":  "O'zbek"}, //乌兹别克语				O'zbek
  // {"key": "vi", "value":  "Tiếng Việt"}, //越南语				Tiếng Việt
  // {"key": "cy", "value":  "Cymraeg"}, //威尔士语				Cymraeg

  // {"key": "xh", "value":  "IsiXhosa saseMzantsi Afrika"}, //南非科萨语    IsiXhosa saseMzantsi Afrika
  // {"key": "yi", "value":  "ייִדיש"}, //意第绪语				            ייִדיש
  // {"key": "yo", "value":  "Yorùbá"}, //约鲁巴语				            Yorùbá
  // {"key": "zu", "value":  "I-South African Zulu"//祖鲁语                I-South African Zulu
];

initReactI18next.init({
  resources: resources,
  fallbackLng: 'en',
  lng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

export default i18n;
