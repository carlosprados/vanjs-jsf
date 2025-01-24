import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true, // Abre el navegador automáticamente
    port:3030,
    watch: {
      usePolling: true, // Garantiza que los cambios se detecten en todas las plataformas
    },
  },
});
