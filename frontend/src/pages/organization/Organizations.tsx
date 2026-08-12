import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  useDeleteOrganization,
  useMyOrganizations,
} from "@/hooks/useOrganizations";
import { parseApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/QueryState";
import type { MyOrganizationEntry } from "@/types/organization.types";

export default function Organizations() {
  const navigate = useNavigate();
  const { data: organizations, isLoading, isError, error, refetch } =
    useMyOrganizations();
  const deleteOrganization = useDeleteOrganization();
  const [pendingDelete, setPendingDelete] = useState<MyOrganizationEntry | null>(
    null
  );

  const canManage = (role: string) => role === "owner" || role === "admin";
  const canDelete = (role: string) => role === "owner";

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteOrganization.mutate(pendingDelete.organizationId._id, {
      onSuccess: () => {
        toast.success("Organization deleted");
        setPendingDelete(null);
      },
      onError: (err) => {
        toast.error(parseApiError(err).message);
      },
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Organizations</h1>
          <p className="text-sm text-muted-foreground">
            Every organization you belong to.
          </p>
        </div>
        <Button onClick={() => navigate("/organizations/create")}>
          <Plus /> Create Organization
        </Button>
      </div>

      {isLoading && <LoadingState label="Loading organizations..." />}

      {isError && (
        <ErrorState message={parseApiError(error).message} onRetry={() => refetch()} />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((entry) => (
            <Card key={entry._id}>
              <CardContent className="flex flex-col gap-3 py-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {entry.organizationId.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      /{entry.organizationId.slug}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 capitalize">
                    {entry.role}
                  </Badge>
                </div>

                {entry.organizationId.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {entry.organizationId.description}
                  </p>
                )}

                <div className="mt-1 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/organizations/${entry.organizationId._id}`)
                    }
                  >
                    Open
                  </Button>
                  {canManage(entry.role) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Edit organization"
                      onClick={() =>
                        navigate(`/organizations/${entry.organizationId._id}/edit`)
                      }
                    >
                      <Pencil />
                    </Button>
                  )}
                  {canDelete(entry.role) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Delete organization"
                      onClick={() => setPendingDelete(entry)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete organization?"
        description={`This will deactivate "${pendingDelete?.organizationId.name}" and remove all members. This can't be undone from here.`}
        confirmLabel="Delete"
        loading={deleteOrganization.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
