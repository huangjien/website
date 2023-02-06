import SSRProvider from 'react-bootstrap/SSRProvider';

export default function App({ Component, pageProps }) {
  return (
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
  );
}
