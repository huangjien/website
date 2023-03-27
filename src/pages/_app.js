import { createTheme, globalCss, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useState } from 'react';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { IconlyProvider } from 'react-iconly';
import { settingContext, userContext } from '../lib/Requests';
import '../styles/github-markdown.css';

// import '../styles/globals.css';

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

      gradient:
        'linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)',
      link: '#5E1DAD',
    },
    shadows: {
      xs: '0 2px 8px 1px rgb(104 112 118 / 0.07), 0 1px 1px -1px rgb(104 112 118 / 0.04)',
      sm: '0 2px 8px 2px rgb(104 112 118 / 0.07), 0 2px 4px -1px rgb(104 112 118 / 0.04)',
      md: '0 12px 20px 6px rgb(104 112 118 / 0.08)',
      lg: '0 12px 34px 6px rgb(104 112 118 / 0.18)',
      xl: '0 25px 65px 0px rgb(104 112 118 / 0.35)',
    },
    // to use along with css dropShadow utility
    dropShadows: {
      xs: 'drop-shadow(0 2px 4px rgb(104 112 118 / 0.07)) drop-shadow(0 1px 1px rgb(104 112 118 / 0.04))',
      sm: 'drop-shadow(0 2px 8px rgb(104 112 118 / 0.07)) drop-shadow(0 2px 4px rgb(104 112 118 / 0.04))',
      md: 'drop-shadow(0 4px 12px rgb(104 112 118 / 0.08)) drop-shadow(0 20px 8px rgb(104 112 118 / 0.04))',
      lg: 'drop-shadow(0 12px 24px rgb(104 112 118 / 0.15)) drop-shadow(0 12px 14px rgb(104 112 118 / 0.1))',
      xl: 'drop-shadow(0 25px 34px rgb(104 112 118 / 0.35))',
    },
    fontSizes: {
      xs: '0.75rem' /* 12px */,
      sm: '0.875rem' /* 14px */,
      base: '1rem' /* 16px */,
      md: '1rem' /* 16px */,
      lg: '1.125rem' /* 18px */,
      xl: '1.25rem' /* 20px */,
      '2xl': '1.5rem' /* 24px */,
      '3xl': '1.875rem' /* 30px */,
      '4xl': '2.25rem' /* 36px */,
      '5xl': '3rem' /* 48px */,
      '6xl': '3.75rem' /* 60px */,
      '7xl': '4.5rem' /* 72px */,
      '8xl': '6rem' /* 96px */,
      '9xl': '8rem' /* 128px */,
    },
    fontWeights: {
      hairline: 100,
      thin: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      xs: 1 /* 16px */,
      sm: 1.25 /* 20px */,
      base: 1.5 /* 24px */,
      md: 1.5 /* 24px */,
      lg: 1.75 /* 28px */,
      xl: 1.75 /* 28px */,
      '2xl': 2 /* 32px */,
      '3xl': 2.25 /* 36px */,
      '4xl': 2.5 /* 40px */,
      '5xl': 1 /* 16px */,
      '6xl': 1 /* 16px */,
      '7xl': 1 /* 16px */,
      '8xl': 1 /* 16px */,
      '9xl': 1 /* 16px */,
    },
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    radii: {
      xs: '7px',
      sm: '9px',
      md: '12px',
      base: '14px',
      lg: '14px', // preferred value by NextUI components
      xl: '18px',
      '2xl': '24px',
      '3xl': '32px',
      squared: '33%',
      rounded: '50%',
      pill: '9999px',
    },
    borderWeights: {
      light: '1px',
      normal: '2px',
      bold: '3px',
      extrabold: '4px',
      black: '5px',
    },
    spacing: {
      0: '0rem',
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.375rem',
      xl: '2.25rem',
      '2xl': '3rem',
      '3xl': '5rem',
      '4xl': '10rem',
      '5xl': '14rem',
      '6xl': '18rem',
      '7xl': '24rem',
      '8xl': '32rem',
      '9xl': '40rem',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
      screen: '100vw',
      full: '100%',
      px: '1px',
      1: '0.125rem',
      2: '0.25rem',
      3: '0.375rem',
      4: '0.5rem',
      5: '0.625rem',
      6: '0.75rem',
      7: '0.875rem',
      8: '1rem',
      9: '1.25rem',
      10: '1.5rem',
      11: '1.75rem',
      12: '2rem',
      13: '2.25rem',
      14: '2.5rem',
      15: '2.75rem',
      16: '3rem',
      17: '3.5rem',
      18: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
    },
    breakpoints: {
      xs: '650px',
      sm: '960px',
      md: '1280px',
      lg: '1400px',
      xl: '1920px',
    },
    zIndices: {
      1: '100',
      2: '200',
      3: '300',
      4: '400',
      5: '500',
      10: '1000',
      max: '9999',
    },
  },
});

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    colors: {
      // generic colors
      white: '#ffffff',
      black: '#000000',

      // background colors (dark)
      background: '$black',
      backgroundAlpha: 'rgba(255, 255, 255, 0.8)', // used for semi-transparent backgrounds like the navbar
      foreground: '$white',
      backgroundContrast: '$black',

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
      primaryShadow: '$blue500',
    },
    shadows: {
      xs: '0 2px 8px 1px rgb(0 0 0 / 0.07), 0 1px 1px -1px rgb(0 0 0 / 0.04)',
      sm: '0 2px 8px 2px rgb(0 0 0 / 0.07), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
      md: '0 12px 20px 6px rgb(0 0 0 / 0.08)',
      lg: '0 12px 34px 6px rgb(0 0 0 / 0.18)',
      xl: '0 25px 65px 0px rgb(0 0 0 / 0.35)',
    },
    // to use along with css dropShadow utility
    dropShadows: {
      xs: 'drop-shadow(0 2px 4px rgb(0 0 0 / 0.07)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.04))',
      sm: 'drop-shadow(0 2px 8px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 4px rgb(0 0 0 / 0.04))',
      md: 'drop-shadow(0 4px 12px rgb(0 0 0 / 0.08)) drop-shadow(0 20px 8px rgb(0 0 0 / 0.04))',
      lg: 'drop-shadow(0 12px 24px rgb(0 0 0 / 0.15)) drop-shadow(0 12px 14px rgb(0 0 0 / 0.1))',
      xl: 'drop-shadow(0 25px 34px rgb(0 0 0 / 0.35))',
    },
    fontSizes: {
      xs: '0.75rem' /* 12px */,
      sm: '0.875rem' /* 14px */,
      base: '1rem' /* 16px */,
      md: '1rem' /* 16px */,
      lg: '1.125rem' /* 18px */,
      xl: '1.25rem' /* 20px */,
      '2xl': '1.5rem' /* 24px */,
      '3xl': '1.875rem' /* 30px */,
      '4xl': '2.25rem' /* 36px */,
      '5xl': '3rem' /* 48px */,
      '6xl': '3.75rem' /* 60px */,
      '7xl': '4.5rem' /* 72px */,
      '8xl': '6rem' /* 96px */,
      '9xl': '8rem' /* 128px */,
    },
    fontWeights: {
      hairline: 100,
      thin: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      xs: 1 /* 16px */,
      sm: 1.25 /* 20px */,
      base: 1.5 /* 24px */,
      md: 1.5 /* 24px */,
      lg: 1.75 /* 28px */,
      xl: 1.75 /* 28px */,
      '2xl': 2 /* 32px */,
      '3xl': 2.25 /* 36px */,
      '4xl': 2.5 /* 40px */,
      '5xl': 1 /* 16px */,
      '6xl': 1 /* 16px */,
      '7xl': 1 /* 16px */,
      '8xl': 1 /* 16px */,
      '9xl': 1 /* 16px */,
    },
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    radii: {
      xs: '7px',
      sm: '9px',
      md: '12px',
      base: '14px',
      lg: '14px', // preferred value by NextUI components
      xl: '18px',
      '2xl': '24px',
      '3xl': '32px',
      squared: '33%',
      rounded: '50%',
      pill: '9999px',
    },
    borderWeights: {
      light: '1px',
      normal: '2px',
      bold: '3px',
      extrabold: '4px',
      black: '5px',
    },
    spacing: {
      0: '0rem',
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.375rem',
      xl: '2.25rem',
      '2xl': '3rem',
      '3xl': '5rem',
      '4xl': '10rem',
      '5xl': '14rem',
      '6xl': '18rem',
      '7xl': '24rem',
      '8xl': '32rem',
      '9xl': '40rem',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
      screen: '100vw',
      full: '100%',
      px: '1px',
      1: '0.125rem',
      2: '0.25rem',
      3: '0.375rem',
      4: '0.5rem',
      5: '0.625rem',
      6: '0.75rem',
      7: '0.875rem',
      8: '1rem',
      9: '1.25rem',
      10: '1.5rem',
      11: '1.75rem',
      12: '2rem',
      13: '2.25rem',
      14: '2.5rem',
      15: '2.75rem',
      16: '3rem',
      17: '3.5rem',
      18: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
    },
    breakpoints: {
      xs: '650px',
      sm: '960px',
      md: '1280px',
      lg: '1400px',
      xl: '1920px',
    },
    zIndices: {
      1: '100',
      2: '200',
      3: '300',
      4: '400',
      5: '500',
      10: '1000',
      max: '9999',
    },
  },
});

const globalStyles = globalCss({
  body: {
    // maxWidth: '70ch',
    margin: 5,
    padding: 5,
    boxSizing: 'border-box',
    maxW: '100%',
    // padding: '3em 1em',
    // margin: 'auto',
    lineHeight: 1.75,
    fontSize: '1.25em',
  },
  '.scrollToTop': {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    alignItems: 'right',
    // height: '40px',
    justifyContent: 'right',
    // zIndex: 1000,
    // cursor: 'pointer',
    // animation: 'fadeIn 0.5s',
    // transition: 'opacity 0.4s',
    // opacity: 0.5
  },
});

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(undefined);
  const [setting, setSetting] = useState(undefined);
  globalStyles();
  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
      }}
    >
      <IconlyProvider
        set="two-tone"
        primaryColor="blue"
        secondaryColor="grey"
        stroke="light"
        size="small"
      >
        <NextUIProvider>
          <SSRProvider>
            <settingContext.Provider value={[setting, setSetting]}>
              <userContext.Provider value={[user, setUser]}>
                <Component {...pageProps} />
              </userContext.Provider>
            </settingContext.Provider>
          </SSRProvider>
        </NextUIProvider>
      </IconlyProvider>
    </NextThemesProvider>
  );
}
