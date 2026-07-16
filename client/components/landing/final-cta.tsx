import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to start learning?
        </h2>
        <p className="mt-3 text-muted-foreground text-sm">
          Join thousands of learners and creators on Relay.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-xl bg-emerald-600 px-6 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-all duration-200"
          >
            Create your account
          </Link>
          <Link
            href="/signin"
            className="inline-flex h-11 items-center rounded-xl border px-6 text-sm font-medium text-foreground hover:bg-muted transition-all duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
