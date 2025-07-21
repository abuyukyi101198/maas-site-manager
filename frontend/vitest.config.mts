import { configDefaults, coverageConfigDefaults, defineConfig, Plugin } from "vitest/config";
import AutoImport from "unplugin-auto-import/vite";
import * as path from "path";

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["react", "vitest"],
      dts: true,
      eslintrc: {
        enabled: true,
      },
    }) as Plugin,
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    server: {
      deps: {
        inline: ["vitest-canvas-mock"],
      },
    },
    setupFiles: ["./mock-web-worker.ts", "./setupTests.ts"],
    exclude: [...configDefaults.exclude, "**/tests/**"],
    coverage: {
      // exclude index files as they're only used to export other files
      // exclude pages as they're covered by playwright tests
      // exclude mock Resolvers:https://github.com/mswjs/msw/discussions/942#discussioncomment-1485279
      exclude: [...coverageConfigDefaults.exclude, "src/mocks/**/*"],
      include: ["src/**/*.{ts,tsx}"],
      reporter: [["text"], ["html"], ["cobertura", { file: "../../.cover/cobertura-coverage-frontend.xml" }]],
      provider: "istanbul",
    },
    clearMocks: true,
  },
});
