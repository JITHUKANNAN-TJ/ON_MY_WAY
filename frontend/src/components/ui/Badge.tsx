import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "warning" | "danger";
}

const variants = {
  default: "bg-white/10 text-text-secondary",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`${variants[variant]} inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium`}
    >
      {children}
    </span>
  );
}
