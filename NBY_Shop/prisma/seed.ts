import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Демо-каталог з дизайн-кіту (ShopProject/DESIGN_SYSTEM.md) — реальні назви й ціни,
// щоб скріни й відео епізодів збігалися з тим, що бачив Богдан у Claude Design.
// Ціни — в копійках (₴ × 100), ніколи float.
const products = [
  {
    slug: "hoodie-it-works-on-my-machine",
    title: 'Худі «It works on my machine»',
    category: "Одяг",
    priceUAH: 189_000,
    compareAt: null,
    rating: 4.9,
    badge: "new",
    image: "/products/hoodie-it-works.jpg",
    stock: 24,
  },
  {
    slug: "tshirt-sudo-sandwich",
    title: 'Футболка «sudo make me a sandwich»',
    category: "Одяг",
    priceUAH: 89_000,
    compareAt: null,
    rating: 4.6,
    badge: null,
    image: "/products/tshirt-sudo.jpg",
    stock: 41,
  },
  {
    slug: "mug-console-log-coffee",
    title: 'Кружка «console.log(coffee)»',
    category: "Кружки",
    priceUAH: 45_000,
    compareAt: 69_000,
    rating: 4.7,
    badge: "-35%",
    image: "/products/mug-console-log.jpg",
    stock: 33,
  },
  {
    slug: "thermo-mug-git-commit-coffee",
    title: 'Термокружка «git commit -m coffee»',
    category: "Кружки",
    priceUAH: 78_000,
    compareAt: null,
    rating: 4.8,
    badge: null,
    image: "/products/thermo-mug-git-commit.jpg",
    stock: 18,
  },
  {
    slug: "keyboard-nby65-hotswap",
    title: "Клавіатура NBY65 · hot-swap",
    category: "Гаджети",
    priceUAH: 499_000,
    compareAt: 599_000,
    rating: 5.0,
    badge: null,
    image: "/products/keyboard-nby65.jpg",
    stock: 9,
  },
  {
    slug: "keyboard-nby75-alu",
    title: "Клавіатура NBY75 Alu",
    category: "Гаджети",
    priceUAH: 640_000,
    compareAt: null,
    rating: 4.9,
    badge: null,
    image: "/products/keyboard-nby75.jpg",
    stock: 5,
  },
  {
    slug: "nby65-barebone-kit",
    title: "NBY65 Barebone Kit",
    category: "Гаджети",
    priceUAH: 320_000,
    compareAt: null,
    rating: 4.8,
    badge: null,
    image: "/products/nby65-barebone.jpg",
    stock: 12,
  },
  {
    slug: "keycaps-pbt-dracula",
    title: 'Кейкапи «PBT Dracula»',
    category: "Гаджети",
    priceUAH: 129_000,
    compareAt: null,
    rating: 4.7,
    badge: null,
    image: "/products/keycaps-dracula.jpg",
    stock: 27,
  },
  {
    slug: "switches-gateron-brown-70",
    title: "Свічі Gateron Brown ×70",
    category: "Гаджети",
    priceUAH: 89_000,
    compareAt: null,
    rating: 4.6,
    badge: null,
    image: "/products/switches-gateron-brown.jpg",
    stock: 60,
  },
  {
    slug: "keyboard-case-65",
    title: "Кейс для клавіатури 65%",
    category: "Гаджети",
    priceUAH: 99_000,
    compareAt: null,
    rating: 4.5,
    badge: null,
    image: "/products/keyboard-case-65.jpg",
    stock: 15,
  },
  {
    slug: "lube-it-switch-grease",
    title: 'Змазка для свічів «lube it»',
    category: "Гаджети",
    priceUAH: 34_000,
    compareAt: null,
    rating: 4.4,
    badge: null,
    image: "/products/lube-it.jpg",
    stock: 50,
  },
  {
    slug: "sticker-pack-merge-conflict",
    title: 'Стікерпак «Merge Conflict»',
    category: "Стікери",
    priceUAH: 19_000,
    compareAt: null,
    rating: 4.8,
    badge: null,
    image: "/products/sticker-merge-conflict.jpg",
    stock: 120,
  },
  {
    slug: "pin-404-not-found",
    title: 'Пін «404 pin not found»',
    category: "Аксесуари",
    priceUAH: 26_000,
    compareAt: null,
    rating: 4.9,
    badge: "new",
    image: "/products/pin-404.jpg",
    stock: 70,
  },
  {
    slug: "mousepad-xl-dark-mode",
    title: 'Килимок XL «dark mode»',
    category: "Аксесуари",
    priceUAH: 69_000,
    compareAt: null,
    rating: 4.7,
    badge: null,
    image: "/products/mousepad-dark-mode.jpg",
    stock: 22,
  },
] as const;

// Приклад з адмінки кіту — чернетка, ще не опублікована. Показує, навіщо взагалі
// status: DRAFT | PUBLISHED у схемі: каталог має показувати лише PUBLISHED.
const draftProduct = {
  slug: "hoodie-dark-mode-only",
  title: 'Худі «Dark Mode Only»',
  category: "Одяг",
  priceUAH: 219_000,
  compareAt: null,
  rating: 0,
  badge: null,
  image: "/products/hoodie-dark-mode-only.jpg",
  stock: 0,
  status: "DRAFT" as const,
};

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  await prisma.product.upsert({
    where: { slug: draftProduct.slug },
    update: draftProduct,
    create: draftProduct,
  });

  console.log(`Засіяно ${products.length + 1} товарів (${products.length} PUBLISHED + 1 DRAFT).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
