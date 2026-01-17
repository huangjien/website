"use client";
import { useTranslation } from "react-i18next";
import { MdLogin, MdLogout, MdSettings } from "react-icons/md";
import { signIn, signOut, useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Button from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const Login = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  const handleDropdownAction = (key) => {
    switch (key) {
      case "logout":
        signOut();
        break;
      case "settings":
        window.open("/settings", "_blank");
        break;
      default:
        break;
    }
  };

  if (status === "unauthenticated" || status === "loading" || !session?.user) {
    return (
      <Button
        aria-label='login'
        variant='secondary'
        onClick={() => signIn("github")}
        className='gap-2'
        title={t("header.login")}
      >
        <MdLogin />
        {t("header.login")}
      </Button>
    );
  }

  const name = session.user.name || "";
  const email = session.user.email || "";
  const image = session.user.image || "";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className='flex items-center gap-2 rounded-xl glass px-3 py-1.5 text-foreground shadow-sm hover:bg-white/10 hover:text-accent-foreground transition-all duration-fast ease-out hover:scale-105 cursor-pointer'
          aria-label='user menu'
        >
          <Avatar className='h-8 w-8'>
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{name?.slice(0, 1) || "?"}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col items-start'>
            <span className='text-sm font-medium'>{name}</span>
            <span className='text-xs text-muted-foreground'>{email}</span>
          </div>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        sideOffset={6}
        className='z-50 min-w-[12rem] rounded-xl glass-card p-1.5 text-popover-foreground shadow-lg animate-slide-down transition-all duration-fast ease-out'
      >
        <DropdownMenu.Label className='px-2 py-1.5 text-xs text-muted-foreground'>
          {t("header.message")}
        </DropdownMenu.Label>
        <DropdownMenu.Item
          className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none hover:bg-white/10 hover:text-accent-foreground transition-all duration-fast ease-out'
          onSelect={() => window.open("/settings", "_blank")}
        >
          <MdSettings /> {t("header.settings")}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none hover:bg-white/10 hover:text-accent-foreground transition-all duration-fast ease-out'
          onSelect={() => signOut()}
        >
          <MdLogout /> {t("header.logout")}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export { Login };
export default Login;
