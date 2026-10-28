import type { ReactNode } from "react";

interface Props {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

const inputClass =
  "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/60";

export { inputClass };

export default function FormField({ label, htmlFor, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs text-muted-foreground block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
