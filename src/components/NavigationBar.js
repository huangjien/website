"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { BiChip, BiCog, BiDetail, BiHome } from "react-icons/bi";
import Login from "./Login";
import { ThemeSwitch } from "./ThemeSwitch";
import { LanguageSwitch } from "./LanguageSwitch";
import { StyleSwitch } from "./StyleSwitch";
import Avatar from "./ui/avatar";
import { MobileMenu } from "./MobileMenu";

const NAV_ITEMS = [
  { href: "/", icon: BiHome, key: "header.home" },
  { href: "/ai", icon: BiChip, key: "header.ai" },
  { href: "/settings", icon: BiCog, key: "header.settings" },
  { href: "/about", icon: BiDetail, key: "header.about" },
];

const isRouteActive = (pathname, href) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const navLinkClass = (active) =>
  `group relative flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors duration-normal ease-out cursor-pointer ${
    active
      ? "text-accent-foreground bg-[hsla(var(--glass-bg-hover))]"
      : "hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground"
  }`;

const navUnderlineClass = (active) =>
  `absolute inset-x-3 -bottom-px h-px bg-gradient-primary transition-opacity duration-normal ${
    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
  }`;

/**
 * Renders a navigation bar with menu items and buttons.
 * @returns {JSX.Element} The rendered navigation bar.
 */
export const NavigationBar = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = router?.pathname || "/";

  return (
    <nav className='w-full glass-nav text-foreground border-b border-border/50 sticky top-0 z-40'>
      <div className='container-prose flex items-center justify-between gap-4 h-16 mt-3 mb-3 rounded-2xl glass shadow-sm px-4'>
        <div className='flex items-center'>
          <Link
            href='/'
            className='flex items-center group'
            aria-label='Home'
            title='Home'
          >
            <Avatar
              alt='Logo'
              className='mr-2 h-9 w-9 ring-1 ring-border/60 transition-transform duration-normal ease-out group-hover:scale-[1.04]'
              src='/favicon.png'
            />
          </Link>
          <MobileMenu />
        </div>
        <div className='lg:flex items-center gap-1 hidden'>
          {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
            const active = isRouteActive(pathname, href);
            return (
              <Link key={href} className={navLinkClass(active)} href={href}>
                <Icon
                  size='1.35em'
                  className='transition-transform duration-normal ease-out group-hover:scale-110'
                  aria-hidden='true'
                />{" "}
                <span className='font-medium tracking-tight'>{t(key)}</span>
                <span className={navUnderlineClass(active)} />
              </Link>
            );
          })}
        </div>
        <div className='flex items-center gap-2'>
          <Login />
          <ThemeSwitch />
          <StyleSwitch />
          <LanguageSwitch />
        </div>
      </div>
    </nav>
  );
};
