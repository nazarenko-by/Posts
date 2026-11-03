// Розмір JS після tsc і після esbuild --minify для кожного варіанта
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { buildSync } from "esbuild";

for (const name of ["enum", "union", "asconst"]) {
  const tsc = readFileSync(`out/${name}.js`);
  const min = buildSync({ entryPoints: [`src/${name}.ts`], minify: true, format: "esm", write: false }).outputFiles[0].contents;
  console.log(`${name.padEnd(8)} tsc ${String(tsc.length).padStart(4)} B · minify ${String(min.length).padStart(4)} B · gzip ${gzipSync(min).length} B`);
}
