"use client";

import { useEffect, useRef } from "react";

type AdSlotProps = {
  slot: string;
  variant?: "in-article" | "footer" | "header";
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ slot, variant = "in-article", className = "" }: AdSlotProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const ref = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!clientId || pushedRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      /* AdSense script not yet loaded — will retry on next mount */
    }
  }, [clientId]);

  if (!clientId) {
    return (
      <div
        className={`my-8 rounded-xl border border-dashed border-line bg-surface p-6 text-center text-xs text-ink-mute ${className}`}
        aria-hidden="true"
      >
        Ad placeholder ({variant})
      </div>
    );
  }

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block my-8 ${className}`}
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
