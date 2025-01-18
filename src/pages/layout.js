"use client";
import { Inter } from "next/font/google";
import { useSettings } from "../lib/useSettings";
import { NavigationBar } from "../components/NavigationBar";
import { ScrollShadow } from "@nextui-org/react";
import { useScroll } from "ahooks";
import { useEffect, useState, useRef } from "react";
import { Link } from "@nextui-org/link";
import { BiArrowToTop } from "react-icons/bi";
import packageJson from "../../package.json";
import { triggerPx } from "../lib/global";

export default function RootLayout({ children }) {
  const scroll = useScroll();
  const [show, setShow] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!scroll) {
      return;
    }
    var sTop = scroll.top;
    if (!show && sTop > triggerPx) {
      setShow(true);
    } else if (show && sTop < triggerPx) {
      setShow(false);
    }
  }, [show, scroll]);

  return (
    // <html lang="en" suppressHydrationWarning>
    //   <body className="bg-white dark:bg-black text-white dark:text-black">
    <main className="w-full flex flex-col h-full min-h-screen bg-white dark:bg-black text-black dark:text-white ">
      <NavigationBar className=" text-gray-700 bg-white dark-mode:text-gray-200 dark-mode:bg-gray-800" />
      {children}
      <BiArrowToTop
        className=" animate-bounce fixed bottom-32 right-10 primary"
        size="2em"
        onClick={scrollToTop}
        style={{ display: show ? "flex" : "none" }}
      />

      <div class="fixed bottom-0 left-0 z-50 bg-gray-500 text-white text-xs shadow-md px-2 rounded-full font-mono">
        <span class="block sm:hidden">xs</span>
        <span class="hidden sm:inline md:hidden">sm</span>
        <span class="hidden md:inline lg:hidden">md</span>
        <span class="hidden lg:inline xl:hidden">lg</span>
        <span class="hidden xl:inline">xl</span>
      </div>
      <footer className=" fixed bottom-0 text-center text-gray-600 right-48 ">
        <p className=" text-xs">
          <Link
            class="hidden sm:inline"
            href={"mailto:" + packageJson.author}
            size={"sm"}
          >
            {packageJson.copyright}
          </Link>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{" version: " + packageJson.version}
        </p>
      </footer>
    </main>

    //   </body>
    // </html>
  );
}
