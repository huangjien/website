"use client";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BiChip, BiCog, BiDetail, BiHome } from "react-icons/bi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  return (
    <nav className='w-full border-b bg-background text-foreground'>
      <div className='w-full flex items-center justify-between h-14 px-4'>
        <div className='flex items-center'>
          <Link href='/' className='flex items-center'>
            <Avatar alt='Logo' className='mr-2 h-8 w-8' src='/favicon.png' />
          </Link>
        </div>
        <div className='lg:flex items-center gap-6 hidden'>
          <Link className='flex items-center gap-2 hover:underline' href='/'>
            <BiHome size='1.5em' /> {t("header.home")}
          </Link>
          {/* {status === "authenticated" && ( */}
            <Link className='flex items-center gap-2 hover:underline' href='/ai'>
              <BiChip size='1.5em' /> {t("header.ai")}
            </Link>
          {/* )} */}
          {/* {status === "authenticated" && ( */}
            <Link className='flex items-center gap-2 hover:underline' href='/settings'>
              <BiCog size='1.5em' /> {t("header.settings")}
            </Link>
          {/* )} */}
          <Link className='flex items-center gap-2 hover:underline' href='/about'>
            <BiDetail size='1.5em' /> {t("header.about")}
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
