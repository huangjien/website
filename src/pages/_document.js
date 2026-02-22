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
            // Workaround for Next.js 16 build/minification bug
            // The build generates code that assigns to this undeclared variable
            var _self___NEXT_DATA___autoExport;

            window.addEventListener('error', function(e) {
              // Check for specific hydration/PWA errors
              if (e.message && (
                e.message.includes('_self___NEXT_DATA___autoExport') || 
                e.message.includes('__NEXT_DATA__') ||
                e.message.includes('hydration')
              )) {
                console.warn('Critical application error detected, attempting recovery...');
                
                // Unregister all service workers
                if (navigator.serviceWorker) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                    
                    // Only reload if we haven't just done so (prevent loops)
                    if (!sessionStorage.getItem('pwa_recovery_v1')) {
                      sessionStorage.setItem('pwa_recovery_v1', '1');
                      window.location.reload();
                    }
                  });
                }
              }
            });
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
