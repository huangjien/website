"use client";
import { Button, Tooltip } from "@nextui-org/react";
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
    <Tooltip
      color="primary"
      content={theme !== "light" ? t("header.day") : t("header.night")}
    >
      <Button
        aria-label="switch theme"
        light
        className=" bg-transparent text-primary "
        onClick={onChange}
      >
        {theme === "light" && <BiMoon size={"2em"} />}
        {theme !== "light" && <BiSun size={"2em"} />}
      </Button>
    </Tooltip>
  );
};
