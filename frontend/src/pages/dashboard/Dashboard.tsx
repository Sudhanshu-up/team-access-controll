import { Link, useNavigate } from "react-router-dom";
import { Building2, LogOut, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { useMyOrganizations } from "@/hooks/useOrganizations";
import { parseApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/QueryState";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: organizations, isLoading, isError, error, refetch } =
    useMyOrganizations();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/organizations/create")}>
            <Plus /> Create Organization
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut /> Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Your organizations</CardTitle>
          {organizations && organizations.length > 0 && (
            <Link
              to="/organizations"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View all
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingState label="Loading your organizations..." />}

          {isError && (
            <ErrorState
              message={parseApiError(error).message}
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && organizations && organizations.length === 0 && (
            <EmptyState
              icon={<Building2 className="size-6 text-muted-foreground" />}
              title="No organizations yet"
              description="Create your first organization to start inviting teammates."
              action={
                <Button size="sm" onClick={() => navigate("/organizations/create")}>
                  <Plus /> Create Organization
                </Button>
              }
            />
          )}

          {!isLoading && !isError && organizations && organizations.length > 0 && (
            <ul className="divide-y divide-border">
              {organizations.map((entry) => (
                <li key={entry._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/organizations/${entry.organizationId._id}`}
                      className="truncate text-sm font-medium hover:underline underline-offset-4"
                    >
                      {entry.organizationId.name}
                    </Link>
                    {entry.organizationId.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.organizationId.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="capitalize shrink-0">
                    {entry.role}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
