import { createNoise3D } from "simplex-noise";

// Поле кутів: шум (x, y, час) → кут у радіанах.
// 3D-шум замість 2D, щоб поле повільно «дихало» в часі. На слайді - спрощена 2D-версія.
export function createField({ scale = 0.004, turns = 2, drift = 0.0004 } = {}) {
  let noise = createNoise3D();
  return {
    angle: (x, y, t) => noise(x * scale, y * scale, t * drift) * Math.PI * turns,
    reseed: () => {
      noise = createNoise3D();
    },
  };
}
