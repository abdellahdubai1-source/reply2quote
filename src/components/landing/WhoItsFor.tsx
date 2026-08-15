import { INDUSTRY_TAGS } from "@/lib/constants";

export function WhoItsFor() {
  return (
    <section className="border-t border-border py-20">
      <div className="container">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Who It's For</h2>
          <p className="mt-3 text-ink-soft">Built for UAE service businesses that quote customers every day.</p>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
          {INDUSTRY_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink-soft shadow-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
