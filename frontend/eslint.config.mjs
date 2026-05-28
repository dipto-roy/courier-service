import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Codebase uses `any` — enforce at boundaries only
      "@typescript-eslint/no-explicit-any": "off",
      // Empty interface extends are idiomatic for shadcn components
      "@typescript-eslint/no-empty-object-type": "off",
      // JSX text with quotes is common — escape manually when it matters
      "react/no-unescaped-entities": "off",
      // Pre-existing pattern in tracking hooks — warn, don't block
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
