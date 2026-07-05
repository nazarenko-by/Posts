import { useState, useEffect, ReactNode } from "react";

type Position = { x: number; y: number };

interface MouseTrackerProps {
  children: (pos: Position) => ReactNode;
}

/**
 * Render props pattern: MouseTracker doesn't render any UI itself.
 * It tracks the mouse position and hands the data to `children`,
 * which is called as a function instead of used as JSX content.
 */
export function MouseTracker({ children }: MouseTrackerProps) {
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return children(pos);
}
