import { Navigate, Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

/**
 * Wraps /login and /register. If the user is already authenticated,
 * bounce them straight to the dashboard.
 */
export default function AuthLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/40 px-4 py-10">
      <div className="flex items-center gap-2 text-foreground">
        <ShieldCheck className="size-5" />
        <span className="text-sm font-semibold">Team Access Control</span>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
