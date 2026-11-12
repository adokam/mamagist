import { PageHeader } from "@/components/PageHeader";

/** Temporary page body used until each screen is built. */
export function PlaceholderPage({ title, label }: { title: string; label?: string | undefined }) {
  return (
    <main className="page-shell">
      <PageHeader title={title} label={label} />
      <p className="mt-3 text-[17px] leading-relaxed text-foreground">Coming in a later step.</p>
    </main>
  );
}
