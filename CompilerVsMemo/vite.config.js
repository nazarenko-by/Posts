// Чотири збірки одного застосунку:
//   VARIANT=plain|manual  - вихідний код (src/plain або src/manual)
//   COMPILER=1            - пропустити через React Compiler (babel-plugin-react-compiler 1.0)
// react-dom/client → react-dom/profiling: у production-збірці працює <Profiler> (onRender з actualDuration)
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const variant = process.env.VARIANT || "plain";
const compiler = process.env.COMPILER === "1";
const name = `${variant}${compiler ? "+compiler" : ""}`;

export default defineConfig({
    plugins: [react(), ...(compiler ? [babel({ presets: [reactCompilerPreset()] })] : [])],
    define: { __VARIANT__: JSON.stringify(name) },
    resolve: {
        alias: {
            "@app": fileURLToPath(new URL(`./src/${variant}/App.jsx`, import.meta.url)),
            "react-dom/client": "react-dom/profiling",
        },
    },
    build: { outDir: `dist/${name}`, emptyOutDir: true },
});
