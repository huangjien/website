"use client";
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BiChip, BiCog, BiDetail, BiHome } from "react-icons/bi";
import { ToastContainer } from "react-toastify";
import Login from "./Login";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "./ThemeSwitch";
import { LanguageSwitch } from "./LanguageSwitch";
import { StyleSwitch } from "./StyleSwitch";
import { useSession } from "next-auth/react";
import Avatar from "./ui/avatar";
import { MobileMenu } from "./MobileMenu";

/**
 * Renders a navigation bar with menu items and buttons.
 * @returns {JSX.Element} The rendered navigation bar.
 */
export const NavigationBar = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inside navigation links rendering, ensure Settings link is always visible
  return (
    <nav className='w-full glass-nav text-foreground border-b border-border/50'>
      <div className='w-full flex items-center justify-between h-14 px-4 mx-4 my-3 rounded-2xl glass shadow-sm'>
        <div className='flex items-center'>
          <Link href='/' className='flex items-center'>
            <Avatar alt='Logo' className='mr-2 h-8 w-8' src='/favicon.png' />
          </Link>
          <MobileMenu />
        </div>
        <div className='lg:flex items-center gap-2 hidden'>
          <Link
            className='group relative flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/10 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105 cursor-pointer'
            href='/'
          >
            <BiHome
              size='1.5em'
              className='group-hover:animate-bounce-subtle'
            />{" "}
            {t("header.home")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-primary transition-all duration-fast group-hover:w-full rounded-full' />
          </Link>
          <Link
            className='group relative flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/10 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105 cursor-pointer'
            href='/ai'
          >
            <BiChip
              size='1.5em'
              className='group-hover:animate-bounce-subtle'
            />{" "}
            {t("header.ai")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-primary transition-all duration-fast group-hover:w-full rounded-full' />
          </Link>
          <Link
            className='group relative flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/10 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105 cursor-pointer'
            href='/settings'
          >
            <BiCog size='1.5em' className='group-hover:animate-bounce-subtle' />{" "}
            {t("header.settings")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-primary transition-all duration-fast group-hover:w-full rounded-full' />
          </Link>
          <Link
            className='group relative flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/10 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105 cursor-pointer'
            href='/about'
          >
            <BiDetail
              size='1.5em'
              className='group-hover:animate-bounce-subtle'
            />{" "}
            {t("header.about")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-primary transition-all duration-fast group-hover:w-full rounded-full' />
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <Login />
          <ThemeSwitch />
          <StyleSwitch />
          <LanguageSwitch />
        </div>
        <ToastContainer
          autoClose={5000}
          limit={3}
          pauseOnHover
          closeOnClick
          theme={mounted && theme === "dark" ? "dark" : "light"}
          draggable
        />
      </div>
    </nav>
  );
};
