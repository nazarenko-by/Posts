// dates.ts — пост 164
// Спрощені стенд-іни для moment.js та date-fns (пакети не тягнемо в демо-прев'ю),
// але поведінка мутації відтворена достеменно — так само, як реальні бібліотеки.
// Аналогічно post_155/jwt.ts, де fakeSign замінював jsonwebtoken.

import type { LibId, RunResult } from "./types";

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// 1. Date (native) — .setDate() мутує сам об'єкт
function runDate(sourceDate: Date): RunResult {
  const original = new Date(sourceDate);
  const before = fmt(original);

  const deadline = original; // те саме посилання
  deadline.setDate(deadline.getDate() + 7);

  return {
    lib: "date",
    originalBefore: before,
    originalAfter: fmt(original),
    deadline: fmt(deadline),
    mutated: fmt(original) !== before,
  };
}

// 2. moment.js — мінімальний мок, що відтворює реальну поведінку .add():
// мутує сам об'єкт і повертає те саме посилання.
class FakeMoment {
  private _d: Date;
  constructor(d: Date) {
    this._d = new Date(d);
  }
  add(amount: number, unit: "days"): FakeMoment {
    if (unit === "days") this._d.setDate(this._d.getDate() + amount);
    return this; // <- саме тут реальний moment повертає той самий об'єкт
  }
  toDate(): Date {
    return this._d;
  }
}
function moment(d: Date): FakeMoment {
  return new FakeMoment(d);
}

function runMoment(sourceDate: Date): RunResult {
  const original = moment(sourceDate);
  const before = fmt(original.toDate());

  const deadline = original.add(7, "days"); // мутує original

  return {
    lib: "moment",
    originalBefore: before,
    originalAfter: fmt(original.toDate()),
    deadline: fmt(deadline.toDate()),
    mutated: fmt(original.toDate()) !== before,
  };
}

// 3. date-fns — мінімальний мок addDays(): чиста функція, завжди новий Date.
function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy; // <- новий об'єкт, original не торкається
}

function runDateFns(sourceDate: Date): RunResult {
  const original = new Date(sourceDate);
  const before = fmt(original);

  const deadline = addDays(original, 7);

  return {
    lib: "datefns",
    originalBefore: before,
    originalAfter: fmt(original),
    deadline: fmt(deadline),
    mutated: fmt(original) !== before,
  };
}

export function runLib(lib: LibId, sourceDate: Date): RunResult {
  if (lib === "date") return runDate(sourceDate);
  if (lib === "moment") return runMoment(sourceDate);
  return runDateFns(sourceDate);
}
