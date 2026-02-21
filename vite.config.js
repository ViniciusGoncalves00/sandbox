import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/sandbox/",

  build: {
    rollupOptions: {
      input: {
        example: path.resolve(__dirname, "src/example/index.html"),
        fluids: path.resolve(__dirname, "src/fluids/index.html"),
        handler: path.resolve(__dirname, "src/handler/index.html"),
        marchingsquares: path.resolve(__dirname, "src/marchingsquares/index.html"),
        snake: path.resolve(__dirname, "src/snake/index.html"),
        terrain: path.resolve(__dirname, "src/terrain/index.html"),
      },
    },
  },
});