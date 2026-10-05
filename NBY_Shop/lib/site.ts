// Епізод 18 (деплой) — базова адреса сайту для metadataBase, sitemap і robots.
// Раніше була зашита як "https://nby.shop" (домену нема), тож на Vercel
// canonical/OG/sitemap вказували б на неіснуючий сайт. Пріоритет:
// 1) NEXT_PUBLIC_SITE_URL — власний домен, якщо колись підключимо;
// 2) VERCEL_PROJECT_PRODUCTION_URL — системна змінна Vercel (хост без протоколу,
//    напр. nby-shop.vercel.app), є і на build, і в runtime;
// 3) демо-фолбек для локальної розробки.
export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL ??
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: "https://nby.shop");
