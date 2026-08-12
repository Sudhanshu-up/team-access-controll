import { api } from "@/api/axios";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  CreateOrganizationPayload,
  MyOrganizationEntry,
  Organization,
  UpdateOrganizationPayload,
} from "@/types/organization.types";

export const organizationService = {
  async create(payload: CreateOrganizationPayload): Promise<Organization> {
    const { data } = await api.post<ApiEnvelope<Organization>>(
      "/api/v1/org/",
      payload
    );
    return data.data;
  },

  /** Returns the caller's memberships (each populated with its organization). */
  async listMine(): Promise<MyOrganizationEntry[]> {
    const { data } = await api.get<ApiEnvelope<MyOrganizationEntry[]>>(
      "/api/v1/org/organizations"
    );
    return data.data;
  },

  async getById(orgId: string): Promise<Organization> {
    const { data } = await api.get<ApiEnvelope<Organization>>(
      `/api/v1/org/organization/${orgId}`
    );
    return data.data;
  },

  async update(
    orgId: string,
    payload: UpdateOrganizationPayload
  ): Promise<Organization> {
    const { data } = await api.patch<ApiEnvelope<Organization>>(
      `/api/v1/org/updateorganization/${orgId}`,
      payload
    );
    return data.data;
  },

  async remove(orgId: string): Promise<void> {
    await api.delete(`/api/v1/org/deleteorganization/${orgId}`);
  },
};
