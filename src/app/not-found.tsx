import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-prose px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-3 text-ink-mute">Page not found</p>
      <Link href="/" className="mt-6 inline-block text-brand-500 hover:underline">
        ← Home
      </Link>
    </div>
  );
}
