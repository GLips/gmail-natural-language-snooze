import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "bun";

async function main() {
  // Clean dist
  await rm("./dist", { recursive: true, force: true });
  await mkdir("./dist");

  // Build content script
  await build({
    entrypoints: ["./src/content/content-script.ts"],
    outdir: "./dist",
    target: "browser",
    minify: false, // keep it readable for now
  });

  // Copy manifest
  await cp("./public/manifest.json", "./dist/manifest.json");

  console.log("Build complete!");
}

main();
