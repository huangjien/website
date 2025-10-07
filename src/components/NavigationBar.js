"use client";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  Navbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Link } from "@heroui/link";
import { Spacer } from "@heroui/spacer";
import { useTranslation } from "react-i18next";
import { Image } from "@heroui/image";
import { BiChip, BiCog, BiDetail, BiHome } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "./ThemeSwitch";
import { LanguageSwitch } from "./LanguageSwitch";
import { useSession } from "next-auth/react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";

/**
 * Renders a navigation bar with menu items and buttons.
 * @returns {JSX.Element} The rendered navigation bar.
 */
export const NavigationBar = () => {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  return (
    <Navbar className='w-full'>
      <NavbarContent className='w-full flex items-center justify-between'>
        <NavbarItem>
          <Link href='/' className='flex items-center'>
            <Avatar alt='Logo' className='mr-2' src='/favicon.png' />
          </Link>
        </NavbarItem>
        <div className='lg:flex items-center gap-6 hidden'>
          <NavbarItem>
            <Link href='/'>
              <BiHome size='2em' /> {t("header.home")}
            </Link>
          </NavbarItem>
          {status === "authenticated" && (
            <NavbarItem>
              <Link href='/ai'>
                <BiChip size='2em' /> {t("header.ai")}
              </Link>
            </NavbarItem>
          )}
          {status === "authenticated" && (
            <NavbarItem>
              <Link href='/settings'>
                <BiCog size='2em' /> {t("header.settings")}
              </Link>
            </NavbarItem>
          )}
          <NavbarItem>
            <Link href='/about'>
              <BiDetail size='2em' /> {t("header.about")}
            </Link>
          </NavbarItem>
        </div>
        <NavbarContent className='flex items-center gap-2' justify='end'>
          <Login />
          <ThemeSwitch />
          <LanguageSwitch />
        </NavbarContent>
        <ToastContainer
          autoClose={5000}
          limit={3}
          pauseOnHover
          closeOnClick
          theme={theme === "dark" ? "dark" : "light"}
          draggable
        />
      </NavbarContent>
    </Navbar>
  );
};
