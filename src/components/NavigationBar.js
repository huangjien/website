"use client";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BiChip, BiCog, BiDetail, BiHome } from "react-icons/bi";
import { ToastContainer } from "react-toastify";
import Login from "./Login";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "./ThemeSwitch";
import { LanguageSwitch } from "./LanguageSwitch";
import { useSession } from "next-auth/react";
import Avatar from "./ui/avatar";

/**
 * Renders a navigation bar with menu items and buttons.
 * @returns {JSX.Element} The rendered navigation bar.
 */
export const NavigationBar = () => {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  // Inside the navigation links rendering, ensure Settings link is always visible
  return (
    <nav className='w-full bg-background/80 backdrop-blur-md text-foreground border-b ring-1 ring-border'>
      <div className='w-full flex items-center justify-between h-14 px-4 mx-2 my-2 rounded-xl shadow-xs'>
        <div className='flex items-center'>
          <Link href='/' className='flex items-center'>
            <Avatar alt='Logo' className='mr-2 h-8 w-8' src='/favicon.png' />
          </Link>
        </div>
        <div className='lg:flex items-center gap-2 hidden'>
          <Link
            className='group relative flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/40 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105'
            href='/'
          >
            <BiHome size='1.5em' className='group-hover:animate-bounce-subtle' /> {t("header.home")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-fast group-hover:w-full' />
          </Link>
          <Link
            className='group relative flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/40 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105'
            href='/ai'
          >
            <BiChip size='1.5em' className='group-hover:animate-bounce-subtle' /> {t("header.ai")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-fast group-hover:w-full' />
          </Link>
          <Link
            className='group relative flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/40 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105'
            href='/settings'
          >
            <BiCog size='1.5em' className='group-hover:animate-bounce-subtle' /> {t("header.settings")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-fast group-hover:w-full' />
          </Link>
          <Link
            className='group relative flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/40 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105'
            href='/about'
          >
            <BiDetail size='1.5em' className='group-hover:animate-bounce-subtle' /> {t("header.about")}
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-fast group-hover:w-full' />
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <Login />
          <ThemeSwitch />
          <LanguageSwitch />
        </div>
        <ToastContainer
          autoClose={5000}
          limit={3}
          pauseOnHover
          closeOnClick
          theme={theme === "dark" ? "dark" : "light"}
          draggable
        />
      </div>
    </nav>
  );
};
