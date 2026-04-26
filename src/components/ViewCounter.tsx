"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/format";

type ViewCounterProps = {
  slug: string;
  initial: number;
  viewsLabel: string;
};

export function ViewCounter({ slug, initial, viewsLabel }: ViewCounterProps) {
  const [count, setCount] = useState<number>(initial);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/views/${encodeURIComponent(slug)}`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        /* counter is best-effort */
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <span aria-label={`${count} ${viewsLabel}`}>
      {formatCount(count)} {viewsLabel}
    </span>
  );
}
