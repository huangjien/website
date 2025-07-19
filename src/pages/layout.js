"use client";
import { Inter } from "next/font/google";
import { useSettings } from "../lib/useSettings";
import { NavigationBar } from "../components/NavigationBar";
import { Button, Spacer } from "@heroui/react";
import { useEffect, useState } from "react";
import { Link } from "@heroui/link";
import { MdKeyboardArrowUp } from "react-icons/md";
import packageJson from "../../package.json";
import { useTranslation } from "react-i18next";

export default function RootLayout({ children }) {
  const { t } = useTranslation();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollButton(scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className='min-h-screen flex flex-col'>
      <NavigationBar />
      <main className='flex-1 p-4'>{children}</main>
      <Spacer />
      {showScrollButton && (
        <Button
          isIconOnly
          variant='flat'
          color='primary'
          size='lg'
          className='fixed bottom-8 right-8 z-50 shadow-lg'
          onPress={scrollToTop}
        >
          <MdKeyboardArrowUp />
        </Button>
      )}
      <footer
        role='contentinfo'
        className='text-center p-4 text-sm text-gray-500'
      >
        <p>
          {t("layout.version")} {packageJson.version}
        </p>
      </footer>
    </div>
  );
}
