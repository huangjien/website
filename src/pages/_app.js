import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ProvideSettings } from "../lib/useSettings";
import NoSSR from "../lib/NoSSR";
import { SessionProvider } from "next-auth/react";
// import { languages } from '../locales/i18n';
import "./globals.css";
import RootLayout from "./layout";
import "../locales/i18n";

function App({ Component, pageProps }) {
  return (
    // Use at the root of our app
    <NoSSR>
      <SessionProvider session={pageProps.session}>
        <NextThemesProvider attribute='class' defaultTheme='dark'>
          <ProvideSettings>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </ProvideSettings>
        </NextThemesProvider>
      </SessionProvider>
    </NoSSR>
  );
}
export default App;
