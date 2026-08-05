// types.ts — Node/Backend #1

export type HttpMethod = "GET" | "POST";

export type ServerResponse = {
  status: number;
  body: unknown;
};

export type Route = {
  method: HttpMethod;
  path: string;
  label: string;
  handler: () => ServerResponse;
};
