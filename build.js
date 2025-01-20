//const esbuild = require("esbuild");
import esbuild from "esbuild";

async function build() {
  const ctx = await esbuild.context({
    entryPoints: ["lib/index.ts"], // Punto de entrada principal
    outfile: "dist/index.js", // Archivo de salida
    bundle: true, // Empaqueta todos los archivos en uno
    format: "esm", // Usa el formato de módulos ES
    platform: "browser", // Plataforma objetivo: navegadores
    sourcemap: true, // Genera mapas de fuente
    target: "esnext", // Soporte para navegadores modernos
    external: [
      // Excluye las dependencias externas
      "@remoteoss/json-schema-form",
      "vanjs-core",
      "vanjs-ext",
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
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
