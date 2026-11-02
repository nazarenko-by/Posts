// Точка входу: усе, що звідси не досяжне, Knip вважає мертвим
import dayjs from "dayjs";
import { formatPrice } from "./utils/format.ts";
import { renderCart } from "./components/cart.ts";

console.log(dayjs().format("DD.MM.YYYY"), renderCart([{ title: "Футболка", price: 49900 }]), formatPrice(0));
