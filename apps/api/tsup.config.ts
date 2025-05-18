import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  outDir: "dist",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  shims: false, // ← avoid CJS shims unless you need them
  esbuildOptions(options) {
    options.platform = "node";
  },
});
