import jseslint from "@eslint/js"
import pluginImport from "eslint-plugin-import"
import pluginPrettier from "eslint-plugin-prettier/recommended"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import pluginImportSort from "eslint-plugin-simple-import-sort"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  // global settings
  {
    ignores: [
      ".tmp/**",
      ".yarn/**",
      ".next/**",
      ".expo/**",
      "dist/**",
      "build/**",
      "node_modules/**",
      "packages/*/node_modules/**",
      "apps/*/node_modules/**",
    ],
  },

  // global base
  jseslint.configs.recommended,
  tseslint.configs.recommended,

  // global plugins
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: { globals: { ...globals.node } },
    settings: { react: { version: "detect" } },
    plugins: {
      "simple-import-sort": pluginImportSort,
      "react-hooks": pluginReactHooks,
      react: pluginReact,
      import: pluginImport,
    },
    rules: {
      // js
      "object-shorthand": "error",
      "no-unused-vars": "off",
      // react
      "react/jsx-handler-names": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "off",
      "react-native/no-inline-styles": "off",
      // ts
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/use-before-define": "off",
      "@typescript-eslint/no-redeclare": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-nocheck": "allow-with-description",
        },
      ],
      "import/no-duplicates": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^.*\\u0000$"], // Type imports with type keyword
            ["^@?\\w"], // External packages
            ["^@app/"], // Internal packages starting with @app/
            ["^\\."], // Relative imports
          ],
        },
      ],
    },
  },

  pluginPrettier
)
