import { AppNav } from "@/components/app/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <AppNav />
      <main className="container max-w-5xl py-8 sm:py-10">{children}</main>
    </div>
  );
}
