import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { membershipService } from "@/services/membership.service";
import { organizationKeys } from "@/hooks/useOrganizations";
import type { Role } from "@/types/membership.types";

export const memberKeys = {
  all: ["members"] as const,
  byOrg: (orgId: string) => [...memberKeys.all, orgId] as const,
};

export function useMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: memberKeys.byOrg(orgId ?? ""),
    queryFn: () => membershipService.listByOrg(orgId as string),
    enabled: !!orgId,
  });
}

export function useUpdateMemberRole(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      role,
    }: {
      membershipId: string;
      role: Role;
    }) => membershipService.updateRole(membershipId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.byOrg(orgId) });
    },
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) =>
      membershipService.remove(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.byOrg(orgId) });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => membershipService.leave(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.mine() });
    },
  });
}
