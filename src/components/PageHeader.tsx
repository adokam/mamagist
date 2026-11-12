/** Page title, with an optional small label above it (e.g. "Daily checklist" above "Today"). */
export function PageHeader({ title, label }: { title: string; label?: string }) {
  return (
    <header>
      {label ? <p className="text-base font-semibold text-foreground">{label}</p> : null}
      <h1 className="text-[30px] leading-tight font-extrabold tracking-tight text-foreground">
        {title}
      </h1>
    </header>
  );
}
