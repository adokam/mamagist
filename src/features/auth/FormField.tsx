import type { ReactNode } from "react";

/** Bold label above an input, with an optional error line under it. */
export function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[15px] font-bold text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="px-5 text-[15px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Friendly error box shown above the main button. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl bg-card px-5 py-4 text-[16px] font-semibold text-foreground">
      {message}
    </p>
  );
}
