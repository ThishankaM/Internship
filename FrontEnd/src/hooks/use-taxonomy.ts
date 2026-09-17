import { useCallback, useEffect, useState } from "react";
import { categoryApi, tagApi } from "@/services/taxonomy-api";
import { ApiError } from "@/services/api-client";
import type { Category, Tag } from "@/types/todo";

export function useTaxonomy(enabled = true) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaxonomy = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const [categoryData, tagData] = await Promise.all([
        categoryApi.getAll(signal),
        tagApi.getAll(signal),
      ]);
      setCategories(categoryData);
      setTags(tagData);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof ApiError ? err.message : "Failed to load categories and tags");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    Promise.all([
      categoryApi.getAll(controller.signal),
      tagApi.getAll(controller.signal),
    ])
      .then(([categoryData, tagData]) => {
        setCategories(categoryData);
        setTags(tagData);
        setError(null);
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load categories and tags"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [enabled]);

  const runMutation = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<{ ok: boolean; error?: string }> => {
      setIsSaving(true);
      setError(null);

      try {
        await operation();
        await fetchTaxonomy();
        return { ok: true };
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Operation failed";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setIsSaving(false);
      }
    },
    [fetchTaxonomy],
  );

  const createCategory = useCallback(
    (name: string) => runMutation(() => categoryApi.create(name)),
    [runMutation],
  );

  const updateCategory = useCallback(
    (id: string, name: string) => runMutation(() => categoryApi.update(id, name)),
    [runMutation],
  );

  const deleteCategory = useCallback(
    (id: string) => runMutation(() => categoryApi.remove(id)),
    [runMutation],
  );

  const createTag = useCallback(
    (name: string) => runMutation(() => tagApi.create(name)),
    [runMutation],
  );

  const updateTag = useCallback(
    (id: string, name: string) => runMutation(() => tagApi.update(id, name)),
    [runMutation],
  );

  const deleteTag = useCallback(
    (id: string) => runMutation(() => tagApi.remove(id)),
    [runMutation],
  );

  return {
    categories,
    tags,
    isLoading,
    isSaving,
    error,
    refetch: fetchTaxonomy,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag,
  };
}
