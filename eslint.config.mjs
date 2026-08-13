import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      ".npm-cache/**",
      ".tmp/**",
      // API da VPS: projeto Node separado, em CommonJS.
      // As regras do Next não se aplicam a ele.
      "server/**"
    ]
  }
]);
