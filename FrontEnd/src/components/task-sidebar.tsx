import {
  AlignLeft,
  Bell,
  Briefcase,
  Calendar,
  Clock,
  LogOut,
  Settings,
  Shield,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavItem } from "@/components/nav-item";
import type { User } from "@/types/auth";

interface TaskSidebarProps {
  user: User | null;
  onLogout: () => void;
}

export function TaskSidebar({ user, onLogout }: TaskSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 px-6 font-semibold text-foreground">
        <AlignLeft className="size-5 text-primary" />
        TaskFlow
      </div>
      <nav className="flex-1 space-y-1 px-3">
        <NavItem icon={Calendar} label="My Tasks" active />
        <NavItem icon={Briefcase} label="Projects" />
        <NavItem icon={Clock} label="Schedule" />
        <NavItem icon={Sun} label="My Day" />
        {user?.role === "ADMIN" && (
          <NavItem
            icon={Shield}
            label="Admin"
            onClick={() => navigate("/admin")}
          />
        )}
      </nav>
      <div className="mt-auto border-t border-border p-4">
        {user && (
          <p className="mb-3 truncate px-2 text-xs text-muted-foreground">
            {user.email}
          </p>
        )}
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={Bell} label="Notifications" />
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
