// db.ts — Node/Backend #4 (N+1)
// In-memory "база" - кожен виклик query() рахується і займає ~1ms,
// щоб реально показати різницю між наївним циклом і include.

import { QueryStats } from "./types";

let queryLog: string[] = [];

function query(label: string): void {
  queryLog.push(label);
}

export function resetLog(): void {
  queryLog = [];
}

// Наївний підхід: 1 запит users + N запитів (по одному на кожного user).
export function naiveFetch(userCount: number): QueryStats {
  resetLog();
  query("SELECT * FROM users");
  for (let i = 0; i < userCount; i++) {
    query(`SELECT * FROM posts WHERE authorId = ${i}`);
  }
  return { queryCount: queryLog.length, timeMs: queryLog.length * 1.2 };
}

// include: один запит з JOIN, незалежно від кількості users.
export function includeFetch(userCount: number): QueryStats {
  resetLog();
  query(`SELECT * FROM users JOIN posts ON posts.authorId = users.id`);
  return { queryCount: queryLog.length, timeMs: 3.4 };
}

export function getLog(): string[] {
  return queryLog;
}
