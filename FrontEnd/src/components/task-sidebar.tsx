import {
  AlignLeft,
  Bell,
  Briefcase,
  Calendar,
  Clock,
  LogOut,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavItem } from "@/components/nav-item";

interface TaskSidebarProps {
  user: { id: string; name: string; email: string };
  onLogout: () => void;
}

export function TaskSidebar({ user, onLogout }: TaskSidebarProps) {
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
      </nav>
      <div className="space-y-1 border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2">
          <User className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={Bell} label="Notifications" />
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
