import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";

export default defineConfig({
  base: "/budgeteer/",
  plugins: [
    tailwindcss(),
    handlebars({
      /** (!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - `__dirname` (vite.config.js:10:33). Use `import.meta.dirname` instead
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning. */
      partialDirectory: resolve(import.meta.dirname, "src/partials"),
    }),
  ],
});
