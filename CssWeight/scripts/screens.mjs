// Перевірка, що три варіанти виглядають однаково: скріни 1280 px (уся сторінка) і 390 px, попіксельне порівняння з Tailwind.
//   node scripts/screens.mjs   (після npm run bench або vite build для кожного VARIANT)  →  screens/*.png
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const VIEWPORTS = [{ name: "desktop", width: 1280, height: 900, full: true }, { name: "mobile", width: 390, height: 844, full: false }];
mkdirSync(join(root, "screens"), { recursive: true });

const browser = await chromium.launch();
const shots = {};
for (const v of ["tailwind", "modules", "vanilla"]) {
    const dir = join(root, "dist", v);
    const srv = createServer((q, r) => {
        const p = join(dir, q.url === "/" ? "index.html" : q.url);
        r.writeHead(200, { "content-type": TYPES[extname(p)] || "text/plain" });
        r.end(readFileSync(p));
    }).listen(0);
    await new Promise((ok) => srv.on("listening", ok));
    for (const vp of VIEWPORTS) {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`http://localhost:${srv.address().port}/`);
        await page.waitForTimeout(300);
        const png = await page.screenshot({ path: join(root, "screens", `${vp.name}-${v}.png`), fullPage: vp.full });
        shots[`${vp.name}-${v}`] = png;
        await page.close();
    }
    srv.close();
}

// порівняння в самому браузері: малюємо обидва PNG у canvas і рахуємо пікселі, що відрізняються помітно
const page = await browser.newPage();
for (const vp of VIEWPORTS) {
    for (const v of ["modules", "vanilla"]) {
        const diff = await page.evaluate(async ([a, b]) => {
            const load = (b64) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = `data:image/png;base64,${b64}`; });
            const [ia, ib] = await Promise.all([load(a), load(b)]);
            if (ia.width !== ib.width || ia.height !== ib.height) return `розмір ${ia.width}×${ia.height} ≠ ${ib.width}×${ib.height}`;
            const px = (img) => { const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height).data; };
            const da = px(ia), db = px(ib);
            let n = 0;
            for (let i = 0; i < da.length; i += 4) if (Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])) > 30) n++;
            return n;
        }, [shots[`${vp.name}-tailwind`].toString("base64"), shots[`${vp.name}-${v}`].toString("base64")]);
        console.log(`${vp.name}: tailwind vs ${v} - різних пікселів: ${diff}`);
    }
}
await browser.close();
