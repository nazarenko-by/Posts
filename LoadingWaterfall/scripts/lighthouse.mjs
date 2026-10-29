// Lighthouse для трьох збірок: mobile, throttling «devtools» (повільний 4G + 4× CPU), 3 запуски на кожну.
// Спершу запусти сервери (див. README), потім: npm i lighthouse chrome-launcher && node scripts/lighthouse.mjs
// CHROME_PATH - шлях до Chrome/Chromium, якщо не знаходиться сам. Результат - results.json.
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { writeFileSync } from "node:fs";

const SITES = { next: 4401, "vite-rr": 4402, astro: 4403 };
const RUNS = 3;
const out = {};
for (const [name, port] of Object.entries(SITES)) {
  out[name] = [];
  for (let i = 0; i < RUNS; i++) {
    const chrome = await chromeLauncher.launch({ ...(process.env.CHROME_PATH ? { chromePath: process.env.CHROME_PATH } : {}), chromeFlags: ["--headless=new", "--no-sandbox"] });
    const r = await lighthouse(`http://localhost:${port}/`, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance"], throttlingMethod: "devtools" });
    await chrome.kill();
    const a = r.lhr.audits;
    const reqs = a["network-requests"].details.items.map((x) => ({
      url: x.url.replace(`http://localhost:${port}`, ""), type: x.resourceType, start: Math.round(x.networkRequestTime), end: Math.round(x.networkEndTime), kb: +(x.transferSize / 1024).toFixed(1),
    }));
    const js = reqs.filter((x) => x.type === "Script").reduce((s, x) => s + x.kb, 0);
    out[name].push({
      score: Math.round(r.lhr.categories.performance.score * 100),
      fcp: Math.round(a["first-contentful-paint"].numericValue), lcp: Math.round(a["largest-contentful-paint"].numericValue),
      tbt: Math.round(a["total-blocking-time"].numericValue), si: Math.round(a["speed-index"].numericValue),
      tti: a["interactive"] ? Math.round(a["interactive"].numericValue) : null,
      jsKb: +js.toFixed(1), requests: reqs.length, reqs,
    });
    console.log(name, i, JSON.stringify({ ...out[name][i], reqs: undefined }));
  }
}
writeFileSync("results.json", JSON.stringify(out, null, 2));
