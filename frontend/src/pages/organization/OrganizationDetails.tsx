import { useState } from "react";
import { useCancelInvitation } from "@/hooks/useInvitations";
import { useOrganizationInvitations,useResendInvitation, } from "@/hooks/useInvitations";
import { useNavigate, useParams } from "react-router-dom";
import { LogOut, Pencil, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import {
  useDeleteOrganization,
  useOrganization,
} from "@/hooks/useOrganizations";
import { useLeaveOrganization, useMembers } from "@/hooks/useMembers";
import { parseApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState, LoadingState } from "@/components/common/QueryState";
import { InviteMemberDialog } from "@/components/organization/InviteMemberDialog";
import { MembersTable } from "@/components/organization/MembersTable";

export default function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const org = useOrganization(id);
  const members = useMembers(id);
  const deleteOrganization = useDeleteOrganization();
  const leaveOrganization = useLeaveOrganization();
  const cancelInvitation = useCancelInvitation(id ?? "");
  const resendInvitation = useResendInvitation(id ?? "");
  const [inviteOpen, setInviteOpen] = useState(false);
  const {
  data: invitations = [],
  isLoading: invitationsLoading,
  isError: invitationsError,
  refetch: refetchInvitations,
  } = useOrganizationInvitations(id ?? "");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingCancelInvitation, setPendingCancelInvitation] = useState<string | null>(null);
 


  if (org.isLoading || members.isLoading) {
    return <LoadingState label="Loading organization..." />;
  }

  if (org.isError) {
    return (
      <ErrorState
        message={parseApiError(org.error).message}
        onRetry={() => org.refetch()}
      />
    );
  }

  if (members.isError) {
    return (
      <ErrorState
        message={parseApiError(members.error).message}
        onRetry={() => members.refetch()}
      />
    );
  }

  if (!org.data || !id) return null;

  const organization = org.data;
  const memberList = members.data ?? [];
  const myMembership = memberList.find((m) => m.userId._id === user?._id);
  const myRole = myMembership?.role;
  const canManage = myRole === "owner" || myRole === "admin";
  const canInvite = canManage;
  const canDelete = myRole === "owner";
  const canLeave = !!myRole;

  const handleDelete = () => {
    deleteOrganization.mutate(id, {
      onSuccess: () => {
        toast.success("Organization deleted");
        navigate("/organizations", { replace: true });
      },
      onError: (err) => toast.error(parseApiError(err).message),
    });
  };

  const handleLeave = () => {
    leaveOrganization.mutate(id, {
      onSuccess: () => {
        toast.success("You left the organization");
        navigate("/organizations", { replace: true });
      },
      onError: (err) => {
        toast.error(parseApiError(err).message);
        setConfirmLeave(false);
      },
    });
  };
 const handleCancelInvitation = () => {
  if (!pendingCancelInvitation) return;

  cancelInvitation.mutate(pendingCancelInvitation, {
    onSuccess: () => {
      toast.success("Invitation cancelled");
      setPendingCancelInvitation(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err).message);
      setPendingCancelInvitation(null);
    },
  });
};
const handleResendInvitation = (invitationId: string) => {
  if (resendInvitation.isPending) return;

  setResendingId(invitationId);
  resendInvitation.mutate(invitationId, {
    onSuccess: (invitation) => {
      if (invitation.emailSent === false) {
        toast(
          "Invitation updated, but the email couldn't be sent. Check the mail server config.",
          { icon: "⚠️" }
        );
      } else {
        toast.success("Invitation resent successfully");
      }
    },
    onError: (err) => {
      toast.error(parseApiError(err).message);
    },
    onSettled: () => {
      setResendingId(null);
    },
  });
};
  

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{organization.name}</CardTitle>
              {!organization.isActive && (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {myRole && (
                <Badge variant="secondary" className="capitalize">
                  {myRole}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              /{organization.slug}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/organizations/${id}/edit`)}
              >
                <Pencil /> Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="text-destructive" /> Delete
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {organization.description && (
            <p className="text-sm text-muted-foreground">
              {organization.description}
            </p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>Created by {organization.createdBy?.name ?? "Unknown"}</span>
            <span>
              Created {new Date(organization.createdAt).toLocaleDateString()}
            </span>
          </div>

          {canLeave && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmLeave(true)}
              >
                <LogOut /> Leave organization
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>
            Members
            <span className="ml-1.5 font-normal text-muted-foreground">
              ({memberList.length})
            </span>
          </CardTitle>
          {canInvite && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus /> Invite member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {memberList.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No members found.
            </p>
          ) : (
            <MembersTable
              orgId={id}
              members={memberList}
              currentUserId={user?._id ?? ""}
              currentUserRole={myRole ?? "viewer"}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending Invitations
            <span className="ml-1.5 font-normal text-muted-foreground">
              ({invitations.length})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {invitationsLoading ? (
            <LoadingState label="Loading invitations..." />
          ) : invitationsError ? (
            <ErrorState
              message="Failed to load pending invitations."
              onRetry={() => refetchInvitations()}
            />
          ) : invitations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pending invitations.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{invitation.email}</p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="capitalize">
                        {invitation.role}
                      </Badge>

                      <span>
                        Expires{" "}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                   <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvitation(invitation._id)}
                      loading={resendInvitation.isPending && resendingId === invitation._id}
                      disabled={resendInvitation.isPending && resendingId !== invitation._id}
                    >
                      Resend
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingCancelInvitation(invitation._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {canInvite && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          orgId={id}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete organization?"
        description={`This will deactivate "${organization.name}" and remove all members. This can't be undone from here.`}
        confirmLabel="Delete"
        loading={deleteOrganization.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Leave organization?"
        description="You'll lose access to this organization and will need a new invitation to rejoin."
        confirmLabel="Leave"
        loading={leaveOrganization.isPending}
        onConfirm={handleLeave}
      />
      <ConfirmDialog
        open={!!pendingCancelInvitation}
        onOpenChange={(open) => {
          if (!open) {
            setPendingCancelInvitation(null);
          }
        }}
        title="Cancel invitation?"
        description="This invitation will become inactive and the recipient will no longer be able to accept it."
        confirmLabel="Cancel invitation"
        loading={cancelInvitation.isPending}
        onConfirm={handleCancelInvitation}
      />
    </div>
  );
}
