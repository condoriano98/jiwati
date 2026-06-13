import { cn } from "@/lib/utils";

const styles = {
  brand: "bg-brand-100 text-brand-700",
  accent: "bg-accent-500/15 text-accent-500",
  muted: "bg-muted text-muted-foreground",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
} as const;

export function Badge({
  variant = "brand",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof styles;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
