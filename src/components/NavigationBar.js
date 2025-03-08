"use client";
import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { BiChip, BiCog, BiDetail, BiHome } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "./ThemeSwitch";
import { LanguageSwitch } from "./LanguageSwitch";
import { useSession } from "next-auth/react";
import Link from "next/link";

/**
 * Renders a navigation bar with menu items and buttons.
 * @returns {JSX.Element} The rendered navigation bar.
 */
export const NavigationBar = () => {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  return (
    <nav
      id='main_header'
      isBordered={theme === "dark"}
      variant='sticky'
      css={{
        $$navbarBackgroundColor: "transparent",
        $$navbarBlurBackgroundColor: "transparent",
      }}
    >
      <div className='block'>
        <Menu>
          <MenuButton>
            <img
              src='/favicon.png'
              alt='brand'
              isZoomed
              width={32}
              height={32}
            />
          </MenuButton>
          <MenuItems
            className='sm:block md:block lg:hidden font-bold text-inherit'
            aria-label='main_dropdown_menu'
            disallowEmptySelection
            selectionMode='single'
          >
            <MenuItem>
              <Link href='/' underline='active'>
                <BiHome size='2em' /> {t("header.home")}
              </Link>
            </MenuItem>
            {status === "authenticated" && (
              <MenuItem>
                <Link href='/ai' underline='active'>
                  <BiChip size='2em' /> {t("header.ai")}
                </Link>
              </MenuItem>
            )}
            {status === "authenticated" && (
              <MenuItem>
                <Link href='/settings' underline='active'>
                  <BiCog size='2em' /> {t("header.settings")}
                </Link>
              </MenuItem>
            )}
            <MenuItem>
              <Link href='/about' underline='active'>
                <BiDetail size='2em' /> {t("header.about")}
              </Link>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
      <div className='font-bold text-inherit text-primary'>
        <div className='hidden lg:block '>
          <Link href='/'>
            <BiHome size='2em' /> {t("header.home")}
          </Link>
        </div>
        {status === "authenticated" && (
          <div className='hidden lg:block'>
            <Link href='/ai' underline='active'>
              <BiChip size='2em' /> {t("header.ai")}
            </Link>
          </div>
        )}
        {status === "authenticated" && (
          <div className='hidden lg:block'>
            <Link href='/settings' underline='active'>
              <BiCog size='2em' /> {t("header.settings")}
            </Link>
          </div>
        )}
        <div className='hidden lg:block'>
          <Link href='/about' underline='active'>
            <BiDetail size='2em' /> {t("header.about")}
          </Link>
        </div>

        <div className='hidden sm:block lg:flex mx-2' />
        <div className='lg:block'>
          <Login />
        </div>
        <div className='lg:block'>
          <ThemeSwitch />
        </div>
        <div className='lg:block'>
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
