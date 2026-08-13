import { useMutation, useQueryClient,useQuery } from "@tanstack/react-query";

import { invitationService } from "@/services/invitation.service";
import { memberKeys } from "@/hooks/useMembers";
import { organizationKeys } from "@/hooks/useOrganizations";
import type { InvitePayload } from "@/types/invitation.types";

export function useInviteMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvitePayload) =>
      invitationService.invite(orgId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.byOrg(orgId) });
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
        queryKey: ["organization-invitations", orgId],
      });
    },
  });
}

export function useOrganizationInvitations(orgId: string) {
  return useQuery({
    queryKey: ["organization-invitations", orgId],
    queryFn: () =>
      invitationService.getOrganizationInvitations(orgId),
    enabled: !!orgId,
  });
};


