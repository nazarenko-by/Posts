// Кодує source.png у JPEG (mozjpeg), WebP, AVIF і JPEG XL на сітці якостей і декодує назад - для замірів SSIM.
//   node scripts/encode.mjs  →  out/<формат>-q<NN>.<ext>, out/<формат>-q<NN>.rgba (декодовані пікселі), out/encode.json
// Кодеки - ті самі WASM-збірки, що в Squoosh (jSquash), однакові на будь-якій машині. Налаштування кодеків - за замовчуванням jSquash,
// змінюється лише quality (AVIF: speed 6, JPEG XL: effort 7, mozjpeg: progressive + оптимізовані таблиці).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

import pngDecode, { init as initPngDec } from "@jsquash/png/decode.js";
import jpegEncode, { init as initJpegEnc } from "@jsquash/jpeg/encode.js";
import jpegDecode, { init as initJpegDec } from "@jsquash/jpeg/decode.js";
import webpEncode, { init as initWebpEnc } from "@jsquash/webp/encode.js";
import webpDecode, { init as initWebpDec } from "@jsquash/webp/decode.js";
import avifEncode, { init as initAvifEnc } from "@jsquash/avif/encode.js";
import avifDecode, { init as initAvifDec } from "@jsquash/avif/decode.js";
import jxlEncode, { init as initJxlEnc } from "@jsquash/jxl/encode.js";
import jxlDecode, { init as initJxlDec } from "@jsquash/jxl/decode.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);
const wasm = (pkg, file) => readFileSync(join(dirname(require.resolve(`${pkg}/package.json`)), file));

// у Node WASM треба підвантажити вручну (у браузері це робить бандлер)
await initPngDec(await WebAssembly.compile(wasm("@jsquash/png", "codec/pkg/squoosh_png_bg.wasm")));
await initJpegEnc(await WebAssembly.compile(wasm("@jsquash/jpeg", "codec/enc/mozjpeg_enc.wasm")));
await initJpegDec(await WebAssembly.compile(wasm("@jsquash/jpeg", "codec/dec/mozjpeg_dec.wasm")));
await initWebpEnc(await WebAssembly.compile(wasm("@jsquash/webp", "codec/enc/webp_enc.wasm")));
await initWebpDec(await WebAssembly.compile(wasm("@jsquash/webp", "codec/dec/webp_dec.wasm")));
await initAvifEnc(await WebAssembly.compile(wasm("@jsquash/avif", "codec/enc/avif_enc.wasm")));
await initAvifDec(await WebAssembly.compile(wasm("@jsquash/avif", "codec/dec/avif_dec.wasm")));
await initJxlEnc(await WebAssembly.compile(wasm("@jsquash/jxl", "codec/enc/jxl_enc.wasm")));
await initJxlDec(await WebAssembly.compile(wasm("@jsquash/jxl", "codec/dec/jxl_dec.wasm")));

const FORMATS = [
    { key: "jpeg", ext: "jpg", enc: (img, q) => jpegEncode(img, { quality: q }), dec: jpegDecode },
    { key: "webp", ext: "webp", enc: (img, q) => webpEncode(img, { quality: q }), dec: webpDecode },
    { key: "avif", ext: "avif", enc: (img, q) => avifEncode(img, { quality: q }), dec: avifDecode },
    { key: "jxl", ext: "jxl", enc: (img, q) => jxlEncode(img, { quality: q }), dec: jxlDecode },
];
// крок 2: ціль SSIM потрапляє між сусідніми якостями з запасом ≤ 1–2%
const QUALITIES = Array.from({ length: 34 }, (_, i) => 30 + i * 2); // 30, 32 … 96

const src = await pngDecode(readFileSync(join(root, "source.png")).buffer);
const out = join(root, "out");
mkdirSync(out, { recursive: true });
const rows = [];
for (const f of FORMATS) {
    for (const q of QUALITIES) {
        const t0 = performance.now();
        const buf = await f.enc(src, q);
        const ms = performance.now() - t0;
        const name = `${f.key}-q${String(q).padStart(2, "0")}`;
        writeFileSync(join(out, `${name}.${f.ext}`), Buffer.from(buf));
        const back = await f.dec(buf);
        writeFileSync(join(out, `${name}.rgba`), Buffer.from(back.data.buffer));
        rows.push({ format: f.key, quality: q, bytes: buf.byteLength, encodeMs: Math.round(ms), file: `${name}.${f.ext}` });
        console.log(f.key.padEnd(5), `q${q}`.padEnd(4), String(buf.byteLength).padStart(8), "B", `${Math.round(ms)} ms`);
    }
}
writeFileSync(join(out, "encode.json"), JSON.stringify({ width: src.width, height: src.height, rows }, null, 1));
