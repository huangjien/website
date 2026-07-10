import pluginNext from "@next/eslint-plugin-next";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    // Global ignore patterns for the project (ESLint flat config)
    ignores: [
      "**/.next/**",
      "node_modules/**",
      "public/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "out/**",
      // Bundled webpack chunk artifact at repo root (orphaned, not hand-authored source)
      "main.js",
    ],
  },
  {
    name: "ESLint Config - nextjs",
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",

        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    ...js.configs.recommended,
    plugins: {
      "@next/next": pluginNext,
      prettier: prettier,
      "react-hooks": reactHooks,
    },
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: ["dist", "build", ".next", "node_modules"],
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-explicit-any": ["off"],
      "explicit-module-boundary-types": 0,
      "no-non-null-assertion": 0,
      "no-non-null-asserted-optional-chain": 0,
    },
  },
];
