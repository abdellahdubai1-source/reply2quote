import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-neutral-50/60 py-20">
      <div className="container">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">How It Works</h2>
          <p className="mt-3 text-ink-soft">From a customer's message to a sent quotation — four simple steps.</p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((s) => (
            <li
              key={s.step}
              className="relative rounded-2xl border border-border bg-white p-6 shadow-soft"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                {s.step}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
