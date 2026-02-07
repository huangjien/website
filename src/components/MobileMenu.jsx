"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BiHome, BiChip, BiCog, BiDetail, BiMenu, BiX } from "react-icons/bi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Button from "./ui/button";

export const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className='lg:hidden'>
      <Button
        variant='ghost'
        size='icon'
        className='bg-transparent text-foreground'
        onClick={handleOpen}
        aria-label={t("mobile_menu.toggle_menu", {
          defaultValue: "Toggle menu",
        })}
        title={t("global.menu", { defaultValue: "Menu" })}
      >
        {open ? <BiX size='1.5em' /> : <BiMenu size='1.5em' />}
      </Button>

      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Content
          sideOffset={6}
          className='z-50 min-w-[12rem] rounded-xl glass-card p-2 text-popover-foreground shadow-lg animate-slide-down transition-all duration-fast ease-out'
          role='menu'
          aria-label={t("mobile_menu.mobile_navigation_menu", {
            defaultValue: "Mobile navigation menu",
          })}
        >
          <DropdownMenu.Item
            className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-all duration-fast ease-out'
            onSelect={handleClose}
            role='menuitem'
            asChild
          >
            <Link href='/' className='w-full'>
              <BiHome size='1.2em' aria-hidden='true' /> {t("header.home")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-all duration-fast ease-out'
            onSelect={handleClose}
            role='menuitem'
            asChild
          >
            <Link href='/ai' className='w-full'>
              <BiChip size='1.2em' aria-hidden='true' /> {t("header.ai")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-all duration-fast ease-out'
            onSelect={handleClose}
            role='menuitem'
            asChild
          >
            <Link href='/settings' className='w-full'>
              <BiCog size='1.2em' aria-hidden='true' /> {t("header.settings")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-all duration-fast ease-out'
            onSelect={handleClose}
            role='menuitem'
            asChild
          >
            <Link href='/about' className='w-full'>
              <BiDetail size='1.2em' aria-hidden='true' /> {t("header.about")}
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

export default MobileMenu;
