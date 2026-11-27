import cloneDeep from "lodash-es/cloneDeep.js";
export const METHODS = {
    structuredClone: (x) => structuredClone(x),
    json: (x) => JSON.parse(JSON.stringify(x)),
    cloneDeep: (x) => cloneDeep(x),
};
// чи клон правильний: Date лишився Date, Map - Map, цикл збережено
export function correct(name, src, out) {
    if (name === "rich") return out.updatedAt instanceof Date && out.byId instanceof Map && out.byId.size === 50 && out.seen instanceof Set && out.byId.get("p1") !== src.byId.get("p1");
    if (name === "cycle") return out.children[0].parent === out && out !== src;
    return JSON.stringify(out) === JSON.stringify(src) && out !== src;
}
