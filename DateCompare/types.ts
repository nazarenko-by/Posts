// types.ts — пост 164, демо "Date vs moment.js vs date-fns"

export type LibId = "date" | "moment" | "datefns";

export interface RunResult {
  lib: LibId;
  originalBefore: string;
  originalAfter: string;
  deadline: string;
  mutated: boolean;
}

export interface LibInfo {
  id: LibId;
  label: string;
  hint: string;
}

export const LIBS: LibInfo[] = [
  { id: "date", label: "Date", hint: "вбудований, мутабельний" },
  { id: "moment", label: "moment.js", hint: "мутабельний (легасі з 2020)" },
  { id: "datefns", label: "date-fns", hint: "immutable, tree-shakeable" },
];
