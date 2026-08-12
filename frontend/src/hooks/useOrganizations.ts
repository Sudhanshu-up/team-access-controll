import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { organizationService } from "@/services/organization.service";
import type {
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
} from "@/types/organization.types";

export const organizationKeys = {
  all: ["organizations"] as const,
  mine: () => [...organizationKeys.all, "mine"] as const,
  detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
};

export function useMyOrganizations() {
  return useQuery({
    queryKey: organizationKeys.mine(),
    queryFn: organizationService.listMine,
  });
}

export function useOrganization(orgId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.detail(orgId ?? ""),
    queryFn: () => organizationService.getById(orgId as string),
    enabled: !!orgId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) =>
      organizationService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.mine() });
    },
  });
}

export function useUpdateOrganization(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrganizationPayload) =>
      organizationService.update(orgId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.mine() });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => organizationService.remove(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.mine() });
    },
  });
}
