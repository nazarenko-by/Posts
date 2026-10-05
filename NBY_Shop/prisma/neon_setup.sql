-- NBY Shop: схема + демо-дані для Neon (SQL Editor). Згенеровано з prisma/schema.prisma і prisma/seed.ts.
-- Запускати на ПОРОЖНІЙ базі. Для повторного запуску спершу розкоментуй блок DROP нижче (видаляє всі дані!).
-- DROP TABLE IF EXISTS "OrderItem","Order","Review","User","Product" CASCADE;
-- DROP TYPE IF EXISTS "ProductStatus","OrderStatus";

BEGIN;

CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "OrderStatus" AS ENUM ('PACKING', 'DELIVERED', 'CANCELLED');

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "priceUAH" INTEGER NOT NULL,
  "compareAt" INTEGER,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "badge" TEXT,
  "image" TEXT NOT NULL,
  "imageCount" INTEGER NOT NULL DEFAULT 4,
  "description" TEXT,
  "specs" JSONB,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "orderSeq" SERIAL NOT NULL,
  "userId" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'PACKING',
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "shipping" TEXT NOT NULL,
  "shippingCostUAH" INTEGER NOT NULL,
  "payment" TEXT NOT NULL,
  "codFeeUAH" INTEGER NOT NULL DEFAULT 0,
  "totalUAH" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "productSlug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "priceUAH" INTEGER NOT NULL,
  "qty" INTEGER NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_status_createdAt_idx" ON "Product"("status", "createdAt");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Order_orderSeq_key" ON "Order"("orderSeq");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Товари ──
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c4682a14680c4ee743b010d9a','hoodie-it-works-on-my-machine','Худі «It works on my machine»','Одяг',189000,NULL,4.9,'new','/products/hoodie-it-works.jpg',5,'Важке худі для тих, хто вирішує баги силою переконання. Щільний фліс, не тягнеться після прання.','{"Розмір":"S–XL","Матеріал":"60% бавовна / 40% поліестер","Догляд":"машинне прання 30°"}'::jsonb,24,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c44196b0bed768e22685e60e9','tshirt-sudo-sandwich','Футболка «sudo make me a sandwich»','Одяг',89000,NULL,4.6,NULL,'/products/tshirt-sudo.jpg',4,'100% бавовна, щільність 180 г/м² — не просвічує і не сідає після першого прання.','{"Розмір":"S–XXL","Матеріал":"100% бавовна","Щільність":"180 г/м²"}'::jsonb,41,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('cd2617dd8ad1c20c6bd353280','mug-console-log-coffee','Кружка «console.log(coffee)»','Кружки',45000,69000,4.7,'-35%','/products/mug-console-log.jpg',3,'Керамічна кружка на 350 мл. Друк не стирається навіть після посудомийки.','{"Об''єм":"350 мл","Матеріал":"кераміка","Посудомийка":"так"}'::jsonb,33,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c6aa3043fc521ecbf2da6edcd','thermo-mug-git-commit-coffee','Термокружка «git commit -m coffee»','Кружки',78000,NULL,4.8,NULL,'/products/thermo-mug-git-commit.jpg',4,'Тримає температуру до 6 годин — вистачить рівно на один затяжний code review.','{"Об''єм":"400 мл","Матеріал":"нержавіюча сталь","Утримання_тепла":"6 год"}'::jsonb,18,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c80c590644930f86881c15477','keyboard-nby65-hotswap','Клавіатура NBY65 · hot-swap','Гаджети',499000,599000,5,NULL,'/products/keyboard-nby65.jpg',6,'65% розкладка, hot-swap PCB — свічі міняються без паяльника. Топ-продаж каталогу.','{"Розкладка":"65%","Підключення":"USB-C / BT 5.1","Hot-swap":"5-pin","Вага":"812 г"}'::jsonb,9,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c42f9708c5ad3c3237b35e0ae','keyboard-nby75-alu','Клавіатура NBY75 Alu','Гаджети',640000,NULL,4.9,NULL,'/products/keyboard-nby75.jpg',6,'Алюмінієвий корпус, gasket-mount — глухий, приємний звук без додаткової шумоізоляції.','{"Розкладка":"75%","Корпус":"алюміній, gasket-mount","Підключення":"USB-C / BT 5.1","Вага":"1090 г"}'::jsonb,5,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c156d5adf4aa0ec71cc5f43fd','nby65-barebone-kit','NBY65 Barebone Kit','Гаджети',320000,NULL,4.8,NULL,'/products/nby65-barebone.jpg',5,'PCB + корпус + плата стабілізаторів, без свічів і кейкапів — збери клавіатуру під себе.','{"Розкладка":"65%","Комплектація":"PCB + корпус + стабілізатори","Hotswap":"так"}'::jsonb,12,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c2c802cd47df92141365de7fe','keycaps-pbt-dracula','Кейкапи «PBT Dracula»','Гаджети',129000,NULL,4.7,NULL,'/products/keycaps-dracula.jpg',4,'Дабл-шот PBT — легенди не стираються роками. Повний набір під 65-100%.','{"Профіль":"OEM","Матеріал":"PBT, дабл-шот","Кількість":"131 кейкап"}'::jsonb,27,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c084de75a04ff145836c76f6a','switches-gateron-brown-70','Свічі Gateron Brown ×70','Гаджети',89000,NULL,4.6,NULL,'/products/switches-gateron-brown.jpg',3,'Тактильні свічі середньої гучності — комфортно і в опенспейсі, і на дзвінках.','{"Тип":"тактильні","Actuation_force":"55g","Кількість":"70 шт"}'::jsonb,60,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('cc9e026f873932b8cc2ffbeaa','keyboard-case-65','Кейс для клавіатури 65%','Гаджети',99000,NULL,4.5,NULL,'/products/keyboard-case-65.jpg',3,'Твердий чохол з EVA-піни, тримає форму, коли клавіатура їде з тобою на конференцію.','{"Сумісність":"65% клавіатури","Матеріал":"EVA-піна, зовні nylon"}'::jsonb,15,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('cda19e537d6e125e90161df7d','lube-it-switch-grease','Змазка для свічів «lube it»','Гаджети',34000,NULL,4.4,NULL,'/products/lube-it.jpg',3,'Густа змазка для стрижнів і пружин — прибирає скретч і резонанс без переборки клавіатури.','{"Об''єм":"10 мл","Тип":"105g0, густа"}'::jsonb,50,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('cbe4d84a1332573277983ef40','sticker-pack-merge-conflict','Стікерпак «Merge Conflict»','Стікери',19000,NULL,4.8,NULL,'/products/sticker-merge-conflict.jpg',3,'12 вінілових стікерів, водостійкі — переживають ноутбук, пляшку і дощ.','{"Кількість":"12 шт","Розмір":"5×5 см","Матеріал":"вініл, водостійкий"}'::jsonb,120,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('c9f7fcd6b5296e876521bdf16','pin-404-not-found','Пін «404 pin not found»','Аксесуари',26000,NULL,4.9,'new','/products/pin-404.jpg',3,'Емальований пін, метал з посрібленням — не тьмяніє в кишені рюкзака.','{"Матеріал":"емальований метал","Розмір":"3 см","Кріплення":"метелик"}'::jsonb,70,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('cfe728e67f9b98f9bfda4eccb','mousepad-xl-dark-mode','Килимок XL «dark mode»','Аксесуари',69000,NULL,4.7,NULL,'/products/mousepad-dark-mode.jpg',4,'На весь стіл — клавіатура, миша й трохи кави поміщаються без переїзду на дерево.','{"Розмір":"900×400 мм","Товщина":"4 мм","Основа":"натуральний каучук"}'::jsonb,22,'PUBLISHED'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');
INSERT INTO "Product" ("id","slug","title","category","priceUAH","compareAt","rating","badge","image","imageCount","description","specs","stock","status","createdAt","updatedAt") VALUES ('cfba4ae8295728a7159990d46','hoodie-dark-mode-only','Худі «Dark Mode Only»','Одяг',219000,NULL,0,NULL,'/products/hoodie-dark-mode-only.jpg',4,NULL,NULL,0,'DRAFT'::"ProductStatus",'2026-10-05 12:26:13.392','2026-10-05 12:26:13.392');

-- ── Відгуки ──
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('c29a248e4a26dc599331051d5','c80c590644930f86881c15477','Олена К.',5,'Друкую на ній цілий день — руки не втомлюються, а звук тихий і глибокий. Прийшла на другий день, у комплекті були запасні свічі.',true,'2026-08-14 00:00:00.000');
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('c974b5b2101fce298eb7b7497','c80c590644930f86881c15477','Максим Т.',4,'Все чудово, крім того, що тепер стара клавіатура на роботі дратує. Мінус зірка за нестачу підсвітки під кейкапами.',true,'2026-08-02 00:00:00.000');
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('cb2ee215a115958140bfdb1de','c80c590644930f86881c15477','Ігор П.',5,'Другий hot-swap набір у мене, і знову без нарікань. Свічі міняються за хвилину, без паяльника.',true,'2026-07-20 00:00:00.000');
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('c7340934cd63767c1be578e71','c80c590644930f86881c15477','Дарина С.',3,'Клавіатура хороша, але доставка забарилась на тиждень — думала, загубили посилку.',false,'2026-07-05 00:00:00.000');
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('cf8c2c0c999ddf181e8b38410','c4682a14680c4ee743b010d9a','Роман В.',5,'Тепле, не сідає після прання, а фраза на грудях зчитується миттєво на кожному стендапі.',true,'2026-08-20 00:00:00.000');
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('c6d41c8bb3eb0f28c0326fbee','c4682a14680c4ee743b010d9a','Настя Л.',4,'Розмір трохи більший, ніж очікувала — брала M, підійшов би S. Якість фліса топова.',true,'2026-08-11 00:00:00.000');
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('c17ff41c83c1a373131ce0306','cd2617dd8ad1c20c6bd353280','Артем Ж.',5,'Друк не стерся навіть після місяця в посудомийці щодня. Рекомендую колегам на кожен стендап.',true,'2026-08-09 00:00:00.000');
INSERT INTO "Review" ("id","productId","author","rating","comment","verified","createdAt") VALUES ('c239cfa29d8608ff794e4daea','cd2617dd8ad1c20c6bd353280','Юлія М.',2,'Прийшла з мікротріщиною на ручці. Написала в підтримку, чекаю на заміну.',true,'2026-07-28 00:00:00.000');

-- ── Демо-юзер (адмін) ──
INSERT INTO "User" ("id","email","passwordHash","name","isAdmin","createdAt") VALUES ('c83d153759791fc3d37cc65b4','demo@nby.shop','$2b$10$13laqO2KjygpXlAYXGsAbOuNc9DuCFH7GIYoa0QbgCPTXnBVp/15.','Олена Коваль',true,'2026-10-05 12:26:13.392');

-- ── Демо-замовлення ──
INSERT INTO "Order" ("id","userId","status","firstName","lastName","email","phone","city","address","shipping","shippingCostUAH","payment","codFeeUAH","totalUAH","createdAt") VALUES ('c3a487fb225e77d76d03667b6','c83d153759791fc3d37cc65b4','DELIVERED'::"OrderStatus",'Олена','Коваль','demo@nby.shop','+380671234567','Київ','вул. Хрещатик 1, кв. 5','nova_poshta',0,'card',0,189000,'2026-08-15 00:00:00.000');
INSERT INTO "OrderItem" ("id","orderId","productId","productSlug","title","priceUAH","qty") VALUES ('c1f908b30582b801814f63053','c3a487fb225e77d76d03667b6','c4682a14680c4ee743b010d9a','hoodie-it-works-on-my-machine','Худі «It works on my machine»',189000,1);
INSERT INTO "Order" ("id","userId","status","firstName","lastName","email","phone","city","address","shipping","shippingCostUAH","payment","codFeeUAH","totalUAH","createdAt") VALUES ('c698eb7f193b22691bd88fb61','c83d153759791fc3d37cc65b4','PACKING'::"OrderStatus",'Олена','Коваль','demo@nby.shop','+380671234567','Київ','вул. Хрещатик 1, кв. 5','courier',9900,'cod',2000,234900,'2026-09-20 00:00:00.000');
INSERT INTO "OrderItem" ("id","orderId","productId","productSlug","title","priceUAH","qty") VALUES ('c6205553249641b4eac465fc9','c698eb7f193b22691bd88fb61','c44196b0bed768e22685e60e9','tshirt-sudo-sandwich','Футболка «sudo make me a sandwich»',89000,2);
INSERT INTO "OrderItem" ("id","orderId","productId","productSlug","title","priceUAH","qty") VALUES ('cda17cbe022167288a9400997','c698eb7f193b22691bd88fb61','cd2617dd8ad1c20c6bd353280','mug-console-log-coffee','Кружка «console.log(coffee)»',45000,1);
INSERT INTO "Order" ("id","userId","status","firstName","lastName","email","phone","city","address","shipping","shippingCostUAH","payment","codFeeUAH","totalUAH","createdAt") VALUES ('cf05b3ce38699e92668c2987b','c83d153759791fc3d37cc65b4','CANCELLED'::"OrderStatus",'Олена','Коваль','demo@nby.shop','+380671234567','Львів','вул. Личаківська 20','pickup',0,'apple_pay',0,45000,'2026-09-10 00:00:00.000');
INSERT INTO "OrderItem" ("id","orderId","productId","productSlug","title","priceUAH","qty") VALUES ('cb05d2b393896346acd8317e4','cf05b3ce38699e92668c2987b','cd2617dd8ad1c20c6bd353280','mug-console-log-coffee','Кружка «console.log(coffee)»',45000,1);

COMMIT;
