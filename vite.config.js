import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

function getEntries() {
  const base = path.resolve(__dirname, "src");
  const entries = {};

  for (const dir of fs.readdirSync(base)) {
    const indexPath = path.join(base, dir, "index.html");
    if (fs.existsSync(indexPath)) {
      entries[dir] = indexPath;
    }
  }

  return entries;
}

export default defineConfig({
  base: "/sandbox/",
  build: {
    rollupOptions: {
      input: getEntries(),
    },
  },
});