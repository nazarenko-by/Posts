// Замір одного варіанта. Працює і в Node, і в браузері (без імпортів).
//   cold - перший виклик на свіжих даних (код ще не оптимізований JIT);
//   hot  - медіана 30 вимірів після 20 прогрівочних; для малих n кожен вимір - пачка викликів (разом ~1 000 000 елементів),
//          результат ділиться на розмір пачки, щоб обійти грубий таймер браузера.
export function measure(fn, data) {
    const batch = Math.max(1, Math.round(1e6 / data.length));
    let sink = 0;
    const use = (r) => { sink += typeof r === "number" ? r : r.length; };
    const t0 = performance.now(); use(fn(data)); const cold = performance.now() - t0;
    for (let i = 0; i < 20; i++) for (let b = 0; b < batch; b++) use(fn(data));
    const times = [];
    for (let i = 0; i < 30; i++) {
        const s = performance.now();
        for (let b = 0; b < batch; b++) use(fn(data));
        times.push((performance.now() - s) / batch);
    }
    times.sort((a, b) => a - b);
    return { cold, hot: times[15], sink };
}
