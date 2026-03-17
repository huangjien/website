import { Head, Html, Main, NextScript } from "next/document";
import React from "react";

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link rel='shortcut icon' href='/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/icon-512x512.png' />
        <meta
          name='theme-color'
          content='#1a1a1a'
          media='(prefers-color-scheme: light)'
        />
        <meta
          name='theme-color'
          content='#000000'
          media='(prefers-color-scheme: dark)'
        />
        <meta name='emotion-insertion-point' content='' />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            var _self___NEXT_DATA___autoExport;
            window.addEventListener('error', function(e) {
              var msg = e && e.message ? e.message : '';
              var recoverable = msg.includes('_self___NEXT_DATA___autoExport') || msg.includes('__NEXT_DATA__') || msg.includes('hydration');
              if (!recoverable || sessionStorage.getItem('pwa_recovery_v1')) {
                return;
              }
              sessionStorage.setItem('pwa_recovery_v1', '1');
              if (!navigator.serviceWorker) {
                window.location.reload();
                return;
              }
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                return Promise.all(registrations.map(function(registration) {
                  return registration.unregister();
                }));
              }).finally(function() {
                window.location.reload();
              });
            }, { once: true });
          `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
