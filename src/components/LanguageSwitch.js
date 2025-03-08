import { useTranslation } from "react-i18next";
import { BiGlobe } from "react-icons/bi";
import { languages } from "../locales/i18n";
import { useSettings } from "../lib/useSettings";
import { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";

export const LanguageSwitch = () => {
  const {
    setLanguageCode,
    setCurrentLanguage,
    currentLanguage,
    setSpeakerName,
  } = useSettings();
  const [language, setLanguage] = useState(new Set([currentLanguage]));
  const { t, i18n } = useTranslation();

  const chooseLanguage = (lang) => {
    var it = lang.values();
    //get first entry:
    var first = it.next();
    //get value out of the iterator entry:
    var value = first.value;
    setLanguage(lang);
    setCurrentLanguage(value);
  };

  useEffect(() => {
    if (currentLanguage) {
      i18n.changeLanguage(currentLanguage);
      // search in languages array for the current language and set languageCode and speakerName
      var lang = languages.find((o) => o.key === currentLanguage);
      if (lang && lang.languageCode && lang.name) {
        setLanguageCode(lang.languageCode);
        setSpeakerName(lang.name);
      } else {
        setLanguageCode(undefined);
        setSpeakerName(undefined);
      }
    }
  }, [currentLanguage, setLanguageCode, setSpeakerName, i18n]);

  return (
    <Menu>
      <MenuButton>
        <button
          aria-label='switch language'
          light
          className=' bg-transparent text-primary '
        >
          <BiGlobe size='2em' />
        </button>
      </MenuButton>
      <MenuItems
        disallowEmptySelection
        selectionMode='single'
        selectedKeys={language}
        items={languages}
        className='text-inherit text-primary'
        onSelectionChange={chooseLanguage}
        aria-label='language'
      >
        {(item) => <MenuItem key={item.key}>{item.value}</MenuItem>}
      </MenuItems>
    </Menu>
  );
};
