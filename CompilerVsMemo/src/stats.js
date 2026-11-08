// Лічильники для замірів: onRender для <Profiler>, а не мутація в render (компілятор не любить побічних ефектів у render)
export const stats = { commits: 0, actual: 0, cards: 0, lists: 0 };
export function onAppRender(_id, _phase, actualDuration) {
    stats.commits++;
    stats.actual += actualDuration;
}
export const onCardRender = () => { stats.cards++; };
export const onListRender = () => { stats.lists++; };
export function resetStats() { stats.commits = 0; stats.actual = 0; stats.cards = 0; stats.lists = 0; }
if (typeof window !== "undefined") Object.assign(window, { __stats: stats, __reset: resetStats });
