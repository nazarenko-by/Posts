// Збирає 4 варіанти в dist/<назва>
import { execSync } from "node:child_process";
const VARIANTS = [
    { VARIANT: "plain", COMPILER: "0" },
    { VARIANT: "manual", COMPILER: "0" },
    { VARIANT: "plain", COMPILER: "1" },
    { VARIANT: "manual", COMPILER: "1" },
];
for (const v of VARIANTS) {
    console.log(`build ${v.VARIANT}${v.COMPILER === "1" ? "+compiler" : ""}`);
    execSync("npx vite build --logLevel warn", { stdio: "inherit", env: { ...process.env, ...v } });
}
