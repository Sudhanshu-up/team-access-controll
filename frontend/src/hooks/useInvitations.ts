import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { invitationService } from "@/services/invitation.service";
import { memberKeys } from "@/hooks/useMembers";
import { organizationKeys } from "@/hooks/useOrganizations";
import type { InvitePayload } from "@/types/invitation.types";

export const invitationKeys = {
  all: ["organization-invitations"] as const,
  byOrg: (orgId: string) => [...invitationKeys.all, orgId] as const,
};

export function useInviteMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvitePayload) =>
      invitationService.invite(orgId, payload),
    onSuccess: () => {
      // Pehle sirf members list invalidate ho raha tha, pending
      // invitations list nahi — isliye naya invite manual refresh ke
      // bina list me nahi dikhta tha. Ab dono invalidate honge.
      queryClient.invalidateQueries({ queryKey: memberKeys.byOrg(orgId) });
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byOrg(orgId),
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => invitationService.accept(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.mine() });
    },
  });
}

export function useRejectInvitation() {
  return useMutation({
    mutationFn: (token: string) => invitationService.reject(token),
  });
}

export function useCancelInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationService.cancel(invitationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byOrg(orgId),
      });
    },
  });
}

export function useResendInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationService.resend(invitationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byOrg(orgId),
      });
    },
  });
}

export function useOrganizationInvitations(orgId: string) {
  return useQuery({
    queryKey: invitationKeys.byOrg(orgId),
    queryFn: () => invitationService.getOrganizationInvitations(orgId),
    enabled: !!orgId,
  });
}