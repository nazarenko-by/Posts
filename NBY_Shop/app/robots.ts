import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Епізод 17 — robots.ts, файлова конвенція Next.js: автоматично віддається
// на /robots.txt. disallow тут — для краулерів, які не читають per-сторінкові
// <meta name="robots"> теги (деякі боти ігнорують meta й орієнтуються лише на
// robots.txt) — дублює ті самі приватні розділи, що вже мають robots:noindex
// у власних metadata (app/account, app/admin, app/checkout, app/wishlist,
// app/search, app/auth), другий, незалежний шар того самого правила.
const BASE_URL = SITE_URL;

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/admin", "/account", "/checkout", "/wishlist", "/search", "/auth", "/api"],
		},
		sitemap: `${BASE_URL}/sitemap.xml`,
	};
}
