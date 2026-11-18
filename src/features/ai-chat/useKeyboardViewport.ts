import { useEffect, useState } from "react";

/**
 * When the phone keyboard is open, the visible part of the screen (top and height).
 * Null when the keyboard is closed, so the page can use dynamic viewport units.
 */
export function useKeyboardViewport(): { top: number; height: number } | null {
  const [view, setView] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const keyboardOpen = vv.scale <= 1.01 && window.innerHeight - vv.height > 120;
      setView(keyboardOpen ? { top: vv.offsetTop, height: vv.height } : null);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return view;
}
