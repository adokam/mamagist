import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value"> & {
  /** ISO value "YYYY-MM-DD" or "". */
  value: string;
  /** What she sees in the field, e.g. "10 May 2026". */
  displayValue: string | null;
  placeholder?: string;
};

/**
 * White rounded date field that opens the phone's own date picker.
 * The native input sits invisibly on top, so the field can show "10 May 2026" in every browser.
 */
export function DateInput({ value, displayValue, placeholder = "Choose a date", className, ...props }: Props) {
  return (
    <div className={cn("relative", className)}>
      <input
        type="date"
        value={value}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {
            // Some browsers block showPicker; tapping still opens the picker there.
          }
        }}
        {...props}
      />
      <div
        aria-hidden
        className="flex h-14 w-full items-center rounded-full border border-input bg-surface px-5 text-[17px] text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
      >
        {displayValue ?? <span className="text-muted-foreground">{placeholder}</span>}
      </div>
    </div>
  );
}
