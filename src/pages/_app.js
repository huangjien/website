import { NextUIProvider } from '@nextui-org/react';
import SSRProvider from 'react-bootstrap/SSRProvider';

export default function App({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <SSRProvider>
        <Component {...pageProps} />
      </SSRProvider>
    </NextUIProvider>
  );
}
