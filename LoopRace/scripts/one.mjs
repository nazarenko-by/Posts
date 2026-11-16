// Один варіант в окремому процесі (щоб JIT не «вчився» на сусідах):
//   node scripts/one.mjs <sum|totals> <for|forOf|forEach|reduce|map> [n=1000000]
import { makeData, CASES } from "./cases.js";
import { measure } from "./measure.js";
const [task, name, n = 1e6] = process.argv.slice(2);
console.log(JSON.stringify({ task, name, n: +n, ...measure(CASES[task][name], makeData(+n)) }));
