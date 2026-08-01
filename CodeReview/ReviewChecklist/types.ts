// types.ts — Code review #4

export type ChecklistGroup = "form" | "readability" | "reliability";

export type ChecklistItem = {
  id: string;
  text: string;
  group: ChecklistGroup;
};
