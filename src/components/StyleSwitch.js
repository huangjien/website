"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { BiPalette } from "react-icons/bi";
import Button from "./ui/button";
import { useSettings } from "../lib/useSettings";
import { DESIGN_STYLES, resolveDesignStyle } from "../lib/ui-ux-pro-max";

export const StyleSwitch = () => {
  const { t } = useTranslation();
  const { currentStyle, setCurrentStyle } = useSettings();

  const chooseStyle = (styleKey) => {
    try {
      const resolved = resolveDesignStyle(styleKey);
      setCurrentStyle(resolved);
    } catch (error) {
      console.error("Failed to change design style", error);
    }
  };

  const styleLabel = (styleKey) => {
    const style = DESIGN_STYLES.find((s) => s.key === styleKey);
    if (!style) return styleKey;
    const fallback = style.key
      .split("_")
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(" ");
    return t(style.i18nKey, { defaultValue: fallback });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label={t("style_switch.switch_design_style", {
            defaultValue: "Switch design style",
          })}
          variant='ghost'
          size='icon'
          className='bg-transparent text-foreground'
          title={t("design_style.label", { defaultValue: "Design style" })}
        >
          <BiPalette size='1.5em' aria-hidden='true' />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        sideOffset={6}
        className='z-50 min-w-48 rounded-xl glass-card p-1 text-popover-foreground shadow-lg animate-slide-down transition-all duration-fast ease-out'
        role='menu'
        aria-label={t("style_switch.design_style_menu", {
          defaultValue: "Design style menu",
        })}
      >
        {DESIGN_STYLES.map((item) => (
          <DropdownMenu.Item
            key={item.key}
            className='flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground'
            onSelect={() => chooseStyle(item.key)}
            role='menuitem'
          >
            {styleLabel(item.key)}
            {resolveDesignStyle(currentStyle) === item.key && (
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
