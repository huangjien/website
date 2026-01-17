/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "fade-out": "fade-out 150ms ease-in",
        "slide-up": "slide-up 300ms ease-out",
        "slide-down": "slide-down 300ms ease-out",
        "slide-left": "slide-left 300ms ease-out",
        "slide-right": "slide-right 300ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        "scale-out": "scale-out 150ms ease-in",
        "bounce-subtle": "bounce-subtle 1s ease-in-out infinite",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
        "spin-slow": "spin-slow 1s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        "accordion-down": "accordion-down 300ms ease-out",
        "accordion-up": "accordion-up 300ms ease-out",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        xs: "0 1px 1px rgba(0,0,0,0.04)",
        sm: "0 1px 2px rgba(0,0,0,0.06)",
        md: "0 4px 6px rgba(0,0,0,0.08)",
        lg: "0 10px 15px rgba(0,0,0,0.10)",
        glass: "0 8px 32px rgba(31, 38, 135, 0.1)",
        "glass-hover": "0 12px 48px rgba(31, 38, 135, 0.15)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-dark-hover": "0 12px 48px rgba(0, 0, 0, 0.5)",
        "glass-glow": "0 4px 20px rgba(102, 126, 234, 0.3)",
        "glass-glow-hover": "0 6px 25px rgba(102, 126, 234, 0.4)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-accent": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsla(228,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.2) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,0.2) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(269,100%,77%,0.2) 0px, transparent 50%)",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
