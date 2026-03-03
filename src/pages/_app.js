import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ProvideSettings } from "../lib/useSettings";
import NoSSR from "../lib/NoSSR";
import { SessionProvider } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import RootLayout from "./layout";
import "../locales/i18n";
import PwaRegister from "../components/PwaRegister";
import { ToastProvider } from "../components/ToastProvider";

function App({ Component, pageProps }) {
  return (
    <NoSSR>
      <SessionProvider session={pageProps.session}>
        <NextThemesProvider attribute='class' defaultTheme='dark'>
          <ProvideSettings>
            <NoSSR>
              <PwaRegister />
            </NoSSR>
            <RootLayout>
              <ToastProvider />
              <Component {...pageProps} />
            </RootLayout>
          </ProvideSettings>
        </NextThemesProvider>
      </SessionProvider>
    </NoSSR>
  );
}
export default App;
