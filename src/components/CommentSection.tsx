"use client";

import { useEffect, useRef, useState } from "react";
import type { Comment, Reply } from "@/lib/redis";
import type { Locale } from "@/lib/locale";
import { getStrings } from "@/i18n";

/* ── Avatar colour from comment ID ──────────────────────────── */
const COLOURS = [
  "bg-emerald-500", "bg-violet-500", "bg-sky-500",
  "bg-amber-500",  "bg-rose-500",   "bg-teal-500",
  "bg-indigo-500", "bg-orange-500",
];
function avatarColour(id: string) {
  const n = (id.charCodeAt(0) ?? 0) + (id.charCodeAt(1) ?? 0);
  return COLOURS[n % COLOURS.length];
}

/* ── Relative time ───────────────────────────────────────────── */
function relativeTime(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return locale === "pt" ? "agora"  : "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} ${locale === "pt" ? "d" : "d"}`;
}

/* ── Like button ─────────────────────────────────────────────── */
function LikeBtn({
  count, liked, onLike,
}: { count: number; liked: boolean; onLike: () => void }) {
  return (
    <button
      type="button"
      onClick={onLike}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
        liked
          ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400"
          : "text-ink-mute hover:bg-surface hover:text-ink"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

/* ── Reply sub-component ─────────────────────────────────────── */
function ReplyItem({
  reply, commentId, slug, locale,
}: { reply: Reply; commentId: string; slug: string; locale: string }) {
  const [likes, setLikes] = useState(reply.likes);
  const [liked, setLiked] = useState(false);

  function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    fetch(`/api/comments/${encodeURIComponent(slug)}/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", replyId: reply.id }),
    }).catch(() => {});
  }

  return (
    <div className="flex gap-2.5 py-2">
      <div className={`flex-none mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarColour(reply.id)}`} aria-hidden="true">
        {reply.id.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-ink">Visitante</span>
          <span className="text-[10px] text-ink-mute">{relativeTime(reply.createdAt, locale)}</span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft whitespace-pre-wrap break-words">{reply.message}</p>
        <div className="mt-1">
          <LikeBtn count={likes} liked={liked} onLike={handleLike} />
        </div>
      </div>
    </div>
  );
}

/* ── Comment item ────────────────────────────────────────────── */
function CommentItem({
  comment, slug, locale,
}: { comment: Comment; slug: string; locale: string }) {
  const t = getStrings(locale as Locale);
  const [likes, setLikes]       = useState(comment.likes);
  const [liked, setLiked]       = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies]   = useState<Reply[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");
  const [replySending, setReplySending] = useState(false);

  function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    fetch(`/api/comments/${encodeURIComponent(slug)}/${comment.id}/like`, {
      method: "POST",
    }).catch(() => {});
  }

  function handleShowReply() {
    setShowReply((v) => !v);
    if (!repliesLoaded && comment.replyCount > 0) {
      setRepliesLoaded(true);
      fetch(`/api/comments/${encodeURIComponent(slug)}/${comment.id}/reply`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { replies: Reply[] } | null) => {
          if (data?.replies) setReplies(data.replies);
        })
        .catch(() => {});
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    setReplySending(true);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(slug)}/${comment.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMsg.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply: Reply };
        setReplies((prev) => [data.reply, ...prev]);
        setReplyMsg("");
        setRepliesLoaded(true);
      }
    } finally {
      setReplySending(false);
    }
  }

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className={`flex-none mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarColour(comment.id)}`} aria-hidden="true">
        {comment.id.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">Visitante</span>
          <span className="text-xs text-ink-mute">{relativeTime(comment.createdAt, locale)}</span>
        </div>

        {/* Message */}
        <p className="mt-1 text-sm leading-relaxed text-ink-soft whitespace-pre-wrap break-words">
          {comment.message}
        </p>

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-1">
          <LikeBtn count={likes} liked={liked} onLike={handleLike} />
          <button
            type="button"
            onClick={handleShowReply}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-mute transition-colors hover:bg-surface hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {t.comments.reply}
            {comment.replyCount > 0 && !repliesLoaded && (
              <span className="ml-0.5 text-brand-500">({comment.replyCount})</span>
            )}
          </button>
        </div>

        {/* Reply area */}
        {showReply && (
          <div className="mt-3 pl-0.5 border-l-2 border-line space-y-3 pl-3">
            {/* Existing replies */}
            {replies.map((r) => (
              <ReplyItem key={r.id} reply={r} commentId={comment.id} slug={slug} locale={locale} />
            ))}

            {/* Reply form */}
            <form onSubmit={submitReply} className="flex gap-2 pt-1">
              <textarea
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                placeholder={t.comments.messagePlaceholder}
                rows={2}
                maxLength={500}
                required
                className="flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
              <button
                type="submit"
                disabled={replySending || !replyMsg.trim()}
                className="self-end flex-none rounded-full bg-gradient-to-r from-brand-500 to-teal-400 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {replySending ? "…" : t.comments.submit}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main section ────────────────────────────────────────────── */
type Props = { slug: string; locale: Locale; initialComments?: Comment[] };

export function CommentSection({ slug, locale, initialComments = [] }: Props) {
  const t = getStrings(locale);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [message, setMessage]   = useState("");
  const [status, setStatus]     = useState<"idle" | "sending" | "error" | "tooFast">("idle");
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/comments/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { comments: Comment[] } | null) => {
        if (data?.comments) setComments(data.comments);
      })
      .catch(() => {});
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (res.status === 429) { setStatus("tooFast"); return; }
      if (!res.ok) { setStatus("error"); return; }
      const data = (await res.json()) as { comment: Comment };
      setComments((prev) => [data.comment, ...prev]);
      setMessage("");
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-14 border-t border-line pt-10">
      {/* Heading */}
      <h2 className="flex items-center gap-2.5 text-base font-bold tracking-tight text-ink">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {t.comments.heading}
        {comments.length > 0 && (
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-normal text-ink-mute">
            {comments.length}
          </span>
        )}
      </h2>

      {/* Form — no name field */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-2.5">
        <textarea
          ref={textRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.comments.messagePlaceholder}
          maxLength={500}
          rows={3}
          required
          className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-ink-mute">
            {status === "tooFast" ? t.comments.tooFast
              : status === "error" ? t.comments.error
              : message.length > 0 ? `${message.length}/500` : ""}
          </span>
          <button
            type="submit"
            disabled={status === "sending" || !message.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-teal-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "sending" ? t.comments.submitting : t.comments.submit}
          </button>
        </div>
      </form>

      {/* Comment list */}
      <div className="mt-8 space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-ink-mute">{t.comments.empty}</p>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} slug={slug} locale={locale} />
          ))
        )}
      </div>
    </section>
  );
}
