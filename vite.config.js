import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/hackos/",
  plugins: [],
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        remote: resolve(__dirname, "remote.html"),
        questions: resolve(__dirname, "questions.html"),
        didit: resolve(__dirname, "didit.html"),
      },
    },
  },
});
