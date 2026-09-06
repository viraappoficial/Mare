import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-sage text-white hover:bg-sage-dark active:bg-sage-dark",
  secondary: "bg-peach text-ink hover:bg-peach-dark active:bg-peach-dark",
  outline: "border-2 border-mist bg-transparent text-ink hover:bg-mist/30",
  ghost: "bg-transparent text-ink hover:bg-mist/30",
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
