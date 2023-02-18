import { createTheme, globalCss, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import SSRProvider from 'react-bootstrap/SSRProvider';

// 2. Call `createTheme` and pass your custom values
const lightTheme = createTheme({
  type: 'light',
  theme: {
    colors: {
      // // generic colors
      // white: '#ffffff',
      // black: '#000000',

      // // background colors (light)
      // background: "$white",
      // backgroundAlpha: "rgba(255, 255, 255, 0.8)", // used for semi-transparent backgrounds like the navbar
      // foreground: "$black",
      // backgroundContrast: "$white",
      // brand colors
      primaryLight: '$green200',
      primaryLightHover: '$green300',
      primaryLightActive: '$green400',
      primaryLightContrast: '$green600',
      primary: '#4ADE7B',
      primaryBorder: '$green500',
      primaryBorderHover: '$green600',
      primarySolidHover: '$green700',
      primarySolidContrast: '$white',
      primaryShadow: '$green500',

      gradient: 'linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)',
      link: '#5E1DAD',
    }, // optional
  }
})

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    colors: {
      // generic colors
      white: '#ffffff',
      black: '#000000',

      // background colors (dark)
      background: "$black",
      backgroundAlpha: "rgba(255, 255, 255, 0.8)", // used for semi-transparent backgrounds like the navbar
      foreground: "$white",
      backgroundContrast: "$black",


      //semantic colors (light)
      blue50: '#EDF5FF',
      // ...
      blue900: '#00254D',
      // ...

      // brand colors
      primaryLight: '$blue200',
      primaryLightHover: '$blue300', // commonly used on hover state
      primaryLightActive: '$blue400', // commonly used on pressed state
      primaryLightContrast: '$blue600', // commonly used for text inside the component
      primary: '$blue600',
      primaryBorder: '$blue500',
      primaryBorderHover: '$blue600',
      primarySolidHover: '$blue700',
      primarySolidContrast: '$white', // commonly used for text inside the component
      primaryShadow: '$blue500'
    }, // optional
  }
})

const globalStyles = globalCss({
  'body': {
    // maxWidth: '70ch',
    padding: '3em 1em',
    margin: 'auto',
    lineHeight: 1.75,
    fontSize: '1.25em'
  }
});

export default function App({ Component, pageProps }) {
  globalStyles();
  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className
      }}
    >
      <NextUIProvider>
        <SSRProvider>
          <Component {...pageProps} />
        </SSRProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
