import type { LucideIcon } from "lucide-react";

interface ComingSoonViewProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ComingSoonView({
  icon: Icon,
  title,
  description,
}: ComingSoonViewProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
