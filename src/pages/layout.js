import { useSettings } from "../lib/useSettings";
import { NavigationBar } from "../components/NavigationBar";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/ui/button";
import Avatar from "../components/ui/avatar";
import { useEffect, useState } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { applyDesignStyleToDocument } from "../lib/ui-ux-pro-max";
import { siteConfig } from "../config/site";

export default function RootLayout({ children }) {
  const { t } = useTranslation();
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { currentStyle } = useSettings();

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    applyDesignStyleToDocument(document, currentStyle);
  }, [currentStyle]);

  return (
    <div className='min-h-screen flex flex-col grain'>
      <a href='#main' className='skip-link'>
        {t("layout.skip_to_content", { defaultValue: "Skip to content" })}
      </a>
      <NavigationBar />
      <div className='flex-1 container-prose py-6'>
        <Breadcrumb />
        <main id='main'>{children}</main>
      </div>
      {showScrollButton && (
        <Button
          variant='default'
          size='icon'
          className='fixed bottom-8 right-8 z-50 shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)] rounded-full animate-slide-up hover:-translate-y-1 hover:brightness-110 transition-all duration-normal ease-out'
          onClick={scrollToTop}
          aria-label={t("layout.scroll_to_top", {
            defaultValue: "Scroll to top",
          })}
          title={t("layout.scroll_to_top", { defaultValue: "Scroll to top" })}
        >
          <MdKeyboardArrowUp />
        </Button>
      )}
      <footer
        role='contentinfo'
        className='border-t border-border/60 mt-8 py-10 text-sm text-muted-foreground'
      >
        <div className='container-prose flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <Avatar
              alt={`${siteConfig.name} logo`}
              className='h-7 w-7 ring-1 ring-border/60'
              src='/favicon.png'
            />
            <div>
              <p className='text-foreground font-medium tracking-tight'>
                {siteConfig.name}
              </p>
              <p className='text-xs text-muted-foreground/80 num-tabular'>
                {t("layout.version", { defaultValue: "Version" })} {appVersion}
              </p>
            </div>
          </div>
          <nav
            aria-label={t("layout.footer_nav", { defaultValue: "Footer" })}
            className='flex flex-wrap items-center gap-x-5 gap-y-2'
          >
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='hover:text-foreground transition-colors duration-normal ease-out'
              >
                {item.label}
              </Link>
            ))}
            <span className='hidden sm:inline text-border'>·</span>
            <Link
              href='/privacy'
              className='hover:text-foreground transition-colors duration-normal ease-out'
            >
              {t("layout.privacy", { defaultValue: "Privacy" })}
            </Link>
            <Link
              href='/terms'
              className='hover:text-foreground transition-colors duration-normal ease-out'
            >
              {t("layout.terms", { defaultValue: "Terms" })}
            </Link>
          </nav>
        </div>
        <p className='container-prose mt-6 text-xs text-muted-foreground/70'>
          © {new Date().getFullYear()} {siteConfig.name}.{" "}
          {t("layout.rights", {
            defaultValue: "All rights reserved.",
          })}
        </p>
      </footer>
    </div>
  );
}
