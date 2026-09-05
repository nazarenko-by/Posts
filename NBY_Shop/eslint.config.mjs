import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

// Перенесено з github.com/nazarenko-by/DataToCanvas (Богданів пет-проєкт) —
// той самий стек (Next.js App Router + TS + Tailwind v4), без змін у правилах.
const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".husky/**", "dist/**", ".prettierrc"]),
	{
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
			"no-console": ["warn", { allow: ["warn", "error"] }],
		},
	},
]);

export default eslintConfig;
