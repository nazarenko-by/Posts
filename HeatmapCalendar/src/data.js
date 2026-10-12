import * as d3 from "d3";

// Умовні дані: кількість комітів на кожен день останніх 52 тижнів.
// d3.randomLcg(seed) - детермінований генератор: при кожному запуску той самий малюнок.
// Заміни на свої дані у форматі [{ date: Date, count: number }].
export function generateDays(end = new Date()) {
  const random = d3.randomLcg(211);
  const last = d3.timeDay.floor(end);
  const start = d3.timeMonday.offset(d3.timeMonday.floor(last), -51);

  return d3.timeDays(start, d3.timeDay.offset(last, 1)).map((date, i) => {
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const busy = 0.6 + 0.4 * Math.sin(i / 7 / 3.2);
    const zero = random() < (weekend ? 0.55 : 0.12);
    const count = zero ? 0 : Math.max(1, Math.round((0.25 + random()) * 11 * busy * (weekend ? 0.5 : 1)));
    return { date, count };
  });
}
