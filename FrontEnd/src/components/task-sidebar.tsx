import {
  AlignLeft,
  Bell,
  Briefcase,
  Calendar,
  Clock,
  KeyRound,
  LogOut,
  Shield,
  Sun,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavItem } from "@/components/nav-item";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types/auth";

interface TaskSidebarProps {
  user: User | null;
  onLogout: () => void;
  onChangePassword: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function TaskSidebar({
  user,
  onLogout,
  onChangePassword,
  isOpen = false,
  onClose,
}: TaskSidebarProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const content = (
    <>
      <div className="flex h-16 items-center justify-between gap-2 px-6 font-semibold text-foreground">
        <span className="flex items-center gap-2">
          <AlignLeft className="size-5 text-primary" />
          TaskFlow
        </span>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3">
        <NavItem icon={Calendar} label="My Tasks" active />
        <NavItem icon={Briefcase} label="Projects" />
        <NavItem icon={Clock} label="Schedule" />
        <NavItem icon={Sun} label="My Day" />
        {user?.role === "ADMIN" && (
          <NavItem
            icon={Shield}
            label="Admin"
            onClick={() => {
              navigate("/admin");
              onClose?.();
            }}
          />
        )}
      </nav>

      <div className="mt-auto border-t border-border p-4">
        {user && (
          <p className="mb-3 truncate px-2 text-xs text-muted-foreground">
            {user.email}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            onChangePassword();
            onClose?.();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <KeyRound size={18} />
          Change Password
        </button>
        <NavItem icon={Bell} label="Notifications" />
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  // Desktop: static sidebar.
  if (!isMobile) {
    return (
      <aside className="flex w-56 flex-col border-r border-border bg-sidebar">
        {content}
      </aside>
    );
  }

  // Mobile: slide-in drawer with a dismissible backdrop.
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        inert={!isOpen}
        aria-label="Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}
