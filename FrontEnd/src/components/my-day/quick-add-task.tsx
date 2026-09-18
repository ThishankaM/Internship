import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickAddTaskProps {
  onAdd: (title: string) => Promise<boolean>;
}

export function QuickAddTask({ onAdd }: QuickAddTaskProps) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSaving) return;

    setIsSaving(true);
    const created = await onAdd(trimmed);
    if (created) setTitle("");
    setIsSaving(false);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3"
    >
      <Input
        value={title}
        disabled={isSaving}
        placeholder="What needs to be done?"
        onChange={(event) => setTitle(event.target.value)}
        className="h-10 border-transparent bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="sm"
        disabled={isSaving || !title.trim()}
        className="shrink-0"
      >
        <Plus className="size-4" />
        Quick Add
      </Button>
    </form>
  );
}
