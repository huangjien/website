"use client";
import Button from "./ui/button";
import Tooltip from "./ui/tooltip";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { BiMoon, BiSun } from "react-icons/bi";
import { useTranslation } from "react-i18next";

export const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const onChange = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Tooltip content={theme !== "light" ? t("header.day") : t("header.night")}>
      <Button
        aria-label='switch theme'
        variant='ghost'
        size='icon'
        className='bg-transparent text-foreground'
        onClick={onChange}
        title={theme !== "light" ? t("header.day") : t("header.night")}
      >
        <span aria-hidden='true'>
          {theme === "light" && <BiMoon size={"1.5em"} />}
          {theme !== "light" && <BiSun size={"1.5em"} />}
        </span>
      </Button>
    </Tooltip>
  );
};
