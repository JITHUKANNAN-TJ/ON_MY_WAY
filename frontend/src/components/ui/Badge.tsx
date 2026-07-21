import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "secondary" | "warning" | "danger";
  size?: "sm" | "md";
}

const variants = {
  default: "bg-white/[0.04] text-text-secondary ring-1 ring-white/[0.06]",
  primary: "bg-primary/10 text-primary ring-1 ring-primary/20",
  secondary: "bg-secondary/10 text-secondary ring-1 ring-secondary/20",
  warning: "bg-warning/10 text-warning ring-1 ring-warning/20",
  danger: "bg-danger/10 text-danger ring-1 ring-danger/20",
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({ children, variant = "default", size = "md" }: BadgeProps) {
  return (
    <span
      className={`${variants[variant]} ${sizes[size]} inline-flex items-center gap-1 rounded-full font-medium`}
    >
      {children}
    </span>
  );
}
