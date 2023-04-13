import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { darkTheme, globalStyle, lightTheme } from '../lib/themes';
import { ProvideAuth } from '../lib/useAuth';
import { ProvideSettings } from '../lib/useSettings';
import '../locales/i18n';
import '../styles/github-markdown.css';

export default function App({ Component, pageProps }) {
  globalStyle();
  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
      }}
    >
      <NextUIProvider>
        <ProvideSettings>
          <ProvideAuth>
            <Component {...pageProps} />
          </ProvideAuth>
        </ProvideSettings>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
