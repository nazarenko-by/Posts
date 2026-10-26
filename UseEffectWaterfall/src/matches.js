import { PACKAGES } from "./packages.js";

export const matches = (name, query) => name.toLowerCase().includes(query.trim().toLowerCase());

// чи те, що на екрані (список і лічильник), відповідає поточному запиту
export const isConsistent = (query, list, count) => {
  const expected = PACKAGES.filter((p) => matches(p, query));
  return list.length === expected.length && list.every((p, i) => p === expected[i]) && count === expected.length;
};
