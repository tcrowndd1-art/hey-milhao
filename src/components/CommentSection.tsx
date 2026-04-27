"use client";

import { useEffect, useRef, useState } from "react";
import type { Comment } from "@/lib/redis";
import type { Locale } from "@/lib/locale";
import { getStrings } from "@/i18n";

/* ── Avatar colour ────────────────────────────────────────── */
const AVATAR_COLOURS = [
  "bg-emerald-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-orange-500",
];

function avatarColour(name: string) {
  const code = (name.charCodeAt(0) ?? 0) + (name.charCodeAt(1) ?? 0);
  return AVATAR_COLOURS[code % AVATAR_COLOURS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

/* ── Relative time ─────────────────────────────────────────── */
function relativeTime(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return locale === "pt" ? "agora" : "ahora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${locale === "pt" ? "d" : "d"}`;
  const months = Math.floor(days / 30);
  return `${months} ${locale === "pt" ? "mês" : "mes"}`;
}

/* ── Component ─────────────────────────────────────────────── */
type Props = {
  slug: string;
  locale: Locale;
  initialComments?: Comment[];
};

export function CommentSection({ slug, locale, initialComments = [] }: Props) {
  const t = getStrings(locale);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "tooFast">("idle");
  const nameRef = useRef<HTMLInputElement>(null);

  /* Load comments on mount */
  useEffect(() => {
    fetch(`/api/comments/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { comments: Comment[] } | null) => {
        if (data?.comments) setComments(data.comments);
      })
      .catch(() => {/* best-effort */});
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      if (res.status === 429) {
        setStatus("tooFast");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }

      const data = (await res.json()) as { comment: Comment };
      setComments((prev) => [data.comment, ...prev]);
      setMessage("");
      setStatus("idle");
      nameRef.current?.blur();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink">
        {/* Chat bubble icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-500"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {t.comments.heading}
        {comments.length > 0 && (
          <span className="rounded-full bg-surface px-2 py-0.5 text-sm font-normal text-ink-mute">
            {comments.length}
          </span>
        )}
      </h2>

      {/* ── Comment form ───────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.comments.namePlaceholder}
          maxLength={40}
          required
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.comments.messagePlaceholder}
          maxLength={500}
          rows={3}
          required
          className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />

        <div className="flex items-center justify-between gap-3">
          {/* Status message */}
          <span className="text-xs text-ink-mute">
            {status === "tooFast"
              ? t.comments.tooFast
              : status === "error"
              ? t.comments.error
              : message.length > 0
              ? `${message.length}/500`
              : ""}
          </span>
          <button
            type="submit"
            disabled={status === "sending" || !name.trim() || !message.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-teal-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "sending" ? t.comments.submitting : t.comments.submit}
          </button>
        </div>
      </form>

      {/* ── Comment list ───────────────────────────────────── */}
      <div className="mt-8 space-y-5">
        {comments.length === 0 ? (
          <p className="text-sm text-ink-mute">{t.comments.empty}</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3.5">
              {/* Avatar */}
              <div
                className={`flex-none flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarColour(c.name)}`}
                aria-hidden="true"
              >
                {initials(c.name)}
              </div>

              {/* Body */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-ink">{c.name}</span>
                  <span className="text-xs text-ink-mute">
                    {relativeTime(c.createdAt, locale)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft whitespace-pre-wrap break-words">
                  {c.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
