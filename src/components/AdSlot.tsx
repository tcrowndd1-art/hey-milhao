"use client";

import { useEffect, useRef } from "react";
import { AffiliateAd } from "./AffiliateAd";
import { pickAd } from "@/data/affiliate-ads";
import type { Locale } from "@/lib/locale";

export type AdVariant = "header" | "in-feed" | "in-article" | "sidebar" | "footer";

type AdSlotProps = {
  slot: string;
  variant?: AdVariant;
  locale?: Locale;
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
  sidebar: "min-h-[320px]",
  footer: "min-h-[200px]",
};

const variantFormat: Record<AdVariant, string> = {
  header: "horizontal",
  "in-feed": "fluid",
  "in-article": "auto",
  sidebar: "rectangle",
  footer: "auto",
};

export function AdSlot({
  slot,
  variant = "in-article",
  locale = "pt",
  className = "",
}: AdSlotProps) {
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

  // Fallback: while AdSense isn't approved, show a rotating affiliate ad.
  if (!clientId) {
    const ad = pickAd(`${slot}:${variant}:${locale}`);
    const orientation = variant === "sidebar" ? "vertical" : "horizontal";
    return (
      <AffiliateAd
        ad={ad}
        locale={locale}
        orientation={orientation}
        className={`${variantClass[variant]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`my-2 flex items-center justify-center rounded-xl bg-surface/40 ring-1 ring-line ${variantClass[variant]} ${className}`}
    >
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
