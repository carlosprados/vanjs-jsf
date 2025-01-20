import { defineConfig } from "vite";

export default defineConfig({
  root: "./dist", // Directorio raíz del servidor (salida de esbuild)
  server: {
    open: true, // Abre el navegador automáticamente
    watch: {
      usePolling: true, // Garantiza que los cambios se detecten en todas las plataformas
    },
  },
});
