"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function FloatingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Modo claro" : "Modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:border-brand-500/40 hover:shadow-brand-500/10"
    >
      {/* Sun */}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-ink-soft ${isDark ? "block" : "hidden"}`} aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      {/* Moon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-ink-soft ${isDark ? "hidden" : "block"}`} aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
