import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],
  outDir: "build",
  clean: true,
  format: ["cjs"],
  dts: false,
  external: ["*.sql"],
});
