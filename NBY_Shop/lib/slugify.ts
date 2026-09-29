// Епізод 15 — слаг товару в admin-формі авто-генерується з назви (кіт,
// COMPONENTS.md → s_admin, показує його як readonly-поле). Наші назви — UA
// з латинською цитатою всередині ("Худі «It works on my machine»"), тож
// проста regex-транслітерація "лишити лише [a-z0-9]" з'їла б майже все слово
// і лишила купу дефісів. Реальний UA e-commerce вирішує це транслітерацією
// кирилиці в латину (стандарт КМУ 55/2010, спрощено — без м'якого знаку/
// апострофа як окремих символів, вони просто випадають).
const UA_TO_LATIN: Record<string, string> = {
	а: "a",
	б: "b",
	в: "v",
	г: "h",
	ґ: "g",
	д: "d",
	е: "e",
	є: "ie",
	ж: "zh",
	з: "z",
	и: "y",
	і: "i",
	ї: "i",
	й: "i",
	к: "k",
	л: "l",
	м: "m",
	н: "n",
	о: "o",
	п: "p",
	р: "r",
	с: "s",
	т: "t",
	у: "u",
	ф: "f",
	х: "kh",
	ц: "ts",
	ч: "ch",
	ш: "sh",
	щ: "shch",
	ю: "iu",
	я: "ia",
	ь: "",
	"'": "",
	"’": "",
};

function transliterate(input: string): string {
	return input
		.toLowerCase()
		.split("")
		.map((char) => UA_TO_LATIN[char] ?? char)
		.join("");
}

export function slugify(title: string): string {
	return transliterate(title)
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "") // діакритика (напр. з латинських назв)
		.replace(/[«»"']/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");
}
