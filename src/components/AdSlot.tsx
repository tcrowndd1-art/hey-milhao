"use client";

import { useEffect, useRef } from "react";

export type AdVariant = "header" | "in-feed" | "in-article" | "sidebar" | "footer";

type AdSlotProps = {
  slot: string;
  variant?: AdVariant;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const variantClass: Record<AdVariant, string> = {
  header: "min-h-[100px] sm:min-h-[120px]",
  "in-feed": "min-h-[200px]",
  "in-article": "min-h-[250px]",
  sidebar: "min-h-[600px]",
  footer: "min-h-[250px]",
};

const variantFormat: Record<AdVariant, string> = {
  header: "horizontal",
  "in-feed": "fluid",
  "in-article": "auto",
  sidebar: "rectangle",
  footer: "auto",
};

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

  const wrapperClass = `my-6 flex items-center justify-center rounded-xl bg-surface/50 ring-1 ring-line ${variantClass[variant]} ${className}`;

  if (!clientId) {
    return (
      <div className={wrapperClass} aria-hidden="true">
        <span className="text-xs uppercase tracking-wider text-ink-mute">
          Ad placeholder · {variant}
        </span>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <ins
        ref={ref}
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={variantFormat[variant]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
