import {
  AlignLeft,
  Bell,
  Briefcase,
  Calendar,
  Clock,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { NavItem } from "@/components/nav-item";

export function TaskSidebar() {
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
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={Bell} label="Notifications" />
        <NavItem icon={User} label="Profile" />
      </div>
    </aside>
  );
}
