import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ProvideSettings } from "../lib/useSettings";
import { SessionProvider } from "next-auth/react";
import {
  Geist as FontSans,
  Geist_Mono as FontMono,
  Newsreader as FontDisplay,
} from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import RootLayout from "./layout";
import "../locales/i18n";
import PwaRegister from "../components/PwaRegister";
import { ToastProvider } from "../components/ToastProvider";

// next/font requires non-exported module-top-level const declarations.
// Kept inline in _app.js (the Pages Router global) so the fonts load
// exactly once per app. NOTE: this requires the webpack dev pipeline
// (pnpm dev) rather than Turbopack (pnpm dev:turbo); Turbo's font
// transform regression rejects 2+ const declarations per project.
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontDisplay = FontDisplay({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <NextThemesProvider attribute='class' defaultTheme='dark'>
        <ProvideSettings>
          <PwaRegister />
          <div
            className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} font-sans`}
          >
            <RootLayout>
              <ToastProvider />
              <Component {...pageProps} />
            </RootLayout>
          </div>
        </ProvideSettings>
      </NextThemesProvider>
    </SessionProvider>
  );
}
export default App;
