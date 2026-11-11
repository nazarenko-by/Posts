// Один застосунок у трьох підходах до стилів: VARIANT=tailwind | modules | vanilla
// (tailwind-base - порожня сторінка з Tailwind, щоб окремо поміряти preflight і тему)
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const variant = process.env.VARIANT || "tailwind";
const extra = { tailwind: [tailwindcss()], "tailwind-base": [tailwindcss()], modules: [], vanilla: [vanillaExtractPlugin()] }[variant];

export default defineConfig({
    plugins: [react(), ...extra],
    resolve: { alias: { "@app": fileURLToPath(new URL(`./src/${variant}/App.jsx`, import.meta.url)) } },
    build: { outDir: `dist/${variant}`, emptyOutDir: true },
});
