'use client';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ProvideSettings } from '../lib/useSettings';
import NoSSR from '../lib/NoSSR';
import { ProvideAuth } from '../lib/useAuth';
import { languages } from '../locales/i18n';
import './globals.css';
// import '../styles/github-markdown.css';

function App({ Component, pageProps }) {
  return (
    // Use at the root of our app
    <NoSSR>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <ProvideSettings>
            <ProvideAuth>
              <Component {...pageProps} />
            </ProvideAuth>
          </ProvideSettings>
        </NextThemesProvider>
      </NextUIProvider>
    </NoSSR>
  );
}
export default App;
