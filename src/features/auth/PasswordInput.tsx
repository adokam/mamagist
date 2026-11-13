import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

import { TextInput } from "@/components/TextInput";
import { cn } from "@/lib/utils";

/** Shared text input with a show / hide toggle on the right. */
export function PasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <TextInput
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-14", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {visible ? (
          <EyeOff className="h-5 w-5" aria-hidden />
        ) : (
          <Eye className="h-5 w-5" aria-hidden />
        )}
      </button>
    </div>
  );
}
