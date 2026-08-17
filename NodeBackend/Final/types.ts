// types.ts — Node/Backend Фінал 6/6 (капстоун)

export type AuthResult = { ok: true; userId: number } | { ok: false; reason: string };

export type StepLog = { step: string; detail: string; ok: boolean };

export type PipelineResult = {
  steps: StepLog[];
  status: number;
  body: unknown;
};
