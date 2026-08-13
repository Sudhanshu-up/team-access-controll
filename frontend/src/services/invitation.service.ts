import { api } from "@/api/axios";
import type { ApiEnvelope } from "@/types/api.types";
import type { Invitation, InvitePayload } from "@/types/invitation.types";

export const invitationService = {
  async invite(orgId: string, payload: InvitePayload): Promise<Invitation> {
    const { data } = await api.post<ApiEnvelope<Invitation>>(
      `/api/v1/invite/organization/${orgId}/invitations`,
      payload,
    );
    return data.data;
  },

  async accept(token: string): Promise<Invitation> {
    const { data } = await api.post<ApiEnvelope<Invitation>>(
      `/api/v1/invite/accept/${token}`,
    );

    return data.data;
  },

  async reject(token: string): Promise<Invitation> {
    const { data } = await api.post<ApiEnvelope<Invitation>>(
      `/api/v1/invite/reject/${token}/invitations`,
    );
    return data.data;
  },
  async cancel(invitationId: string): Promise<Invitation> {
  const { data } = await api.delete<ApiEnvelope<Invitation>>(
    `/api/v1/invite/cancel/${invitationId}`,
  );

  return data.data;
},
  async getOrganizationInvitations(orgId: string): Promise<Invitation[]> {
    const { data } = await api.get<ApiEnvelope<Invitation[]>>(
      `/api/v1/invite/organization/${orgId}/invitations`,
    );

    return data.data;
  },
};
