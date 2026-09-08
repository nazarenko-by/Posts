# NBY Shop

Навчальний проєкт серії «Магазин з нуля» (@nby.frontend).

## Стек

Next.js (App Router) · Prisma · PostgreSQL · Tailwind CSS v4 · shadcn/ui (з епізоду 2)

## Запуск

```bash
npm install
cp .env.example .env   # і встав свій DATABASE_URL
npx prisma db push
npm run db:seed
npm run dev
```

## Епізоди

| # | Тема |
|---|------|
| 1 | Каталог товарів — Server Components + Prisma |
| 2 | UI-фундамент — navbar/footer, shadcn |
| 3 | Dark mode — next-themes |
