/** Temporary page body used until each screen is built. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="px-6 pt-12">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">Coming in a later step.</p>
    </main>
  );
}
