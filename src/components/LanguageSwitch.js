import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { BiGlobe } from "react-icons/bi";
import { ensureLocaleLoaded, languages } from "../locales/i18n";
import { useSettings } from "../lib/useSettings";
import { useEffect } from "react";
import Button from "./ui/button";

export const LanguageSwitch = () => {
  const { setCurrentLanguage, currentLanguage } = useSettings();
  const { t, i18n } = useTranslation();

  const chooseLanguageKey = (key) => {
    try {
      const selected = languages.find((l) => l.key === key);
      if (selected) {
        setCurrentLanguage(key);
      }
    } catch (error) {
      console.error("Failed to change language", error);
    }
  };

  useEffect(() => {
    if (i18n && currentLanguage) {
      Promise.resolve(
        typeof ensureLocaleLoaded === "function"
          ? ensureLocaleLoaded(currentLanguage)
          : undefined,
      ).finally(() => {
        i18n.changeLanguage(currentLanguage);
      });
    }
  }, [currentLanguage, i18n]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label={t("language_switch.switch_language", {
            defaultValue: "Switch language",
          })}
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
        className='z-50 min-w-[10rem] rounded-xl glass-card p-1 text-popover-foreground shadow-lg animate-slide-down transition-all duration-fast ease-out'
        role='menu'
        aria-label={t("language_switch.language_menu", {
          defaultValue: "Language menu",
        })}
      >
        {languages.map((item) => (
          <DropdownMenu.Item
            key={item.key}
            className={`flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-sm outline-none transition-all duration-fast ease-out ${
              currentLanguage === item.key
                ? "bg-accent text-accent-foreground"
                : "hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground"
            }`}
            onSelect={() => chooseLanguageKey(item.key)}
            role='menuitem'
            aria-current={currentLanguage === item.key ? "true" : undefined}
          >
            {item.value}
            {currentLanguage === item.key && (
              <span
                className='ml-auto text-xs font-semibold'
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
