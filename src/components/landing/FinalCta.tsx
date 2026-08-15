import { ButtonLink } from "@/components/ui/ButtonLink";

export function FinalCta() {
  return (
    <section className="border-t border-border bg-ink py-20">
      <div className="container flex flex-col items-center text-center">
        <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Stop typing the same replies every day.
        </h2>
        <p className="mt-4 max-w-md text-balance text-neutral-300">
          Turn customer enquiries into professional quotations in seconds.
        </p>
        <ButtonLink href="/new" size="lg" className="mt-8 px-10">
          Start Free
        </ButtonLink>
      </div>
    </section>
  );
}
