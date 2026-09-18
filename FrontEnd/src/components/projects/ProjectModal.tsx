import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreateProjectRequest, Project, ProjectStatus } from "@/types/project";

interface ProjectModalProps {
  isOpen: boolean;
  isSaving: boolean;
  editingProject: Project | null;
  serverError?: string | null;
  onClose: () => void;
  onSave: (payload: CreateProjectRequest) => Promise<boolean>;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const COLOR_PRESETS = ["#8A73FF", "#FF8A5B", "#12A575", "#E5484D", "#3B82F6", "#F59E0B", "#10B981", "#EC4899"];

export function ProjectModal({ isOpen, isSaving, editingProject, serverError, onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState(editingProject?.name ?? "");
  const [description, setDescription] = useState(editingProject?.description ?? "");
  const [color, setColor] = useState(editingProject?.color ?? "#8A73FF");
  const [status, setStatus] = useState<ProjectStatus>(editingProject?.status ?? "active");
  const [dueDate, setDueDate] = useState(editingProject?.dueDate ?? "");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Name is required");
      return;
    }
    setValidationError("");
    const ok = await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color: color || undefined,
      status,
      dueDate: dueDate || undefined,
    });
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSaving && !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingProject ? "Edit Project" : "Create Project"}</DialogTitle>
        </DialogHeader>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name *</Label>
            <Input
              id="project-name"
              value={name}
              disabled={isSaving}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="e.g. TaskFlow Website"
            />
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              rows={3}
              value={description}
              disabled={isSaving}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`size-7 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <Input
                value={color}
                disabled={isSaving}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#8A73FF"
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-status">Status</Label>
              <Select
                value={status}
                items={Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]))}
                disabled={isSaving}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
              >
                <SelectTrigger id="project-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="project-due" className="mt-4 block">
                Due Date
              </Label>
              <Input
                id="project-due"
                type="date"
                value={dueDate}
                disabled={isSaving}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" disabled={isSaving} onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingProject ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
