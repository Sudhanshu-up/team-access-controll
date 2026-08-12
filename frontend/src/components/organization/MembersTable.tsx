import { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { useRemoveMember, useUpdateMemberRole } from "@/hooks/useMembers";
import { parseApiError } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { Member, Role } from "@/types/membership.types";

interface MembersTableProps {
  orgId: string;
  members: Member[];
  currentUserId: string;
  /** The logged-in user's role within this specific organization. */
  currentUserRole: Role;
}

const ROLE_BADGE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
  viewer: "outline",
};

export function MembersTable({
  orgId,
  members,
  currentUserId,
  currentUserRole,
}: MembersTableProps) {
  const updateRole = useUpdateMemberRole(orgId);
  const removeMember = useRemoveMember(orgId);
  const [pendingRemove, setPendingRemove] = useState<Member | null>(null);

  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  const canEditRow = (member: Member) => {
    if (!canManageMembers) return false;
    if (member.userId._id === currentUserId) return false; // no self-service
    if (member.role === "owner") return false; // owner is untouchable
    if (currentUserRole === "admin" && member.role === "admin") return false; // admin can't touch admin
    return true;
  };

  const assignableRoles: Role[] =
    currentUserRole === "owner"
      ? ["admin", "member", "viewer"]
      : ["member", "viewer"]; // only owner may grant admin

  const handleRoleChange = (member: Member, role: Role) => {
    if (role === member.role) return;
    updateRole.mutate(
      { membershipId: member._id, role },
      {
        onSuccess: () => toast.success(`${member.userId.name}'s role updated`),
        onError: (err) => toast.error(parseApiError(err).message),
      }
    );
  };

  const handleRemove = () => {
    if (!pendingRemove) return;
    removeMember.mutate(pendingRemove._id, {
      onSuccess: () => {
        toast.success(`${pendingRemove.userId.name} removed`);
        setPendingRemove(null);
      },
      onError: (err) => toast.error(parseApiError(err).message),
    });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Email</th>
              <th className="py-2 pr-3 font-medium">Role</th>
              {canManageMembers && (
                <th className="py-2 pl-3 font-medium text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => {
              const isSelf = member.userId._id === currentUserId;
              const editable = canEditRow(member);

              return (
                <tr key={member._id}>
                  <td className="py-2.5 pr-3">
                    {member.userId.name}
                    {isSelf && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">
                    {member.userId.email}
                  </td>
                  <td className="py-2.5 pr-3">
                    {editable ? (
                      <Select
                        className="h-8 w-32"
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member, e.target.value as Role)
                        }
                        disabled={updateRole.isPending}
                      >
                        {/* Keep the member's current role selectable even if
                           it wouldn't otherwise be assignable, so the value
                           always matches an existing option. */}
                        {!assignableRoles.includes(member.role) && (
                          <option value={member.role}>{member.role}</option>
                        )}
                        {assignableRoles.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Badge variant={ROLE_BADGE_VARIANT[member.role]} className="capitalize">
                        {member.role}
                      </Badge>
                    )}
                  </td>
                  {canManageMembers && (
                    <td className="py-2.5 pl-3 text-right">
                      {editable && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Remove member"
                          onClick={() => setPendingRemove(member)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingRemove}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remove member?"
        description={`${pendingRemove?.userId.name} will lose access to this organization.`}
        confirmLabel="Remove"
        loading={removeMember.isPending}
        onConfirm={handleRemove}
      />
    </>
  );
}
