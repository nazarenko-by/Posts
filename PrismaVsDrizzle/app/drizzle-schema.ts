// Drizzle-схема для тієї самої SQLite-бази, що створив prisma db push (імена таблиць і колонок - як у Prisma).
import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const product = sqliteTable("Product", {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    priceUAH: integer("priceUAH").notNull(),
    compareAt: integer("compareAt"),
    rating: real("rating").notNull().default(0),
    badge: text("badge"),
    image: text("image").notNull(),
    imageCount: integer("imageCount").notNull().default(4),
    description: text("description"),
    specs: text("specs", { mode: "json" }),
    stock: integer("stock").notNull().default(0),
    status: text("status", { enum: ["DRAFT", "PUBLISHED"] }).notNull().default("PUBLISHED"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
}, (t) => [uniqueIndex("Product_slug_key").on(t.slug), index("Product_status_createdAt_idx").on(t.status, t.createdAt)]);

export const review = sqliteTable("Review", {
    id: text("id").primaryKey(),
    productId: text("productId").notNull().references(() => product.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    verified: integer("verified", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
}, (t) => [index("Review_productId_idx").on(t.productId)]);

export const order = sqliteTable("Order", {
    id: text("id").primaryKey(),
    orderSeq: integer("orderSeq").notNull(),
    userId: text("userId"),
    status: text("status", { enum: ["PACKING", "DELIVERED", "CANCELLED"] }).notNull().default("PACKING"),
    firstName: text("firstName").notNull(),
    lastName: text("lastName").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    city: text("city").notNull(),
    address: text("address").notNull(),
    shipping: text("shipping").notNull(),
    shippingCostUAH: integer("shippingCostUAH").notNull(),
    payment: text("payment").notNull(),
    codFeeUAH: integer("codFeeUAH").notNull().default(0),
    totalUAH: integer("totalUAH").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});

export const orderItem = sqliteTable("OrderItem", {
    id: text("id").primaryKey(),
    orderId: text("orderId").notNull().references(() => order.id, { onDelete: "cascade" }),
    productId: text("productId"),
    productSlug: text("productSlug").notNull(),
    title: text("title").notNull(),
    priceUAH: integer("priceUAH").notNull(),
    qty: integer("qty").notNull(),
});

export const productRelations = relations(product, ({ many }) => ({ reviews: many(review) }));
export const reviewRelations = relations(review, ({ one }) => ({ product: one(product, { fields: [review.productId], references: [product.id] }) }));
