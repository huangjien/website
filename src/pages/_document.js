import { CssBaseline } from '@nextui-org/react';
import { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  async function getInitialProps(ctx) {
    // we can put get init data here !!!
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: React.Children.toArray([initialProps.styles]),
    };
  }
  return (
    <Html lang="en">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="emotion-insertion-point" content="" />
        {CssBaseline.flush()}{' '}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
