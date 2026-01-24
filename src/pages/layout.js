import { useSettings } from "../lib/useSettings";
import { NavigationBar } from "../components/NavigationBar";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/ui/button";
import { useEffect, useState } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";
import packageJson from "../../package.json";
import { useTranslation } from "react-i18next";
import { applyDesignStyleToDocument } from "../lib/ui-ux-pro-max";

export default function RootLayout({ children }) {
  const { t } = useTranslation();
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    applyDesignStyleToDocument(document, currentStyle);
  }, [currentStyle]);

  return (
    <div className='min-h-screen flex flex-col'>
      <NavigationBar />
      <div className='flex-1 p-4'>
        <Breadcrumb />
        <main>{children}</main>
      </div>
      {showScrollButton && (
        <Button
          variant='default'
          size='icon'
          className='fixed bottom-8 right-8 z-50 shadow-glass-glow rounded-full animate-slide-up hover:scale-110 hover:shadow-glass-glow-hover transition-all duration-fast ease-out'
          onClick={scrollToTop}
          aria-label='Scroll to top'
          title='Scroll to top'
        >
          <MdKeyboardArrowUp />
        </Button>
      )}
      <footer
        role='contentinfo'
        className='text-center p-4 text-sm text-gray-500'
      >
        <p>
          {t("layout.version")} {packageJson.version}
        </p>
      </footer>
    </div>
  );
}
