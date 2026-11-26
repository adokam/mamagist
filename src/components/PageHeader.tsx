/** Page title, with an optional small label above it (e.g. "Daily checklist" above "Today"). */
export function PageHeader({ title, label }: { title: string; label?: string | undefined }) {
  return (
    <header>
      {label ? <p className="text-[15px] font-semibold text-foreground">{label}</p> : null}
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-foreground">
        {title}
      </h1>
    </header>
  );
}
