import React from "react";
import { HelpCircle, Info, Radio, Sun} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { MiniProjectCard } from "@/components/mini-project-card";


export function ProjectPanel() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <aside className="hidden w-80 flex-col gap-6 overflow-y-auto border-l border-border bg-sidebar p-6 lg:flex">
      <div className="flex items-center gap-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full rounded-lg border"
          captionLayout="dropdown"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Projects</p>
        <div className="space-y-3">
          <MiniProjectCard
            title="Website Redesign"
            tasks={12}
            progress={72}
            color="bg-primary"
          />
          <MiniProjectCard
            title="Mobile App"
            tasks={8}
            progress={45}
            color="bg-secondary-accent"
          />
          <MiniProjectCard
            title="Marketing Site"
            tasks={5}
            progress={20}
            color="bg-success"
          />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-muted-foreground">
        <button
          type="button"
          className="flex items-center gap-1.5"
          aria-label="Theme"
        >
          <Sun className="size-4" /> Theme
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5"
          aria-label="Help"
        >
          <HelpCircle className="size-4" /> Help
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5"
          aria-label="Info"
        >
          <Info className="size-4" /> Info
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5"
          aria-label="Live"
        >
          <Radio className="size-4" /> Live
        </button>
      </div>
    </aside>
  );
}
