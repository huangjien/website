import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { BiGlobe } from "react-icons/bi";
import { languages } from "../locales/i18n";
import { useSettings } from "../lib/useSettings";
import { useEffect } from "react";
import Button from "./ui/button";

export const LanguageSwitch = () => {
  const {
    setLanguageCode,
    setCurrentLanguage,
    currentLanguage,
    setSpeakerName,
  } = useSettings();
  const { t, i18n } = useTranslation();

  const chooseLanguageKey = (key) => {
    try {
      const selected = languages.find((l) => l.key === key);
      if (selected) {
        setLanguageCode(selected.languageCode);
        setSpeakerName(selected.name);
      }
      setCurrentLanguage(key);
    } catch (error) {
      console.error("Failed to change language", error);
    }
  };

  useEffect(() => {
    if (i18n && currentLanguage) {
      i18n.changeLanguage(currentLanguage);
      // search in languages array for the current language and set languageCode and speakerName
      const lang = languages.find((o) => o.key === currentLanguage);
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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label='switch language'
          variant='ghost'
          size='icon'
          className='bg-transparent text-foreground'
          title={t("header.language")}
        >
          <BiGlobe size='1.5em' aria-hidden='true' />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        sideOffset={6}
        className='z-50 min-w-[10rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-slide-down transition-all duration-fast ease-out'
        role='menu'
        aria-label='language menu'
      >
        {languages.map((item) => (
          <DropdownMenu.Item
            key={item.key}
            className='flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground'
            onSelect={() => chooseLanguageKey(item.key)}
            role='menuitem'
          >
            {item.value}
            {currentLanguage === item.key && (
              <span
                className='ml-auto text-xs text-muted-foreground'
                aria-label='selected'
              >
                ✓
              </span>
            )}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
