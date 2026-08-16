import * as React from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/organizations", label: "Organizations", icon: Building2 },
  { to: "/invitations", label: "Invitations", icon: Mail },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export default function DashboardLayout() {
  const { isAuthenticated, isInitializing, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (isInitializing) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

 if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
    } catch {
      // Even if the backend call fails, local auth state is already cleared.
      toast("Logged out locally (server request failed)");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5" />
          <span className="text-sm font-semibold">Team Access Control</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "z-40 w-64 shrink-0 border-r border-border bg-background",
            "md:sticky md:top-0 md:block md:h-svh",
            mobileOpen
              ? "fixed inset-x-0 top-14.25 block h-[calc(100svh-57px)] overflow-y-auto"
              : "hidden"
          )}
        >
          <div className="hidden items-center gap-2 px-5 py-5 md:flex">
            <ShieldCheck className="size-5" />
            <span className="text-sm font-semibold">Team Access Control</span>
          </div>

          <nav className="flex flex-col gap-1 px-3 py-3">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-border p-3">
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                title="Log out"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-h-svh w-full min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
