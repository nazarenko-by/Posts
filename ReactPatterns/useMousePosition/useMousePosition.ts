import { useState, useEffect } from "react";

type Position = { x: number; y: number };

/**
 * Custom hook: shares mouse-tracking logic across any component.
 * Unlike the render props version (MouseTracker, see post_121/demo),
 * there's no wrapper component and no JSX nesting — just a function call.
 */
export function useMousePosition(): Position {
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return pos;
}
