"use client";
import { useTranslation } from "react-i18next";
import { MdLogin, MdLogout, MdSettings } from "react-icons/md";
import { signIn, signOut, useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Button from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export const openInNewTab = (url) => {
  if (typeof window === "undefined") {
    return null;
  }
  const openedWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (openedWindow) {
    openedWindow.opener = null;
  }
  return openedWindow;
};

export const handleDropdownAction = (key) => {
  switch (key) {
    case "logout":
      signOut();
      return true;
    case "settings":
      openInNewTab("/settings");
      return true;
    default:
      return false;
  }
};

export const getUserInitials = (name) => {
  if (!name || typeof name !== "string") {
    return "?";
  }
  return name.slice(0, 1) || "?";
};

export const getUserDisplayName = (user) => {
  if (!user) return "";
  return user.name || "";
};

export const getUserDisplayEmail = (user) => {
  if (!user) return "";
  return user.email || "";
};

export const getUserImage = (user) => {
  if (!user) return "";
  return user.image || "";
};

const Login = ({
  onLogin = () => signIn("github"),
  onLogout = () => signOut(),
  onSettings = () => openInNewTab("/settings"),
} = {}) => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  const shouldShowLoginButton =
    status === "unauthenticated" || status === "loading" || !session?.user;

  if (shouldShowLoginButton) {
    const loginAriaLabel = t("header.login", { defaultValue: "Login" });
    return (
      <Button
        aria-label={loginAriaLabel}
        variant='secondary'
        onClick={onLogin}
        className='gap-2'
        title={loginAriaLabel}
      >
        <MdLogin />
        {loginAriaLabel}
      </Button>
    );
  }

  const name = getUserDisplayName(session.user);
  const email = getUserDisplayEmail(session.user);
  const image = getUserImage(session.user);
  const initials = getUserInitials(name);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className='flex items-center gap-2 rounded-xl glass px-3 py-1.5 text-foreground shadow-sm hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground transition-transform duration-fast ease-out hover:scale-105 cursor-pointer touch-action-manipulation'
          aria-label={t("header.message", { defaultValue: "User menu" })}
        >
          <Avatar className='h-8 w-8'>
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col items-start'>
            <span className='text-sm font-medium'>{name}</span>
            <span className='text-xs text-muted-foreground'>{email}</span>
          </div>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        sideOffset={6}
        className='z-50 min-w-48 rounded-xl glass-card p-1.5 text-popover-foreground shadow-lg animate-slide-down transition-all duration-fast ease-out'
      >
        <DropdownMenu.Label className='px-2 py-1.5 text-xs text-muted-foreground'>
          {t("header.message", { defaultValue: "Message" })}
        </DropdownMenu.Label>
        <DropdownMenu.Item
          className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground transition-colors duration-fast'
          onSelect={onSettings}
        >
          <MdSettings /> {t("header.settings", { defaultValue: "Settings" })}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className='flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none hover:bg-[hsla(var(--glass-bg-hover))] hover:text-accent-foreground transition-colors duration-fast'
          onSelect={onLogout}
        >
          <MdLogout /> {t("header.logout", { defaultValue: "Logout" })}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export { Login };
export default Login;
