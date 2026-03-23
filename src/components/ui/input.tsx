import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm outline-none transition-all",
              "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
              error ? "border-red-500/50" : "border-white/10",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
