import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { apiClient } from "@/services/api-client";
import type { UserRole } from "@/types/auth";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  created_at: string;
  _count: { todos: number };
}

interface AdminStats {
  users: number;
  todos: number;
  completedTodos: number;
  activeTodos: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    return apiClient.get<AdminUser[]>("/admin/users");
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchUsers(), apiClient.get<AdminStats>("/admin/stats")])
      .then(([userData, statsData]) => {
        if (!cancelled) {
          setUsers(userData);
          setStats(statsData);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchUsers]);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userData, statsData] = await Promise.all([
        fetchUsers(),
        apiClient.get<AdminStats>("/admin/stats"),
      ]);
      setUsers(userData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = async (id: string) => {
    setPendingId(id);
    try {
      await apiClient.patch(`/admin/users/${id}/toggle-active`);
      setUsers((current) =>
        current.map((user) =>
          user.id === id ? { ...user, isActive: !user.isActive } : user,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setPendingId(null);
    }
  };

  const changeRole = async (id: string, role: UserRole) => {
    setPendingId(id);
    try {
      await apiClient.patch(`/admin/users/${id}/role`, { role });
      setUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, role } : user)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="size-7 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Back to board
          </Link>
        </div>

        {isLoading && <LoadingState message="Loading users..." />}

        {!isLoading && error && (
          <ErrorState
            title="Couldn't load users"
            message={error}
            onRetry={handleRetry}
          />
        )}

        {!isLoading && !error && users.length === 0 && (
          <EmptyState
            title="No users"
            message="There are no registered users yet."
          />
        )}

        {!isLoading && !error && stats && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="mt-1 text-2xl font-semibold">{stats.users}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Todos</p>
              <p className="mt-1 text-2xl font-semibold">{stats.todos}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.completedTodos}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="mt-1 text-2xl font-semibold">{stats.activeTodos}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && users.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Todos</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="p-4">{user.name}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        disabled={pendingId === user.id}
                        onChange={(event) =>
                          void changeRole(
                            user.id,
                            event.target.value as UserRole,
                          )
                        }
                        className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4">{user._count.todos}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingId === user.id}
                        onClick={() => toggleUser(user.id)}
                      >
                        {user.isActive ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
