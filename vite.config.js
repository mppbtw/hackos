import { defineConfig } from "vite"

export default defineConfig({
    base: "/hackos/",
    build: {
        target: "esnext",
        rollupOptions: {
            output: {
            },
        },
    }
})
