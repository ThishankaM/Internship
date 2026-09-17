import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Category, Tag } from "@/types/todo";

interface OrganizerModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  tags: Tag[];
  isSaving: boolean;
  error: string | null;
  onCreateCategory: (name: string) => Promise<{ ok: boolean }>;
  onUpdateCategory: (id: string, name: string) => Promise<{ ok: boolean }>;
  onDeleteCategory: (id: string) => Promise<{ ok: boolean }>;
  onCreateTag: (name: string) => Promise<{ ok: boolean }>;
  onUpdateTag: (id: string, name: string) => Promise<{ ok: boolean }>;
  onDeleteTag: (id: string) => Promise<{ ok: boolean }>;
}

export function OrganizerModal({
  open,
  onClose,
  categories,
  tags,
  isSaving,
  error,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: OrganizerModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");

  const addCategory = async () => {
    const name = categoryName.trim();
    if (!name) return;
    const result = await onCreateCategory(name);
    if (result.ok) setCategoryName("");
  };

  const addTag = async () => {
    const name = tagName.trim();
    if (!name) return;
    const result = await onCreateTag(name);
    if (result.ok) setTagName("");
  };

  const saveCategory = async (id: string) => {
    const name = editingCategoryName.trim();
    if (!name) return;
    const result = await onUpdateCategory(id, name);
    if (result.ok) {
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };

  const saveTag = async (id: string) => {
    const name = editingTagName.trim();
    if (!name) return;
    const result = await onUpdateTag(id, name);
    if (result.ok) {
      setEditingTagId(null);
      setEditingTagName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSaving && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Categories & Tags</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Categories</h3>
              <p className="text-xs text-muted-foreground">
                Organize todos into groups.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={categoryName}
                disabled={isSaving}
                placeholder="New category"
                onChange={(event) => setCategoryName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void addCategory();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                disabled={isSaving || !categoryName.trim()}
                onClick={() => void addCategory()}
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet.</p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                  >
                    {editingCategoryId === category.id ? (
                      <>
                        <Input
                          value={editingCategoryName}
                          disabled={isSaving}
                          onChange={(event) => setEditingCategoryName(event.target.value)}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => void saveCategory(category.id)}
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => setEditingCategoryId(null)}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {category.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {category._count?.todos ?? 0}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => void onDeleteCategory(category.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Tags</h3>
              <p className="text-xs text-muted-foreground">
                Add multiple labels to todos.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={tagName}
                disabled={isSaving}
                placeholder="New tag"
                onChange={(event) => setTagName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void addTag();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                disabled={isSaving || !tagName.trim()}
                onClick={() => void addTag()}
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="space-y-2">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags yet.</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                  >
                    {editingTagId === tag.id ? (
                      <>
                        <Input
                          value={editingTagName}
                          disabled={isSaving}
                          onChange={(event) => setEditingTagName(event.target.value)}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => void saveTag(tag.id)}
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => setEditingTagId(null)}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {tag.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tag._count?.todos ?? 0}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => {
                            setEditingTagId(tag.id);
                            setEditingTagName(tag.name);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isSaving}
                          onClick={() => void onDeleteTag(tag.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
