// server.ts — Node/Backend #2 (Request lifecycle)
// Дві версії того самого handler'а: наївна (без validate) і з middleware-валідацією
// + централізованим error handler. Обидві реально викликаються з UI.

import { Body, ServerResult } from "./types";

// Наївний handler — без validate(), падає якщо body.name відсутній.
export function handleNaive(body: Body): ServerResult {
  try {
    // тут би впав реальний сервер: Cannot read properties of undefined
    const name = body.name!.trim();
    return { crashed: false, status: 201, body: { id: 3, name } };
  } catch {
    return { crashed: true, message: "TypeError: Cannot read properties of undefined (reading 'trim')" };
  }
}

// validate() — middleware, що зупиняє ланцюжок до handler'а.
function validate(body: Body): string | null {
  if (!body.name) return "name required";
  return null;
}

// Handler з валідацією + єдиний error handler на кінці ланцюжка.
export function handleWithValidation(body: Body): ServerResult {
  const error = validate(body);
  if (error) {
    // це і є той самий app.use((err, req, res, next) => {...})
    return { crashed: false, status: 400, body: { error } };
  }
  return { crashed: false, status: 201, body: { id: 3, name: body.name!.trim() } };
}
