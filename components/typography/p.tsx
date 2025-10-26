import { cn } from "@/lib/utils";

interface PProps {
  children: React.ReactNode;
  className?: string;
}

export function P({ children, className }: PProps) {
  return (
    <p className={cn(
      "leading-7 [&:not(:first-child)]:mt-6",
      className
    )}>
      {children}
    </p>
  );
}
