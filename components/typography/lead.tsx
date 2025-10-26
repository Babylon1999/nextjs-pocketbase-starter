import { cn } from "@/lib/utils";

interface LeadProps {
  children: React.ReactNode;
  className?: string;
}

export function Lead({ children, className }: LeadProps) {
  return (
    <p className={cn(
      "text-xl text-muted-foreground",
      className
    )}>
      {children}
    </p>
  );
}
