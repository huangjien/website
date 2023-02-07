import { CssBaseline } from '@nextui-org/react';
import { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';


export default function Document() {
  async function getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: React.Children.toArray([initialProps.styles])
    };
  }
  return (
    <Html lang="en">
      <Head >{CssBaseline.flush()} </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
