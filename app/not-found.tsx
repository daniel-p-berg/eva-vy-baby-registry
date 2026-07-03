import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-peach-700">
        Page not found
      </p>
      <h1 className="serif mt-3 text-4xl font-bold">
        This page isn&apos;t available.
      </h1>
      <p className="mt-3 text-stone-600">
        The link may be incomplete or may have expired.
      </p>
      <Link href="/" className="button-primary mt-7">
        Visit the registry
      </Link>
    </main>
  );
}
