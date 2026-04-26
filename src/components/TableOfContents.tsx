"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

type TableOfContentsProps = {
  items: TocItem[];
  label: string;
};

export function TableOfContents({ items, label }: TableOfContentsProps) {
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
          const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          setActiveId(top.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <nav className="mt-3">
        <ul className="space-y-2 border-l border-line text-sm">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <li
                key={item.id}
                className={item.level === 3 ? "pl-2" : ""}
              >
                <a
                  href={`#${item.id}`}
                  className={`block border-l-2 -ml-px py-1 pl-3 transition-colors ${
                    active
                      ? "border-brand-500 text-ink font-medium"
                      : "border-transparent text-ink-mute hover:text-ink"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
