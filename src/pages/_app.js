"use client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ProvideSettings } from "../lib/useSettings";
import NoSSR from "../lib/NoSSR";
import { SessionProvider } from "next-auth/react";
// import { languages } from '../locales/i18n';
import "./globals.css";
import RootLayout from "./layout";
import "tailwindcss/tailwind.css";

function App({ Component, pageProps }) {
  return (
    // Use at the root of our app
    <NoSSR>
      <NextUIProvider>
        <SessionProvider session={pageProps.session}>
          <NextThemesProvider attribute='class' defaultTheme='dark'>
            <ProvideSettings>
              <RootLayout>
                <Component {...pageProps} />
              </RootLayout>
            </ProvideSettings>
          </NextThemesProvider>
        </SessionProvider>
      </NextUIProvider>
    </NoSSR>
  );
}
export default App;
