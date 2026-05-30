//const esbuild = require("esbuild");
import esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "fs";

async function build() {
  const ctx = await esbuild.context({
    entryPoints: ["lib/index.ts"], // Punto de entrada principal
    outdir: "dist", // Directorio de salida (entry -> dist/index.js)
    bundle: true, // Empaqueta todos los archivos
    splitting: true, // Genera chunks separados para los import() dinámicos
    format: "esm", // Usa el formato de módulos ES (requerido por splitting)
    platform: "browser", // Plataforma objetivo: navegadores
    sourcemap: true, // Genera mapas de fuente
    target: "esnext", // Soporte para navegadores modernos
    // Chunks de dependencias pesadas (CodeMirror, ESLint, Pikaday) cargadas con
    // import() dinámico; los nombres incluyen hash para cacheado.
    chunkNames: "chunks/[name]-[hash]",
    external: [
      // Excluye las dependencias externas
      "@remoteoss/json-schema-form",
      "vanjs-core",
      "vanjs-ext",
      "van-ui-extended",
    ],
  });

  // Activa el modo watch si se pasa el flag "--watch"
  if (process.argv.includes("--watch")) {
    console.log("Watching for changes...");
    await ctx.watch();
  } else {
    // Ejecuta una compilación única
    await ctx.rebuild();
    ctx.dispose();
    // Copy default CSS to dist
    mkdirSync("dist", { recursive: true });
    copyFileSync("lib/jsf-defaults.css", "dist/jsf-defaults.css");
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
