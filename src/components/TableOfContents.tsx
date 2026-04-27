"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

type TableOfContentsProps = {
  items: TocItem[];
  label: string;
  variant?: "sidebar" | "inline";
};

export function TableOfContents({
  items,
  label,
  variant = "sidebar",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
          setActiveId(top.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  /* ── Inline variant (mobile / inside article) ─────────────────── */
  if (variant === "inline") {
    return (
      <nav className="my-8 rounded-2xl border border-line bg-surface/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
          {label}
        </p>
        <ol className="mt-3 space-y-2 text-sm text-ink-soft">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className={`flex gap-3 ${item.level === 3 ? "pl-4" : ""}`}
            >
              <span className="font-mono text-xs text-ink-mute pt-px">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <a
                href={`#${item.id}`}
                className="transition-colors hover:text-brand-500"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  /* ── Sidebar variant (no wrapper — parent aside handles sticky) ── */
  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </p>
      <nav className="mt-3">
        <ul className="space-y-1.5 border-l border-line text-sm">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <li key={item.id} className={item.level === 3 ? "pl-2" : ""}>
                <a
                  href={`#${item.id}`}
                  className={`block border-l-2 -ml-px py-1 pl-3 text-[13px] leading-snug transition-colors ${
                    active
                      ? "border-brand-500 text-ink font-semibold"
                      : "border-transparent text-ink-mute hover:text-ink hover:border-line"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
